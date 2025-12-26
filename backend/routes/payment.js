const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const RefundCalculator = require('../utils/refundCalculator');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order for token purchase
// @route   POST /api/payment/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Validate amount (minimum ₹1, maximum ₹100,000)
    if (amount < 1 || amount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be between ₹1 and ₹100,000'
      });
    }

    // Create order using Razorpay API
    const orderOptions = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: receipt || `token_purchase_${Date.now()}_${req.user.id}`,
      notes: {
        userId: req.user.id,
        userEmail: req.user.email,
        type: 'token_purchase',
        ...metadata
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    logger.info(`Razorpay order created: ${order.id} for user ${req.user.email}, amount: ₹${amount}`);

    res.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        created_at: order.created_at
      }
    });
  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @desc    Complete token purchase
// @route   POST /api/payment/complete-token-purchase
// @access  Private
router.post('/complete-token-purchase', protect, async (req, res) => {
  try {
    const {
      order_id,
      payment_id,
      signature,
      tokens,
      amount,
      currency = 'INR',
      payment_method = 'razorpay',
      email,
      contact
    } = req.body;

    if (!order_id || !payment_id || !signature || !tokens || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Verify Razorpay signature
    const body = order_id + '|' + payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.error(`Signature verification failed for payment ${payment_id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if payment is already processed
    const existingTransaction = user.getTransactionById(payment_id);
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed'
      });
    }

    // Verify payment with Razorpay
    try {
      const payment = await razorpay.payments.fetch(payment_id);

      if (payment.status !== 'captured') {
        return res.status(400).json({
          success: false,
          message: 'Payment not captured'
        });
      }

      if (payment.amount !== amount * 100) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch'
        });
      }
    } catch (razorpayError) {
      logger.error('Razorpay payment verification failed:', razorpayError);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Calculate bonus tokens based on package
    const tokenPackages = [
      { amount: 5, price: 49, bonus: 0 },
      { amount: 10, price: 89, bonus: 1 },
      { amount: 25, price: 199, bonus: 5 },
      { amount: 50, price: 349, bonus: 15 },
      { amount: 100, price: 599, bonus: 40 }
    ];

    const selectedPackage = tokenPackages.find(pkg => pkg.amount === (tokens - pkg.bonus));
    const regularTokens = selectedPackage ? selectedPackage.amount : tokens;
    const bonusTokens = selectedPackage ? selectedPackage.bonus : 0;

    // Add tokens to user account
    await user.addTokens(regularTokens);
    if (bonusTokens > 0) {
      await user.addBonusTokens(bonusTokens);
    }

    const newTokenBalance = user.getTotalTokens();

    // Add transaction record
    const transactionData = {
      transactionId: payment_id,
      orderId: order_id,
      amount: amount * 100, // Store in paise
      currency: currency,
      status: 'captured',
      paymentId: payment_id,
      method: payment_method,
      email: email,
      contact: contact,
      createdAt: new Date(),
      capturedAt: new Date(),
      notes: `${regularTokens} AI Tokens Purchase${bonusTokens > 0 ? ` + ${bonusTokens} Bonus` : ''}`,
      metadata: {
        boughtTokens: regularTokens,  // CRITICAL: For refund calculations
        bonusTokensAdded: bonusTokens,  // CRITICAL: For refund calculations
        tokensAdded: tokens,
        regularTokensAdded: regularTokens,
        newTokenBalance: newTokenBalance,
        type: 'token_purchase',
        razorpaySignature: signature
      }
    };

    await user.addRazorpayTransaction(transactionData);

    logger.info(`Token purchase completed for user ${user.email}: ${tokens} tokens for ₹${amount}`);

    // Send payment invoice email
    try {
      logger.info(`Attempting to send payment invoice email to ${user.email} for transaction ${payment_id}`);

      const emailResult = await emailService.sendPaymentInvoice({
        email: user.email,
        name: user.name || user.email.split('@')[0],
        transactionId: order_id,
        paymentId: payment_id,
        amount: amount,
        tokensAdded: tokens,
        paymentMethod: 'Razorpay',
        paymentDate: new Date()
      });

      if (emailResult.success) {
        logger.info(`✅ Payment invoice email sent successfully to ${user.email} - Message ID: ${emailResult.messageId || 'N/A'}`);
      } else {
        logger.warn(`❌ Failed to send payment invoice email to ${user.email}: ${emailResult.error}`);
        // Don't fail the payment process if email fails
      }
    } catch (emailError) {
      logger.error(`💥 Error sending payment invoice email to ${user.email}:`, emailError);
      // Don't fail the payment process if email fails
    }

    // Get updated token data after purchase
    const { calculateTotalTokens } = require('../utils/tokenCalculator');
    const updatedTokenData = await calculateTotalTokens(user._id);

    res.json({
      success: true,
      message: 'Token purchase completed successfully',
      data: {
        tokens: {
          balance: updatedTokenData.totalTokenBalance,
          purchasedTokens: updatedTokenData.purchasedTokens,
          bonusTokens: updatedTokenData.bonusTokens,
          added: tokens,
          regularTokensAdded: regularTokens,
          bonusTokensAdded: bonusTokens
        },
        transaction: {
          id: payment_id,
          amount: amount,
          currency: currency
        }
      }
    });
  } catch (error) {
    logger.error('Complete token purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete token purchase',
      error: error.message
    });
  }
});

// @desc    Get payment history
// @route   GET /api/payment/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const transactions = user.razorpayTransactionsWithRefundStatus.slice(0, 20);

    res.json({
      success: true,
      data: {
        transactions: transactions,
        totalTransactions: transactions.length
      }
    });
  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

// @desc    Razorpay webhook handler
// @route   POST /api/payment/webhook
// @access  Public (Razorpay calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    if (!signature) {
      logger.error('Razorpay webhook: Missing signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.error('Razorpay webhook: Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body.toString());
    logger.info(`Razorpay webhook received: ${event.event}`);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'order.paid':
        await handleOrderPaid(event);
        break;
      default:
        logger.info(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    logger.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// @desc    Get Razorpay key for frontend
// @route   GET /api/payment/razorpay-key
// @access  Private
router.get('/razorpay-key', protect, (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
});

// @desc    Verify payment signature (utility endpoint)
// @route   POST /api/payment/verify-signature
// @access  Private
router.post('/verify-signature', protect, async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const body = order_id + '|' + payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === signature;

    res.json({
      success: true,
      valid: isValid
    });
  } catch (error) {
    logger.error('Signature verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Signature verification failed'
    });
  }
});

// Helper functions for webhook handling
async function handlePaymentCaptured(event) {
  try {
    const payment = event.payload.payment.entity;
    const order = event.payload.order.entity;

    logger.info(`Payment captured: ${payment.id} for order: ${order.id}`);

    // Find user by order notes
    if (order.notes && order.notes.userId) {
      const user = await User.findById(order.notes.userId);
      if (user) {
        // Update transaction status if exists
        const transaction = user.getTransactionById(payment.id);
        if (transaction && transaction.status !== 'captured') {
          await user.updateTransactionStatus(payment.id, 'captured', {
            capturedAt: new Date(),
            webhookProcessed: true
          });
          logger.info(`Updated transaction status for user ${user.email}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error handling payment captured webhook:', error);
  }
}

async function handlePaymentFailed(event) {
  try {
    const payment = event.payload.payment.entity;
    const order = event.payload.order.entity;

    logger.info(`Payment failed: ${payment.id} for order: ${order.id}`);

    // Find user by order notes
    if (order.notes && order.notes.userId) {
      const user = await User.findById(order.notes.userId);
      if (user) {
        // Update transaction status if exists
        const transaction = user.getTransactionById(payment.id);
        if (transaction) {
          await user.updateTransactionStatus(payment.id, 'failed', {
            failedAt: new Date(),
            webhookProcessed: true
          });
          logger.info(`Updated transaction status for user ${user.email}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error handling payment failed webhook:', error);
  }
}

async function handleOrderPaid(event) {
  try {
    const order = event.payload.order.entity;

    logger.info(`Order paid: ${order.id}`);

    // Additional order-level processing can be added here
  } catch (error) {
    logger.error('Error handling order paid webhook:', error);
  }
}

// @desc    Admin: Give bonus tokens to user
// @route   POST /api/payment/admin/give-bonus-tokens/:userId
// @access  Private (Admin only)
router.post('/admin/give-bonus-tokens/:userId', protect, async (req, res) => {
  try {
    // Check if user is admin (you might want to add admin role check)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { userId } = req.params;
    const { tokens, reason = 'Admin bonus' } = req.body;

    if (!tokens || tokens <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid token amount is required'
      });
    }

    // Validate token amount (reasonable limit for admin bonus)
    if (tokens > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Bonus tokens cannot exceed 10,000 per transaction'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add bonus tokens
    await user.addBonusTokens(tokens);

    // Get updated token data
    const { calculateTotalTokens } = require('../utils/tokenCalculator');
    const updatedTokenData = await calculateTotalTokens(user._id);

    // Add transaction record for tracking
    const transactionData = {
      transactionId: `admin_bonus_${Date.now()}_${userId}`,
      orderId: `admin_bonus_${Date.now()}`,
      amount: 0, // No monetary value for bonus tokens
      currency: 'INR',
      status: 'captured', // Use 'captured' as it's the valid enum value for successful transactions
      paymentId: `admin_bonus_${Date.now()}`,
      method: 'admin_bonus',
      email: user.email,
      contact: '',
      createdAt: new Date(),
      capturedAt: new Date(),
      notes: `${tokens} Bonus Tokens - ${reason}`,
      metadata: {
        tokensAdded: tokens,
        bonusTokensAdded: tokens,
        newTokenBalance: updatedTokenData.totalTokenBalance,
        type: 'admin_bonus',
        reason: reason,
        givenBy: req.user.email
      }
    };

    await user.addRazorpayTransaction(transactionData);

    logger.info(`Admin ${req.user.email} gave ${tokens} bonus tokens to user ${user.email}. Reason: ${reason}`);

    // Send bonus tokens email notification
    try {
      logger.info(`Attempting to send bonus tokens email to ${user.email} for ${tokens} tokens`);

      const emailResult = await emailService.sendBonusTokensEmail({
        email: user.email,
        name: user.firstName || user.email.split('@')[0],
        tokensAdded: tokens,
        newTokenBalance: updatedTokenData.totalTokenBalance,
        givenBy: req.user.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : req.user.email,
        reason: reason,
        dateAdded: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      if (emailResult.success) {
        logger.info(`✅ Bonus tokens email sent successfully to ${user.email} - Message ID: ${emailResult.messageId || 'N/A'}`);
      } else {
        logger.warn(`❌ Failed to send bonus tokens email to ${user.email}: ${emailResult.error}`);
        // Don't fail the bonus token process if email fails
      }
    } catch (emailError) {
      logger.error(`💥 Error sending bonus tokens email to ${user.email}:`, emailError);
      // Don't fail the bonus token process if email fails
    }

    res.json({
      success: true,
      message: 'Bonus tokens added successfully',
      data: {
        userId: user._id,
        userEmail: user.email,
        tokensAdded: tokens,
        newTokenBalance: updatedTokenData.totalTokenBalance,
        reason: reason
      }
    });
  } catch (error) {
    logger.error('Admin give bonus tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bonus tokens',
      error: error.message
    });
  }
});

// @desc    Admin: Give bonus tokens to user by email
// @route   POST /api/payment/admin/give-bonus-tokens-by-email
// @access  Private (Admin only)
router.post('/admin/give-bonus-tokens-by-email', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { email, tokens, reason = 'Admin bonus' } = req.body;

    if (!email || !tokens || tokens <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid email and token amount are required'
      });
    }

    if (tokens > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Bonus tokens cannot exceed 10,000 per transaction'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Add bonus tokens
    await user.addBonusTokens(tokens);

    // Get updated token data
    const { calculateTotalTokens } = require('../utils/tokenCalculator');
    const updatedTokenData = await calculateTotalTokens(user._id);

    // Add transaction record
    const transactionData = {
      transactionId: `admin_bonus_${Date.now()}_${user._id}`,
      orderId: `admin_bonus_${Date.now()}`,
      amount: 0,
      currency: 'INR',
      status: 'captured',
      paymentId: `admin_bonus_${Date.now()}`,
      method: 'admin_bonus',
      email: user.email,
      contact: '',
      createdAt: new Date(),
      capturedAt: new Date(),
      notes: `${tokens} Bonus Tokens - ${reason}`,
      metadata: {
        tokensAdded: tokens,
        bonusTokensAdded: tokens,
        newTokenBalance: updatedTokenData.totalTokenBalance,
        type: 'admin_bonus',
        reason: reason,
        givenBy: req.user.email
      }
    };

    await user.addRazorpayTransaction(transactionData);

    logger.info(`Admin ${req.user.email} gave ${tokens} bonus tokens to user ${user.email}. Reason: ${reason}`);

    // Send bonus tokens email notification
    try {
      const emailResult = await emailService.sendBonusTokensEmail({
        email: user.email,
        name: user.firstName || user.email.split('@')[0],
        tokensAdded: tokens,
        newTokenBalance: updatedTokenData.totalTokenBalance,
        givenBy: req.user.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : req.user.email,
        reason: reason,
        dateAdded: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      if (emailResult.success) {
        logger.info(`✅ Bonus tokens email sent successfully to ${user.email}`);
      } else {
        logger.warn(`❌ Failed to send bonus tokens email to ${user.email}: ${emailResult.error}`);
      }
    } catch (emailError) {
      logger.error(`💥 Error sending bonus tokens email to ${user.email}:`, emailError);
    }

    res.json({
      success: true,
      message: 'Bonus tokens added successfully',
      data: {
        userId: user._id,
        userEmail: user.email,
        tokensAdded: tokens,
        newTokenBalance: updatedTokenData.totalTokenBalance,
        reason: reason
      }
    });
  } catch (error) {
    logger.error('Admin give bonus tokens by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bonus tokens',
      error: error.message
    });
  }
});

// @desc    Request refund for a transaction
// @route   POST /api/payment/request-refund
// @access  Private
router.post('/request-refund', protect, async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    if (!transactionId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and refund reason are required'
      });
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason must be at least 10 characters long'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find transaction
    const transaction = user.getTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if transaction is eligible for refund
    if (transaction.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Only captured transactions can be refunded'
      });
    }

    // Check if already refunded or refund requested
    if (transaction.status === 'refunded' || transaction.status === 'refund_requested') {
      return res.status(400).json({
        success: false,
        message: transaction.status === 'refunded' ? 'Transaction already refunded' : 'Refund already requested'
      });
    }

    // Check if transaction is within refund window (7 days)
    const transactionDate = new Date(transaction.createdAt || transaction.capturedAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - transactionDate) / (1000 * 60 * 60 * 24));

    if (daysDifference > 7) {
      return res.status(400).json({
        success: false,
        message: 'Refund can only be requested within 7 days of transaction'
      });
    }

    // Update transaction status to refund_requested
    const refundRequestData = {
      refundRequestedAt: new Date(),
      refundReason: reason.trim(),
      refundStatus: 'pending'
    };

    await user.updateTransactionStatus(transactionId, 'refund_requested', refundRequestData);

    logger.info(`Refund requested for transaction ${transactionId} by user ${user.email}`);

    // Send refund request confirmation email
    try {
      logger.info(`Attempting to send refund request confirmation email to ${user.email} for transaction ${transactionId}`);

      const emailResult = await emailService.sendRefundRequestEmail({
        email: user.email,
        name: user.firstName || user.email.split('@')[0],
        transactionId: transactionId,
        orderId: transaction.orderId,
        amount: transaction.amount / 100, // Convert from paise to rupees
        reason: reason.trim(),
        requestDate: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      if (emailResult.success) {
        logger.info(`✅ Refund request confirmation email sent successfully to ${user.email} - Message ID: ${emailResult.messageId || 'N/A'}`);
      } else {
        logger.warn(`❌ Failed to send refund request confirmation email to ${user.email}: ${emailResult.error}`);
        // Don't fail the refund request if email fails
      }
    } catch (emailError) {
      logger.error(`💥 Error sending refund request confirmation email to ${user.email}:`, emailError);
      // Don't fail the refund request if email fails
    }

    res.json({
      success: true,
      message: 'Refund request submitted successfully. We will process your refund within 3-5 business days.',
      data: {
        transactionId: transactionId,
        refundStatus: 'pending',
        requestedAt: refundRequestData.refundRequestedAt
      }
    });
  } catch (error) {
    logger.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit refund request',
      error: error.message
    });
  }
});

// @desc    Admin: Get all refund requests
// @route   GET /api/payment/admin/refund-requests
// @access  Private (Admin only)
router.get('/admin/refund-requests', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { page = 1, limit = 10, status, userId } = req.query;

    // Get all users with refund requests (query needs to check nested transactions)
    let userQuery = {};
    if (userId) {
      userQuery._id = userId;
    }

    // Use aggregation pipeline to filter by transaction status
    let pipeline = [
      { $match: userQuery },
      { $unwind: '$razorpayTransactions' },
      { $match: { 'razorpayTransactions.status': 'refund_requested' } },
      { $sort: { 'razorpayTransactions.createdAt': -1 } }
    ];

    const users = await User.aggregate(pipeline);
    const refundRequests = [];

    // Extract refund requests from aggregation results
    // Aggregation pipeline already filtered by refund_requested status
    users.forEach(user => {
      const transaction = user.razorpayTransactions;
      refundRequests.push({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        transaction: {
          transactionId: transaction.transactionId,
          orderId: transaction.orderId,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          createdAt: transaction.createdAt,
          capturedAt: transaction.capturedAt,
          refundRequestedAt: transaction.refundRequestedAt || transaction.metadata?.refundRequestedAt,
          refundReason: transaction.refundReason || transaction.metadata?.refundReason || '',
          refundStatus: transaction.refundStatus || transaction.metadata?.refundStatus || 'pending',
          notes: transaction.notes
        }
      });
    });

    // Already sorted by aggregation pipeline, no need to sort again

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRequests = refundRequests.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        refundRequests: paginatedRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: refundRequests.length,
          pages: Math.ceil(refundRequests.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get refund requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get refund requests',
      error: error.message
    });
  }
});

// @desc    Calculate refund eligibility for a transaction
// @route   POST /api/payment/calculate-refund/:transactionId
// @access  Private
router.post('/calculate-refund/:transactionId', protect, async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find user with the transaction
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const transaction = user.getTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Validate transaction is in capturable state
    if (transaction.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: `Transaction cannot be refunded. Current status: ${transaction.status}`,
        details: {
          transactionId,
          currentStatus: transaction.status
        }
      });
    }

    // Calculate refund using RefundCalculator
    const refundResult = RefundCalculator.calculateRefund(
      transaction,
      { tokens: user.tokens, bonusTokens: user.bonusTokens },
      transaction.amount
    );

    // Return eligibility summary
    res.json({
      success: true,
      data: {
        transactionId: transaction.transactionId,
        orderId: transaction.orderId,
        amount: transaction.amount / 100,
        currency: transaction.currency,
        createdAt: transaction.createdAt,
        capturedAt: transaction.capturedAt,
        refundEligibility: {
          scenario: refundResult.scenario,
          eligible: refundResult.status === 'eligible',
          refundAmount: RefundCalculator.paiseToRupees(refundResult.refundAmount),
          refundAmountInPaise: refundResult.refundAmount,
          refundPercentage: refundResult.refundPercentage,
          message: refundResult.message,
          status: refundResult.status,
          reason: refundResult.status === 'not_eligible' ? refundResult.message : null
        },
        tokenDetails: {
          purchased: refundResult.boughtTokens,
          bonusAdded: refundResult.bonusTokensAdded,
          currentBalance: refundResult.currentTokens,
          currentBonusBalance: refundResult.currentBonusTokens,
          totalAvailable: refundResult.currentTokens + refundResult.currentBonusTokens
        }
      }
    });

  } catch (error) {
    logger.error('Calculate refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate refund',
      error: error.message
    });
  }
});

// @desc    Admin: Process refund (approve or reject)
// @route   POST /api/payment/admin/process-refund/:transactionId
// @access  Private (Admin only)
router.post('/admin/process-refund/:transactionId', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { transactionId } = req.params;
    const { action, notes = '' } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    // Find user with the transaction
    const user = await User.findOne({
      'razorpayTransactions.transactionId': transactionId,
      'razorpayTransactions.status': 'refund_requested'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    // Get the transaction
    const transaction = user.getTransactionById(transactionId);
    if (!transaction || transaction.status !== 'refund_requested') {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    if (action === 'approve') {
      // Calculate refund using RefundCalculator
      const refundResult = RefundCalculator.calculateRefund(
        transaction,
        { tokens: user.tokens, bonusTokens: user.bonusTokens },
        transaction.amount
      );

      logger.info(`Refund calculation for ${transactionId}:`, {
        scenario: refundResult.scenario,
        status: refundResult.status,
        refundAmount: refundResult.refundAmount,
        refundPercentage: refundResult.refundPercentage,
        message: refundResult.message
      });

      // Check if refund is eligible
      if (refundResult.status === 'not_eligible') {
        // Send not-eligible email to user
        try {
          logger.info(`Sending not-eligible email to ${user.email} for transaction ${transactionId}`);

          const totalAvailable = Math.max(0, refundResult.currentTokens - (refundResult.bonusTokensAdded - refundResult.currentBonusTokens));

          const emailResult = await emailService.sendRefundNotEligibleEmail({
            email: user.email,
            name: user.firstName || user.email.split('@')[0],
            transactionId: transaction.transactionId,
            orderId: transaction.orderId,
            amountPaid: transaction.amount,
            refundReason: refundResult.message,
            boughtTokens: refundResult.boughtTokens,
            bonusTokensAdded: refundResult.bonusTokensAdded,
            currentTokenBalance: refundResult.currentTokens,
            totalAvailable: totalAvailable
          });

          if (emailResult.success) {
            logger.info(`✅ Not-eligible email sent successfully to ${user.email}`);
          } else {
            logger.warn(`❌ Failed to send not-eligible email to ${user.email}: ${emailResult.error}`);
          }
        } catch (emailError) {
          logger.error(`💥 Error sending not-eligible email to ${user.email}:`, emailError);
        }

        // Update transaction with rejection
        const rejectionData = {
          refundProcessedBy: req.user.email,
          refundProcessedAt: new Date(),
          adminNotes: notes,
          refundStatus: 'not_eligible',
          refundScenario: refundResult.scenario,
          refundReason: refundResult.message
        };

        await user.updateTransactionStatus(transactionId, 'refund_rejected', rejectionData);

        logger.info(`Admin ${req.user.email} processed refund for ${transactionId} - NOT ELIGIBLE (Scenario ${refundResult.scenario})`);

        return res.json({
          success: true,
          message: 'Refund request processed - Not eligible for refund',
          data: {
            transactionId: transactionId,
            status: 'not_eligible',
            scenario: refundResult.scenario,
            refundAmount: 0,
            reason: refundResult.message,
            details: {
              boughtTokens: refundResult.boughtTokens,
              bonusTokensAdded: refundResult.bonusTokensAdded,
              currentBalance: refundResult.currentTokens,
              currentBonusBalance: refundResult.currentBonusTokens
            }
          }
        });
      }

      // Process refund via Razorpay for eligible refunds
      try {
        // First check if payment still exists and is capturable
        const payment = await razorpay.payments.fetch(transaction.paymentId);

        if (payment.status !== 'captured') {
          return res.status(400).json({
            success: false,
            message: 'Payment is not in a refundable state'
          });
        }

        // Create refund with calculated amount
        const refund = await razorpay.payments.refund(transaction.paymentId, {
          amount: refundResult.refundAmount,
          notes: {
            adminId: req.user.id,
            adminEmail: req.user.email,
            refundReason: transaction.metadata?.refundReason,
            refundScenario: refundResult.scenario,
            refundPercentage: refundResult.refundPercentage,
            adminNotes: notes
          }
        });

        // Update transaction status with refund details
        const refundData = {
          status: 'refunded',
          refundedAt: new Date(),
          refundId: refund.id,
          refundAmount: refundResult.refundAmount,
          refundProcessedBy: req.user.email,
          refundProcessedAt: new Date(),
          adminNotes: notes,
          refundStatus: 'completed',
          refundScenario: refundResult.scenario,
          refundPercentage: refundResult.refundPercentage
        };

        await user.updateTransactionStatus(transactionId, 'refunded', refundData);

        // ============ DEDUCT TOKENS FROM USER ACCOUNT ============
        // Calculate tokens to deduct based on refund scenario
        let tokensToDeduct = 0;
        let bonusTokensToDeduct = 0;

        if (refundResult.scenario === 1) {
          // Scenario 1: No bonus, all tokens unused
          // Deduct all purchased tokens
          tokensToDeduct = refundResult.boughtTokens;
        } else if (refundResult.scenario === 2) {
          // Scenario 2: No bonus, partial tokens used
          // Deduct remaining tokens (the ones being refunded for)
          tokensToDeduct = refundResult.currentTokens;
        } else if (refundResult.scenario === 3) {
          // Scenario 3: With bonus, all tokens unused
          // Deduct all purchased tokens + all bonus tokens
          tokensToDeduct = refundResult.boughtTokens;
          bonusTokensToDeduct = refundResult.bonusTokensAdded;
        } else if (refundResult.scenario === 4) {
          // Scenario 4: With bonus, bonus used but purchased tokens intact
          // Deduct the purchased tokens (since they're the ones being paid for)
          tokensToDeduct = refundResult.boughtTokens;
          // Bonus tokens already used, so deduct what's remaining
          bonusTokensToDeduct = refundResult.currentBonusTokens;
        } else if (refundResult.scenario === 5) {
          // Scenario 5B: Both used, effective tokens for refund
          // Deduct current tokens (the ones available for refund)
          const bonusUsed = refundResult.bonusTokensAdded - refundResult.currentBonusTokens;
          tokensToDeduct = refundResult.currentTokens;
          bonusTokensToDeduct = refundResult.currentBonusTokens;
        }

        // Apply token deductions to user account
        if (tokensToDeduct > 0) {
          user.tokens = Math.max(0, (user.tokens || 0) - tokensToDeduct);
          logger.info(`Deducting ${tokensToDeduct} regular tokens from user ${user.email} (Refund Scenario ${refundResult.scenario})`);
        }

        if (bonusTokensToDeduct > 0) {
          user.bonusTokens = Math.max(0, (user.bonusTokens || 0) - bonusTokensToDeduct);
          logger.info(`Deducting ${bonusTokensToDeduct} bonus tokens from user ${user.email} (Refund Scenario ${refundResult.scenario})`);
        }

        // Save user with deducted tokens
        if (tokensToDeduct > 0 || bonusTokensToDeduct > 0) {
          await user.save();
          logger.info(`User ${user.email} tokens updated after refund: Regular: ${user.tokens}, Bonus: ${user.bonusTokens}`);
        }
        // ============ END TOKEN DEDUCTION ============

        // Send refund completion email
        try {
          logger.info(`Attempting to send refund completion email to ${user.email} for transaction ${transactionId}`);

          const emailResult = await emailService.sendRefundCompletionEmail({
            email: user.email,
            name: user.firstName || user.email.split('@')[0],
            transactionId: transactionId,
            orderId: transaction.orderId,
            refundAmount: RefundCalculator.paiseToRupees(refundResult.refundAmount),
            refundId: refund.id,
            processedDate: new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });

          if (emailResult.success) {
            logger.info(`✅ Refund completion email sent successfully to ${user.email}`);
          } else {
            logger.warn(`❌ Failed to send refund completion email to ${user.email}: ${emailResult.error}`);
          }
        } catch (emailError) {
          logger.error(`💥 Error sending refund completion email to ${user.email}:`, emailError);
        }

        logger.info(`Admin ${req.user.email} approved refund for transaction ${transactionId} - Scenario ${refundResult.scenario}, Amount: ₹${RefundCalculator.paiseToRupees(refundResult.refundAmount)}, Tokens deducted: ${tokensToDeduct} regular + ${bonusTokensToDeduct} bonus`);

        res.json({
          success: true,
          message: 'Refund approved and processed successfully',
          data: {
            transactionId: transactionId,
            refundId: refund.id,
            status: 'refunded',
            refundAmount: RefundCalculator.paiseToRupees(refundResult.refundAmount),
            refundAmountInPaise: refundResult.refundAmount,
            refundPercentage: refundResult.refundPercentage,
            scenario: refundResult.scenario,
            originalAmount: RefundCalculator.paiseToRupees(transaction.amount),
            tokensDeducted: {
              regular: tokensToDeduct,
              bonus: bonusTokensToDeduct,
              total: tokensToDeduct + bonusTokensToDeduct
            },
            newBalance: {
              regular: user.tokens,
              bonus: user.bonusTokens,
              total: user.tokens + user.bonusTokens
            }
          }
        });

      } catch (razorpayError) {
        logger.error('Razorpay refund error:', razorpayError);

        // Update transaction with failed refund status
        const failedRefundData = {
          refundProcessedBy: req.user.email,
          refundProcessedAt: new Date(),
          adminNotes: notes,
          refundStatus: 'rejected',
          refundReason: `Razorpay Error: ${razorpayError.message}`,
          refundScenario: refundResult.scenario
        };

        await user.updateTransactionStatus(transactionId, 'refund_requested', failedRefundData);

        return res.status(500).json({
          success: false,
          message: 'Failed to process refund via Razorpay',
          error: razorpayError.message
        });
      }

    } else if (action === 'reject') {
      // Reject refund request
      const rejectionData = {
        refundProcessedBy: req.user.email,
        refundProcessedAt: new Date(),
        adminNotes: notes,
        refundStatus: 'rejected'
      };

      await user.updateTransactionStatus(transactionId, 'captured', rejectionData);

      // Send refund rejection email
      try {
        logger.info(`Attempting to send refund rejection email to ${user.email} for transaction ${transactionId}`);

        const emailResult = await emailService.sendRefundRejectionEmail({
          email: user.email,
          name: user.firstName || user.email.split('@')[0],
          transactionId: transactionId,
          orderId: transaction.orderId,
          amount: transaction.amount / 100,
          rejectionReason: notes,
          rejectedDate: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });

        if (emailResult.success) {
          logger.info(`✅ Refund rejection email sent successfully to ${user.email}`);
        } else {
          logger.warn(`❌ Failed to send refund rejection email to ${user.email}: ${emailResult.error}`);
        }
      } catch (emailError) {
        logger.error(`💥 Error sending refund rejection email to ${user.email}:`, emailError);
      }

      logger.info(`Admin ${req.user.email} rejected refund for transaction ${transactionId}`);

      res.json({
        success: true,
        message: 'Refund request rejected',
        data: {
          transactionId: transactionId,
          status: 'captured',
          rejectionReason: notes
        }
      });
    }

  } catch (error) {
    logger.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

// @desc    Admin: Get refund statistics
// @route   GET /api/payment/admin/refund-stats
// @access  Private (Admin only)
router.get('/admin/refund-stats', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Get all users
    const users = await User.find({}).select('razorpayTransactions');

    let totalRefundRequests = 0;
    let pendingRefunds = 0;
    let completedRefunds = 0;
    let rejectedRefunds = 0;
    let totalRefundedAmount = 0;

    users.forEach(user => {
      user.razorpayTransactions.forEach(transaction => {
        if (transaction.status === 'refund_requested') {
          totalRefundRequests++;
          if (transaction.metadata?.refundStatus === 'pending') {
            pendingRefunds++;
          }
        } else if (transaction.status === 'refunded') {
          completedRefunds++;
          totalRefundedAmount += transaction.amount || 0;
        } else if (transaction.status === 'captured' && transaction.metadata?.refundStatus === 'rejected') {
          rejectedRefunds++;
        }
      });
    });

    res.json({
      success: true,
      data: {
        totalRefundRequests,
        pendingRefunds,
        completedRefunds,
        rejectedRefunds,
        totalRefundedAmount: totalRefundedAmount / 100, // Convert from paise to rupees
        stats: {
          pendingPercentage: totalRefundRequests > 0 ? Math.round((pendingRefunds / totalRefundRequests) * 100) : 0,
          completedPercentage: totalRefundRequests > 0 ? Math.round((completedRefunds / totalRefundRequests) * 100) : 0,
          rejectedPercentage: totalRefundRequests > 0 ? Math.round((rejectedRefunds / totalRefundRequests) * 100) : 0
        }
      }
    });
  } catch (error) {
    logger.error('Get refund stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get refund statistics',
      error: error.message
    });
  }
});

module.exports = router;