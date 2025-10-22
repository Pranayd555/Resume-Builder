const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');
const { calculateTotalTokens } = require('../utils/tokenCalculator');
const subscriptionController = require('../controllers/subscriptionController');

// Stripe integration removed

const router = express.Router();

// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: { monthly: 0 },
        features: [
          '2 resume projects total',
          'Basic templates only',
          'PDF export',
          'Email support',
          'AI actions as per token available'
        ],
        limits: {
          resumes: 2,
          templates: ['free'],
          exports: ['pdf'],
          aiActions: 'token-based',
          freeTokens: 0
        },
        popular: false
      },
      {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        price: { monthly: 499 },
        features: [
          '5 resume projects total',
          'Free + Premium templates',
          '150 free tokens + token-based AI actions',
          'Resume feedback analysis (ATS score, grammar)',
          'PDF export',
          'Priority support',
          'Unlimited exports'
        ],
        limits: {
          resumes: 5,
          templates: ['free', 'premium'],
          exports: ['pdf', 'docx'],
          aiActions: 'token-based',
          freeTokens: 150,
          aiReview: true,
          prioritySupport: true,
          unlimitedExports: true
        },
        popular: true,
        trial: {
          free: 3
        }
      },
      {
        id: 'pro_yearly',
        name: 'Pro Yearly',
        price: { yearly: 4999 },
        features: [
          '5 resume projects total',
          'Full access to all premium templates',
          '300 free tokens + token-based AI actions',
          'Resume feedback analysis (ATS score, grammar)',
          'PDF export',
          'Priority support',
          'Unlimited exports',
          'Cloud resume history',
          'Custom branding'
        ],
        limits: {
          resumes: 5,
          templates: ['free', 'premium'],
          exports: ['pdf', 'docx'],
          aiActions: 'token-based',
          freeTokens: 300,
          aiReview: true,
          prioritySupport: true,
          unlimitedExports: true,
          customBranding: true
        },
        popular: false,
        trial: {
          free: 3
        }
      }
    ];

    res.json({
      success: true,
      data: {
        plans
      }
    });
  } catch (error) {
    logger.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get trial information
// @route   GET /api/subscriptions/trial-info
// @access  Private
router.get('/trial-info', protect, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Check if trial has expired and update if necessary
    if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
      await subscription.expireTrial();
      // Refresh the subscription data after expiration
      subscription = await Subscription.findOne({ user: req.user.id });
    }

    const trialInfo = {
      isTrialActive: subscription.isTrialActive(),
      hasTrialExpired: subscription.hasTrialExpired(),
      trialType: subscription.billing?.trialType,
      trialEnd: subscription.billing?.trialEnd,
      trialRemainingDays: subscription.trialRemainingDays,
      plan: subscription.plan,
      status: subscription.status
    };

    res.json({
      success: true,
      data: {
        trialInfo
      }
    });
  } catch (error) {
    logger.error('Get trial info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get current subscription
// @route   GET /api/subscriptions/current
// @access  Private
router.get('/current', protect, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      // Create default free subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active'
      });
      await subscription.save();
    } else {
      // Check if trial has expired and update if necessary
      if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
        await subscription.expireTrial();
        // Refresh the subscription data after expiration
        subscription = await Subscription.findOne({ user: req.user.id });
      }
      
      // Recalculate actual resume count since subscription started
      await subscription.recalculateResumeCount();
    }

    // Compute current weekly window and limits
    const usage = subscription.usage || {};
    res.json({
      success: true,
      data: {
        subscription,
        usage: {
          resumes: {
            used: usage.resumesCreated || 0,
            limit: subscription.features?.resumeLimit || 2
          },
          aiActions: {
            used: usage.aiActionsThisMonth || 0,
            limit: subscription.features?.aiActionsLimit || 200
          }
        }
      }
    });
  } catch (error) {
    logger.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Start trial
// @route   POST /api/subscriptions/start-trial
// @access  Private
router.post('/start-trial', [
  protect,
  body('trialType').isIn(['free']).withMessage('Valid trial type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { trialType } = req.body;
    let subscription = await Subscription.findOne({ user: req.user.id });

    // Check if user already has an active trial
    if (subscription && subscription.status === 'trialing' && subscription.billing?.trialEnd) {
      const trialEnd = new Date(subscription.billing.trialEnd);
      const now = new Date();
      
      if (trialEnd > now) {
        return res.status(400).json({
          success: false,
          error: 'Trial already active'
        });
      }
    }

    // Check if user has already had a trial before
    if (subscription && subscription.hasHadTrial) {
      return res.status(400).json({
        success: false,
        error: 'You have already used your trial. Please upgrade to continue using Pro features.'
      });
    }

    // Create new subscription if doesn't exist
    if (!subscription) {
      subscription = await Subscription.createTrial(req.user.id, trialType, 3); // Always 3 days for free trial
      subscription.features.freeTokens = 0; // Ensure no free tokens are granted during trial
    } else {
      // Update existing subscription for trial
      subscription.plan = 'pro_monthly';
      subscription.status = 'trialing';
      subscription.hasHadTrial = true;
      subscription.billing = {
        trialType: trialType,
        trialEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Always 3 days for free trial
      };
      
      // Set trial features properly
      subscription.features.resumeLimit = 5;
      subscription.features.templateAccess = ['free', 'premium'];
      subscription.features.exportFormats = ['pdf'];
      subscription.features.aiActionsLimit = 'token-based';
      subscription.features.freeTokens = 0; // No free tokens during trial
      subscription.features.aiReview = true;
      subscription.features.prioritySupport = true;
      subscription.features.customBranding = false; // Only for pro_yearly
      subscription.features.unlimitedExports = true;
      
      // Reset usage for trial
      subscription.usage = {
        resumesCreated: 0,
        aiActionsThisCycle: 0,
        freeTokensUsed: 0,
        cycleStartDate: new Date(),
        lastBillingCycleReset: new Date()
      };
      
      // Clear any existing payment data for trial
      // Payment integration removed
    }

    await subscription.save();

    // Reset isDBCleared flag when trial is started
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { isDBCleared: false });

    logger.info(`Trial started: ${trialType} trial for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        subscription
      }
    });
  } catch (error) {
    logger.error('Start trial error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => 
        `${key}: ${error.errors[key].message}`
      ).join(', ');
      
      return res.status(400).json({
        success: false,
        error: `Validation error: ${validationErrors}`
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error starting trial'
    });
  }
});

// @desc    Activate subscription after payment
// @route   POST /api/subscriptions/activate
// @access  Private
router.post('/activate', [
  protect,
  body('plan').isIn(['pro_monthly', 'pro_yearly']).withMessage('Valid plan is required'),
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('amount').isNumeric().withMessage('Amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { plan, paymentId, amount } = req.body;
    
    let subscription = await Subscription.findOne({ user: req.user.id });
    
    // Calculate next billing date considering remaining trial days
    let nextBillingDate;
    if (subscription && subscription.status === 'trialing' && subscription.billing?.trialEnd) {
      // User is converting from trial - add remaining trial days to billing period
      const now = new Date();
      const trialEnd = new Date(subscription.billing.trialEnd);
      const remainingTrialDays = Math.max(0, Math.floor((trialEnd - now) / (1000 * 60 * 60 * 24)));
      
      if (plan === 'pro_monthly') {
        // Monthly: remaining trial days + 30 days
        nextBillingDate = new Date(trialEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        // Yearly: remaining trial days + 365 days
        nextBillingDate = new Date(trialEnd.getTime() + 365 * 24 * 60 * 60 * 1000);
      }
      
      logger.info(`Trial conversion billing calculation: User ${req.user.id}, Remaining trial days: ${remainingTrialDays}, Plan: ${plan}, Next billing: ${nextBillingDate.toISOString()}`);
    } else if (subscription && subscription.billing?.nextBillingDate) {
      // User has existing subscription - add remaining days to new plan
      const now = new Date();
      const currentBilling = new Date(subscription.billing.nextBillingDate);
      const remainingDays = Math.max(0, Math.floor((currentBilling - now) / (1000 * 60 * 60 * 24)));
      
      const newPlanDays = plan === 'pro_monthly' ? 30 : 365;
      const totalDays = remainingDays + newPlanDays;
      nextBillingDate = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000);
      
      logger.info(`Existing subscription conversion: User ${req.user.id}, Remaining days: ${remainingDays}, Plan: ${plan}, Total days: ${totalDays}, Next billing: ${nextBillingDate.toISOString()}`);
    } else {
      // New subscription - standard billing
      nextBillingDate = new Date(Date.now() + (plan === 'pro_monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);
      
      logger.info(`New subscription billing calculation: User ${req.user.id}, Plan: ${plan}, Next billing: ${nextBillingDate.toISOString()}`);
    }
    
    if (!subscription) {
      // Create new subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: plan,
        status: 'active',
        billing: {
          cycle: plan === 'pro_monthly' ? 'monthly' : 'yearly',
          amount: amount,
          currency: 'INR',
          nextBillingDate: nextBillingDate
        },
        usage: {
          resumesCreated: 0,
          aiActionsThisCycle: 0,
          freeTokensUsed: 0,
          cycleStartDate: new Date(),
          lastBillingCycleReset: new Date()
        }
      });
    } else {
      // Store current free tokens before plan change
      const currentFreeTokens = subscription.features.freeTokens || 0;
      const currentFreeTokensUsed = subscription.usage.freeTokensUsed || 0;
      const remainingFreeTokens = Math.max(0, currentFreeTokens - currentFreeTokensUsed);
      
      // Update existing subscription
      subscription.plan = plan;
      subscription.status = 'active';
      subscription.billing = {
        cycle: plan === 'pro_monthly' ? 'monthly' : 'yearly',
        amount: amount,
        currency: 'INR',
        nextBillingDate: nextBillingDate
      };
      
      // Reset usage for new billing cycle
      subscription.usage.freeTokensUsed = 0;
      subscription.usage.cycleStartDate = new Date();
      subscription.usage.lastBillingCycleReset = new Date();
    }
    
    // Add payment record
    subscription.addPayment({
      amount: amount,
      currency: 'INR',
      status: 'succeeded',
      paymentId: paymentId,
      invoiceId: `invoice_${Date.now()}`, // Generate invoice ID
      description: `${plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly'} plan subscription`,
      paidAt: new Date(),
      metadata: {
        plan: plan,
        source: 'subscription_activation',
        // Enhanced tracking details
        paymentMethod: 'manual_activation',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        subscriptionId: subscription._id,
        userId: req.user.id,
        userEmail: req.user.email,
        planDetails: {
          name: plan === 'pro_monthly' ? 'Pro Monthly Plan' : 'Pro Yearly Plan',
          price: amount,
          features: plan === 'pro_monthly' ? ['150 free tokens', 'Premium templates', 'ATS analysis', 'Priority support', 'Unlimited exports'] : ['300 free tokens', 'All features', 'Priority support', 'Unlimited exports', 'Custom branding']
        },
        billingCycle: plan === 'pro_monthly' ? 'monthly' : 'yearly',
        nextBillingDate: subscription.billing.nextBillingDate,
        source: 'admin_activation',
        campaign: req.headers.referer || 'direct',
        sessionId: req.sessionID || 'no_session',
        activationType: 'manual',
        previousPlan: subscription.plan || 'free'
      }
    });
    
    await subscription.save(); // This triggers the pre-save middleware to set freeTokens
    
    // Merge free tokens if updating existing subscription

    
    logger.info(`Subscription activated: ${plan} plan for user ${req.user.email}, Payment ID: ${paymentId}. Free tokens: ${mergedFreeTokens} (${remainingFreeTokens > 0 ? `merged: ${remainingFreeTokens} remaining + ${subscription.features.freeTokens - remainingFreeTokens} new` : 'new'})`);
    
    // Send confirmation email
    await emailService.sendSubscriptionConfirmationEmail(req.user.email, {
      name: req.user.name,
      planName: plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly',
      amount: (amount / 100).toFixed(2),
      currency: 'INR',
      nextBillingDate: subscription.billing.nextBillingDate.toLocaleDateString(),
      appName: process.env.APP_NAME || 'Resume Builder Pro'
    });

    res.status(200).json({
      success: true,
      data: {
        subscription,
        tokens: {
          totalAvailable: calculateTotalTokens(subscription)
        }
      }
    });
  } catch (error) {
    logger.error('Activate subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Error activating subscription'
    });
  }
});

