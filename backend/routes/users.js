const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let subscription = await Subscription.findOne({ user: req.user.id });

    // Apply same subscription processing logic as /current endpoint
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
    
    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          subscription
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  protect,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().trim().isLength({ max: 20 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const updateData = {};
    const allowedFields = ['firstName', 'lastName', 'phone', 'location', 'bio'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let subscription = await Subscription.findOne({ user: req.user.id });

    // Apply same subscription processing logic as /current endpoint
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
    
    const resumeCount = await Resume.countDocuments({ user: req.user.id });
    const publishedResumeCount = await Resume.countDocuments({ 
      user: req.user.id, 
      status: 'published' 
    });
    
    const recentResumes = await Resume.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('template', 'name category');

    const totalViews = await Resume.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: null, totalViews: { $sum: '$analytics.views' } } }
    ]);

    const totalDownloads = await Resume.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: null, totalDownloads: { $sum: '$analytics.downloads' } } }
    ]);

    const stats = {
      resumeCount,
      publishedResumeCount,
      totalViews: totalViews[0]?.totalViews || 0,
      totalDownloads: totalDownloads[0]?.totalDownloads || 0,
      subscription: subscription?.plan || 'free',
      subscriptionStatus: subscription?.status || 'active',
      remainingResumes: subscription?.canCreateResume() ? 
        subscription.features.resumeLimit - subscription.usage.resumesCreated : 0,
      remainingExports: subscription?.features.unlimitedExports ? 
        'Unlimited' : 
        Math.max(0, 10 - (subscription?.usage.exportsThisMonth || 0))
    };

    res.json({
      success: true,
      data: {
        stats,
        recentResumes
      }
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', [
  protect,
  body('theme').optional().isIn(['light', 'dark', 'system']),
  body('language').optional().isLength({ min: 2, max: 10 }),
  body('emailNotifications').optional().isBoolean(),
  body('marketingEmails').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { theme, language, emailNotifications, marketingEmails } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'preferences.theme': theme,
        'preferences.language': language,
        'preferences.emailNotifications': emailNotifications,
        'preferences.marketingEmails': marketingEmails
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user activity
// @route   GET /api/users/activity
// @access  Private
router.get('/activity', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get recent resume activities
    const recentResumes = await Resume.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('template', 'name category')
      .select('title status updatedAt analytics');

    // Get export history
    const exportHistory = await Resume.aggregate([
      { $match: { user: req.user.id } },
      { $unwind: '$exports' },
      { $sort: { 'exports.exportedAt': -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          'exports.format': 1,
          'exports.exportedAt': 1,
          'exports.downloadCount': 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        recentResumes,
        exportHistory,
        pagination: {
          page,
          limit,
          total: await Resume.countDocuments({ user: req.user.id })
        }
      }
    });
  } catch (error) {
    logger.error('User activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Export user data
// @route   GET /api/users/export
// @access  Private
router.get('/export', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const subscription = await Subscription.findOne({ user: req.user.id });
    const resumes = await Resume.find({ user: req.user.id })
      .populate('template', 'name category');

    const userData = {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        createdAt: user.createdAt,
        preferences: user.preferences
      },
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        features: subscription.features
      } : null,
      resumes: resumes.map(resume => ({
        title: resume.title,
        status: resume.status,
        personalInfo: resume.personalInfo,
        summary: resume.summary,
        workExperience: resume.workExperience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
        achievements: resume.achievements,
        template: resume.template,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      })),
      exportedAt: new Date()
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    logger.error('Export user data error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Admin routes
// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('subscription');

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('subscription');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const resumeCount = await Resume.countDocuments({ user: req.params.id });

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          resumeCount
        }
      }
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
router.put('/:id/status', [
  protect,
  authorize('admin'),
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.info(`User ${user.email} status updated to ${isActive ? 'active' : 'inactive'} by admin ${req.user.email}`);

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add tokens to user account
// @route   POST /api/users/add-tokens
// @access  Private
router.post('/add-tokens', protect, async (req, res) => {
  try {
    const { tokens, paymentId, orderId, amount, plan, source } = req.body;

    // Validate required fields
    if (!tokens || tokens <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid token amount is required'
      });
    }

    if (!paymentId || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Payment details are required'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add tokens to user account
    const previousTokens = user.tokens || 0;
    user.tokens = (user.tokens || 0) + tokens;
    await user.save();

    // Log the transaction
    logger.info(`Added ${tokens} tokens to user ${user.email}. Previous: ${previousTokens}, New total: ${user.tokens}`);

    res.json({
      success: true,
      data: {
        message: `Successfully added ${tokens} tokens`,
        tokens: {
          added: tokens,
          previous: previousTokens,
          current: user.tokens
        },
        payment: {
          paymentId,
          orderId,
          amount,
          plan: plan || 'token_purchase',
          source: source || 'direct_purchase'
        }
      }
    });

  } catch (error) {
    logger.error('Add tokens error:', error);
    
    // Send error notification email
    try {
      const emailService = require('../utils/emailService');
      const emailResult = await emailService.sendErrorNotification({
        type: 'TOKEN_ADDITION_FAILED',
        userEmail: req.user.email,
        userId: req.user.id,
        error: error.message,
        requestData: {
          tokens: req.body.tokens,
          paymentId: req.body.paymentId,
          orderId: req.body.orderId,
          amount: req.body.amount,
          plan: req.body.plan
        },
        timestamp: new Date()
      });
      
      if (emailResult.success) {
        logger.info('Error notification email sent successfully');
      } else {
        logger.error('Failed to send error notification email:', emailResult.error);
      }
    } catch (emailError) {
      logger.error('Failed to send error notification email:', emailError);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to add tokens. Support has been notified.'
    });
  }
});

// @desc    Test error notification email
// @route   POST /api/users/test-error-email
// @access  Private
router.post('/test-error-email', protect, async (req, res) => {
  try {
    const emailService = require('../utils/emailService');
    
    const result = await emailService.sendErrorNotification({
      type: 'TEST_ERROR_NOTIFICATION',
      userEmail: req.user.email,
      userId: req.user.id,
      error: 'This is a test error notification',
      requestData: {
        test: true,
        timestamp: new Date(),
        userAgent: req.headers['user-agent']
      },
      timestamp: new Date()
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Test error notification sent successfully',
        result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test error notification',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Test error notification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test error notification failed',
      error: error.message
    });
  }
});

module.exports = router; 