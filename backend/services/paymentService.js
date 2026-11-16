/**
 * Token purchases and refunds through Razorpay.
 *
 * Buying:
 *   1. createOrder(user, packId)  server prices the pack, creates the Razorpay
 *      order and a Payment record (status 'created').
 *   2. fulfilOrder(orderId)       called by the browser callback (after its
 *      signature check), by the payment.captured / order.paid webhooks and by
 *      the reconcile job. Whichever runs first moves the Payment to 'paid' and
 *      credits the tokens; the others do nothing. Crediting carries an
 *      operation id, so it is applied exactly once even after a crash.
 *
 * Tokens are non-refundable. refundPayment() is admin-only, used after
 * investigating a claim (duplicate charge, paid but not credited, service
 * failure). It claims the Payment atomically, removes whatever is left of the
 * pack's tokens (optional), then asks Razorpay for the refund. If Razorpay
 * fails, exactly the removed tokens are put back and it can be retried.
 *
 * Everything that changes state is a single conditional update, so double
 * clicks, retries and concurrent webhooks are safe.
 */
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const logger = require('../utils/logger');
const { logSafe } = require('../utils/logSafe');
const emailService = require('../utils/emailService');
const { TOKEN_PACKS, CURRENCY, findPack, pricePaise } = require('../config/tokenPacks');
const { creditTokens, deductForRefund, getTokenBalance, isOpApplied, toUserId } = require('../utils/tokenCalculator');

// ---- configuration ----------------------------------------------------------

let razorpayClient = null;

/** Razorpay client, or null when keys are not configured. Replaceable in tests. */
function getRazorpay() {
  if (!razorpayClient && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayClient;
}

function setRazorpayClient(client) {
  razorpayClient = client;
}

/** New purchases are accepted only when PAYMENTS_ENABLED=true and keys are set. */
function paymentsEnabled() {
  return process.env.PAYMENTS_ENABLED === 'true' && Boolean(getRazorpay());
}

/** Public configuration for the checkout page. */
function publicConfig() {
  const enabled = paymentsEnabled();
  return {
    enabled,
    keyId: enabled ? process.env.RAZORPAY_KEY_ID : null,
    currency: CURRENCY,
    refundable: false,
    packs: TOKEN_PACKS.map(({ id, tokens, bonus, price, popular }) => ({ id, tokens, bonus, price, popular: Boolean(popular) }))
  };
}

class PaymentError extends Error {
  constructor(message, statusCode = 400, code = 'payment_error') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Razorpay ids are short alphanumeric strings with underscores.
const RAZORPAY_ID = /^\w{1,64}$/;
const isRazorpayId = (value) => typeof value === 'string' && RAZORPAY_ID.test(value);

/** A Payment _id from a request, as a plain string (404 for anything else). */
function toPaymentId(id) {
  const value = String(id);
  if (!/^[a-f0-9]{24}$/i.test(value)) throw new PaymentError('Payment not found.', 404, 'not_found');
  return value;
}

const creditOpId = (payment) => `credit:${payment._id}`;
const refundOpId = (payment, attempt) => `refund:${payment._id}:${attempt}`;
const restoreOpId = (payment, attempt) => `refund-restore:${payment._id}:${attempt}`;

// ---- signatures ---------------------------------------------------------------

function hmacHex(secret, data) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/** Constant-time comparison of two hex signatures. */
function safeEqualHex(expected, received) {
  if (typeof received !== 'string' || received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(received, 'utf8'));
}

/** Checkout signature: HMAC-SHA256 of "order_id|payment_id" with the key secret. */
function verifyCheckoutSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  return safeEqualHex(hmacHex(secret, `${orderId}|${paymentId}`), signature);
}

/** Webhook signature: HMAC-SHA256 of the raw request body with the webhook secret. */
function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !Buffer.isBuffer(rawBody)) return false;
  return safeEqualHex(hmacHex(secret, rawBody), signature);
}

// ---- buying -------------------------------------------------------------------

