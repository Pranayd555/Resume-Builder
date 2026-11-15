const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { spendTokens, refundSpend, tokenPayload } = require('../utils/tokenCalculator');

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

      req.isOwnApiKey = !!req.user.isOwnApiKey;

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

// Charge one AI token before an AI action (skip it for BYOK users with
// skipIfBYOK). The spend is a single atomic update, bonus tokens first, so
// concurrent requests can't overspend. If the action then fails (a JSON body
// with success: false, or any 4xx/5xx status), the token goes back to the pool
// it came from and the refreshed balance is attached to the error body as
// `tokens`. Successful responses carry the new balance in req.tokens.
const AI_ACTION_COST = 1;

const chargeAIToken = async (req, res, next) => {
  let result;
  try {
    result = await spendTokens(req.user._id, AI_ACTION_COST);
  } catch (error) {
    logger.error(`Error charging AI token for user ${req.user && req.user._id}: ${error.message}`);
    return res.status(error.statusCode === 404 ? 404 : 500).json({
      success: false,
      error: error.statusCode === 404 ? 'User not found' : 'Error checking token balance'
    });
  }

  if (!result.ok) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient tokens. You need 1 token to use AI features. Please buy tokens to continue.',
      limitReached: true,
      tokensRequired: AI_ACTION_COST,
      action: 'buy_tokens',
      tokens: tokenPayload(result.balance)
    });
  }

  req.tokens = tokenPayload(result.balance);
  logger.info(`AI token charged for user ${req.user._id} (bonus: ${result.spent.fromBonus}, purchased: ${result.spent.fromPurchased}); remaining ${result.balance.total}`);

  let settled = false;
  const refund = async () => {
    if (settled) return null;
    settled = true;
    try {
      const balance = await refundSpend(req.user._id, result.spent);
      logger.info(`AI token refunded to user ${req.user._id} after a failed AI action`);
      return balance;
    } catch (error) {
      logger.error(`Error refunding AI token for user ${req.user._id}: ${error.message}`);
      return null;
    }
  };

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (!settled && body && body.success === false) {
      refund().then((balance) => {
        if (balance && typeof body === 'object') {
          body.tokens = tokenPayload(balance);
          if (body.data && typeof body.data === 'object') delete body.data.tokens;
        }
        originalJson(body);
      });
      return res;
    }
    if (res.statusCode < 400) settled = true;
    return originalJson(body);
  };

  // Non-JSON failures (res.send, error handler, etc.)
  res.on('finish', () => {
    if (!settled && res.statusCode >= 400) refund();
    settled = true;
  });

  next();
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

const skipIfBYOK = (middleware) => {
  return (req, res, next) => {
    if (req.isOwnApiKey) return next();
    return middleware(req, res, next);
  };
};

module.exports = {
  protect,
  authorize,
  checkTemplateAccess,
  checkExportFormat,
  chargeAIToken,
  trackUsage,
  checkUserStatus,
  skipIfBYOK
}; 