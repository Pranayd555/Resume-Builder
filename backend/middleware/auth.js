const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user has active subscription
const requireSubscription = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Not authenticated.'
    });
  }

  try {
    let subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. No subscription found.'
      });
    }

    // Check if trial has expired and update if necessary
    if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
      await subscription.expireTrial();
      // Refresh the subscription data after expiration
      subscription = await Subscription.findOne({ user: req.user.id });
    }

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Active subscription required.'
      });
    }

    // Add subscription to request for later use
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Require subscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking subscription status'
    });
  }
};

// Check subscription limits for resume creation
const checkResumeLimit = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'No subscription found. Please upgrade to create resumes.'
      });
    }

    // Check if trial has expired and update if necessary
    if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
      await subscription.expireTrial();
      // Refresh the subscription data after expiration
      subscription = await Subscription.findOne({ user: req.user.id });
    }

    const canCreate = await subscription.canCreateResume();
    if (!canCreate) {
      const currentUsage = subscription.usage.resumesCreated || 0;
      const limit = subscription.features?.resumeLimit || 2;
      const planName = subscription.plan === 'free' ? 'Free' : 'Pro';
      return res.status(403).json({
        success: false,
        error: `Resume creation limit reached. You have created ${currentUsage}/${limit} resumes on your ${planName} plan. Please upgrade to create more resumes.`,
        limitReached: true,
        currentUsage,
        limit,
        plan: subscription.plan
      });
    }

    // Add subscription to request for later use
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Check resume limit error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking subscription limits'
    });
  }
};

// Check AI action limits
const checkAIActionLimit = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'No subscription found. Please upgrade to use AI features.'
      });
    }

    // Check if trial has expired and update if necessary
    if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
      await subscription.expireTrial();
      // Refresh the subscription data after expiration
      subscription = await Subscription.findOne({ user: req.user.id });
    }

    if (!subscription.canUseAIAction()) {
      const currentUsage = subscription.usage.aiActionsThisCycle || 0;
      const limit = subscription.features?.aiActionsLimit || 200;
      const planName = subscription.plan === 'free' ? 'Free' : 'Pro';
      const cycleType = subscription.plan === 'free' ? 'month' : (subscription.billing?.cycle || 'month');
      return res.status(403).json({
        success: false,
        error: `${cycleType.charAt(0).toUpperCase() + cycleType.slice(1)}ly AI action limit reached. You have used ${currentUsage}/${limit} AI actions this ${cycleType} on your ${planName} plan. Please upgrade to use more AI actions.`,
        limitReached: true,
        currentUsage,
        limit,
        plan: subscription.plan,
        cycleType
      });
    }

    // Add subscription to request for later use
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Check AI action limit error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking AI action limits'
    });
  }
};

// Check template access
const checkTemplateAccess = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });
    const templateTier = req.body.templateTier || req.params.templateTier || 'free';
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'No subscription found. Please upgrade to access premium templates.'
      });
    }

    // Check if trial has expired and update if necessary
    if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
      await subscription.expireTrial();
      // Refresh the subscription data after expiration
      subscription = await Subscription.findOne({ user: req.user.id });
    }

    if (!subscription.canAccessTemplate(templateTier)) {
      const planType = subscription.isTrialActive() ? 'trial' : subscription.plan;
      return res.status(403).json({
        success: false,
        error: `Template not available in your ${planType} plan. Please upgrade to Pro plan.`
      });
    }

    // Add subscription to request for later use
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Check template access error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking template access'
    });
  }
};

// Check export format access
const checkExportFormat = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });
    const format = req.body.format || req.params.format || 'pdf';
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'No subscription found. Please upgrade to export resumes.'
      });
    }

    // Check if trial has expired and update if necessary
    if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
      await subscription.expireTrial();
      // Refresh the subscription data after expiration
      subscription = await Subscription.findOne({ user: req.user.id });
    }

    if (!subscription.canExportFormat(format)) {
      const planType = subscription.isTrialActive() ? 'trial' : subscription.plan;
      return res.status(403).json({
        success: false,
        error: `${format.toUpperCase()} export not available in your ${planType} plan. Please upgrade to Pro plan.`
      });
    }

    // Add subscription to request for later use
    req.subscription = subscription;
    next();
  } catch (error) {
    logger.error('Check export format error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking export format access'
    });
  }
};

// Check and consume tokens for free plan users
const checkTokenLimit = async (req, res, next) => {
  try {
    // Only check tokens for free plan users
    if (req.subscription && req.subscription.plan === 'free') {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user has enough tokens (1 token for resume parsing)
      if (!user.hasTokens(1)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient tokens. You need 1 token to parse resume files. Please buy tokens to continue.',
          tokensRequired: 1,
          currentTokens: user.tokens,
          action: 'buy_tokens'
        });
      }

      // Consume 1 token for resume parsing
      try {
        await user.consumeTokens(1);
        logger.info(`Token consumed: 1 token for user ${req.user.id}, remaining: ${user.tokens}`);
      } catch (error) {
        logger.error(`Error consuming tokens: ${error.message}`);
        return res.status(500).json({
          success: false,
          error: 'Error processing token consumption'
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Check token limit error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking token limits'
    });
  }
};

// Track usage after successful operations
const trackUsage = async (req, res, next) => {
  const originalSend = res.json;
  
  res.json = function(data) {
    // Only track usage if the operation was successful
    if (data.success && req.subscription) {
      const usageType = req.usageType || 'resume';
      
      req.subscription.incrementUsage(usageType)
        .then(() => {
          logger.info(`Usage tracked: ${usageType} for user ${req.user.id}`);
        })
        .catch(error => {
          logger.error(`Error tracking usage: ${error.message}`);
        });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  protect,
  authorize,
  requireSubscription,
  checkResumeLimit,
  checkAIActionLimit,
  checkTemplateAccess,
  checkExportFormat,
  checkTokenLimit,
  trackUsage
}; 