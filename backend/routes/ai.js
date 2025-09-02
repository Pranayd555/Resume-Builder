const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, checkAIActionLimit, trackUsage } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Rewrite resume content with AI
// @route   POST /api/ai/rewrite
// @access  Private
router.post('/rewrite', [
  protect,
  checkAIActionLimit,
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('tone').optional().isIn(['professional', 'casual', 'formal', 'creative']).withMessage('Invalid tone'),
  body('style').optional().isIn(['concise', 'detailed', 'action-oriented', 'achievement-focused']).withMessage('Invalid style')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { content, tone = 'professional', style = 'action-oriented' } = req.body;

    // TODO: Implement actual AI rewriting logic here
    // For now, return a mock response
    const rewrittenContent = `[AI Rewritten] ${content} - Enhanced with ${tone} tone and ${style} style.`;

    logger.info(`AI rewrite request processed for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        originalContent: content,
        rewrittenContent,
        tone,
        style,
        message: 'Content rewritten successfully'
      }
    });
  } catch (error) {
    logger.error('AI rewrite error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Summarize resume section with AI
// @route   POST /api/ai/summarize
// @access  Private
router.post('/summarize', [
  protect,
  checkAIActionLimit,
  body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  body('maxLength').optional().isInt({ min: 50, max: 500 }).withMessage('Max length must be between 50 and 500 characters')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { content, maxLength = 150 } = req.body;

    // TODO: Implement actual AI summarization logic here
    // For now, return a mock response
    const summary = `[AI Summary] ${content.substring(0, maxLength)}...`;

    logger.info(`AI summarize request processed for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        originalContent: content,
        summary,
        maxLength,
        message: 'Content summarized successfully'
      }
    });
  } catch (error) {
    logger.error('AI summarize error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Enhance keywords with AI
// @route   POST /api/ai/enhance-keywords
// @access  Private
router.post('/enhance-keywords', [
  protect,
  checkAIActionLimit,
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('industry').optional().trim().isLength({ min: 2 }).withMessage('Industry must be at least 2 characters')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { content, industry = 'general' } = req.body;

    // TODO: Implement actual AI keyword enhancement logic here
    // For now, return a mock response
    const enhancedContent = `[AI Enhanced] ${content} - Optimized with industry-specific keywords for ${industry}.`;

    logger.info(`AI keyword enhancement request processed for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        originalContent: content,
        enhancedContent,
        industry,
        message: 'Keywords enhanced successfully'
      }
    });
  } catch (error) {
    logger.error('AI enhance keywords error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Adjust tone with AI
// @route   POST /api/ai/adjust-tone
// @access  Private
router.post('/adjust-tone', [
  protect,
  checkAIActionLimit,
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('targetTone').isIn(['professional', 'casual', 'formal', 'confident', 'friendly']).withMessage('Invalid target tone')
], trackUsage, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Set usage type for tracking
    req.usageType = 'aiAction';

    const { content, targetTone } = req.body;

    // TODO: Implement actual AI tone adjustment logic here
    // For now, return a mock response
    const adjustedContent = `[AI Tone Adjusted] ${content} - Adjusted to ${targetTone} tone.`;

    logger.info(`AI tone adjustment request processed for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        originalContent: content,
        adjustedContent,
        targetTone,
        message: 'Tone adjusted successfully'
      }
    });
  } catch (error) {
    logger.error('AI adjust tone error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get AI usage statistics
// @route   GET /api/ai/usage
// @access  Private
router.get('/usage', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    const usage = subscription.usage || {};
    
    res.json({
      success: true,
      data: {
        aiActionsUsed: usage.aiActionsThisCycle || 0,
        aiActionsLimit: subscription.features?.aiActionsLimit || 10,
        plan: subscription.plan,
        remainingActions: Math.max(0, (subscription.features?.aiActionsLimit || 10) - (usage.aiActionsThisCycle || 0)),
        cycleStartDate: usage.cycleStartDate || subscription.startDate,
        nextBillingDate: subscription.billing?.nextBillingDate || null,
        billingCycle: subscription.billing?.cycle || 'monthly',
        daysUntilReset: subscription.billing?.nextBillingDate ? 
          Math.ceil((new Date(subscription.billing.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
      }
    });
  } catch (error) {
    logger.error('Get AI usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