async function createOrder(userId, packId) {
  if (!paymentsEnabled()) {
    throw new PaymentError('Payments are not available right now.', 503, 'payments_disabled');
  }
  const pack = findPack(String(packId));
  if (!pack) throw new PaymentError('Unknown token pack.', 400, 'unknown_pack');

  const user = toUserId(userId);
  const amount = pricePaise(pack);
  const order = await getRazorpay().orders.create({
    amount,
    currency: CURRENCY,
    receipt: `tok_${Date.now()}`,
    notes: { userId: user, packId: pack.id }
  });

  const payment = await Payment.create({
    user,
    type: 'purchase',
    status: 'created',
    packId: pack.id,
    tokens: pack.tokens,
    bonusTokens: pack.bonus,
    amount,
    currency: CURRENCY,
    orderId: String(order.id)
  });

  return { payment, order: { id: order.id, amount, currency: CURRENCY } };
}

/**
 * The captured Razorpay payment for an order, capturing it first if it is
 * only authorized (when auto-capture is off). Null if nothing was paid yet.
 */
async function findCapturedPayment(payment, paymentId) {
  const razorpay = getRazorpay();
  let attempts;
  if (paymentId) {
    attempts = [await razorpay.payments.fetch(paymentId)];
  } else {
    const list = await razorpay.orders.fetchPayments(payment.orderId);
    attempts = list?.items || [];
  }

  const ours = attempts.filter((p) => p && p.order_id === payment.orderId);
  let captured = ours.find((p) => p.status === 'captured');
  if (!captured) {
    const authorized = ours.find((p) => p.status === 'authorized');
    if (!authorized) return null;
    captured = await razorpay.payments.capture(authorized.id, payment.amount, payment.currency);
  }
  if (captured.amount !== payment.amount || captured.currency !== payment.currency) {
    logger.error(`Payment ${logSafe(captured.id)} amount/currency does not match order ${logSafe(payment.orderId)}`);
    throw new PaymentError('Payment does not match the order. Please contact support.', 409, 'amount_mismatch');
  }
  return captured;
}

/** Give a paid Payment its receipt number (once; numbers have no gaps). */
async function ensureReceiptNumber(payment) {
  if (payment.receiptNumber) return payment.receiptNumber;
  const receiptNumber = await Payment.nextReceiptNumber(payment.paidAt || new Date());
  const updated = await Payment.findOneAndUpdate(
    { _id: payment._id, receiptNumber: { $exists: false } },
    { $set: { receiptNumber } },
    { new: true }
  );
  payment.receiptNumber = updated ? receiptNumber : (await Payment.findById(payment._id).select('receiptNumber').lean())?.receiptNumber;
  return payment.receiptNumber;
}

/** Credit the tokens of a paid Payment (idempotent) and mark it credited. */
async function creditPaidPayment(payment) {
  await ensureReceiptNumber(payment);
  const balance = await creditTokens(
    payment.user,
    { purchased: payment.tokens, bonus: payment.bonusTokens },
    { opId: creditOpId(payment) }
  );
  if (!balance && !(await isOpApplied(payment.user, creditOpId(payment)))) {
    throw new PaymentError('User not found for payment.', 404, 'user_not_found');
  }
  await Payment.updateOne({ _id: payment._id }, { $set: { credited: true } });
  return balance || getTokenBalance(payment.user);
}

async function sendReceipt(payment) {
  try {
    const user = await User.findById(payment.user).select('email firstName').lean();
    if (!user) return;
    const result = await emailService.sendPaymentInvoice({
      email: user.email,
      name: user.firstName || user.email.split('@')[0],
      transactionId: payment.receiptNumber,
      paymentId: payment.paymentId,
      amount: payment.amount / 100,
      tokensAdded: payment.tokens + payment.bonusTokens,
      paymentMethod: payment.method ? `Razorpay (${payment.method})` : 'Razorpay'
    });
    if (!result?.success) logger.warn(`Receipt email failed for ${logSafe(payment.receiptNumber)}`);
  } catch (error) {
    logger.error('Receipt email error', { message: error?.message });
  }
}

/**
 * Make sure a paid order has its tokens. Safe to call any number of times,
 * from any path, concurrently.
 * @param {string} orderId
 * @param {{ paymentId?: string, userId?: string }} [options] userId: only
 *   fulfil if the order belongs to this user (browser callback).
 * @returns {Promise<{ payment, balance, fulfilled: boolean }>} fulfilled is
 *   true only for the call that moved the payment to 'paid'.
 */
