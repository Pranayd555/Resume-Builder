const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const validateSubscription = require('../middleware/validateSubscription');
const {
  startTrial,
  activatePro,
  getSubscriptionStatus
} = require('../controllers/subscriptionController');

const router = express.Router();

/**
 * @desc    Start a 3-day trial
 * @route   POST /api/subscription/start-trial
 * @access  Private
 */
router.post('/start-trial', protect, async (req, res) => {
  await startTrial(req, res);
});

/**
 * @desc    Activate pro plan (monthly or yearly)
 * @route   POST /api/subscription/activate-pro
 * @access  Private
 */
router.post('/activate-pro', [
  protect,
  body('planType')
    .isIn(['monthly', 'yearly'])
    .withMessage('Plan type must be either monthly or yearly')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  await activatePro(req, res);
});

/**
 * @desc    Get current subscription status
 * @route   GET /api/subscription/status
 * @access  Private
 */
router.get('/status', protect, async (req, res) => {
  await getSubscriptionStatus(req, res);
});

/**
 * @desc    Get subscription plans information
 * @route   GET /api/subscription/plans
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free Plan',
        price: 0,
        features: [
          '2 resume projects',
          'Basic templates',
          'PDF export',
          'Limited AI features (token-based)',
          'Email support'
        ],
        limits: {
          resumes: 2,
          aiTokens: 20
        }
      },
      {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        price: 499,
        features: [
          '5 resume projects',
          'All premium templates',
          'PDF export',
          'Full AI features',
          'Priority support'
        ],
        limits: {
          resumes: 5,
          aiTokens: 0 // Pro users get tokens through subscription
        },
        billing: 'monthly'
      },
      {
        id: 'pro_yearly',
        name: 'Pro Yearly',
        price: 4999,
        features: [
          '5 resume projects',
          'All premium templates',
          'PDF export',
          'Full AI features',
          'Priority support',
          'Custom branding'
        ],
        limits: {
          resumes: 5,
          aiTokens: 0 // Pro users get tokens through subscription
        },
        billing: 'yearly'
      }
    ];

    res.json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching plans'
    });
  }
});

module.exports = router;
