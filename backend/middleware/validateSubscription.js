const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');

/**
 * Middleware to validate subscription and handle expiration cleanup
 * Runs on every authenticated API request to check subscription status
 * and automatically downgrade expired users to free plan
 * Now uses Subscription model as primary source
 */
const validateSubscription = async (req, res, next) => {
  try {
    // Skip validation for non-authenticated routes
    if (!req.user || !req.user.id) {
      return next();
    }

    // Get fresh user data from database
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

    // Check if subscription is expired
    if (subscription.isExpired) {
      logger.info(`Subscription expired for user ${user.email}, downgrading to free plan`);
      
      // Reset to free plan
      await subscription.resetToFreePlan();
      
      // Get user's resumes and delete extra ones beyond free limit (2)
      const userResumes = await Resume.find({ user: user._id })
        .sort({ createdAt: -1 }); // Sort by creation date (newest first)
      
      if (userResumes.length > 2) {
        const resumesToDelete = userResumes.slice(2); // Keep latest 2, delete the rest
        
        logger.info(`Deleting ${resumesToDelete.length} extra resumes for user ${user.email}`);
        
        // Delete extra resumes
        const resumeIdsToDelete = resumesToDelete.map(resume => resume._id);
        await Resume.deleteMany({ _id: { $in: resumeIdsToDelete } });
        
        logger.info(`Deleted resumes: ${resumeIdsToDelete.join(', ')}`);
      }
      
      // Update user object in request for consistency
      req.user = user;
      req.subscription = subscription;
      
      logger.info(`Successfully downgraded user ${user.email} to free plan`);
    } else {
      // Add subscription to request for use in routes
      req.subscription = subscription;
    }

    // Continue to next middleware/route
    next();
  } catch (error) {
    logger.error('Subscription validation error:', error);
    
    // Don't block the request if subscription validation fails
    // Log the error and continue
    next();
  }
};

module.exports = validateSubscription;
