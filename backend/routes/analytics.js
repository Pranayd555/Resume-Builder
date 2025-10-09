const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const Template = require('../models/Template');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

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

    // Check subscription and export limits
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Subscription not found. Please contact support.'
      });
    }

    // Check if user can export in the requested format
    if (!subscription.canExportFormat(format)) {
      return res.status(403).json({
        success: false,
        error: `${format.toUpperCase()} export not available in your subscription plan. Please upgrade to Pro.`
      });
    }

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

    // Check if user can access this template
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription) {
      return res.status(403).json({
        success: false,
        error: 'Subscription not found. Please contact support.'
      });
    }

    if (!subscription.canAccessTemplate(template.availability.tier)) {
      return res.status(403).json({
        success: false,
        error: 'Template not available in your subscription plan. Please upgrade to Pro.'
      });
    }

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

    // Get subscription info
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    // Get user info for tokens
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('tokens razorpayTransactions');
    
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
      subscription: {
        plan: subscription?.plan || 'free',
        resumeLimit: subscription?.features?.resumeLimit || 2,
        resumesCreated: subscription?.usage?.resumesCreated || 0,
        aiActionsLimit: subscription?.features?.aiActionsLimit || 200,
        aiActionsUsed: subscription?.usage?.aiActionsThisCycle || 0,
        cycleStartDate: subscription?.usage?.cycleStartDate || new Date(),
        nextBillingDate: subscription?.billing?.nextBillingDate || null,
        billingCycle: subscription?.billing?.cycle || 'monthly',
        tokenBalance: user?.tokens || 0
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
        balance: user?.tokens || 0,
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
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    const usage = subscription.usage || {};
    const now = new Date();
    
    // Calculate cycle information
    let cycleInfo = {
      currentCycle: 'free',
      cycleStartDate: usage.cycleStartDate || subscription.startDate,
      nextResetDate: null,
      daysUntilReset: null,
      cycleProgress: 0
    };

    if (subscription.plan === 'free') {
      // For free users, reset monthly
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      cycleInfo.currentCycle = 'monthly';
      cycleInfo.nextResetDate = nextMonthStart;
      cycleInfo.daysUntilReset = Math.ceil((nextMonthStart - now) / (1000 * 60 * 60 * 24));
      cycleInfo.cycleProgress = ((now - currentMonthStart) / (nextMonthStart - currentMonthStart)) * 100;
    } else if (subscription.billing?.nextBillingDate) {
      // For paid users, reset on billing cycle
      const nextBilling = new Date(subscription.billing.nextBillingDate);
      const lastReset = new Date(usage.lastBillingCycleReset || subscription.startDate);
      cycleInfo.currentCycle = subscription.billing.cycle || 'monthly';
      cycleInfo.nextResetDate = nextBilling;
      cycleInfo.daysUntilReset = Math.ceil((nextBilling - now) / (1000 * 60 * 60 * 24));
      cycleInfo.cycleProgress = ((now - lastReset) / (nextBilling - lastReset)) * 100;
    }

    const aiUsageAnalytics = {
      currentUsage: {
        aiActionsUsed: usage.aiActionsThisCycle || 0,
        aiActionsLimit: subscription.features?.aiActionsLimit || 200,
        remainingActions: Math.max(0, (subscription.features?.aiActionsLimit || 200) - (usage.aiActionsThisCycle || 0)),
        usagePercentage: Math.round(((usage.aiActionsThisCycle || 0) / (subscription.features?.aiActionsLimit || 200)) * 100)
      },
      cycleInfo,
      plan: subscription.plan,
      status: subscription.status,
      features: {
        aiActionsLimit: subscription.features?.aiActionsLimit || 200,
        aiReview: subscription.features?.aiReview || false
      }
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

// @desc    Admin: Reset AI action cycle for a user (for testing purposes)
// @route   POST /api/analytics/admin/reset-ai-cycle/:userId
// @access  Private (Admin only)
router.post('/admin/reset-ai-cycle/:userId', protect, async (req, res) => {
  try {
    // Check if user is admin (you can modify this based on your admin system)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const subscription = await Subscription.findOne({ user: req.params.userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    // Reset the AI action cycle
    await subscription.resetAIActionCycle();

    logger.info(`Admin reset AI action cycle for user ${req.params.userId} by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'AI action cycle reset successfully',
      data: {
        userId: req.params.userId,
        resetAt: new Date(),
        newCycleStart: subscription.usage.cycleStartDate,
        nextBillingDate: subscription.billing?.nextBillingDate
      }
    });
  } catch (error) {
    logger.error('Admin reset AI cycle error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get user token balance
// @route   GET /api/analytics/tokens
// @access  Private
router.get('/tokens', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('tokens');
    
    res.json({
      success: true,
      data: {
        balance: user?.tokens || 0
      }
    });
  } catch (error) {
    logger.error('Get token balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
