const User = require('../models/User');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');

/**
 * Middleware to validate subscription and handle expiration cleanup
 * Runs on every authenticated API request to check subscription status
 * and automatically downgrade expired users to free plan
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

    // Check if subscription is expired
    if (user.isSubscriptionExpired()) {
      logger.info(`Subscription expired for user ${user.email}, downgrading to free plan`);
      
      // Reset to free plan
      await user.resetToFreePlan();
      
      // Get user's resumes and delete extra ones beyond free limit (2)
      const userResumes = await Resume.find({ user: user._id })
        .sort({ createdAt: 1 }); // Sort by creation date (oldest first)
      
      if (userResumes.length > 2) {
        const resumesToDelete = userResumes.slice(2); // Keep oldest 2, delete the rest
        
        logger.info(`Deleting ${resumesToDelete.length} extra resumes for user ${user.email}`);
        
        // Delete extra resumes
        const resumeIdsToDelete = resumesToDelete.map(resume => resume._id);
        await Resume.deleteMany({ _id: { $in: resumeIdsToDelete } });
        
        logger.info(`Deleted resumes: ${resumeIdsToDelete.join(', ')}`);
      }
      
      // Update user object in request for consistency
      req.user = user;
      
      logger.info(`Successfully downgraded user ${user.email} to free plan`);
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
