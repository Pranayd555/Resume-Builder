const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

// Initialize Stripe only if secret key is provided
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const router = express.Router();

// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        features: [
          '1 resume template',
          'Basic editing tools',
          'PDF export (with watermark)',
          'Email support',
          '1-2 AI suggestions per month'
        ],
        limits: {
          resumes: 1,
          templates: ['free'],
          exports: ['pdf'],
          aiActions: 2
        },
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 9.99, yearly: 79 },
        features: [
          'Unlimited resume projects',
          'Full access to all premium templates',
          '100 AI actions/month (rewrite, summarize, keyword-enhance, tone adjust)',
          'Resume feedback analysis (ATS score, grammar)',
          'Export in DOCX + PDF',
          'No watermark, unlimited exports',
          'Cloud resume history',
          'Priority support'
        ],
        limits: {
          resumes: 50,
          templates: ['free', 'pro'],
          exports: ['pdf', 'docx'],
          aiActions: 100
        },
        popular: true,
        trial: {
          free: 3,
          paid: 7
        }
      }
    ];

    res.json({
      success: true,
      data: {
        plans
      }
    });
  } catch (error) {
    logger.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get trial information
// @route   GET /api/subscriptions/trial-info
// @access  Private
router.get('/trial-info', protect, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    // Check if trial has expired and update if necessary
    if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
      await subscription.expireTrial();
      // Refresh the subscription data after expiration
      subscription = await Subscription.findOne({ user: req.user.id });
    }

    const trialInfo = {
      isTrialActive: subscription.isTrialActive(),
      hasTrialExpired: subscription.hasTrialExpired(),
      trialType: subscription.billing?.trialType,
      trialEnd: subscription.billing?.trialEnd,
      trialRemainingDays: subscription.trialRemainingDays,
      plan: subscription.plan,
      status: subscription.status
    };

    res.json({
      success: true,
      data: {
        trialInfo
      }
    });
  } catch (error) {
    logger.error('Get trial info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get current subscription
// @route   GET /api/subscriptions/current
// @access  Private
router.get('/current', protect, async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      // Create default free subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: 'free',
        status: 'active'
      });
      await subscription.save();
    } else {
      // Check if trial has expired and update if necessary
      if (subscription.status === 'trialing' && subscription.hasTrialExpired()) {
        await subscription.expireTrial();
        // Refresh the subscription data after expiration
        subscription = await Subscription.findOne({ user: req.user.id });
      }
    }

    res.json({
      success: true,
      data: {
        subscription
      }
    });
  } catch (error) {
    logger.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Start trial
// @route   POST /api/subscriptions/start-trial
// @access  Private
router.post('/start-trial', [
  protect,
  body('trialType').isIn(['free', 'paid']).withMessage('Valid trial type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { trialType } = req.body;
    let subscription = await Subscription.findOne({ user: req.user.id });

    // Check if user already has an active trial
    if (subscription && subscription.status === 'trialing' && subscription.billing?.trialEnd) {
      const trialEnd = new Date(subscription.billing.trialEnd);
      const now = new Date();
      
      if (trialEnd > now) {
        return res.status(400).json({
          success: false,
          error: 'Trial already active'
        });
      }
    }

    // Check if user has already had a trial before
    if (subscription && subscription.hasHadTrial) {
      return res.status(400).json({
        success: false,
        error: 'You have already used your trial. Please upgrade to continue using Pro features.'
      });
    }

    // Create new subscription if doesn't exist
    if (!subscription) {
      subscription = Subscription.createTrial(req.user.id, trialType, trialType === 'free' ? 3 : 7);
    } else {
      // Update existing subscription for trial
      subscription.plan = 'pro';
      subscription.status = 'trialing';
      subscription.hasHadTrial = true;
      subscription.billing = {
        trialType: trialType,
        trialEnd: new Date(Date.now() + (trialType === 'free' ? 3 : 7) * 24 * 60 * 60 * 1000)
      };
      
      // Reset usage for trial
      subscription.usage = {
        resumesCreated: 0,
        exportsThisMonth: 0,
        aiActionsThisMonth: 0,
        lastResetDate: new Date()
      };
      
      // Clear any existing Stripe data for trial
      subscription.stripe = {};
    }

    await subscription.save();

    logger.info(`Trial started: ${trialType} trial for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        subscription
      }
    });
  } catch (error) {
    logger.error('Start trial error:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => 
        `${key}: ${error.errors[key].message}`
      ).join(', ');
      
      return res.status(400).json({
        success: false,
        error: `Validation error: ${validationErrors}`
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error starting trial'
    });
  }
});

// @desc    Create Stripe checkout session
// @route   POST /api/subscriptions/create-checkout-session
// @access  Private
router.post('/create-checkout-session', [
  protect,
  body('plan').isIn(['pro']).withMessage('Valid plan is required'),
  body('billing').isIn(['monthly', 'yearly']).withMessage('Valid billing cycle is required')
], async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Payment processing not configured'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { plan, billing } = req.body;
    const user = req.user;

    // Define price mapping (in production, these would be Stripe Price IDs)
    const priceMapping = {
      pro: {
        monthly: 'price_pro_monthly_999',
        yearly: 'price_pro_yearly_7900'
      }
    };

    const priceId = priceMapping[plan][billing];

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan or billing cycle'
      });
    }

    // Create or get Stripe customer
    let customer;
    const existingSubscription = await Subscription.findOne({ user: user.id });

    if (existingSubscription && existingSubscription.stripe?.customerId) {
      customer = await stripe.customers.retrieve(existingSubscription.stripe.customerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id.toString()
        }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/plans`,
      metadata: {
        userId: user.id.toString(),
        plan,
        billing
      }
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    logger.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating checkout session'
    });
  }
});

