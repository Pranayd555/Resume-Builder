const User = require('../models/User');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

/**
 * Subscription Controller
 * Handles subscription-related operations using Subscription model as primary source
 */

/**
 * Start a 3-day trial for the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const startTrial = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get or create subscription
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      // Create default free subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active'
      });
      await subscription.save();
    }

    // Check if user already has an active trial
    if (subscription.status === 'trialing' && subscription.billing?.trialEnd) {
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
    logger.info(`Trial check for user ${user.email}: hasHadTrial=${subscription.hasHadTrial}, plan=${subscription.plan}, status=${subscription.status}`);
    
    if (subscription.hasHadTrial) {
      return res.status(400).json({
        success: false,
        error: 'You have already used your free trial'
      });
    }

    // Start trial
    await subscription.startTrial('free', 3, 'pro_monthly');
    
    logger.info(`Trial started for user ${user.email}`);
    
    res.json({
      success: true,
      message: 'Trial started successfully',
      data: subscription.getSubscriptionStatus()
    });
  } catch (error) {
    logger.error('Start trial error:', error);
    res.status(500).json({
      success: false,
      error: 'Error starting trial'
    });
  }
};

/**
 * Activate pro plan (monthly or yearly)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const activatePro = async (req, res) => {
  try {
    const { planType } = req.body; // 'monthly' or 'yearly'
    
    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid plan type is required (monthly or yearly)'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get or create subscription
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      // Create default free subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active'
      });
      await subscription.save();
    }

    // Activate pro plan
    try {
      await subscription.activatePro(planType);
      logger.info(`Pro plan activated for user ${user.email}: ${planType}`);
    } catch (proError) {
      logger.error('Error activating pro plan:', proError);
      return res.status(500).json({
        success: false,
        error: 'Error activating pro plan'
      });
    }
    
    res.json({
      success: true,
      message: 'Pro plan activated successfully',
      data: subscription.getSubscriptionStatus()
    });
  } catch (error) {
    logger.error('Activate pro error:', error);
    res.status(500).json({
      success: false,
      error: 'Error activating pro plan'
    });
  }
};

/**
 * Get current subscription status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get or create subscription
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      // Create default free subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active'
      });
      await subscription.save();
    }

    // Check if subscription is expired and handle cleanup
    try {
      if (subscription.isExpired) {
        await subscription.resetToFreePlan();
        logger.info(`Subscription expired for user ${user.email}, reset to free plan`);
      }
    } catch (expiredError) {
      logger.error('Error checking subscription expiration:', expiredError);
      // Continue with the request even if expiration check fails
    }

    // Get subscription status
    const subscriptionStatus = subscription.getSubscriptionStatus();

    res.json({
      success: true,
      data: subscriptionStatus
    });
  } catch (error) {
    logger.error('Get subscription status error:', error);
    
    // Provide more specific error information
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Data validation error'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error getting subscription status'
    });
  }
};

/**
 * Cancel subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelSubscription = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get subscription
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Cancel subscription
    await subscription.cancelSubscription(reason);
    
    logger.info(`Subscription canceled for user ${user.email}`);
    
    res.json({
      success: true,
      message: 'Subscription canceled successfully',
      data: subscription.getSubscriptionStatus()
    });
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Error canceling subscription'
    });
  }
};

/**
 * Get subscription details for localStorage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSubscriptionForLocalStorage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get or create subscription
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      // Create default free subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active'
      });
      await subscription.save();
    }

    // Check if trial has been used
    const hasUsedTrial = subscription.hasHadTrial || false;
    
    // Check if trial is currently active
    const isTrialActive = subscription.isTrialActive();
    
    // Check if trial has expired
    const hasTrialExpired = subscription.hasTrialExpired();

    // Debug logging
    logger.info(`localStorage API for user ${user.email}: hasHadTrial=${subscription.hasHadTrial}, hasUsedTrial=${hasUsedTrial}, isTrialActive=${isTrialActive}, hasTrialExpired=${hasTrialExpired}`);

    // Return data optimized for localStorage
    const localStorageData = {
      plan: subscription.plan,
      status: subscription.status,
      isActive: subscription.status === 'active' || subscription.status === 'trialing',
      isTrial: subscription.isTrial,
      isExpired: subscription.isExpired,
      remainingDays: subscription.remainingDays,
      trialRemainingDays: subscription.trialRemainingDays,
      // Direct trial usage information for frontend compatibility
      hasHadTrial: hasUsedTrial,
      // Trial usage information
      trialUsage: {
        hasUsedTrial: hasUsedTrial,
        isTrialActive: isTrialActive,
        hasTrialExpired: hasTrialExpired,
        canStartTrial: subscription.canStartTrial(),
        trialEnd: subscription.billing?.trialEnd,
        trialType: subscription.billing?.trialType
      },
      // Debug field to verify server is using updated code
      debugVersion: 'v2.0',
      features: {
        resumeLimit: subscription.features.resumeLimit,
        templateAccess: subscription.features.templateAccess,
        exportFormats: subscription.features.exportFormats,
        aiActionsLimit: subscription.features.aiActionsLimit,
        freeTokens: subscription.features.freeTokens,
        aiReview: subscription.features.aiReview,
        prioritySupport: subscription.features.prioritySupport,
        customBranding: subscription.features.customBranding,
        unlimitedExports: subscription.features.unlimitedExports
      },
      usage: {
        resumesCreated: subscription.usage.resumesCreated,
        aiActionsThisCycle: subscription.usage.aiActionsThisCycle,
        freeTokensUsed: subscription.usage.freeTokensUsed
      },
      billing: {
        cycle: subscription.billing.cycle,
        amount: subscription.billing.amount,
        currency: subscription.billing.currency,
        nextBillingDate: subscription.billing.nextBillingDate,
        trialEnd: subscription.billing.trialEnd
      },
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: localStorageData
    });
  } catch (error) {
    logger.error('Get subscription for localStorage error:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting subscription data'
    });
  }
};

/**
 * Helper function to check if a plan is valid
 * @param {String} subscriptionType - The subscription type to check
 * @param {Date} subscriptionEnd - The subscription end date
 * @returns {Boolean} - Whether the plan is valid
 */
const isPlanValid = (subscriptionType, subscriptionEnd) => {
  if (subscriptionType === 'free') return true;
  if (!subscriptionEnd) return false;
  return new Date() < new Date(subscriptionEnd);
};

module.exports = {
  startTrial,
  activatePro,
  getSubscriptionStatus,
  cancelSubscription,
  getSubscriptionForLocalStorage,
  isPlanValid
};
