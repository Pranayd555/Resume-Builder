const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
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
  body('category')
    .optional()
    .isIn(['general', 'technical', 'billing', 'feature', 'bug', 'partnership'])
    .withMessage('Invalid category')
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

    const { name, email, subject, message, category = 'general' } = req.body;

    // Get client information
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    // Create contact
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      category,
      userAgent,
      ipAddress
    });

    // Send email notification to admin
    try {
      await emailService.sendContactNotification({
        contactId: contact._id,
        name,
        email,
        subject,
        message,
        category,
        createdAt: contact.createdAt
      });
      
      logger.info(`Contact email sent for contact ID: ${contact._id}`);
    } catch (emailError) {
      logger.error('Failed to send contact email:', emailError);
      // Don't fail the request if email fails
    }

    // Send auto-reply to user
    try {
      await emailService.sendContactAutoReply({
        name,
        email,
        subject,
        category
      });
      
      logger.info(`Contact auto-reply sent to: ${email}`);
    } catch (emailError) {
      logger.error('Failed to send contact auto-reply:', emailError);
      // Don't fail the request if auto-reply fails
    }

    logger.info(`New contact submission: ${name} (${email}) - ${category}`);

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you within 24 hours.',
      data: {
        contactId: contact._id,
        status: contact.status,
        category: contact.category
      }
    });

  } catch (error) {
    logger.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get all contacts (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['new', 'in-progress', 'responded', 'resolved', 'closed']).withMessage('Invalid status'),
  query('category').optional().isIn(['general', 'technical', 'billing', 'feature', 'bug', 'partnership']).withMessage('Invalid category'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-userAgent -ipAddress');

    // Get total count
    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get contact by ID (Admin only)
// @route   GET /api/contact/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });

  } catch (error) {
    logger.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update contact status (Admin only)
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), [
  body('status')
    .isIn(['new', 'in-progress', 'responded', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
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

    const { status, priority, adminNotes } = req.body;
    const updateData = { status };
    
    if (priority) updateData.priority = priority;
    if (adminNotes) updateData.adminNotes = adminNotes;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    logger.info(`Contact ${req.params.id} status updated to ${status} by admin ${req.user.id}`);

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });

  } catch (error) {
    logger.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Add response to contact (Admin only)
// @route   PUT /api/contact/:id/response
// @access  Private/Admin
router.put('/:id/response', protect, authorize('admin'), [
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

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        response,
        respondedBy: req.user.id,
        respondedAt: new Date(),
        status: 'responded'
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Send response email to user
    try {
      await emailService.sendContactResponse({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        response: response,
        adminName: req.user.name || 'Support Team'
      });
      
      logger.info(`Contact response sent to: ${contact.email}`);
    } catch (emailError) {
      logger.error('Failed to send contact response email:', emailError);
      // Don't fail the request if email fails
    }

    logger.info(`Response added to contact ${req.params.id} by admin ${req.user.id}`);

    res.json({
      success: true,
      message: 'Response added successfully',
      data: contact
    });

  } catch (error) {
    logger.error('Add contact response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get contact statistics (Admin only)
// @route   GET /api/contact/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Contact.getStats();
    const categoryStats = await Contact.getByCategory();

    res.json({
      success: true,
      data: {
        overview: stats,
        byCategory: categoryStats
      }
    });

  } catch (error) {
    logger.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete contact (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    logger.info(`Contact ${req.params.id} deleted by admin ${req.user.id}`);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    logger.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