// @desc    Handle successful subscription
// @route   POST /api/subscriptions/success
// @access  Private
router.post('/success', [
  protect,
  body('sessionId').notEmpty().withMessage('Session ID is required')
], async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Payment processing not configured'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { sessionId } = req.body;

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata.userId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }

    // Get subscription details
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

    // Update or create subscription
    let subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      subscription = new Subscription({
        user: req.user.id,
        plan: session.metadata.plan,
        status: 'active',
        billing: {
          cycle: session.metadata.billing,
          amount: stripeSubscription.items.data[0].price.unit_amount / 100,
          currency: stripeSubscription.currency.toUpperCase(),
          nextBillingDate: new Date(stripeSubscription.current_period_end * 1000)
        },
        stripe: {
          customerId: session.customer,
          subscriptionId: session.subscription,
          priceId: stripeSubscription.items.data[0].price.id
        }
      });
    } else {
      subscription.plan = session.metadata.plan;
      subscription.status = 'active';
      subscription.billing.cycle = session.metadata.billing;
      subscription.billing.amount = stripeSubscription.items.data[0].price.unit_amount / 100;
      subscription.billing.currency = stripeSubscription.currency.toUpperCase();
      subscription.billing.nextBillingDate = new Date(stripeSubscription.current_period_end * 1000);
      subscription.stripe.customerId = session.customer;
      subscription.stripe.subscriptionId = session.subscription;
      subscription.stripe.priceId = stripeSubscription.items.data[0].price.id;
    }

    await subscription.save();

    // Update user subscription info
    await User.findByIdAndUpdate(req.user.id, {
      'subscription.plan': session.metadata.plan,
      'subscription.isActive': true,
      'subscription.stripeCustomerId': session.customer,
      'subscription.stripeSubscriptionId': session.subscription
    });

    logger.info(`Subscription activated: ${session.metadata.plan} for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        subscription
      }
    });
  } catch (error) {
    logger.error('Subscription success error:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing subscription'
    });
  }
});

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
router.post('/cancel', [
  protect,
  body('reason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    if (subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel free plan'
      });
    }

    if (stripe && subscription.stripe?.subscriptionId) {
      // Cancel Stripe subscription
      await stripe.subscriptions.update(subscription.stripe.subscriptionId, {
        cancel_at_period_end: true
      });
    }

    // Update subscription
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    subscription.cancelReason = req.body.reason;
    subscription.endDate = subscription.billing.nextBillingDate;

    await subscription.save();

    logger.info(`Subscription canceled for user ${req.user.email}. Reason: ${req.body.reason}`);

    res.json({
      success: true,
      data: {
        message: 'Subscription will be canceled at the end of current billing period',
        endDate: subscription.endDate
      }
    });
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Error canceling subscription'
    });
  }
});

// @desc    Reactivate subscription
// @route   POST /api/subscriptions/reactivate
// @access  Private
router.post('/reactivate', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    if (subscription.status !== 'canceled') {
      return res.status(400).json({
        success: false,
        error: 'Subscription is not canceled'
      });
    }

    if (stripe && subscription.stripe?.subscriptionId) {
      // Reactivate Stripe subscription
      await stripe.subscriptions.update(subscription.stripe.subscriptionId, {
        cancel_at_period_end: false
      });
    }

    // Update subscription
    subscription.status = 'active';
    subscription.canceledAt = undefined;
    subscription.cancelReason = undefined;
    subscription.endDate = undefined;

    await subscription.save();

    logger.info(`Subscription reactivated for user ${req.user.email}`);

    res.json({
      success: true,
      data: {
        subscription
      }
    });
  } catch (error) {
    logger.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Error reactivating subscription'
    });
  }
});

// @desc    Get billing history
// @route   GET /api/subscriptions/billing-history
// @access  Private
router.get('/billing-history', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No subscription found'
      });
    }

    const history = subscription.paymentHistory
      .sort((a, b) => b.paidAt - a.paidAt)
      .slice(0, 20); // Last 20 payments

    res.json({
      success: true,
      data: {
        history
      }
    });
  } catch (error) {
    logger.error('Get billing history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update payment method
// @route   POST /api/subscriptions/update-payment-method
// @access  Private
router.post('/update-payment-method', [
  protect,
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
], async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Payment processing not configured'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const subscription = await Subscription.findOne({ user: req.user.id });

    if (!subscription || !subscription.stripe?.subscriptionId) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const { paymentMethodId } = req.body;

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripe.customerId
    });

    // Update subscription default payment method
    await stripe.subscriptions.update(subscription.stripe.subscriptionId, {
      default_payment_method: paymentMethodId
    });

    // Update our record
    subscription.stripe.paymentMethodId = paymentMethodId;
    await subscription.save();

    res.json({
      success: true,
      data: {
        message: 'Payment method updated successfully'
      }
    });
  } catch (error) {
    logger.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating payment method'
    });
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/subscriptions/webhook
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).send('Payment processing not configured');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook error'
    });
  }
});

// Helper functions for webhook handlers
async function handlePaymentSucceeded(paymentIntent) {
  const subscription = await Subscription.findOne({
    'stripe.customerId': paymentIntent.customer
  }).populate('user');

  if (subscription) {
    await subscription.addPayment({
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'succeeded',
      stripePaymentIntentId: paymentIntent.id,
      paidAt: new Date()
    });

    // Send subscription confirmation email
    try {
      const user = subscription.user;
      const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
      const amount = (paymentIntent.amount / 100).toFixed(2);
      
      await emailService.sendSubscriptionConfirmation(
        user.email,
        `${user.firstName} ${user.lastName}`,
        planName,
        amount
      );
    } catch (emailError) {
      logger.error('Failed to send subscription confirmation email:', emailError);
    }
  }
}

async function handlePaymentFailed(paymentIntent) {
  const subscription = await Subscription.findOne({
    'stripe.customerId': paymentIntent.customer
  });

  if (subscription) {
    await subscription.addPayment({
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'failed',
      stripePaymentIntentId: paymentIntent.id,
      failureReason: paymentIntent.last_payment_error?.message
    });

    // Update subscription status
    subscription.status = 'past_due';
    await subscription.save();
  }
}

async function handleSubscriptionUpdated(stripeSubscription) {
  const subscription = await Subscription.findOne({
    'stripe.subscriptionId': stripeSubscription.id
  });

  if (subscription) {
    subscription.status = stripeSubscription.status;
    subscription.billing.nextBillingDate = new Date(stripeSubscription.current_period_end * 1000);
    await subscription.save();
  }
}

async function handleSubscriptionDeleted(stripeSubscription) {
  const subscription = await Subscription.findOne({
    'stripe.subscriptionId': stripeSubscription.id
  }).populate('user');

  if (subscription) {
    const previousPlan = subscription.plan;
    subscription.plan = 'free';
    subscription.status = 'canceled';
    subscription.endDate = new Date();
    await subscription.save();

    // Send subscription cancellation email
    try {
      const user = subscription.user;
      const planName = previousPlan.charAt(0).toUpperCase() + previousPlan.slice(1);
      
      await emailService.sendSubscriptionCancellation(
        user.email,
        `${user.firstName} ${user.lastName}`,
        planName
      );
    } catch (emailError) {
      logger.error('Failed to send subscription cancellation email:', emailError);
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  const subscription = await Subscription.findOne({
    'stripe.customerId': invoice.customer
  });

  if (subscription) {
    await subscription.addPayment({
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'succeeded',
      stripeInvoiceId: invoice.id,
      description: `Subscription payment for ${subscription.plan} plan`,
      paidAt: new Date(invoice.status_transitions.paid_at * 1000)
    });
  }
}

module.exports = router; 