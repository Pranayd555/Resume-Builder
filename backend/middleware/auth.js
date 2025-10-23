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

    if (!(await subscription.canUseAIAction())) {
      return res.status(403).json({
        success: false,
        error: 'No tokens available. Please purchase more tokens to use AI features.',
        limitReached: true,
        plan: subscription.plan
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

// Check subscription and handle automatic cleanup
const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const User = require('../models/User');
    const Subscription = require('../models/Subscription');
    const Resume = require('../models/Resume');

    // Get user with subscription details
    let user = await User.findById(req.user.id);
    if (!user) {
      return next();
    }

    // Check if subscription or trial has expired
    const now = new Date();
    const subscriptionEndDate = user.subscription?.endDate;
    
    // Check for subscription expiration
    const isSubscriptionExpired = subscriptionEndDate && new Date(subscriptionEndDate) < now;
    
    // Check for trial expiration
    let subscription = await Subscription.findOne({ user: user._id });
    const isTrialExpired = subscription && subscription.status === 'trialing' && subscription.hasTrialExpired();
    
    if (isSubscriptionExpired || isTrialExpired) {
      const expirationType = isTrialExpired ? 'trial' : 'subscription';
      logger.info(`${expirationType} expired for user ${user.email}, performing cleanup...`);
      
      // Only proceed if isDBCleared is false
      if (!user.isDBCleared) {
        // 1. Update subscription details to free
        user.subscription.plan = 'free';
        user.subscription.isActive = true;
        user.subscription.startDate = new Date();
        user.subscription.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
        
        // 2. Update subscription model if it exists
        if (subscription) {
          subscription.plan = 'free';
          subscription.status = 'active';
          subscription.billing = {
            cycle: 'monthly',
            amount: 0,
            currency: 'INR',
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            trialEnd: undefined,
            trialType: null,
            discountCode: undefined,
            discountAmount: 0
          };
          subscription.features = {
            resumeLimit: 2,
            templateAccess: ['free'],
            exportFormats: ['pdf'],
            aiActionsLimit: 'token-based',
            freeTokens: 0,
            aiReview: false,
            prioritySupport: false,
            customBranding: false,
            unlimitedExports: false
          };
          subscription.usage = {
            resumesCreated: 0,
            aiActionsThisCycle: 0,
            freeTokensUsed: 0,
            cycleStartDate: new Date(),
            lastBillingCycleReset: new Date()
          };
          subscription.paymentHistory = [];
          // Don't reset hasHadTrial flag - keep it true if user had trial
          await subscription.save();
        }

        // 3. Check resume count and cleanup if necessary
        const freePlanLimit = 2;
        const totalResumes = await Resume.countDocuments({ user: user._id });
        
        if (totalResumes > freePlanLimit) {
          logger.info(`User ${user.email} has ${totalResumes} resumes, limit is ${freePlanLimit}. Cleaning up...`);
          
          // Get resumes sorted by creation date (oldest first)
          const resumesToDelete = await Resume.find({ user: user._id })
            .sort({ createdAt: 1 })
            .limit(totalResumes - freePlanLimit)
            .select('_id');
          
          // Delete excess resumes
          const resumeIdsToDelete = resumesToDelete.map(resume => resume._id);
          await Resume.deleteMany({ _id: { $in: resumeIdsToDelete } });
          
          logger.info(`Deleted ${resumeIdsToDelete.length} resumes for user ${user.email}`);
        }

        // 4. Update isDBCleared flag
        user.isDBCleared = true;
        await user.save();
        
        logger.info(`${expirationType} cleanup completed for user ${user.email}`);
      }
    }

    next();
  } catch (error) {
    logger.error('Check subscription error:', error);
    // Don't block the request if cleanup fails
    next();
  }
};

module.exports = {
  protect,
  authorize,
  checkAIActionLimit,
  checkTemplateAccess,
  checkExportFormat,
  checkTokenLimit,
  trackUsage,
  checkSubscription
}; 