async function fulfilOrder(orderId, { paymentId, userId } = {}) {
  if (!isRazorpayId(orderId) || (paymentId !== undefined && !isRazorpayId(paymentId))) {
    throw new PaymentError('Invalid payment details.', 400, 'invalid_ids');
  }
  const filter = { orderId: { $eq: orderId }, type: 'purchase' };
  if (userId) filter.user = toUserId(userId);
  const payment = await Payment.findOne(filter);
  if (!payment) throw new PaymentError('Order not found.', 404, 'order_not_found');

  if (payment.status !== 'created') {
    // Already paid: finish crediting if a previous attempt stopped half way.
    const balance = payment.credited ? await getTokenBalance(payment.user) : await creditPaidPayment(payment);
    return { payment, balance, fulfilled: false };
  }

  const captured = await findCapturedPayment(payment, paymentId);
  if (!captured) throw new PaymentError('Payment has not been completed yet.', 409, 'not_captured');

  const claimed = await Payment.findOneAndUpdate(
    { _id: payment._id, status: 'created' },
    {
      $set: {
        status: 'paid',
        paymentId: String(captured.id),
        method: String(captured.method || ''),
        paidAt: captured.created_at ? new Date(captured.created_at * 1000) : new Date(),
        credited: false
      }
    },
    { new: true }
  );
  if (!claimed) {
    // Another path got there first; make sure its credit went through.
    return fulfilOrder(orderId, { paymentId, userId });
  }

  const balance = await creditPaidPayment(claimed);
  logger.info(`Payment ${logSafe(claimed.paymentId)} credited: ${Number(claimed.tokens)} + ${Number(claimed.bonusTokens)} bonus tokens (${logSafe(claimed.receiptNumber)})`);
  await sendReceipt(claimed);
  return { payment: claimed, balance, fulfilled: true };
}

/** Browser callback: check the checkout signature, then fulfil for this user. */
async function verifyAndFulfil(userId, { orderId, paymentId, signature }) {
  if (!isRazorpayId(orderId) || !isRazorpayId(paymentId) || typeof signature !== 'string') {
    throw new PaymentError('Invalid payment details.', 400, 'invalid_ids');
  }
  if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
    logger.warn(`Checkout signature mismatch for order ${logSafe(orderId)}`);
    throw new PaymentError('Payment could not be verified.', 400, 'bad_signature');
  }
  return fulfilOrder(orderId, { paymentId, userId });
}

// ---- refunds ------------------------------------------------------------------