// @desc    Upgrade subscription plan
// @route   POST /api/subscriptions/upgrade
// @access  Private
router.post('/upgrade', [
  protect,
  body('plan').isIn(['pro_monthly', 'pro_yearly']).withMessage('Valid plan is required'),
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('amount').isNumeric().withMessage('Amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { plan, paymentId, amount } = req.body;
    
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Check if already on the same or higher plan
    const planHierarchy = { free: 0, pro_monthly: 1, pro_yearly: 2 };
    if (planHierarchy[subscription.plan] >= planHierarchy[plan]) {
      return res.status(400).json({
        success: false,
        error: `Already on ${subscription.plan} plan or higher`
      });
    }

    // Store current free tokens before plan change
    const currentFreeTokens = subscription.features.freeTokens || 0;
    const currentFreeTokensUsed = subscription.usage.freeTokensUsed || 0;
    const remainingFreeTokens = Math.max(0, currentFreeTokens - currentFreeTokensUsed);
    
    // Calculate new plan's free tokens
    const newPlanFreeTokens = plan === 'pro_monthly' ? 150 : plan === 'pro_yearly' ? 300 : 0;
    
    // Update subscription
    subscription.plan = plan;
    subscription.status = 'active';
    subscription.billing.cycle = plan === 'pro_monthly' ? 'monthly' : 'yearly';
    subscription.billing.amount = amount;
    
    // Calculate remaining days from current subscription and add to new plan
    let remainingDays = 0;
    const now = new Date();
    
    if (subscription.status === 'trialing' && subscription.billing?.trialEnd) {
      // If user is in trial, calculate remaining trial days
      const trialEnd = new Date(subscription.billing.trialEnd);
      if (trialEnd > now) {
        remainingDays = Math.floor((trialEnd - now) / (1000 * 60 * 60 * 24));
      }
    } else if (subscription.billing?.nextBillingDate) {
      // If user has an active subscription, calculate remaining days
      const nextBilling = new Date(subscription.billing.nextBillingDate);
      if (nextBilling > now) {
        remainingDays = Math.floor((nextBilling - now) / (1000 * 60 * 60 * 24));
      }
    }
    
    // Calculate new billing date: start from now + remaining days + new plan period
    const newPlanDays = plan === 'pro_monthly' ? 30 : 365;
    const totalDays = remainingDays + newPlanDays;
    subscription.billing.nextBillingDate = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000);
    
    subscription.features.freeTokens = mergedFreeTokens;
    
    // Keep existing usage but reset cycle for new billing period
    subscription.usage.cycleStartDate = new Date();
    subscription.usage.lastBillingCycleReset = new Date();
    
    // Add payment record
    subscription.addPayment({
      amount: amount,
      currency: 'INR',
      status: 'succeeded',
      paymentId: paymentId,
      invoiceId: `invoice_${Date.now()}`, // Generate invoice ID
      description: `Upgraded to ${plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly'} plan`,
      paidAt: new Date(),
      metadata: {
        plan: plan,
        source: 'subscription_upgrade',
        previousPlan: subscription.plan,
        // Enhanced tracking details
        paymentMethod: 'manual_upgrade',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        subscriptionId: subscription._id,
        userId: req.user.id,
        userEmail: req.user.email,
        planDetails: {
          name: plan === 'pro_monthly' ? 'Pro Monthly Plan' : 'Pro Yearly Plan',
          price: amount,
          features: plan === 'pro_monthly' ? ['150 free tokens', 'Premium templates', 'ATS analysis', 'Priority support', 'Unlimited exports'] : ['300 free tokens', 'All features', 'Priority support', 'Unlimited exports', 'Custom branding']
        },
        previousPlanDetails: {
          name: subscription.plan === 'free' ? 'Free Plan' : (subscription.plan === 'pro_monthly' ? 'Pro Monthly Plan' : 'Pro Yearly Plan'),
          features: subscription.plan === 'free' ? ['Basic templates', 'Limited features'] : (subscription.plan === 'pro_monthly' ? ['150 free tokens', 'Premium templates'] : ['300 free tokens', 'All features'])
        },
        billingCycle: plan === 'pro_monthly' ? 'monthly' : 'yearly',
        nextBillingDate: subscription.billing.nextBillingDate,
        source: 'admin_upgrade',
        campaign: req.headers.referer || 'direct',
        sessionId: req.sessionID || 'no_session',
        activationType: 'manual',
        previousPlan: subscription.plan || 'free'
      }
    });

    await subscription.save(); // This triggers the pre-save middleware to set freeTokens

    // Merge free tokens if updating existing subscription
    let mergedFreeTokens = subscription.features.freeTokens || 0;
    if (subscription.plan !== 'free' && remainingFreeTokens > 0) {
      const newPlanFreeTokens = subscription.features.freeTokens || 0;
      mergedFreeTokens = newPlanFreeTokens + remainingFreeTokens;
      subscription.features.freeTokens = mergedFreeTokens;
      await subscription.save(); // Save again with merged tokens
    }

    logger.info(`Subscription upgraded: ${plan} plan for user ${req.user.email}, Payment ID: ${paymentId}. Free tokens: ${mergedFreeTokens} (${remainingFreeTokens > 0 ? `merged: ${remainingFreeTokens} remaining + ${subscription.features.freeTokens - remainingFreeTokens} new` : 'new'}). Remaining days added: ${remainingDays}, New billing date: ${subscription.billing.nextBillingDate.toISOString()}`);

    // Send confirmation email
    await emailService.sendSubscriptionConfirmationEmail(req.user.email, {
      name: req.user.name,
      planName: plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly',
      amount: (amount / 100).toFixed(2),
      currency: 'INR',
      nextBillingDate: subscription.billing.nextBillingDate.toLocaleDateString(),
      appName: process.env.APP_NAME || 'Resume Builder Pro'
    });

    res.status(200).json({
      success: true,
      data: {
        subscription,
        tokens: {
          totalAvailable: calculateTotalTokens(subscription)
        }
      }
    });
  } catch (error) {
    logger.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Error upgrading subscription'
    });
  }
});

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
router.post('/cancel', [
  protect,
  body('reason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    if (subscription.status === 'canceled') {
      return res.status(400).json({
        success: false,
        error: 'Subscription is already canceled'
      });
    }

    if (subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel free plan'
      });
    }

    // Update subscription
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    subscription.cancelReason = req.body.reason;
    subscription.endDate = subscription.billing.nextBillingDate; // Set end date to current billing period end

    await subscription.save();

    logger.info(`Subscription canceled for user ${req.user.email}. Reason: ${req.body.reason}`);

    res.json({
      success: true,
      data: {
        message: 'Subscription will be canceled at the end of current billing period',
        endDate: subscription.endDate
      }
    });
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Error canceling subscription'
    });
  }
});



