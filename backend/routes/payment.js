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

// @desc    Complete payment and activate subscription
// @route   POST /api/payment/complete-payment
// @access  Private
router.post('/complete-payment', protect, async (req, res) => {
  try {
    const { 
      order_id, 
      payment_id, 
      signature, 
      plan, 
      amount,
      tokens, // For direct token purchases
      tokenPurchase = false, // Flag to indicate if this is a token purchase
      currency = 'INR',
      payment_method,
      bank,
      wallet,
      vpa,
      email,
      contact
    } = req.body;
    
    // Validate required fields
    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required'
      });
    }

    // For subscription purchases, plan and amount are required
    if (!tokenPurchase && (!plan || !amount || !['pro_monthly', 'pro_yearly'].includes(plan))) {
      return res.status(400).json({
        success: false,
        message: 'Valid Plan and Amount are required for subscription purchases'
      });
    }

    // For token purchases, tokens and amount are required
    if (tokenPurchase && (!tokens || !amount)) {
      return res.status(400).json({
        success: false,
        message: 'Tokens and Amount are required for token purchases'
      });
    }

    // Verify payment signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${order_id}|${payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      // Send error notification for payment verification failure
      await sendPaymentVerificationErrorNotification(req.user, 'Payment verification failed', req, order_id, payment_id, signature, {message: 'error'});
      
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Import required models
    const Subscription = require('../models/Subscription');
    const User = require('../models/User');
    const logger = require('../utils/logger');

    // Get user from request (assuming auth middleware is used)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Handle token purchases (direct token addition)
    if (tokenPurchase) {
      try {
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

        // Calculate total available tokens (purchased + free tokens from subscription)
        const Subscription = require('../models/Subscription');
        const subscription = await Subscription.findOne({ user: userId }).select('features.freeTokens usage.freeTokensUsed');
        const freeTokens = subscription?.features?.freeTokens || 0;
        const freeTokensUsed = subscription?.usage?.freeTokensUsed || 0;
        const remainingFreeTokens = Math.max(0, freeTokens - freeTokensUsed);
        const totalTokenBalance = user.tokens + remainingFreeTokens;

        logger.info(`Token purchase completed: ${tokens} tokens added to user ${user.email}. Previous: ${previousTokens}, New total: ${user.tokens}, Total available: ${totalTokenBalance}`);

        return res.json({
          success: true,
          message: 'Token purchase completed successfully',
          data: {
            tokens: {
              added: parseInt(tokens),
              current: user.tokens,
              totalAvailable: totalTokenBalance
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

      } catch (tokenError) {
        logger.error('Token purchase failed:', tokenError);
        
        
      // Send error notification for token addition failure
        await sendTokenAdditionErrorNotification(user, 'TOKEN_PURCHASE_FAILED', req, payment_id, order_id, amount, plan, subscription, tokenError);

        return res.status(500).json({
          success: false,
          message: 'Token purchase failed. Support has been notified.',
          error: tokenError.message
        });
      }
    }

    // Handle subscription purchases
    let subscription = await Subscription.findOne({ user: userId });
    
    const billingCycle = plan === 'pro_monthly' ? 'monthly' : 'yearly';
    const nextBillingDate = plan === 'pro_monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const freeTokens = plan === 'pro_monthly' ? 150 : 300;

    if (!subscription) {
      // Create new subscription
      subscription = new Subscription({
        user: userId,
        plan: plan,
        status: 'active',
        billing: {
          cycle: billingCycle,
          amount: amount,
          currency: 'INR',
          nextBillingDate: nextBillingDate
        },
        features: {
          freeTokens: freeTokens
        },
        usage: {
          resumesCreated: 0,
          aiActionsThisCycle: 0,
          freeTokensUsed: 0,
          cycleStartDate: new Date(),
          lastBillingCycleReset: new Date()
        }
      });
    } else {
      // Update existing subscription
      subscription.plan = plan;
      subscription.status = 'active';
      subscription.billing = {
        cycle: billingCycle,
        amount: amount,
        currency: 'INR',
        nextBillingDate: nextBillingDate
      };
      subscription.features.freeTokens = freeTokens;
      
      // Reset usage for new billing cycle
      subscription.usage.freeTokensUsed = 0;
      subscription.usage.cycleStartDate = new Date();
      subscription.usage.lastBillingCycleReset = new Date();
    }
    
    // Add payment record to subscription
    subscription.addPayment({
      amount: amount,
      currency: 'INR',
      status: 'succeeded',
      paymentId: payment_id,
      invoiceId: order_id, // Use order_id as invoice ID
      description: `${plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly'} plan subscription`,
      paidAt: new Date(),
      metadata: {
        orderId: order_id,
        plan: plan,
        signature: signature,
        // Enhanced tracking details
        paymentMethod: 'razorpay',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        subscriptionId: subscription._id,
        userId: userId,
        planDetails: {
          name: plan === 'pro_monthly' ? 'Pro Monthly Plan' : 'Pro Yearly Plan',
          price: amount,
          features: plan === 'pro_monthly' ? ['150 free tokens', 'Premium templates', 'ATS analysis', 'Priority support', 'Unlimited exports'] : ['300 free tokens', 'All features', 'Priority support', 'Unlimited exports', 'Custom branding']
        },
        billingCycle: billingCycle,
        nextBillingDate: subscription.billing.nextBillingDate,
        source: 'web_payment',
        campaign: req.headers.referer || 'direct',
        sessionId: req.sessionID || 'no_session'
      }
    });

    // Also add to User's Razorpay transactions
    const user = await User.findById(userId);
    if (user) {
      await user.addRazorpayTransaction({
        transactionId: payment_id, // Use payment_id as transaction ID
        orderId: order_id,
        amount: amount,
        currency: 'INR',
        status: 'captured',
        paymentId: payment_id,
        signature: signature,
        method: 'razorpay',
        capturedAt: new Date(),
        notes: `${plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly'} plan subscription`,
        metadata: {
          plan: plan,
          subscriptionId: subscription._id,
          // Enhanced tracking for Razorpay transactions
          paymentGateway: 'razorpay',
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          timestamp: new Date().toISOString(),
          userId: userId,
          planDetails: {
            name: plan === 'pro_monthly' ? 'Pro Monthly Plan' : 'Pro Yearly Plan',
            price: amount,
            features: plan === 'pro_monthly' ? ['150 free tokens', 'Premium templates', 'ATS analysis', 'Priority support', 'Unlimited exports'] : ['300 free tokens', 'All features', 'Priority support', 'Unlimited exports', 'Custom branding']
          },
          billingCycle: billingCycle,
          nextBillingDate: subscription.billing.nextBillingDate,
          source: 'web_payment',
          campaign: req.headers.referer || 'direct',
          sessionId: req.sessionID || 'no_session',
          // Additional Razorpay specific tracking
          razorpayOrderId: order_id,
          razorpayPaymentId: payment_id,
          razorpaySignature: signature,
          paymentStatus: 'captured',
          paymentMethod: 'razorpay',
          transactionType: 'subscription_purchase'
        }
      });
    }

    // Add tokens to user account for direct token purchases
    if (req.body.tokenPurchase && req.body.tokens) {
      try {
        const tokensToAdd = parseInt(req.body.tokens);
        if (tokensToAdd > 0) {
          const previousTokens = user.tokens || 0;
          user.tokens = (user.tokens || 0) + tokensToAdd;
          await user.save();
          
          logger.info(`Added ${tokensToAdd} tokens to user ${user.email}. Previous: ${previousTokens}, New total: ${user.tokens}`);
        }
      } catch (tokenError) {
        logger.error('Failed to add tokens to user account:', tokenError);
        
        // Send error notification for token addition failure
        await sendTokenAdditionErrorNotification(user, 'TOKEN_ADDITION_FAILED_AFTER_PAYMENT', req, payment_id, order_id, amount, plan, subscription, tokenError);
      }
    }
    
    await subscription.save(); // This triggers the pre-save middleware to set freeTokens
    
    logger.info(`Payment completed and subscription activated: ${plan} plan for user ${userId}, Payment ID: ${payment_id}`);
    
    // Calculate total available tokens (purchased + remaining free tokens)
    const { calculateTotalTokens } = require('../utils/tokenCalculator');
    const tokenData = await calculateTotalTokens(userId);

    res.json({
      success: true,
      message: 'Payment completed and subscription activated successfully',
      data: {
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          freeTokens: subscription.features.freeTokens,
          nextBillingDate: subscription.billing.nextBillingDate
        },
        payment: {
          payment_id,
          amount,
          currency: 'INR'
        },
        tokens: req.body.tokenPurchase ? {
          added: req.body.tokens,
          current: user.tokens,
          totalAvailable: tokenData.totalTokenBalance,
          purchasedTokens: tokenData.purchasedTokens,
          remainingFreeTokens: tokenData.remainingFreeTokens
        } : {
          totalAvailable: tokenData.totalTokenBalance,
          purchasedTokens: tokenData.purchasedTokens,
          remainingFreeTokens: tokenData.remainingFreeTokens
        }
      }
    });
  } catch (error) {
    console.error('Complete payment error:', error);
      // Send error notification for token addition failure
        await sendTokenAdditionErrorNotification(req.user, 'Complete payment error', req, payment_id, order_id, amount, plan, subscription, error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to complete payment. Support has been notified.',
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

    // Calculate total available tokens (purchased + remaining free tokens)
    const { calculateTotalTokens } = require('../utils/tokenCalculator');
    const tokenData = await calculateTotalTokens(userId);

    res.json({
      success: true,
      message: 'Token purchase completed successfully',
      data: {
        tokens: {
          added: parseInt(tokens),
          previous: previousTokens,
          current: user.tokens,
          totalAvailable: tokenData.totalTokenBalance,
          purchasedTokens: tokenData.purchasedTokens,
          remainingFreeTokens: tokenData.remainingFreeTokens
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
