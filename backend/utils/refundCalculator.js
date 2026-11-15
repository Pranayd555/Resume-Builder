const logger = require('./logger');

/**
 * Calculates refund amount based on token usage and bonus tokens
 * 
 * Scenarios:
 * 1. Token bought, no bonus, balance >= tokens bought → Full refund
 * 2. Token bought, no bonus, balance < tokens bought → Partial refund based on usage
 * 3. Token bought with bonus, balance >= bought + bonus → Full refund
 * 4. Token bought with bonus, balance >= bought but bonus < added → Partial refund
 * 5. Token bought with bonus, balance < bought and bonus < added → Partial refund with min check
 * 6. Token bought with bonus, balance < bought and bonus >= added → Partial refund for unused purchased tokens
 *
 * Only purchased tokens (user.tokens) are ever refunded; the bonus pool only
 * reduces the refund when this purchase's bonus has been used. Tokens are
 * spent bonus first (see utils/tokenCalculator.js).
 */

class RefundCalculator {
  /**
   * Main refund calculation method
   * @param {Object} transaction - The Razorpay transaction from user.razorpayTransactions
   * @param {Object} currentUserState - Current user state with tokens and bonusTokens
   * @param {Object} paidAmount - The amount paid in paise (Razorpay format)
   * @returns {Object} { refundAmount, refundPercentage, scenario, message, status }
   */
  static calculateRefund(transaction, currentUserState, paidAmount) {
    try {
      // Validate inputs
      if (!transaction || !transaction.metadata) {
        throw new Error('Invalid transaction data');
      }

      if (!currentUserState || currentUserState.tokens === undefined || currentUserState.bonusTokens === undefined) {
        throw new Error('Invalid user state');
      }

      const { tokens: currentTokens, bonusTokens: currentBonusTokens } = currentUserState;
      const { boughtTokens, bonusTokensAdded } = transaction.metadata;
      const paidInPaise = paidAmount || transaction.amount;

      // Validate transaction metadata
      if (!boughtTokens || boughtTokens < 1) {
        throw new Error('Invalid transaction: tokens bought not found or invalid');
      }

      // Helper function to determine scenario and calculate refund
      const hasBonus = bonusTokensAdded && bonusTokensAdded > 0;

      let scenario, refundData;

      if (!hasBonus) {
        // Scenarios 1 & 2: No bonus
        if (currentTokens >= boughtTokens) {
          // Scenario 1: Full refund
          scenario = 1;
          refundData = {
            refundAmount: paidInPaise,
            refundPercentage: 100,
            message: 'Full refund approved - token balance is sufficient'
          };
        } else {
          // Scenario 2: Partial refund based on token usage
          scenario = 2;
          const tokensUsed = boughtTokens - currentTokens;
          const refundPercentage = (currentTokens / boughtTokens) * 100;
          const refundAmount = Math.round((paidInPaise / boughtTokens) * currentTokens);

          refundData = {
            refundAmount,
            refundPercentage,
            message: `Partial refund approved - ${tokensUsed} tokens have been used. Refunding for ${currentTokens} unused tokens.`
          };
        }
      } else {
        // Scenarios 3, 4, 5, 6: With bonus
        const totalTokensWithBonus = boughtTokens + bonusTokensAdded;
        const currentBonusAvailable = currentBonusTokens;
        const bonusUsed = bonusTokensAdded - currentBonusAvailable;

        if (currentTokens >= boughtTokens && currentBonusTokens >= bonusTokensAdded) {
          // Scenario 3: Full refund - both regular and bonus tokens are available
          scenario = 3;
          refundData = {
            refundAmount: paidInPaise,
            refundPercentage: 100,
            message: 'Full refund approved - both purchased tokens and bonus tokens are available'
          };
        } else if (currentTokens >= boughtTokens && currentBonusTokens < bonusTokensAdded) {
          // Scenario 4: Partial refund - regular tokens ok, bonus not fully available
          scenario = 4;
          const bonusUsedAmount = bonusTokensAdded - currentBonusAvailable;
          const effectiveTokensToRefundFor = boughtTokens - bonusUsedAmount;
          const refundPercentage = (effectiveTokensToRefundFor / boughtTokens) * 100;
          const refundAmount = Math.round((paidInPaise / boughtTokens) * effectiveTokensToRefundFor);

          refundData = {
            refundAmount,
            refundPercentage,
            message: `Partial refund approved - ${bonusUsedAmount} bonus tokens have been used. Refunding for ${effectiveTokensToRefundFor} effective tokens.`
          };
        } else if (currentTokens < boughtTokens && currentBonusTokens < bonusTokensAdded) {
          // Scenarios 5 & 6: Both regular and bonus tokens are partially used
          scenario = currentBonusTokens > bonusTokensAdded - currentBonusTokens ? 5 : 5; // Both treated as 5/6

          // Calculate total available tokens (accounting for bonus usage)
          const bonusUsedAmount = bonusTokensAdded - currentBonusAvailable;
          const regularTokensUsed = boughtTokens - currentTokens;
          
          // Effective tokens for refund = current available - tokens lost from bonus
          const effectiveTokensForRefund = currentTokens - bonusUsedAmount;

          // Check if refund is possible (must be at least 1 token)
          if (effectiveTokensForRefund < 1) {
            refundData = {
              refundAmount: 0,
              refundPercentage: 0,
              status: 'not_eligible',
              message: 'Refund not possible as per policy - tokens have been used beyond the purchased amount plus bonus used.'
            };
          } else {
            const refundPercentage = (effectiveTokensForRefund / boughtTokens) * 100;
            const refundAmount = Math.round((paidInPaise / boughtTokens) * effectiveTokensForRefund);

            refundData = {
              refundAmount,
              refundPercentage,
              message: `Partial refund approved - ${regularTokensUsed} purchased tokens and ${bonusUsedAmount} bonus tokens have been used.`
            };
          }
        } else {
          // Scenario 6: some purchased tokens used, but the bonus pool still
          // holds at least this purchase's bonus (e.g. a bonus was granted
          // later). No bonus from this purchase counts as used, so refund the
          // unused purchased tokens, as in scenario 2.
          scenario = 6;
          const regularTokensUsed = boughtTokens - currentTokens;

          if (currentTokens < 1) {
            refundData = {
              refundAmount: 0,
              refundPercentage: 0,
              status: 'not_eligible',
              message: 'Refund not possible as per policy - all purchased tokens have been used.'
            };
          } else {
            refundData = {
              refundAmount: Math.round((paidInPaise / boughtTokens) * currentTokens),
              refundPercentage: (currentTokens / boughtTokens) * 100,
              message: `Partial refund approved - ${regularTokensUsed} purchased tokens have been used. Refunding for ${currentTokens} unused tokens.`
            };
          }
        }
      }

      // Ensure refund amount never exceeds paid amount
      refundData.refundAmount = Math.min(refundData.refundAmount || 0, paidInPaise);

      return {
        ...refundData,
        scenario,
        paid: paidInPaise,
        currentTokens,
        currentBonusTokens,
        boughtTokens,
        bonusTokensAdded: bonusTokensAdded || 0,
        status: refundData.status || 'eligible'
      };
    } catch (error) {
      logger.error('Error calculating refund:', error);
      return {
        success: false,
        error: error.message,
        status: 'error'
      };
    }
  }