// @desc    Get billing history
// @route   GET /api/subscriptions/billing-history
// @access  Private
router.get('/billing-history', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    const history = subscription.paymentHistory
      .sort((a, b) => b.paidAt - a.paidAt)
      .slice(0, 20); // Last 20 payments

    res.json({
      success: true,
      data: {
        history
      }
    });
  } catch (error) {
    logger.error('Get billing history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});










// New subscription management routes using Subscription model as primary source

// @desc    Get subscription status (new unified endpoint)
// @route   GET /api/subscriptions/status
// @access  Private
router.get('/status', protect, subscriptionController.getSubscriptionStatus);

// @desc    Start trial (new unified endpoint)
// @route   POST /api/subscriptions/start-trial-new
// @access  Private
router.post('/start-trial-new', protect, subscriptionController.startTrial);

// @desc    Activate pro plan (new unified endpoint)
// @route   POST /api/subscriptions/activate-pro
// @access  Private
router.post('/activate-pro', protect, subscriptionController.activatePro);

// @desc    Cancel subscription (new unified endpoint)
// @route   POST /api/subscriptions/cancel
// @access  Private
router.post('/cancel-new', protect, subscriptionController.cancelSubscription);

// @desc    Get subscription data for localStorage
// @route   GET /api/subscriptions/localstorage
// @access  Private
router.get('/localstorage', protect, subscriptionController.getSubscriptionForLocalStorage);

module.exports = router;