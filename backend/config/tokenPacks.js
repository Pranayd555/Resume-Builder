/**
 * Token packs: the only place prices are defined. The frontend reads them from
 * GET /api/payment/config, and an order is always created from a pack id, so
 * the browser never sends an amount or a token count.
 *
 * price is in rupees. 1 token = 1 AI action. Tokens never expire and are
 * non-refundable; money is refunded only by an admin after investigating a
 * claim (duplicate charge, paid but not credited, service failure).
 */
const TOKEN_PACKS = Object.freeze([
  { id: 'pack_10', tokens: 10, bonus: 0, price: 49 },
  { id: 'pack_25', tokens: 25, bonus: 0, price: 99 },
  { id: 'pack_60', tokens: 60, bonus: 0, price: 199, popular: true },
  { id: 'pack_200', tokens: 200, bonus: 0, price: 499 }
].map(Object.freeze));

const CURRENCY = 'INR';

function findPack(id) {
  return TOKEN_PACKS.find((pack) => pack.id === id) || null;
}

/** Pack price in paise, the unit Razorpay uses. */
const pricePaise = (pack) => pack.price * 100;

module.exports = { TOKEN_PACKS, CURRENCY, findPack, pricePaise };