  /**
   * True for a paid token purchase. Bonus grants (admin, feedback, signup) are
   * stored as zero-amount transactions and are never refundable.
   * @param {Object} transaction
   * @returns {boolean}
   */
  static isPurchaseTransaction(transaction) {
    if (!transaction) return false;
    const metadata = transaction.metadata || {};
    return Number(transaction.amount) > 0 &&
      Number(metadata.boughtTokens) >= 1 &&
      metadata.type !== 'admin_bonus';
  }

  /**
   * Tokens to remove from the user's pools once an eligible refund is paid.
   * See docs/REFUND_TOKEN_DEDUCTION_LOGIC.md.
   * @param {Object} refundResult - result of calculateRefund()
   * @returns {{ purchased: number, bonus: number }}
   */
  static getTokenDeduction(refundResult) {
    const { scenario, boughtTokens = 0, bonusTokensAdded = 0, currentTokens = 0, currentBonusTokens = 0 } = refundResult || {};
    switch (scenario) {
      case 1: // no bonus, nothing used: all purchased tokens
        return { purchased: boughtTokens, bonus: 0 };
      case 2: // no bonus, some used: the unused purchased tokens
        return { purchased: currentTokens, bonus: 0 };
      case 3: // with bonus, nothing used: purchased + this purchase's bonus
        return { purchased: boughtTokens, bonus: bonusTokensAdded };
      case 4: // bonus partly used, purchased intact: purchased + remaining bonus
        return { purchased: boughtTokens, bonus: currentBonusTokens };
      case 5: // both partly used: everything that is left
        return { purchased: currentTokens, bonus: currentBonusTokens };
      case 6: // purchased partly used, bonus covered: unused purchased + this purchase's bonus
        return { purchased: currentTokens, bonus: bonusTokensAdded };
      default:
        return { purchased: 0, bonus: 0 };
    }
  }

  /**
   * Formats refund amount from paise to rupees
   * @param {number} paise - Amount in paise
   * @returns {number} Amount in rupees
   */
  static paiseToRupees(paise) {
    return (paise / 100).toFixed(2);
  }

  /**
   * Formats refund amount from rupees to paise
   * @param {number} rupees - Amount in rupees
   * @returns {number} Amount in paise
   */
  static rupeesToPaise(rupees) {
    return Math.round(rupees * 100);
  }

  /**
   * Gets refund eligibility summary
   * @param {Object} transaction - The transaction
   * @param {Object} currentUserState - Current user state
   * @returns {Object} Eligibility summary
   */
  static getRefundEligibilitySummary(transaction, currentUserState) {
    const refundResult = this.calculateRefund(transaction, currentUserState, transaction.amount);
    
    return {
      eligible: refundResult.status === 'eligible',
      scenario: refundResult.scenario,
      refundAmount: this.paiseToRupees(refundResult.refundAmount),
      refundPercentage: refundResult.refundPercentage,
      message: refundResult.message,
      reason: refundResult.status === 'not_eligible' ? 'No refund possible - insufficient unused tokens' : null
    };
  }
}

module.exports = RefundCalculator;
