/**
 * Token packs: the only place prices are defined. The frontend reads them from
 * GET /api/payment/config, and an order is always created from a pack id, so
 * the browser never sends an amount or a token count.
 *
 * price is in rupees; tokens go to the purchased (refundable) pool and bonus
 * to the bonus pool.
 */
const TOKEN_PACKS = Object.freeze([
  { id: 'pack_5', tokens: 5, bonus: 0, price: 49 },
  { id: 'pack_10', tokens: 10, bonus: 1, price: 89 },
  { id: 'pack_25', tokens: 25, bonus: 5, price: 199 },
  { id: 'pack_50', tokens: 50, bonus: 15, price: 349 },
  { id: 'pack_100', tokens: 100, bonus: 40, price: 599 }
].map(Object.freeze));

const CURRENCY = 'INR';

/** Days after payment in which an unused pack can be refunded. */
const REFUND_WINDOW_DAYS = 7;

function findPack(id) {
  return TOKEN_PACKS.find((pack) => pack.id === id) || null;
}

/** Pack price in paise, the unit Razorpay uses. */
const pricePaise = (pack) => pack.price * 100;

module.exports = { TOKEN_PACKS, CURRENCY, REFUND_WINDOW_DAYS, findPack, pricePaise };
