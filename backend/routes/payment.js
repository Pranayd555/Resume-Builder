const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

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
        tokensAdded: tokens,
        regularTokensAdded: regularTokens,
        bonusTokensAdded: bonusTokens,
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

    const transactions = user.getTransactionHistory(20);

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

module.exports = router;