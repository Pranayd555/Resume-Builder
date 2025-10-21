const User = require('../models/User');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

/**
 * Subscription Controller
 * Handles subscription-related operations for the new simplified system
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

    // Check if user already has a subscription record
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
        error: 'You have already used your free trial'
      });
    }

    // Create new subscription if doesn't exist
    if (!subscription) {
      subscription = await Subscription.createTrial(req.user.id, 'free', 3); // Always 3 days for free trial
      subscription.features.freeTokens = 0; // Ensure no free tokens are granted during trial
    } else {
      // Update existing subscription for trial
      subscription.plan = 'pro_monthly';
      subscription.status = 'trialing';
      subscription.hasHadTrial = true;
      subscription.billing = {
        trialType: 'free',
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
    }

    await subscription.save();

    // Also update User model for backward compatibility
    user.subscriptionType = 'trial';
    user.subscriptionStart = new Date();
    user.subscriptionEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    user.resumeLimit = 5;
    user.aiTokens = 0; // No free tokens during trial
    await user.save();

    logger.info(`Trial started for user ${user.email}`);
    
    res.json({
      success: true,
      message: 'Trial started successfully',
      data: {
        subscriptionType: 'trial',
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        resumeLimit: user.resumeLimit,
        aiTokens: user.aiTokens,
        trialRemainingDays: 3
      }
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

    // Activate pro plan
    try {
      await user.activatePro(planType);
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
      data: {
        subscriptionType: user.subscriptionType,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        resumeLimit: user.resumeLimit,
        aiTokens: user.aiTokens,
        planType: planType
      }
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

    // Safely check if subscription is expired and handle cleanup
    try {
      if (user.isSubscriptionExpired && user.isSubscriptionExpired()) {
        await user.resetToFreePlan();
        logger.info(`Subscription expired for user ${user.email}, reset to free plan`);
      }
    } catch (expiredError) {
      logger.error('Error checking subscription expiration:', expiredError);
      // Continue with the request even if expiration check fails
    }

    // Calculate remaining days safely
    let remainingDays = null;
    try {
      if (user.subscriptionEnd && user.subscriptionType !== 'free') {
        const now = new Date();
        const endDate = new Date(user.subscriptionEnd);
        const diffTime = endDate - now;
        remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        remainingDays = Math.max(0, remainingDays);
      }
    } catch (dateError) {
      logger.error('Error calculating remaining days:', dateError);
      remainingDays = null;
    }

    // Safely get usage data
    let usageData = {
      resumesCreated: 0,
      canCreateResume: false
    };
    
    try {
      usageData = {
        resumesCreated: user.usage?.resumesCreated || 0,
        canCreateResume: user.canCreateResume ? user.canCreateResume() : false
      };
    } catch (usageError) {
      logger.error('Error getting usage data:', usageError);
    }

    // Safely get subscription status
    let isActive = false;
    let isExpired = false;
    
    try {
      isActive = user.isSubscriptionActive || false;
      isExpired = user.isSubscriptionExpired ? user.isSubscriptionExpired() : false;
    } catch (statusError) {
      logger.error('Error getting subscription status:', statusError);
    }

    res.json({
      success: true,
      data: {
        subscriptionType: user.subscriptionType || 'free',
        subscriptionStart: user.subscriptionStart || new Date(),
        subscriptionEnd: user.subscriptionEnd || null,
        resumeLimit: user.resumeLimit || 2,
        aiTokens: user.aiTokens || 20,
        isActive: isActive,
        isExpired: isExpired,
        remainingDays: remainingDays,
        usage: usageData
      }
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
  isPlanValid
};
