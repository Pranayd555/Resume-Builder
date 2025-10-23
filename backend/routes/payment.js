const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function sendTokenAdditionErrorNotification(user, type, req, payment_id, order_id, amount, plan, subscription, tokenError) {
  try {
    const emailService = require('../utils/emailService');
    await emailService.sendErrorNotification({
      type: type,
      userEmail: user.email,
      userId: user._id,
      error: tokenError.message,
      requestData: {
        tokens: req.body.tokens,
        paymentId: payment_id,
        orderId: order_id,
        amount: amount,
        plan: plan,
        subscriptionId: subscription._id
      },
      timestamp: new Date()
    });
  } catch (emailError) {
    logger.error('Failed to send token addition error notification:', emailError);
  }
}

// Test Razorpay connection
router.get('/test', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Razorpay instance initialized successfully',
      keyId: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured',
      keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Configured' : 'Not configured',
      environment: process.env.NODE_ENV,
      allEnvVars: {
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set',
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize Razorpay',
      error: error.message
    });
  }
});

// Create order
router.post('/create-order', async (req, res) => {
  try {    
    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay configuration missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.',
        error: 'Razorpay keys not configured'
      });
    }
    
    const { amount, currency = 'INR', receipt } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { order_id, payment_id, signature, plan, amount } = req.body;
    
    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required'
      });
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${order_id}|${payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === signature) {
      // Payment verified successfully
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          order_id,
          payment_id,
          plan,
          amount,
          // Note: Frontend should call /api/subscriptions/activate after this
          nextStep: 'Call /api/subscriptions/activate to activate subscription'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// @desc    Complete token purchase
// @route   POST /api/payment/complete-payment
// @access  Private
router.post('/complete-payment', protect, async (req, res) => {
  try {
    const { 
      order_id, 
      payment_id, 
      signature, 
      tokens,
      amount,
      currency = 'INR',
      payment_method,
      bank,
      wallet,
      vpa,
      email,
      contact
    } = req.body;
    
    // Validate required fields
    if (!order_id || !payment_id || !signature || !tokens || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, Signature, Tokens, and Amount are required'
      });
    }

    // Verify payment signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${order_id}|${payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Import required models
    const User = require('../models/User');
    const logger = require('../utils/logger');

    // Get user from request
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add tokens to user account
    const previousTokens = user.tokens || 0;
    user.tokens = (user.tokens || 0) + parseInt(tokens);
    await user.save();

    // Add to Razorpay transactions
    await user.addRazorpayTransaction({
      transactionId: payment_id,
      orderId: order_id,
      amount: amount,
      currency: currency,
      status: 'captured',
      paymentId: payment_id,
      signature: signature,
      method: payment_method || 'razorpay',
      bank: bank,
      wallet: wallet,
      vpa: vpa,
      email: email,
      contact: contact,
      capturedAt: new Date(),
      notes: `Direct token purchase - ${tokens} tokens`,
      metadata: {
        tokenPurchase: true,
        tokensAdded: parseInt(tokens),
        previousTokens: previousTokens,
        newTokenBalance: user.tokens,
        paymentGateway: 'razorpay',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        userId: userId,
        source: 'web_payment',
        campaign: req.headers.referer || 'direct',
        sessionId: req.sessionID || 'no_session'
      }
    });

    logger.info(`Token purchase completed: ${tokens} tokens added to user ${user.email}. Previous: ${previousTokens}, New total: ${user.tokens}`);

    res.json({
      success: true,
      message: 'Token purchase completed successfully',
      data: {
        tokens: {
          added: parseInt(tokens),
          previous: previousTokens,
          current: user.tokens,
          totalAvailable: user.tokens
        },
        payment: {
          paymentId: payment_id,
          orderId: order_id,
          amount: amount,
          currency: currency,
          status: 'succeeded'
        }
      }
    });

  } catch (error) {
    logger.error('Token purchase error:', error);
    
    // Send error notification
    try {
      const emailService = require('../utils/emailService');
      await emailService.sendErrorNotification({
        type: 'TOKEN_PURCHASE_FAILED',
        userEmail: req.user?.email || 'unknown',
        userId: req.user?.id || 'unknown',
        error: error.message,
        requestData: {
          tokens: req.body.tokens,
          paymentId: req.body.payment_id,
          orderId: req.body.order_id,
          amount: req.body.amount,
          currency: req.body.currency
        },
        timestamp: new Date()
      });
    } catch (emailError) {
      logger.error('Failed to send token purchase error notification:', emailError);
    }

    res.status(500).json({
      success: false,
      message: 'Token purchase failed. Support has been notified.',
      error: error.message
    });
  }
});


// Get order details
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await razorpay.orders.fetch(orderId);
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

module.exports = router;
