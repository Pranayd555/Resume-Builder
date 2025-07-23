const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message is required and must be less than 2000 characters'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, subject, message, rating } = req.body;

    // Get client information
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    // Create feedback
    const feedback = await Feedback.create({
      name,
      email,
      subject,
      message,
      rating,
      userAgent,
      ipAddress
    });

    logger.info(`New feedback submitted by ${email}: ${subject}`);

    // Send email notification (don't let email failure prevent response)
    try {
      await emailService.sendFeedbackNotification(feedback);
    } catch (emailError) {
      logger.error('Failed to send feedback notification email:', emailError);
      // Continue processing - don't fail the request due to email issues
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: feedback._id,
        name: feedback.name,
        email: feedback.email,
        subject: feedback.subject,
        rating: feedback.rating,
        submittedAt: feedback.createdAt
      }
    });

  } catch (error) {
    logger.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

// @desc    Get all feedback (Admin only)
// @route   GET /api/feedback
// @access  Private/Admin
router.get('/', [
  protect,
  authorize('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['new', 'reviewed', 'responded', 'resolved']).withMessage('Invalid status'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('sortBy').optional().isIn(['createdAt', 'rating', 'status', 'name']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const rating = req.query.rating;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);

    // Get feedback with pagination
    const feedback = await Feedback.find(query)
      .populate('respondedBy', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback'
    });
  }
});

// @desc    Get feedback statistics (Admin only)
// @route   GET /api/feedback/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Feedback.getStats();
    
    // Get recent feedback counts
    const recentStats = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get status distribution
    const statusStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusDistribution = {};
    statusStats.forEach(stat => {
      statusDistribution[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        overall: stats,
        recentTrends: recentStats,
        statusDistribution
      }
    });

  } catch (error) {
    logger.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback statistics'
    });
  }
});

// @desc    Get feedback by ID (Admin only)
// @route   GET /api/feedback/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('respondedBy', 'firstName lastName email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: { feedback }
    });

  } catch (error) {
    logger.error('Get feedback by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback'
    });
  }
});

// @desc    Update feedback status (Admin only)
// @route   PUT /api/feedback/:id/status
// @access  Private/Admin
router.put('/:id/status', [
  protect,
  authorize('admin'),
  body('status')
    .isIn(['new', 'reviewed', 'responded', 'resolved'])
    .withMessage('Invalid status'),
  body('adminNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, adminNotes } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    feedback.status = status;
    if (adminNotes) feedback.adminNotes = adminNotes;
    
    if (status === 'reviewed' && feedback.status !== 'reviewed') {
      feedback.respondedBy = req.user.id;
      feedback.respondedAt = new Date();
    }

    await feedback.save();

    logger.info(`Feedback ${feedback._id} status updated to ${status} by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: { feedback }
    });

  } catch (error) {
    logger.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feedback status'
    });
  }
});

// @desc    Add response to feedback (Admin only)
// @route   PUT /api/feedback/:id/response
// @access  Private/Admin
router.put('/:id/response', [
  protect,
  authorize('admin'),
  body('response')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Response is required and must be less than 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { response } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await feedback.addResponse(response, req.user);

    logger.info(`Response added to feedback ${feedback._id} by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'Response added successfully',
      data: { feedback }
    });

  } catch (error) {
    logger.error('Add feedback response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add response'
    });
  }
});

// @desc    Delete feedback (Admin only)
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await feedback.deleteOne();

    logger.info(`Feedback ${req.params.id} deleted by admin ${req.user.email}`);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    logger.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete feedback'
    });
  }
});

// @desc    Get public feedback (for testimonials)
// @route   GET /api/feedback/public
// @access  Public
router.get('/public/testimonials', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Minimum rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const limit = parseInt(req.query.limit) || 5;
    const minRating = parseInt(req.query.minRating) || 4;

    const testimonials = await Feedback.find({
      isPublic: true,
      rating: { $gte: minRating }
    })
    .select('name message rating createdAt')
    .sort({ createdAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      data: { testimonials }
    });

  } catch (error) {
    logger.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve testimonials'
    });
  }
});

module.exports = router; 