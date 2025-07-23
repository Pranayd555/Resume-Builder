const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Test email service connection
// @route   GET /api/email-test/connection
// @access  Private (Admin only)
router.get('/connection', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await emailService.testConnection();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Email connection test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test email connection'
    });
  }
});

// @desc    Send test email
// @route   POST /api/email-test/send
// @access  Private (Admin only)
router.post('/send', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, email } = req.body;
    const user = req.user;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    let result;
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(email, 'Test User');
        break;
      case 'password-reset':
        result = await emailService.sendPasswordResetEmail(email, 'Test User', 'test-token-123');
        break;
      case 'email-verification':
        result = await emailService.sendEmailVerification(email, 'Test User', 'test-verification-token-123');
        break;
      case 'subscription-confirmation':
        result = await emailService.sendSubscriptionConfirmation(email, 'Test User', 'Pro', '9.99');
        break;
      case 'subscription-cancellation':
        result = await emailService.sendSubscriptionCancellation(email, 'Test User', 'Pro');
        break;
      case 'contact-form':
        result = await emailService.sendContactFormEmail('test@example.com', 'Test User', 'Test Subject', 'This is a test message from the email service.');
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid email type. Available types: welcome, password-reset, email-verification, subscription-confirmation, subscription-cancellation, contact-form'
        });
    }

    logger.info(`Test email sent: ${type} to ${email} by admin ${user.email}`);

    res.json({
      success: true,
      message: `Test ${type} email sent successfully to ${email}`,
      data: result
    });
  } catch (error) {
    logger.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    });
  }
});

module.exports = router; 