const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// @desc    Get all feedbacks with pagination and filtering
// @route   GET /api/feedback
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get feedbacks with pagination
    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('respondedBy', 'firstName lastName email');

    // Get total count for pagination
    const total = await Feedback.countDocuments(filter);

    // Get feedback statistics
    const stats = await Feedback.getStats();

    res.json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      }
    });
  } catch (error) {
    logger.error('Get feedbacks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedbacks'
    });
  }
});

// @desc    Get single feedback by ID
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
      data: feedback
    });
  } catch (error) {
    logger.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback'
    });
  }
});

// @desc    Update feedback status
// @route   PUT /api/feedback/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'reviewed', 'responded', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    feedback.status = status;
    if (status === 'reviewed' || status === 'responded') {
      feedback.respondedBy = req.user.id;
      feedback.respondedAt = new Date();
    }

    await feedback.save();

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feedback status'
    });
  }
});

// @desc    Add response to feedback
// @route   POST /api/feedback/:id/response
// @access  Private/Admin
router.post('/:id/response', protect, authorize('admin'), async (req, res) => {
  try {
    const { response } = req.body;
    
    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Response is required'
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await feedback.addResponse(response, req.user);

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('Add feedback response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add response'
    });
  }
});

// @desc    Add admin notes to feedback
// @route   POST /api/feedback/:id/notes
// @access  Private/Admin
router.post('/:id/notes', protect, authorize('admin'), async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    feedback.adminNotes = adminNotes;
    await feedback.save();

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('Add feedback notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add notes'
    });
  }
});

// @desc    Delete feedback
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

    await Feedback.findByIdAndDelete(req.params.id);

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

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Feedback.getStats();
    
    // Get additional stats
    const additionalStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = additionalStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ...stats,
        statusStats
      }
    });
  } catch (error) {
    logger.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback statistics'
    });
  }
});

module.exports = router;