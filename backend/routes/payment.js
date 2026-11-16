/**
 * Token payments (Razorpay). The logic lives in services/paymentService.js;
 * these handlers only validate input and shape responses.
 *
 *   GET  /config                     public: packs, refund window, checkout key, enabled
 *   POST /orders                     { packId } -> Razorpay order
 *   POST /verify                     { orderId, paymentId, signature } -> tokens credited
 *   GET  /history                    the caller's purchases and bonus grants
 *   POST /:id/refund                 self-serve refund of an unused pack
 *   POST /webhook                    Razorpay webhooks (raw body, see server.js)
 *   GET  /admin/payments             admin: list payments
 *   POST /admin/payments/:id/refund  admin: refund (optionally a goodwill refund)
 *   POST /admin/give-bonus-tokens/:userId, /admin/give-bonus-tokens-by-email
 */
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');
const { logSafe } = require('../utils/logSafe');
const { tokenPayload, creditTokens, toUserId } = require('../utils/tokenCalculator');
const payments = require('../services/paymentService');

const router = express.Router();

/** Send a PaymentError as JSON; anything else is a 500. */
function sendError(res, error, fallback) {
  if (error instanceof payments.PaymentError) {
    return res.status(error.statusCode).json({ success: false, code: error.code, message: error.message });
  }
  logger.error(fallback, { message: error?.message });
  return res.status(error?.statusCode || 500).json({ success: false, message: fallback });
}

// ---- customer -----------------------------------------------------------------

router.get('/config', (req, res) => {
  res.json({ success: true, data: payments.publicConfig() });
});

router.post('/orders', protect, async (req, res) => {
  try {
    const { payment, order } = await payments.createOrder(req.user._id, req.body?.packId);
    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        pack: { id: payment.packId, tokens: payment.tokens, bonus: payment.bonusTokens }
      }
    });
  } catch (error) {
    sendError(res, error, 'Could not start the payment. Please try again.');
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body || {};
    const { payment, balance } = await payments.verifyAndFulfil(req.user._id, { orderId, paymentId, signature });
    res.json({
      success: true,
      message: 'Payment successful. Tokens added to your account.',
      data: {
        tokens: tokenPayload(balance),
        payment: payments.toClientPayment(payment, balance)
      }
    });
  } catch (error) {
    sendError(res, error, 'We could not confirm the payment yet. If money was taken, your tokens will be added within a few minutes.');
  }
});

router.get('/history', protect, async (req, res) => {
  try {
    const list = await payments.listUserPayments(req.user._id);
    res.json({ success: true, data: { payments: list } });
  } catch (error) {
    sendError(res, error, 'Failed to load payment history');
  }
});

router.post('/:id/refund', protect, async (req, res) => {
  try {
    const { payment, balance } = await payments.refundPayment(req.params.id, {
      by: 'user',
      userId: req.user._id,
      reason: typeof req.body?.reason === 'string' ? req.body.reason : undefined
    });
    res.json({
      success: true,
      message: 'Refund issued. The money will reach your original payment method in 5-7 business days.',
      data: { tokens: tokenPayload(balance), payment: payments.toClientPayment(payment, balance) }
    });
  } catch (error) {
    sendError(res, error, 'Failed to process the refund');
  }
});

// Raw body (Buffer) is provided by server.js for this path only.
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!payments.verifyWebhookSignature(req.body, signature)) {
    logger.warn('Razorpay webhook rejected: bad or missing signature');
    return res.status(400).json({ success: false });
  }
  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false });
  }
  try {
    await payments.handleWebhookEvent(event);
    res.json({ success: true });
  } catch (error) {
    // Non-2xx makes Razorpay retry the delivery.
    logger.error(`Razorpay webhook ${logSafe(event?.event)} failed`, { message: error?.message });
    res.status(500).json({ success: false });
  }
});

// ---- admin --------------------------------------------------------------------

