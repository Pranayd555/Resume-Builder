const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Subscription Controller
 * Handles subscription-related operations for the new simplified system
 */

/**
 * Start a 7-day trial for the user
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

    // Check if user already has an active trial or pro subscription
    if (user.subscriptionType === 'trial' && !user.isSubscriptionExpired()) {
      return res.status(400).json({
        success: false,
        error: 'Trial already active'
      });
    }

    if (user.subscriptionType === 'pro' && !user.isSubscriptionExpired()) {
      return res.status(400).json({
        success: false,
        error: 'Pro subscription already active'
      });
    }

    // Start trial
    try {
      await user.startTrial();
      logger.info(`Trial started for user ${user.email}`);
    } catch (trialError) {
      logger.error('Error starting trial:', trialError);
      return res.status(500).json({
        success: false,
        error: 'Error starting trial'
      });
    }
    
    res.json({
      success: true,
      message: 'Trial started successfully',
      data: {
        subscriptionType: user.subscriptionType,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        resumeLimit: user.resumeLimit,
        aiTokens: user.aiTokens
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
