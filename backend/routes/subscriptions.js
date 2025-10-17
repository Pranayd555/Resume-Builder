const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');
const { calculateTotalTokens } = require('../utils/tokenCalculator');

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
        id: 'base',
        name: 'Base',
        price: { monthly: 299 },
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
          exports: ['pdf'],
          aiActions: 'token-based',
          freeTokens: 150
        },
        popular: true,
        trial: {
          free: 3,
          paid: 7
        }
      },
      {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 499 },
        features: [
          '5 resume projects total',
          'Full access to all premium templates',
          '300 free tokens + token-based AI actions',
          'Resume feedback analysis (ATS score, grammar)',
          'PDF export',
          'Priority support',
          'Unlimited exports',
          'Cloud resume history'
        ],
        limits: {
          resumes: 5,
          templates: ['free', 'premium'],
          exports: ['pdf'],
          aiActions: 'token-based',
          freeTokens: 300
        },
        popular: false,
        trial: {
          free: 3,
          paid: 7
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
  body('trialType').isIn(['free', 'paid']).withMessage('Valid trial type is required')
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
      subscription = Subscription.createTrial(req.user.id, trialType, trialType === 'free' ? 3 : 7);
    } else {
      // Update existing subscription for trial
      subscription.plan = 'pro';
      subscription.status = 'trialing';
      subscription.hasHadTrial = true;
      subscription.billing = {
        trialType: trialType,
        trialEnd: new Date(Date.now() + (trialType === 'free' ? 3 : 7) * 24 * 60 * 60 * 1000)
      };
      
      // Reset usage for trial
      subscription.usage = {
        resumesCreated: 0,
        aiActionsThisMonth: 0,
        monthStartAtUtc: new Date()
      };
      
      // Clear any existing payment data for trial
      // Payment integration removed
    }

    await subscription.save();

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
  body('plan').isIn(['base', 'pro']).withMessage('Valid plan is required'),
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
    
    if (!subscription) {
      // Create new subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: plan,
        status: 'active',
        billing: {
          cycle: 'monthly',
          amount: amount,
          currency: 'INR',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
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
        cycle: 'monthly',
        amount: amount,
        currency: 'INR',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan subscription`,
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
          name: plan === 'base' ? 'Base Plan' : 'Pro Plan',
          price: amount,
          features: plan === 'base' ? ['150 free tokens', 'Premium templates', 'ATS analysis'] : ['300 free tokens', 'All features', 'Priority support']
        },
        billingCycle: 'monthly',
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
    let mergedFreeTokens = subscription.features.freeTokens || 0;
    if (subscription.plan !== 'free' && remainingFreeTokens > 0) {
      const newPlanFreeTokens = subscription.features.freeTokens || 0;
      mergedFreeTokens = newPlanFreeTokens + remainingFreeTokens;
      subscription.features.freeTokens = mergedFreeTokens;
      await subscription.save(); // Save again with merged tokens
    }
    
    logger.info(`Subscription activated: ${plan} plan for user ${req.user.email}, Payment ID: ${paymentId}. Free tokens: ${mergedFreeTokens} (${remainingFreeTokens > 0 ? `merged: ${remainingFreeTokens} remaining + ${subscription.features.freeTokens - remainingFreeTokens} new` : 'new'})`);
    
    // Restore any expired resumes when user resubscribes
    let restoreResult = null;
    try {
      restoreResult = await subscription.restoreExpiredResumes();
      if (restoreResult.action === 'restored') {
        logger.info(`Restored ${restoreResult.restoredCount} resumes for user ${req.user.email}`);
      }
    } catch (restoreError) {
      logger.error('Failed to restore expired resumes:', restoreError);
      // Don't fail the activation if resume restoration fails
    }
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    res.json({
      success: true,
      data: {
        subscription,
        message: `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated successfully`,
        totalTokenBalance: tokenData.totalTokenBalance,
        nextBillingDate: subscription.billing.nextBillingDate,
        resumeRestoration: restoreResult
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
  body('plan').isIn(['base', 'pro']).withMessage('Valid plan is required'),
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
    const planHierarchy = { free: 0, base: 1, pro: 2 };
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
    const newPlanFreeTokens = plan === 'base' ? 150 : plan === 'pro' ? 300 : 0;
    
    // Update subscription
    subscription.plan = plan;
    subscription.status = 'active';
    subscription.billing.cycle = 'monthly';
    subscription.billing.amount = amount;
    
    // Extend subscription end date by 30 days from current nextBillingDate or now
    const currentNextBilling = subscription.billing.nextBillingDate || new Date();
    subscription.billing.nextBillingDate = new Date(currentNextBilling.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Merge tokens: remaining tokens from old plan + new plan tokens
    const mergedFreeTokens = remainingFreeTokens + newPlanFreeTokens;
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
      description: `Upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`,
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
          name: plan === 'base' ? 'Base Plan' : 'Pro Plan',
          price: amount,
          features: plan === 'base' ? ['150 free tokens', 'Premium templates', 'ATS analysis'] : ['300 free tokens', 'All features', 'Priority support']
        },
        previousPlanDetails: {
          name: subscription.plan === 'free' ? 'Free Plan' : subscription.plan === 'base' ? 'Base Plan' : 'Pro Plan',
          features: subscription.plan === 'free' ? ['Basic templates', 'Limited features'] : subscription.plan === 'base' ? ['150 free tokens', 'Premium templates'] : ['300 free tokens', 'All features']
        },
        billingCycle: 'monthly',
        nextBillingDate: subscription.billing.nextBillingDate,
        source: 'admin_upgrade',
        campaign: req.headers.referer || 'direct',
        sessionId: req.sessionID || 'no_session',
        upgradeType: 'manual',
        upgradeReason: 'admin_initiated'
      }
    });
    
    await subscription.save();
    
    logger.info(`Subscription upgraded: ${plan} plan for user ${req.user.email}, Payment ID: ${paymentId}. Free tokens merged: ${remainingFreeTokens} (remaining) + ${newPlanFreeTokens} (new) = ${mergedFreeTokens} total`);
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    res.json({
      success: true,
      data: {
        subscription,
        message: `Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`,
        totalTokenBalance: tokenData.totalTokenBalance,
        nextBillingDate: subscription.billing.nextBillingDate,
        tokenMerge: {
          previousRemainingTokens: remainingFreeTokens,
          newPlanTokens: newPlanFreeTokens,
          mergedTokens: mergedFreeTokens,
          totalAvailable: tokenData.totalTokenBalance
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

    if (subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel free plan'
      });
    }

    // Stripe integration removed

    // Update subscription
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    subscription.cancelReason = req.body.reason;
    subscription.endDate = subscription.billing.nextBillingDate;

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

// @desc    Reactivate subscription
// @route   POST /api/subscriptions/reactivate
// @access  Private
router.post('/reactivate', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    if (subscription.status !== 'canceled') {
      return res.status(400).json({
        success: false,
        error: 'Subscription is not canceled'
      });
    }

    // Stripe integration removed

    // Update subscription
    subscription.status = 'active';
    subscription.canceledAt = undefined;
    subscription.cancelReason = undefined;
    subscription.endDate = undefined;

    await subscription.save();

    logger.info(`Subscription reactivated for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        subscription
      }
    });
  } catch (error) {
    logger.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Error reactivating subscription'
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

// @desc    Get detailed payment analytics
// @route   GET /api/subscriptions/payment-analytics
// @access  Private
router.get('/payment-analytics', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Calculate analytics
    const totalPayments = subscription.paymentHistory.length;
    const totalAmount = subscription.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    const successfulPayments = subscription.paymentHistory.filter(p => p.status === 'succeeded').length;
    const failedPayments = subscription.paymentHistory.filter(p => p.status === 'failed').length;
    
    // Plan distribution
    const planDistribution = subscription.paymentHistory.reduce((acc, payment) => {
      const plan = payment.metadata?.plan || 'unknown';
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});

    // Payment method distribution
    const paymentMethodDistribution = subscription.paymentHistory.reduce((acc, payment) => {
      const method = payment.metadata?.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Monthly revenue
    const monthlyRevenue = subscription.paymentHistory.reduce((acc, payment) => {
      const month = new Date(payment.paidAt).toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + payment.amount;
      return acc;
    }, {});

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivity = subscription.paymentHistory.filter(p => new Date(p.paidAt) >= thirtyDaysAgo);

    // User Razorpay transactions
    const razorpayTransactions = user?.razorpayTransactions || [];

    res.json({
      success: true,
      data: {
        summary: {
          totalPayments,
          totalAmount,
          successfulPayments,
          failedPayments,
          successRate: totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0,
          averagePaymentAmount: totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0
        },
        distribution: {
          plans: planDistribution,
          paymentMethods: paymentMethodDistribution
        },
        revenue: {
          monthly: monthlyRevenue,
          total: totalAmount
        },
        activity: {
          recent: recentActivity.length,
          last30Days: recentActivity
        },
        subscription: {
          currentPlan: subscription.plan,
          status: subscription.status,
          nextBillingDate: subscription.billing?.nextBillingDate,
          freeTokens: subscription.features?.freeTokens || 0,
          freeTokensUsed: subscription.usage?.freeTokensUsed || 0
        },
        tracking: {
          totalRazorpayTransactions: razorpayTransactions.length,
          lastTransaction: razorpayTransactions[0] || null
        }
      }
    });
  } catch (error) {
    logger.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Handle subscription expiration
// @route   POST /api/subscriptions/handle-expiration
// @access  Private
router.post('/handle-expiration', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Check if user is downgrading from paid to free
    if (subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        error: 'User is already on free plan'
      });
    }

    // Handle subscription expiration
    const result = await subscription.handleSubscriptionExpiration();
    
    // Update subscription to free plan
    subscription.plan = 'free';
    subscription.status = 'active';
    subscription.endDate = new Date();
    subscription.canceledAt = new Date();
    subscription.cancelReason = 'subscription_expired';
    
    // Clear billing information
    subscription.billing = {
      currency: 'USD'
    };
    
    await subscription.save();

    logger.info(`Subscription expired for user ${req.user.email}: ${result.message}`);

    res.json({
      success: true,
      data: {
        message: 'Subscription expiration handled successfully',
        result
      }
    });
  } catch (error) {
    logger.error('Handle subscription expiration error:', error);
    res.status(500).json({
      success: false,
      error: 'Error handling subscription expiration'
    });
  }
});

// @desc    Restore expired resumes when resubscribing
// @route   POST /api/subscriptions/restore-resumes
// @access  Private
router.post('/restore-resumes', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Check if user has upgraded to a paid plan
    if (subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        error: 'User must be on a paid plan to restore resumes'
      });
    }

    // Restore expired resumes
    const result = await subscription.restoreExpiredResumes();

    logger.info(`Resumes restored for user ${req.user.email}: ${result.message}`);

    res.json({
      success: true,
      data: {
        message: 'Resumes restored successfully',
        result
      }
    });
  } catch (error) {
    logger.error('Restore resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Error restoring resumes'
    });
  }
});

// @desc    Get resumes marked for deletion
// @route   GET /api/subscriptions/expired-resumes
// @access  Private
router.get('/expired-resumes', protect, async (req, res) => {
  try {
    const Resume = require('../models/Resume');
    
    const resumes = await Resume.find({
      user: req.user.id,
      markedForDeletion: true
    }).sort({ deletionDate: 1 });

    res.json({
      success: true,
      data: {
        resumes,
        count: resumes.length
      }
    });
  } catch (error) {
    logger.error('Get expired resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching expired resumes'
    });
  }
});


module.exports = router; 