async function sendRefundEmail(payment, refundAmount) {
  try {
    const user = await User.findById(payment.user).select('email firstName').lean();
    if (!user) return;
    await emailService.sendRefundCompletionEmail({
      email: user.email,
      name: user.firstName || user.email.split('@')[0],
      transactionId: payment.receiptNumber || payment.paymentId,
      orderId: payment.orderId,
      refundAmount: refundAmount / 100,
      refundId: payment.refund?.razorpayRefundId || '',
      processedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  } catch (error) {
    logger.error('Refund email error', { message: error?.message });
  }
}

/** Release a refund claim after a failure so the payment can be refunded again. */
async function releaseRefundClaim(payment, error) {
  await Payment.updateOne(
    { _id: payment._id, 'refund.status': 'pending' },
    { $set: { 'refund.status': 'failed', 'refund.error': String(error).slice(0, 300) } }
  );
}

/**
 * Admin refund after investigating a customer's claim. Tokens are otherwise
 * non-refundable, so there is no customer-facing refund.
 * @param {string} paymentDocId Payment _id
 * @param {{ adminEmail: string, reason: string, amount?: number, removeTokens?: boolean }} options
 *   amount: paise to refund (default: the full payment). removeTokens: take
 *   back whatever is left of the pack's tokens (default true; turn off e.g.
 *   when the customer never received them).
 */
async function refundPayment(paymentDocId, { adminEmail, reason, amount, removeTokens = true }) {
  if (!getRazorpay()) throw new PaymentError('Refunds are not available right now.', 503, 'payments_disabled');
  const note = typeof reason === 'string' ? reason.trim() : '';
  if (note.length < 5) throw new PaymentError('Add a short reason for the refund (what was investigated).', 400, 'reason_required');

  const payment = await Payment.findOne({ _id: toPaymentId(paymentDocId), type: 'purchase' });
  if (!payment) throw new PaymentError('Payment not found.', 404, 'not_found');
  if (payment.status !== 'paid') throw new PaymentError('Only completed payments can be refunded.', 400, 'not_refundable');

  const refundAmount = amount === undefined || amount === null ? payment.amount : Number(amount);
  if (!Number.isInteger(refundAmount) || refundAmount < 100 || refundAmount > payment.amount) {
    throw new PaymentError(`Refund amount must be between ₹1 and ₹${payment.amount / 100}.`, 400, 'invalid_amount');
  }

  // 1. Claim the refund: only one request can get past this point.
  const attempt = (payment.refund?.attempts || 0) + 1;
  const claimed = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: 'paid',
      $or: [{ refund: { $exists: false } }, { refund: null }, { 'refund.status': 'failed' }]
    },
    {
      $set: {
        refund: {
          status: 'pending',
          amount: refundAmount,
          by: 'admin',
          adminEmail: String(adminEmail || ''),
          reason: note.slice(0, 500),
          attempts: attempt,
          requestedAt: new Date()
        }
      }
    },
    { new: true }
  );
  if (!claimed) throw new PaymentError('A refund for this payment is already in progress.', 409, 'refund_in_progress');

  // 2. Take back whatever is left of the pack's tokens.
  let removed = { purchased: 0, bonus: 0 };
  let balance = null;
  if (removeTokens) {
    const result = await deductForRefund(
      claimed.user,
      { purchased: claimed.tokens, bonus: claimed.bonusTokens },
      { opId: refundOpId(claimed, attempt) }
    );
    if (result) ({ removed, balance } = result);
  }

  // 3. Return the money.
  let refund;
  try {
    refund = await getRazorpay().payments.refund(claimed.paymentId, {
      amount: refundAmount,
      speed: 'normal',
      notes: { paymentRecord: String(claimed._id) }
    });
  } catch (error) {
    const description = error?.error?.description || error?.message || 'Razorpay error';
    logger.error(`Razorpay refund failed for ${logSafe(claimed.paymentId)}`, { message: description });
    // Put back exactly what was removed, once.
    if (removed.purchased || removed.bonus) {
      await creditTokens(claimed.user, removed, { opId: restoreOpId(claimed, attempt) });
    }
    await releaseRefundClaim(claimed, description);
    throw new PaymentError(`Razorpay could not process the refund (${description}). If the Razorpay balance is lower than the refund, add funds or retry after new payments.`, 502, 'gateway_error');
  }

  const processed = refund.status === 'processed';
  const done = {
    status: 'refunded',
    'refund.razorpayRefundId': String(refund.id),
    'refund.status': processed ? 'processed' : 'pending',
    'refund.tokensRemoved': removed
  };
  if (processed) done['refund.processedAt'] = new Date();
  const updated = await Payment.findOneAndUpdate({ _id: claimed._id }, { $set: done }, { new: true });
  logger.info(`Refund ${logSafe(refund.id)} of ${Number(refundAmount)} paise issued for ${logSafe(claimed.paymentId)} by ${logSafe(adminEmail)}`);
  await sendRefundEmail(updated, refundAmount);
  return { payment: updated, balance: balance || await getTokenBalance(claimed.user), removed };
}

// ---- webhooks -----------------------------------------------------------------

async function handleRefundEvent(entity, status) {
  if (!isRazorpayId(entity?.id)) return;
  await Payment.updateOne(
    { 'refund.razorpayRefundId': { $eq: entity.id } },
    { $set: { 'refund.status': status, 'refund.processedAt': new Date() } }
  );
  if (status === 'failed') {
    logger.error(`Razorpay reports refund ${logSafe(entity.id)} failed; needs manual follow-up`);
  }
}

/**
 * Handle a verified webhook event. Unknown orders are ignored (not ours).
 * Throws on unexpected errors so Razorpay retries the delivery.
 */
async function handleWebhookEvent(event) {
  const payment = event?.payload?.payment?.entity;
  const refund = event?.payload?.refund?.entity;
  switch (event?.event) {
    case 'payment.captured':
    case 'order.paid':
      if (!payment?.order_id) return;
      try {
        await fulfilOrder(payment.order_id, { paymentId: payment.id });
      } catch (error) {
        if (error instanceof PaymentError && ['order_not_found', 'not_captured'].includes(error.code)) return;
        throw error;
      }
      return;
    case 'refund.processed':
      await handleRefundEvent(refund, 'processed');
      return;
    case 'refund.failed':
      await handleRefundEvent(refund, 'failed');
      return;
    default:
      // payment.failed etc.: the customer can retry in the same checkout.
  }
}

