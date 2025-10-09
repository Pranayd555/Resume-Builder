const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

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
        price: { monthly: 0, yearly: 0 },
        features: [
          '2 resume projects total',
          'Basic templates only',
          'PDF export (with watermark)',
          'Email support',
          '10 AI actions per month'
        ],
        limits: {
          resumes: 2,
          templates: ['free'],
          exports: ['pdf'],
          aiActions: 10
        },
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 9.99, yearly: 79 },
        features: [
          '5 resume projects total',
          'Full access to all premium templates',
          '200 AI actions per month',
          'Resume feedback analysis (ATS score, grammar)',
          'Export in DOCX + PDF',
          'No watermark, unlimited exports',
          'Cloud resume history',
          'Priority support'
        ],
        limits: {
          resumes: 5,
          templates: ['free', 'pro'],
          exports: ['pdf', 'docx'],
          aiActions: 200
        },
        popular: true,
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
            limit: subscription.features?.aiActionsLimit || 10
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

// Stripe checkout session route removed

// Stripe success handler removed

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

// Stripe payment method update route removed

// Stripe webhook handler and helper functions removed

module.exports = router; 