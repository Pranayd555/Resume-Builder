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
        aiActionsLimit: subscription?.features?.aiActionsLimit || 10,
        aiActionsUsed: subscription?.usage?.aiActionsThisMonth || 0
      },
      templates: {
        totalUsed: templatesUsed.length,
        templates: templatesUsed.map(template => ({
          id: template._id,
          name: template.name,
          category: template.category,
          usage: template.usage
        }))
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

module.exports = router;
