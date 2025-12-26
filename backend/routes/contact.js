const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

// @desc    Submit new contact form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Create contact
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      category,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    // Send auto-reply to user
    try {
      await emailService.sendContactAutoReply({
        name,
        email,
        subject,
        category
      });
    } catch (emailError) {
      logger.error('Failed to send contact auto-reply:', emailError);
      // Continue even if email fails
    }

    // Send notification to admin
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
    } catch (emailError) {
      logger.error('Failed to send contact notification:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form'
    });
  }
});

// @desc    Get all contacts with pagination and filtering
// @route   GET /api/contact
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
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('respondedBy', 'firstName lastName email');

    // Get total count for pagination
    const total = await Contact.countDocuments(filter);

    // Get contact statistics
    const stats = await Contact.getStats();

    res.json({
      success: true,
      data: {
        contacts,
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
    logger.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts'
    });
  }
});

// @desc    Get single contact by ID
// @route   GET /api/contact/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
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
      error: 'Failed to fetch contact'
    });
  }
});

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'in-progress', 'responded', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    contact.status = status;
    if (status === 'responded' || status === 'resolved') {
      contact.respondedBy = req.user.id;
      contact.respondedAt = new Date();
    }

    await contact.save();

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact status'
    });
  }
});

// @desc    Update contact priority
// @route   PUT /api/contact/:id/priority
// @access  Private/Admin
router.put('/:id/priority', protect, authorize('admin'), async (req, res) => {
  try {
    const { priority } = req.body;

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority'
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    contact.priority = priority;
    await contact.save();

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Update contact priority error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact priority'
    });
  }
});

// @desc    Add response to contact
// @route   POST /api/contact/:id/response
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

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Get admin information for the email
    const adminUser = await require('../models/User').findById(req.user.id);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found'
      });
    }

    const adminName = `${adminUser.firstName} ${adminUser.lastName}`.trim();

    contact.response = response;
    contact.status = 'responded';
    contact.respondedBy = req.user.id;
    contact.respondedAt = new Date();
    await contact.save();

    // Send email response to user using contact-response.html template
    try {
      await emailService.sendContactResponse({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        response: response,
        adminName: adminName
      });

      logger.info(`Contact response email sent to ${contact.email} for contact ID ${contact._id}`);
    } catch (emailError) {
      logger.error('Failed to send contact response email:', emailError);
      // Don't fail the entire request if email fails, but log it
      // The response was still saved successfully
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Add contact response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add response'
    });
  }
});

// @desc    Add admin notes to contact
// @route   POST /api/contact/:id/notes
// @access  Private/Admin
router.post('/:id/notes', protect, authorize('admin'), async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    contact.adminNotes = adminNotes;
    await contact.save();

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Add contact notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add notes'
    });
  }
});

// @desc    Record token reward for contact
// @route   POST /api/contact/:id/record-token-reward
// @access  Private/Admin
router.post('/:id/record-token-reward', protect, authorize('admin'), async (req, res) => {
  try {
    const { tokens } = req.body;

    if (!tokens || tokens <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid token amount is required'
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    contact.tokensAwarded = (contact.tokensAwarded || 0) + parseInt(tokens);
    // Auto-update status to resolved if tokens are awarded
    if (contact.status !== 'closed' && contact.status !== 'resolved') {
      contact.status = 'resolved';
    }

    await contact.save();

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Record token reward error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record token reward'
    });
  }
});

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    logger.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact'
    });
  }
});

// @desc    Get contact statistics
// @route   GET /api/contact/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Contact.getStats();

    // Get category distribution
    const categoryStats = await Contact.getByCategory();

    // Get priority distribution
    const priorityStats = await Contact.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityDistribution = priorityStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ...stats,
        categoryStats,
        priorityDistribution
      }
    });
  } catch (error) {
    logger.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact statistics'
    });
  }
});

module.exports = router;