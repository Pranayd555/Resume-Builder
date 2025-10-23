const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const Template = require('../models/Template');
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
    const user = await User.findById(req.user.id).select('tokens razorpayTransactions');
    
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
        remainingFreeTokens: tokenData.remainingFreeTokens,
        recentTransactions: user?.razorpayTransactions?.slice(0, 5) || []
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
    const user = await User.findById(req.user.id).select('tokens razorpayTransactions');
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    const aiUsageAnalytics = {
      currentUsage: {
        tokenBalance: tokenData.totalTokenBalance,
        purchasedTokens: tokenData.purchasedTokens,
        remainingFreeTokens: tokenData.remainingFreeTokens,
        isTokenBased: true
      },
      recentTransactions: user?.razorpayTransactions?.slice(0, 5) || []
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
    const user = await User.findById(req.user.id).select('tokens razorpayTransactions');
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    const responseData = {
      balance: tokenData.totalTokenBalance,
      purchasedTokens: tokenData.purchasedTokens,
      remainingFreeTokens: tokenData.remainingFreeTokens,
      recentTransactions: user?.razorpayTransactions?.slice(0, 5) || []
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
    const user = await User.findById(req.user.id).select('tokens');
    
    // Calculate total available tokens using utility function
    const tokenData = await calculateTotalTokens(req.user.id);
    
    // Check if user has enough tokens
    if (tokenData.totalTokenBalance < tokensUsed) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient tokens. Please purchase more tokens to use AI features.'
      });
    }
    
    // Deduct tokens from user account
    user.tokens = Math.max(0, (user.tokens || 0) - tokensUsed);
    await user.save();
    
    logger.info(`AI action tracked: ${actionType} (${tokensUsed} tokens) by user ${req.user.email}`);
    
    res.json({
      success: true,
      data: {
        actionType,
        tokensUsed,
        remainingTokens: tokenData.totalTokenBalance - tokensUsed
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

module.exports = router;