const STATUSES = ['created', 'paid', 'refunded', 'expired', 'granted'];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/admin/payments', protect, authorize('admin'), async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const filter = {};
    const status = String(req.query.status || '');
    if (STATUSES.includes(status)) filter.status = status;
    if (['purchase', 'bonus'].includes(String(req.query.type))) filter.type = String(req.query.type);

    const search = String(req.query.search || '').trim().slice(0, 100);
    if (search) {
      const users = await User.find({ email: { $regex: escapeRegex(search), $options: 'i' } }).select('_id').limit(200).lean();
      filter.$or = [
        { user: { $in: users.map((u) => u._id) } },
        { receiptNumber: { $eq: search } },
        { paymentId: { $eq: search } },
        { orderId: { $eq: search } }
      ];
    }

    const [items, total, totals] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('user', 'email firstName lastName tokens bonusTokens').lean(),
      Payment.countDocuments(filter),
      Payment.aggregate([
        { $match: { type: 'purchase', status: { $in: ['paid', 'refunded'] } } },
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
      ])
    ]);

    const summary = Object.fromEntries(totals.map((t) => [t._id, { count: t.count, amount: t.amount }]));
    res.json({
      success: true,
      data: {
        payments: items.map((p) => {
          const balance = { purchased: p.user?.tokens || 0, bonus: p.user?.bonusTokens || 0 };
          return {
            ...payments.toClientPayment(p, balance),
            user: p.user ? { id: String(p.user._id), email: p.user.email, name: [p.user.firstName, p.user.lastName].filter(Boolean).join(' ') } : null,
            refundBy: p.refund?.by || null,
            refundReason: p.refund?.reason || null,
            refundError: p.refund?.status === 'failed' ? p.refund?.error || null : null,
            grantedBy: p.grantedBy || null
          };
        }),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        summary: {
          paid: summary.paid || { count: 0, amount: 0 },
          refunded: summary.refunded || { count: 0, amount: 0 }
        }
      }
    });
  } catch (error) {
    sendError(res, error, 'Failed to load payments');
  }
});

router.post('/admin/payments/:id/refund', protect, authorize('admin'), async (req, res) => {
  try {
    const { payment, balance } = await payments.refundPayment(req.params.id, {
      by: 'admin',
      adminEmail: req.user.email,
      reason: typeof req.body?.reason === 'string' ? req.body.reason : undefined,
      force: req.body?.force === true
    });
    res.json({
      success: true,
      message: 'Refund issued.',
      data: { payment: payments.toClientPayment(payment, balance), userBalance: balance }
    });
  } catch (error) {
    sendError(res, error, 'Failed to process the refund');
  }
});

// ---- admin bonus grants ---------------------------------------------------------

const MAX_BONUS_GRANT = 10000;
// Shown to users in the bonus email; never an individual admin's name.
const BONUS_GIVEN_BY = 'The Presmistique Team';

function validateBonusAmount(tokens) {
  if (!Number.isInteger(tokens) || tokens <= 0) return 'Valid token amount is required';
  if (tokens > MAX_BONUS_GRANT) return 'Bonus tokens cannot exceed 10,000 per transaction';
  return null;
}

/** Grant bonus (non-refundable) tokens, record the grant and email the user. */
async function grantBonusTokens(user, tokens, rawReason, admin) {
  const reason = String(rawReason ?? '').slice(0, 200) || 'Admin bonus';
  const grant = await payments.recordBonusGrant(user._id, { tokens, reason, grantedBy: admin.email });
  const balance = await creditTokens(user._id, { bonus: tokens }, { opId: `bonus:${grant._id}` });
  if (!balance) {
    await Payment.deleteOne({ _id: grant._id });
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  logger.info(`Admin ${logSafe(admin.email)} gave ${Number(tokens)} bonus tokens to user ${logSafe(user.email)}. Reason: ${logSafe(reason)}`);

  try {
    await emailService.sendBonusTokensEmail({
      email: user.email,
      name: user.firstName || user.email.split('@')[0],
      tokensAdded: tokens,
      newTokenBalance: balance.total,
      givenBy: BONUS_GIVEN_BY,
      reason,
      dateAdded: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    });
  } catch (emailError) {
    logger.error(`Bonus email to ${logSafe(user.email)} failed`, { message: emailError?.message });
  }
  return balance;
}

async function sendBonusGrant(req, res, findUser) {
  try {
    const tokens = Number(req.body?.tokens);
    const amountError = validateBonusAmount(tokens);
    if (amountError) return res.status(400).json({ success: false, message: amountError });

    const user = await findUser();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const balance = await grantBonusTokens(user, tokens, req.body?.reason, req.user);
    // The balance belongs to another user, so it is not sent as `tokens`
    // (clients treat `tokens` as the caller's own balance).
    res.json({
      success: true,
      message: 'Bonus tokens added successfully',
      data: {
        userId: user._id,
        userEmail: user.email,
        tokensAdded: tokens,
        newTokenBalance: balance.total,
        userTokenBalance: balance
      }
    });
  } catch (error) {
    sendError(res, error, 'Failed to add bonus tokens');
  }
}

router.post('/admin/give-bonus-tokens/:userId', protect, authorize('admin'), (req, res) =>
  sendBonusGrant(req, res, () => User.findById(toUserId(req.params.userId)).select('email firstName tokens bonusTokens')));

router.post('/admin/give-bonus-tokens-by-email', protect, authorize('admin'), (req, res) => {
  if (typeof req.body?.email !== 'string' || !req.body.email.trim()) {
    return res.status(400).json({ success: false, message: 'Valid email and token amount are required' });
  }
  const email = req.body.email.trim().toLowerCase();
  return sendBonusGrant(req, res, () => User.findOne({ email: { $eq: email } }).select('email firstName tokens bonusTokens'));
});

module.exports = router;
