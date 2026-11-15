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

// ---- Scenario helpers (amounts in paise) ----

const fullRefund = (paid, message) => ({ refundAmount: paid, refundPercentage: 100, message });

// Refund for `effective` of the `bought` tokens, at the price paid per token.
const partialRefund = (paid, bought, effective, message) => ({
  refundAmount: Math.round((paid / bought) * effective),
  refundPercentage: (effective / bought) * 100,
  message
});

const notEligible = (message) => ({ refundAmount: 0, refundPercentage: 0, status: 'not_eligible', message });

// Scenarios 1 and 2: the purchase had no bonus.
function scenarioWithoutBonus({ paid, bought, tokens }) {
  if (tokens >= bought) {
    return { scenario: 1, ...fullRefund(paid, 'Full refund approved - token balance is sufficient') };
  }
  return {
    scenario: 2,
    ...partialRefund(paid, bought, tokens,
      `Partial refund approved - ${bought - tokens} tokens have been used. Refunding for ${tokens} unused tokens.`)
  };
}

// Scenario 5: purchased and bonus tokens both partly used. The bonus used
// reduces the refundable tokens; under 1 token left means not eligible.
function scenarioBothUsed({ paid, bought, tokens, bonusUsed }) {
  const effective = tokens - bonusUsed;
  if (effective < 1) {
    return {
      scenario: 5,
      ...notEligible('Refund not possible as per policy - tokens have been used beyond the purchased amount plus bonus used.')
    };
  }
  return {
    scenario: 5,
    ...partialRefund(paid, bought, effective,
      `Partial refund approved - ${bought - tokens} purchased tokens and ${bonusUsed} bonus tokens have been used.`)
  };
}

// Scenario 6: some purchased tokens used, but the bonus pool still holds at
// least this purchase's bonus (e.g. a bonus was granted later). No bonus from
// this purchase counts as used, so refund the unused purchased tokens, as in
// scenario 2.
function scenarioPurchasedUsedBonusCovered({ paid, bought, tokens }) {
  if (tokens < 1) {
    return { scenario: 6, ...notEligible('Refund not possible as per policy - all purchased tokens have been used.') };
  }
  return {
    scenario: 6,
    ...partialRefund(paid, bought, tokens,
      `Partial refund approved - ${bought - tokens} purchased tokens have been used. Refunding for ${tokens} unused tokens.`)
  };
}

// Scenarios 3 to 6: the purchase came with bonus tokens.
function scenarioWithBonus({ paid, bought, tokens, bonus, bonusAdded }) {
  const purchasedIntact = tokens >= bought;
  const bonusIntact = bonus >= bonusAdded;
  const bonusUsed = bonusAdded - bonus;

  if (purchasedIntact && bonusIntact) {
    return {
      scenario: 3,
      ...fullRefund(paid, 'Full refund approved - both purchased tokens and bonus tokens are available')
    };
  }
  if (purchasedIntact) {
    // Scenario 4: bonus partly used, purchased intact
    const effective = bought - bonusUsed;
    return {
      scenario: 4,
      ...partialRefund(paid, bought, effective,
        `Partial refund approved - ${bonusUsed} bonus tokens have been used. Refunding for ${effective} effective tokens.`)
    };
  }
  if (!bonusIntact) {
    return scenarioBothUsed({ paid, bought, tokens, bonusUsed });
  }
  return scenarioPurchasedUsedBonusCovered({ paid, bought, tokens });
}

function validateInputs(transaction, currentUserState) {
  if (!transaction?.metadata) {
    throw new Error('Invalid transaction data');
  }
  if (currentUserState?.tokens === undefined || currentUserState?.bonusTokens === undefined) {
    throw new Error('Invalid user state');
  }
  const { boughtTokens } = transaction.metadata;
  if (!boughtTokens || boughtTokens < 1) {
    throw new Error('Invalid transaction: tokens bought not found or invalid');
  }
}

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
      validateInputs(transaction, currentUserState);

      const { tokens: currentTokens, bonusTokens: currentBonusTokens } = currentUserState;
      const { boughtTokens, bonusTokensAdded } = transaction.metadata;
      const paidInPaise = paidAmount || transaction.amount;
      const input = {
        paid: paidInPaise,
        bought: boughtTokens,
        tokens: currentTokens,
        bonus: currentBonusTokens,
        bonusAdded: bonusTokensAdded
      };

      const refundData = bonusTokensAdded > 0 ? scenarioWithBonus(input) : scenarioWithoutBonus(input);

      // Ensure refund amount never exceeds paid amount
      refundData.refundAmount = Math.min(refundData.refundAmount || 0, paidInPaise);

      return {
        ...refundData,
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
