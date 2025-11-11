const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Resume = require('../models/Resume');
const Template = require('../models/Template');
const User = require('../models/User');
// Subscription model no longer needed
const logger = require('../utils/logger');
const { calculateTotalTokens } = require('../utils/tokenCalculator');

// @desc    Track resume view
// @route   POST /api/analytics/resume/:id/view
// @access  Private
router.post('/resume/:id/view', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Update resume analytics
    resume.analytics.views += 1;
    resume.analytics.lastViewed = new Date();
    await resume.save();

    logger.info(`Resume view tracked: ${resume.title} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    logger.error('Track resume view error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Track resume download
// @route   POST /api/analytics/resume/:id/download
// @access  Private
router.post('/resume/:id/download', protect, async (req, res) => {
  try {
    const { format = 'pdf' } = req.body;

    // All export formats are now available to all users

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Update resume analytics
    resume.analytics.downloads += 1;
    resume.analytics.lastDownloaded = new Date();
    await resume.save();

    // If resume has a template, increment template usage
    if (resume.template) {
      await Template.findByIdAndUpdate(
        resume.template,
        {
          $inc: { 'usage.totalUses': 1 },
          $addToSet: { 'usage.uniqueUsers': req.user.id }
        },
        { new: true }
      );
    }

    logger.info(`Resume download tracked: ${resume.title} (${format}) by user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        downloads: resume.analytics.downloads,
        lastDownloaded: resume.analytics.lastDownloaded
      },
      message: 'Download tracked successfully'
    });
  } catch (error) {
    logger.error('Track resume download error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Track template usage
// @route   POST /api/analytics/template/:id/use
// @access  Private
router.post('/template/:id/use', protect, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // All templates are now accessible to all users

    // Increment template usage
    await template.incrementUsage(req.user.id);

    logger.info(`Template usage tracked: ${template.name} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Template usage tracked successfully'
    });
  } catch (error) {
    logger.error('Track template usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get analytics summary for user
// @route   GET /api/analytics/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    // Get user's resumes analytics
    const resumes = await Resume.find({ user: req.user.id });
    
    const totalViews = resumes.reduce((sum, resume) => sum + (resume.analytics.views || 0), 0);
    const totalDownloads = resumes.reduce((sum, resume) => sum + (resume.analytics.downloads || 0), 0);

    // Get user info for tokens
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('tokens bonusTokens razorpayTransactions');
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    // Get templates used by user
    const templatesUsed = await Template.find({
      'usage.uniqueUsers': req.user.id
    }).select('name category usage');

    const analyticsSummary = {
      resumes: {
        total: resumes.length,
        totalViews,
        totalDownloads,
        averageViews: resumes.length > 0 ? Math.round(totalViews / resumes.length) : 0,
        averageDownloads: resumes.length > 0 ? Math.round(totalDownloads / resumes.length) : 0
      },
      templates: {
        totalUsed: templatesUsed.length,
        templates: templatesUsed.map(template => ({
          id: template._id,
          name: template.name,
          category: template.category,
          usage: template.usage
        }))
      },
      tokens: {
        balance: tokenData.totalTokenBalance,
        purchasedTokens: tokenData.purchasedTokens,
        bonusTokens: tokenData.bonusTokens,
        remainingFreeTokens: tokenData.remainingFreeTokens,
        recentTransactions: user?.razorpayTransactionsWithRefundStatus?.slice(0, 10) || []
      }
    };

    res.json({
      success: true,
      data: analyticsSummary
    });
  } catch (error) {
    logger.error('Get analytics summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get detailed AI usage analytics
// @route   GET /api/analytics/ai-usage
// @access  Private
router.get('/ai-usage', protect, async (req, res) => {
  try {
    // Get user info for tokens
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('tokens bonusTokens razorpayTransactions');
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    const aiUsageAnalytics = {
      currentUsage: {
        tokenBalance: tokenData.totalTokenBalance,
        purchasedTokens: tokenData.purchasedTokens,
        bonusTokens: tokenData.bonusTokens,
        remainingFreeTokens: tokenData.remainingFreeTokens,
        isTokenBased: true
      },
      recentTransactions: user?.razorpayTransactionsWithRefundStatus?.slice(0, 5) || []
    };

    res.json({
      success: true,
      data: aiUsageAnalytics
    });
  } catch (error) {
    logger.error('Get AI usage analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});


// @desc    Get user token balance and usage
// @route   GET /api/analytics/tokens
// @access  Private
router.get('/tokens', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('tokens bonusTokens razorpayTransactions');
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    const responseData = {
      balance: tokenData.totalTokenBalance,
      purchasedTokens: tokenData.purchasedTokens,
      bonusTokens: tokenData.bonusTokens,
        remainingFreeTokens: tokenData.remainingFreeTokens,
        recentTransactions: user?.razorpayTransactionsWithRefundStatus?.slice(0, 5) || []
    };
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    logger.error('Get token balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Track AI action usage (token-based)
// @route   POST /api/analytics/ai-action
// @access  Private
router.post('/ai-action', protect, async (req, res) => {
  try {
    const { actionType, tokensUsed = 1 } = req.body;
    
    // Get user info for tokens
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('tokens bonusTokens');
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    // Check if user has enough tokens
    if (tokenData.totalTokenBalance < tokensUsed) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient tokens. Please purchase more tokens to use AI features.'
      });
    }
    
    // Deduct tokens from user account (bonus first, then regular)
    await user.consumeTokens(tokensUsed);
    
    logger.info(`AI action tracked: ${actionType} (${tokensUsed} tokens) by user ${req.user.email}`);
    
    // Get updated token data after consumption
    const updatedTokenData = await calculateTotalTokens(req.user.id);
    
    res.json({
      success: true,
      data: {
        actionType,
        tokensUsed,
        tokens: {
          balance: updatedTokenData.totalTokenBalance,
          purchasedTokens: updatedTokenData.purchasedTokens,
          bonusTokens: updatedTokenData.bonusTokens
        }
      },
      message: 'AI action tracked successfully'
    });
  } catch (error) {
    logger.error('Track AI action error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});


// @desc    Track feature usage
// @route   POST /api/analytics/feature-usage
// @access  Private
router.post('/feature-usage', protect, async (req, res) => {
  try {
    const { feature, action } = req.body;
    
    // All features are now available to all users
    // Log feature usage
    logger.info(`Feature usage tracked: ${feature} - ${action} by user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        feature,
        action,
        hasAccess: true
      },
      message: 'Feature usage tracked successfully'
    });
  } catch (error) {
    logger.error('Track feature usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// ==================== ADMIN ROUTES ====================

// @desc    Get admin dashboard statistics
// @route   GET /api/analytics/admin/dashboard
// @access  Private/Admin
router.get('/admin/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    // Get total users count with error handling
    const totalUsers = await User.countDocuments().catch(err => {
      logger.error('Error counting total users:', err);
      return 0;
    });
    
    const activeUsers = await User.countDocuments({ isActive: true }).catch(err => {
      logger.error('Error counting active users:', err);
      return 0;
    });
    
    // Get total resumes count with error handling
    const totalResumes = await Resume.countDocuments().catch(err => {
      logger.error('Error counting total resumes:', err);
      return 0;
    });
    
    const publishedResumes = await Resume.countDocuments({ status: 'published' }).catch(err => {
      logger.error('Error counting published resumes:', err);
      return 0;
    });
    
    // Get total templates count with error handling
    const totalTemplates = await Template.countDocuments().catch(err => {
      logger.error('Error counting templates:', err);
      return 0;
    });
    
    // Get revenue data from payments with proper error handling
    const revenueData = await User.aggregate([
      {
        $unwind: {
          path: '$razorpayTransactions',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          'razorpayTransactions.status': 'captured',
          'razorpayTransactions.amount': { $exists: true, $type: 'number' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$razorpayTransactions.amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]).catch(err => {
      logger.error('Error aggregating revenue data:', err);
      return [{ totalRevenue: 0, totalTransactions: 0 }];
    });

    // Calculate total tokens from user tokens field (not from transactions)
    const tokensData = await User.aggregate([
      {
        $group: {
          _id: null,
          totalTokensSold: { $sum: { $add: ['$tokens', '$bonusTokens'] } },
          totalUsersWithTokens: { $sum: { $cond: [{ $gt: [{ $add: ['$tokens', '$bonusTokens'] }, 0] }, 1, 0] } }
        }
      }
    ]).catch(err => {
      logger.error('Error aggregating tokens data:', err);
      return [{ totalTokensSold: 0, totalUsersWithTokens: 0 }];
    });

    // Get recent transactions with proper error handling
    const recentTransactions = await User.aggregate([
      {
        $unwind: {
          path: '$razorpayTransactions',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          'razorpayTransactions.status': 'captured',
          'razorpayTransactions.amount': { $exists: true, $type: 'number' }
        }
      },
      {
        $sort: { 'razorpayTransactions.createdAt': -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: { 
            $concat: [
              { $ifNull: ['$firstName', ''] }, 
              ' ', 
              { $ifNull: ['$lastName', ''] }
            ]
          },
          email: '$email',
          amount: '$razorpayTransactions.amount',
          currency: { $ifNull: ['$razorpayTransactions.currency', 'INR'] },
          date: '$razorpayTransactions.createdAt',
          status: '$razorpayTransactions.status',
          transactionId: '$razorpayTransactions.transactionId'
        }
      }
    ]).catch(err => {
      logger.error('Error getting recent transactions:', err);
      return [];
    });
    // Get recent users with error handling
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt isActive')
      .catch(err => {
        logger.error('Error getting recent users:', err);
        return [];
      });
    // Get refund requests with proper error handling
    const refundRequests = await User.aggregate([
      {
        $unwind: {
          path: '$razorpayTransactions',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          'razorpayTransactions.refundStatus': { $in: ['pending', 'requested'] }
        }
      },
      {
        $project: {
          name: { 
            $concat: [
              { $ifNull: ['$firstName', ''] }, 
              ' ', 
              { $ifNull: ['$lastName', ''] }
            ]
          },
          email: '$email',
          amount: '$razorpayTransactions.amount',
          currency: { $ifNull: ['$razorpayTransactions.currency', 'INR'] },
          refundReason: '$razorpayTransactions.refundReason',
          refundStatus: '$razorpayTransactions.refundStatus',
          date: '$razorpayTransactions.createdAt',
          transactionId: '$razorpayTransactions.transactionId'
        }
      }
    ]).catch(err => {
      logger.error('Error getting refund requests:', err);
      return [];
    });

    // Get activity feed (recent user registrations and transactions)
    const activityFeed = [
      ...recentUsers.map(user => ({
        type: 'user_registration',
        message: `New user ${user.firstName || ''} ${user.lastName || ''} registered`,
        date: user.createdAt,
        icon: 'person_add',
        color: 'green'
      })),
      ...recentTransactions.slice(0, 3).map(transaction => ({
        type: 'transaction',
        message: `${transaction.name || 'Unknown User'} made a purchase of ₹${transaction.amount || 0}`,
        date: transaction.date,
        icon: 'shopping_cart',
        color: 'blue'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    // Get additional stats for better insights
    const additionalStats = await Promise.allSettled([
      // Users registered in last 30 days
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      // Resumes created in last 30 days
      Resume.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      // Templates usage stats
      Template.aggregate([
        { $group: { _id: null, totalUses: { $sum: '$usage.totalUses' } } }
      ])
    ]).catch(err => {
      logger.error('Error getting additional stats:', err);
      return [0, 0, [{ totalUses: 0 }]];
    });

    const dashboardData = {
      stats: {
        totalUsers,
        activeUsers,
        totalResumes,
        publishedResumes,
        totalTemplates,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalTransactions: revenueData[0]?.totalTransactions || 0,
        totalTokensSold: tokensData[0]?.totalTokensSold || 0,
        totalUsersWithTokens: tokensData[0]?.totalUsersWithTokens || 0,
        newUsersLast30Days: additionalStats[0]?.value || 0,
        newResumesLast30Days: additionalStats[1]?.value || 0,
        totalTemplateUses: additionalStats[2]?.value?.[0]?.totalUses || 0
      },
      recentTransactions: recentTransactions || [],
      recentUsers: recentUsers || [],
      refundRequests: refundRequests || [],
      activityFeed: activityFeed || []
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get admin analytics charts data
// @route   GET /api/analytics/admin/charts
// @access  Private/Admin
router.get('/admin/charts', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Validate period parameter
    const validPeriods = ['7d', '30d', '90d'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period. Must be one of: 7d, 30d, 90d'
      });
    }
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get revenue chart data with error handling
    const revenueChart = await User.aggregate([
      {
        $unwind: {
          path: '$razorpayTransactions',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          'razorpayTransactions.status': 'captured',
          'razorpayTransactions.createdAt': { $gte: startDate },
          'razorpayTransactions.amount': { $exists: true, $type: 'number' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$razorpayTransactions.createdAt'
            }
          },
          dailyRevenue: { $sum: '$razorpayTransactions.amount' },
          dailyTransactions: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).catch(err => {
      logger.error('Error getting revenue chart data:', err);
      return [];
    });

    // Get user registration chart data with error handling
    const userRegistrationChart = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          dailyRegistrations: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).catch(err => {
      logger.error('Error getting user registration chart data:', err);
      return [];
    });

    // Get resume creation chart data
    const resumeCreationChart = await Resume.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          dailyResumes: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).catch(err => {
      logger.error('Error getting resume creation chart data:', err);
      return [];
    });

    // Get template usage data with error handling
    const templateUsage = await Template.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          usageCount: { $size: { $ifNull: ['$usage.uniqueUsers', []] } },
          totalUses: { $ifNull: ['$usage.totalUses', 0] },
          averageRating: { $ifNull: ['$usage.rating.average', 0] }
        }
      },
      {
        $sort: { usageCount: -1 }
      },
      {
        $limit: 10
      }
    ]).catch(err => {
      logger.error('Error getting template usage data:', err);
      return [];
    });

    // Get category distribution
    const categoryDistribution = await Template.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalUses: { $sum: { $ifNull: ['$usage.totalUses', 0] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).catch(err => {
      logger.error('Error getting category distribution:', err);
      return [];
    });

    res.json({
      success: true,
      data: {
        revenueChart: revenueChart || [],
        userRegistrationChart: userRegistrationChart || [],
        resumeCreationChart: resumeCreationChart || [],
        templateUsage: templateUsage || [],
        categoryDistribution: categoryDistribution || [],
        period,
        dateRange: {
          start: startDate,
          end: now
        }
      }
    });
  } catch (error) {
    logger.error('Admin charts data error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
