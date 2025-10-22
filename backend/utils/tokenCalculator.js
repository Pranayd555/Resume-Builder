const User = require('../models/User');
const Subscription = require('../models/Subscription');

/**
 * Calculate total available tokens for a user
 * @param {string|Object} userIdOrSubscription - User ID or Subscription object
 * @returns {Promise<Object>} Token calculation result
 */
async function calculateTotalTokens(userIdOrSubscription) {
  try {
    let user, subscription;
    
    // Handle both user ID and subscription object inputs
    if (typeof userIdOrSubscription === 'string') {
      user = await User.findById(userIdOrSubscription).select('tokens');
      subscription = await Subscription.findOne({ user: userIdOrSubscription });
    } else {
      // If subscription object is passed, get user data
      user = await User.findById(userIdOrSubscription.user).select('tokens');
      subscription = userIdOrSubscription;
    }
    
    // Calculate purchased tokens
    const purchasedTokens = user?.tokens || 0;
    
    // Calculate remaining free tokens
    const freeTokens = subscription?.features?.freeTokens || 0;
    const freeTokensUsed = subscription?.usage?.freeTokensUsed || 0;
    const remainingFreeTokens = Math.max(0, freeTokens - freeTokensUsed);
    
    // Calculate total available tokens
    const totalTokenBalance = purchasedTokens + remainingFreeTokens;
    
    return {
      totalTokenBalance,
      purchasedTokens,
      remainingFreeTokens,
      freeTokens,
      freeTokensUsed,
      subscription: {
        plan: subscription?.plan || 'free',
        planName: subscription?.plan === 'free' ? 'Free' : 
                 subscription?.plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly',
        isTokenBased: subscription?.features?.aiActionsLimit === 'token-based',
        status: subscription?.status || 'active',
        isTrial: subscription?.status === 'trialing',
        remainingDays: subscription?.remainingDays || 0,
        trialRemainingDays: subscription?.trialRemainingDays || 0
      }
    };
  } catch (error) {
    console.error('Error calculating total tokens:', error);
    return {
      totalTokenBalance: 0,
      purchasedTokens: 0,
      remainingFreeTokens: 0,
      freeTokens: 0,
      freeTokensUsed: 0,
      subscription: {
        plan: 'free',
        planName: 'Free',
        isTokenBased: true,
        status: 'active',
        isTrial: false,
        remainingDays: 0,
        trialRemainingDays: 0
      }
    };
  }
}

module.exports = {
  calculateTotalTokens
};