// ---- reconcile job ------------------------------------------------------------

const MINUTE = 60 * 1000;

/**
 * Catch anything the browser and webhooks missed:
 *  - orders paid but never fulfilled (tab closed, webhook not delivered)
 *  - payments marked paid whose credit did not finish
 *  - orders never paid after 3 days -> 'expired'
 */
async function reconcile({ now = new Date() } = {}) {
  if (!getRazorpay()) return { checked: 0, fulfilled: 0, expired: 0 };
  const summary = { checked: 0, fulfilled: 0, expired: 0 };

  const uncredited = await Payment.find({ status: { $in: ['paid', 'refunded'] }, credited: false, type: 'purchase' }).limit(100);
  for (const payment of uncredited) {
    await creditPaidPayment(payment);
  }

  const pending = await Payment.find({
    type: 'purchase',
    status: 'created',
    createdAt: { $lt: new Date(now - 5 * MINUTE) }
  }).limit(100);

  for (const payment of pending) {
    summary.checked += 1;
    try {
      const result = await fulfilOrder(payment.orderId);
      if (result.fulfilled) summary.fulfilled += 1;
    } catch (error) {
      if (error.code !== 'not_captured') {
        logger.error(`Reconcile failed for order ${logSafe(payment.orderId)}`, { message: error.message });
        continue;
      }
      if (payment.createdAt < new Date(now - 3 * 24 * 60 * MINUTE)) {
        await Payment.updateOne({ _id: payment._id, status: 'created' }, { $set: { status: 'expired' } });
        summary.expired += 1;
      }
    }
  }
  if (summary.fulfilled || summary.expired) {
    logger.info(`Payment reconcile: ${summary.fulfilled} fulfilled, ${summary.expired} expired`);
  }
  return summary;
}

let reconcileTimer = null;

/** Run reconcile() every 10 minutes (no-op when Razorpay is not configured). */
function startReconcileJob(intervalMs = 10 * MINUTE) {
  if (reconcileTimer || !getRazorpay()) return;
  reconcileTimer = setInterval(() => {
    reconcile().catch((error) => logger.error('Payment reconcile error', { message: error?.message }));
  }, intervalMs);
  reconcileTimer.unref();
}

// ---- history ------------------------------------------------------------------

/** A Payment as shown to its owner. */
function toClientPayment(payment) {
  const p = typeof payment.toObject === 'function' ? payment.toObject() : payment;
  return {
    id: String(p._id),
    type: p.type,
    status: p.status,
    packId: p.packId || null,
    tokens: p.tokens,
    bonusTokens: p.bonusTokens,
    amount: p.amount,
    currency: p.currency,
    receiptNumber: p.receiptNumber || null,
    paymentId: p.paymentId || null,
    orderId: p.orderId || null,
    method: p.method || null,
    reason: p.type === 'bonus' ? p.reason || null : null,
    createdAt: p.createdAt,
    paidAt: p.paidAt || null,
    refund: p.refund?.status
      ? { status: p.refund.status, amount: p.refund.amount, requestedAt: p.refund.requestedAt, processedAt: p.refund.processedAt || null }
      : null
  };
}

async function listUserPayments(userId, { limit = 50 } = {}) {
  const user = toUserId(userId);
  const payments = await Payment.find({ user, status: { $nin: ['created', 'expired'] } })
    .sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 50, 100)).lean();
  return payments.map((p) => toClientPayment(p));
}

/** Record an admin bonus grant in the payment history. */
async function recordBonusGrant(userId, { tokens, reason, grantedBy }) {
  return Payment.create({
    user: toUserId(userId),
    type: 'bonus',
    status: 'granted',
    bonusTokens: Number(tokens),
    amount: 0,
    reason: String(reason ?? '').slice(0, 200),
    grantedBy: String(grantedBy ?? '').slice(0, 254)
  });
}

module.exports = {
  PaymentError,
  getRazorpay,
  setRazorpayClient,
  paymentsEnabled,
  publicConfig,
  verifyCheckoutSignature,
  verifyWebhookSignature,
  createOrder,
  fulfilOrder,
  verifyAndFulfil,
  refundPayment,
  handleWebhookEvent,
  reconcile,
  startReconcileJob,
  toClientPayment,
  listUserPayments,
  recordBonusGrant
};
