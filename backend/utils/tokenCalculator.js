const User = require('../models/User');
const Subscription = require('../models/Subscription');

/**
 * Calculate total available tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Token calculation result
 */
async function calculateTotalTokens(userId) {
  try {
    const user = await User.findById(userId).select('tokens');
    const subscription = await Subscription.findOne({ user: userId });
    
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
        isTokenBased: subscription?.features?.aiActionsLimit === 'token-based'
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
        isTokenBased: true
      }
    };
  }
}

module.exports = {
  calculateTotalTokens
};
