/**
 * The refund rule, in one place (matches the public Cancellation & Refunds page):
 *
 *   A token pack gets a full refund if it was paid for within the last
 *   REFUND_WINDOW_DAYS days, has not been refunded, and every token it added,
 *   bonus included, is still in the user's balance (the pack is unused).
 *   Otherwise there is no refund. Bonus grants are never refundable.
 *
 * Tokens are spent bonus first, so using AI even once after buying a pack
 * makes it non-refundable. Admins can still issue a goodwill refund.
 */
const { REFUND_WINDOW_DAYS } = require('../config/tokenPacks');

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * @param {object} payment Payment document (or plain object)
 * @param {{purchased: number, bonus: number}} balance the user's current balance
 * @param {Date} [now]
 * @returns {{ refundable: boolean, reason: string|null, refundableUntil: Date|null }}
 */
function refundEligibility(payment, balance, now = new Date()) {
  const no = (reason, refundableUntil = null) => ({ refundable: false, reason, refundableUntil });

  if (payment?.type !== 'purchase' || !(payment.amount > 0)) {
    return no('Bonus tokens are not refundable.');
  }
  if (payment.status === 'refunded' || payment.refund?.status === 'pending' || payment.refund?.status === 'processed') {
    return no('This payment has already been refunded.');
  }
  if (payment.status !== 'paid' || !payment.paidAt) {
    return no('Only completed payments can be refunded.');
  }

  const refundableUntil = new Date(new Date(payment.paidAt).getTime() + REFUND_WINDOW_DAYS * DAY_MS);
  if (now > refundableUntil) {
    return no(`Refunds are available for ${REFUND_WINDOW_DAYS} days after purchase.`, refundableUntil);
  }

  const purchased = Number(balance?.purchased) || 0;
  const bonus = Number(balance?.bonus) || 0;
  if (purchased < (payment.tokens || 0) || bonus < (payment.bonusTokens || 0)) {
    return no('Tokens from this pack have been used, so it can no longer be refunded.', refundableUntil);
  }

  return { refundable: true, reason: null, refundableUntil };
}

module.exports = { refundEligibility, REFUND_WINDOW_DAYS };
