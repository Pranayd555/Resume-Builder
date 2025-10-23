const User = require('../models/User');

/**
 * Calculate total available tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Token calculation result
 */
async function calculateTotalTokens(userId) {
  try {
    const user = await User.findById(userId).select('tokens');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get purchased tokens from user
    const purchasedTokens = user.tokens || 0;
    
    return {
      totalTokenBalance: purchasedTokens,
      purchasedTokens: purchasedTokens,
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