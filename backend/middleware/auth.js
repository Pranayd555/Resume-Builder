const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { calculateTotalTokens } = require('../utils/tokenCalculator');

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
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has tokens available
    if (user.tokens <= 0 && user.bonusTokens <= 0) {
      return res.status(403).json({
        success: false,
        error: 'No tokens available. Please purchase more tokens to use AI features.',
        limitReached: true
      });
    }

    // Add user to request for later use
    req.userData = user;
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
    const templateTier = req.body.templateTier || req.params.templateTier || 'free';
    
    // For now, allow access to all templates (free tier only)
    // This can be updated later if premium templates are added
    if (templateTier !== 'free') {
      return res.status(403).json({
        success: false,
        error: 'Premium templates are not available. Please use free templates.'
      });
    }

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
    const format = req.body.format || req.params.format || 'pdf';
    
    // Allow PDF export for all users
    if (format !== 'pdf') {
      return res.status(403).json({
        success: false,
        error: `${format.toUpperCase()} export not available. Only PDF export is supported.`
      });
    }

    next();
  } catch (error) {
    logger.error('Check export format error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error checking export format access'
    });
  }
};

// Check and consume tokens for AI actions
const checkTokenLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has enough tokens (1 token for AI actions)
    if (!user.hasTokens(1)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient tokens. You need 1 token to use AI features. Please buy tokens to continue.',
        tokensRequired: 1,
        currentTokens: user.tokens,
        action: 'buy_tokens'
      });
    }

    // Consume 1 token for AI action
    try {
      await user.consumeTokens(1);
      logger.info(`Token consumed: 1 token for user ${req.user.id}, remaining: ${user.tokens + user.bonusTokens}`);
      const tokenData = await calculateTotalTokens(req.user.id);
      // Store user object and token data in request for potential refund and response
      req.userForRefund = user;
      req.tokens = {
        balance: tokenData.totalTokenBalance,
        purchasedTokens: tokenData.purchasedTokens,
        bonusTokens: tokenData.bonusTokens,
      };
    } catch (error) {
      logger.error(`Error consuming tokens: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: 'Error processing token consumption'
      });
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
    if (data.success && req.userData) {
      const usageType = req.usageType || 'resume';
      
      // Update user usage statistics
      if (usageType === 'resume') {
        req.userData.usage.resumesCreated = (req.userData.usage.resumesCreated || 0) + 1;
        req.userData.save().catch(error => {
          logger.error(`Error tracking usage: ${error.message}`);
        });
      }
      
      logger.info(`Usage tracked: ${usageType} for user ${req.user.id}`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};


// Helper function to refund tokens on AI errors
const refundTokenOnError = async (req, res, next) => {
  const originalSend = res.json;
  
  res.json = function(data) {
    // If the response indicates an error and we have a user for refund
    if (!data.success && req.userForRefund) {
      try {
        // Refund the token back to the user
        req.userForRefund.addTokens(1);
        logger.info(`Token refunded: 1 token returned to user ${req.userForRefund._id} due to AI error`);
      } catch (refundError) {
        logger.error(`Error refunding token: ${refundError.message}`);
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Check user status and handle cleanup
const checkUserStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next();
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive. Please contact support.'
      });
    }

    next();
  } catch (error) {
    logger.error('Check user status error:', error);
    next(); // Continue even if user status check fails
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
  checkUserStatus,
  refundTokenOnError
}; 