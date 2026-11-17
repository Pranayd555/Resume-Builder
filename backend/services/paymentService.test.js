/**
 * Payments and refunds against a real MongoDB with a fake Razorpay client.
 * Covers: server-priced orders, exactly-once crediting from the browser,
 * webhooks and the reconcile job (also concurrently), ownership checks,
 * admin-only refunds (reason, partial amount, double-click, Razorpay failure),
 * and the webhook through the real body parsers.
 *
 * Needs TOKEN_TEST_MONGODB_URI (uses a separate "payment-test" database):
 *   TOKEN_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/token-test node --test services/paymentService.test.js
 */
const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.RAZORPAY_KEY_ID = 'rzp_test_fake';
process.env.RAZORPAY_KEY_SECRET = 'key-secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'webhook-secret';

const BASE_URI = process.env.TOKEN_TEST_MONGODB_URI;
const MONGO_URI = BASE_URI && (() => {
  const url = new URL(BASE_URI);
  url.pathname = '/payment-test';
  return url.toString();
})();

const sign = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex');
const DAY = 24 * 60 * 60 * 1000;

/** In-memory stand-in for the Razorpay SDK (only the calls we use). */
function fakeRazorpay() {
  const fake = {
    orders: [],
    payments: new Map(),
    refundCalls: [],
    refundError: null,
    refundStatus: 'processed',
    seq: 0
  };
  fake.client = {
    orders: {
      create: async ({ amount, currency, notes }) => {
        const order = { id: `order_${++fake.seq}`, amount, currency, notes, status: 'created' };
        fake.orders.push(order);
        return order;
      },
      fetchPayments: async (orderId) => ({ items: [...fake.payments.values()].filter((p) => p.order_id === orderId) })
    },
    payments: {
      fetch: async (id) => {
        const p = fake.payments.get(id);
        if (!p) throw Object.assign(new Error('not found'), { statusCode: 404 });
        return { ...p };
      },
      capture: async (id, amount) => {
        const p = fake.payments.get(id);
        assert.equal(amount, p.amount);
        p.status = 'captured';
        return { ...p };
      },
      refund: async (id, options) => {
        fake.refundCalls.push({ id, ...options });
        await new Promise((r) => setTimeout(r, 5));
        if (fake.refundError) throw fake.refundError;
        return { id: `rfnd_${fake.refundCalls.length}`, amount: options.amount, status: fake.refundStatus };
      }
    }
  };
  /** Simulate the customer paying an order. */
  fake.pay = (order, { status = 'captured', amount = order.amount, currency = 'INR' } = {}) => {
    const p = { id: `pay_${++fake.seq}`, order_id: order.id, amount, currency, status, method: 'upi', fee: Math.round(amount * 0.0236), created_at: Math.floor(Date.now() / 1000) };
    fake.payments.set(p.id, p);
    return p;
  };
  return fake;
}

describe('payments (database)', { skip: !MONGO_URI && 'TOKEN_TEST_MONGODB_URI not set' }, () => {
  let mongoose;
  let User;
  let Payment;
  let payments;
  let emailService;
  let fake;
  const emails = [];

  before(async () => {
    mongoose = require('mongoose');
    await mongoose.connect(MONGO_URI);
    User = require('../models/User');
    Payment = require('../models/Payment');
    await Payment.syncIndexes();
    payments = require('./paymentService');
    emailService = require('../utils/emailService');
    emailService.sendPaymentInvoice = async (args) => { emails.push({ type: 'receipt', ...args }); return { success: true }; };
    emailService.sendRefundCompletionEmail = async (args) => { emails.push({ type: 'refund', ...args }); return { success: true }; };
  });

  after(async () => {
    if (!mongoose) return;
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Payment.deleteMany({}), mongoose.connection.collection('counters').deleteMany({})]);
    fake = fakeRazorpay();
    payments.setRazorpayClient(fake.client);
    process.env.PAYMENTS_ENABLED = 'true';
    emails.length = 0;
  });

  let seq = 0;
  const makeUser = (tokens = 0, bonusTokens = 0) => User.create({
    firstName: 'Pay',
    lastName: 'Tester',
    email: `pay-test-${Date.now()}-${seq++}@example.com`,
    password: 'Password123!',
    tokens,
    bonusTokens
  });
  const balanceOf = async (user) => (await User.findById(user._id)).tokenBalance;

  /** Create an order for pack_60 (60 tokens, ₹199) and pay it. */
  async function buyPack60(user, payOptions) {
    const { order } = await payments.createOrder(user._id, 'pack_60');
    const paid = fake.pay(fake.orders.find((o) => o.id === order.id), payOptions);
    return { order, paid, signature: sign('key-secret', `${order.id}|${paid.id}`) };
  }
  const PACK = { purchased: 60, bonus: 0, total: 60 };

  // ---- orders ----

  test('orders are priced by the server from the pack id', async () => {
    const user = await makeUser();
    const { order, payment } = await payments.createOrder(user._id, 'pack_60');
    assert.equal(order.amount, 19900);
    assert.deepEqual(fake.orders[0].notes, { userId: String(user._id), packId: 'pack_60' });
    assert.equal(payment.status, 'created');
    assert.deepEqual([payment.tokens, payment.bonusTokens, payment.amount], [60, 0, 19900]);
    await assert.rejects(payments.createOrder(user._id, 'pack_7'), (e) => e.code === 'unknown_pack');
  });

  test('no new orders while payments are disabled; config never offers refunds', async () => {
    const user = await makeUser();
    assert.equal(payments.publicConfig().refundable, false);
    process.env.PAYMENTS_ENABLED = 'false';
    await assert.rejects(payments.createOrder(user._id, 'pack_10'), (e) => e.statusCode === 503);
    assert.equal(payments.publicConfig().enabled, false);
    assert.equal(payments.publicConfig().keyId, null);
  });

  // ---- fulfilment ----

  test('verified checkout credits the pack once and issues a receipt', async () => {
    const user = await makeUser(0, 2);
    const { order, paid, signature } = await buyPack60(user);
    const first = await payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature });
    assert.equal(first.fulfilled, true);
    assert.deepEqual(first.balance, { purchased: 60, bonus: 2, total: 62 });
    assert.match(first.payment.receiptNumber, /^PRS-\d{4}-000001$/);
    assert.equal(emails.filter((e) => e.type === 'receipt').length, 1);

    const again = await payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature });
    assert.equal(again.fulfilled, false);
    assert.deepEqual(await balanceOf(user), { purchased: 60, bonus: 2, total: 62 });
    assert.equal(emails.length, 1);
  });

  test('browser callback, webhooks and reconcile racing credit exactly once', async () => {
    const user = await makeUser();
    const { order, paid, signature } = await buyPack60(user);
    const event = (name) => ({ event: name, payload: { payment: { entity: { ...fake.payments.get(paid.id) } } } });
    await Promise.all([
      payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature }),
      payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature }),
      payments.handleWebhookEvent(event('payment.captured')),
      payments.handleWebhookEvent(event('order.paid')),
      payments.reconcile({ now: new Date(Date.now() + 10 * 60 * 1000) })
    ]);
    assert.deepEqual(await balanceOf(user), PACK);
    assert.equal(await Payment.countDocuments({ status: 'paid' }), 1);
    assert.equal(emails.length, 1);
  });

  test('a payment cannot be claimed by another account', async () => {
    const owner = await makeUser();
    const other = await makeUser();
    const { order, paid, signature } = await buyPack60(owner);
    await assert.rejects(
      payments.verifyAndFulfil(other._id, { orderId: order.id, paymentId: paid.id, signature }),
      (e) => e.code === 'order_not_found'
    );
    assert.deepEqual(await balanceOf(other), { purchased: 0, bonus: 0, total: 0 });
  });

  test('bad signature, mismatched payment and malformed ids are rejected', async () => {
    const user = await makeUser();
    const { order, paid } = await buyPack60(user);
    await assert.rejects(payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature: 'x'.repeat(64) }), (e) => e.code === 'bad_signature');
    await assert.rejects(payments.verifyAndFulfil(user._id, { orderId: { $ne: null }, paymentId: paid.id, signature: 'a' }), (e) => e.code === 'invalid_ids');

    // A payment that belongs to a different order is not accepted for this one.
    const { order: order2 } = await payments.createOrder(user._id, 'pack_10');
    const sig = sign('key-secret', `${order2.id}|${paid.id}`);
    await assert.rejects(payments.verifyAndFulfil(user._id, { orderId: order2.id, paymentId: paid.id, signature: sig }), (e) => e.code === 'not_captured');
    assert.deepEqual(await balanceOf(user), { purchased: 0, bonus: 0, total: 0 });
  });

  test('an authorized-only payment is captured, then credited', async () => {
    const user = await makeUser();
    const { order, paid, signature } = await buyPack60(user, { status: 'authorized' });
    const result = await payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature });
    assert.equal(fake.payments.get(paid.id).status, 'captured');
    assert.deepEqual(result.balance, PACK);
  });

  test('wrong amount is never credited', async () => {
    const user = await makeUser();
    const { order, paid, signature } = await buyPack60(user, { amount: 100 });
    await assert.rejects(payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature }), (e) => e.code === 'amount_mismatch');
    assert.deepEqual(await balanceOf(user), { purchased: 0, bonus: 0, total: 0 });
  });

  test('reconcile credits paid orders nobody reported and expires abandoned ones', async () => {
    const user = await makeUser();
    const { order } = await buyPack60(user); // paid, but the tab was closed and no webhook came
    await payments.createOrder(user._id, 'pack_10'); // never paid
    // createdAt is immutable through Mongoose, so age the orders directly.
    await Payment.collection.updateMany({}, { $set: { createdAt: new Date(Date.now() - 4 * DAY) } });

    const summary = await payments.reconcile();
    assert.deepEqual(summary, { checked: 2, fulfilled: 1, expired: 1 });
    assert.deepEqual(await balanceOf(user), PACK);
    assert.equal((await Payment.findOne({ orderId: order.id })).status, 'paid');
    assert.equal(await Payment.countDocuments({ status: 'expired' }), 1);
  });

  test('a crash between "paid" and crediting is repaired without double credit', async () => {
    const user = await makeUser();
    const { order, paid, signature } = await buyPack60(user);
    await payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature });
    // Pretend the process died after crediting but before marking it.
    await Payment.updateOne({ orderId: order.id }, { $set: { credited: false } });
    await payments.reconcile();
    assert.deepEqual(await balanceOf(user), PACK);
    assert.equal((await Payment.findOne({ orderId: order.id })).credited, true);
  });

  // ---- admin refunds (tokens are otherwise non-refundable) ----

  async function paidPack60(user) {
    const { order, paid, signature } = await buyPack60(user);
    const { payment } = await payments.verifyAndFulfil(user._id, { orderId: order.id, paymentId: paid.id, signature });
    return payment;
  }
  const admin = (extra = {}) => ({ adminEmail: 'admin@example.com', reason: 'Duplicate charge confirmed', ...extra });

  test('admin refund returns the money and takes back what is left of the pack', async () => {
    const user = await makeUser(0, 3); // 3 signup bonus tokens stay
    const payment = await paidPack60(user);
    await require('../utils/tokenCalculator').spendTokens(user._id, 5); // 3 bonus + 2 purchased used
    const { payment: refunded, balance, removed } = await payments.refundPayment(payment._id, admin());
    assert.equal(refunded.status, 'refunded');
    assert.equal(refunded.refund.status, 'processed');
    assert.equal(refunded.refund.by, 'admin');
    assert.deepEqual(removed, { purchased: 58, bonus: 0 });
    assert.deepEqual(balance, { purchased: 0, bonus: 0, total: 0 });
    assert.deepEqual(fake.refundCalls.map((c) => [c.id, c.amount, c.speed]), [[payment.paymentId, 19900, 'normal']]);
    assert.equal(emails.filter((e) => e.type === 'refund').length, 1);
    await assert.rejects(payments.refundPayment(payment._id, admin()), (e) => e.code === 'not_refundable');
  });

  test('admin refund needs a reason; partial amount and keeping tokens are supported', async () => {
    const user = await makeUser();
    const payment = await paidPack60(user);
    await assert.rejects(payments.refundPayment(payment._id, admin({ reason: ' ' })), (e) => e.code === 'reason_required');
    await assert.rejects(payments.refundPayment(payment._id, admin({ amount: 50000 })), (e) => e.code === 'invalid_amount');
    const { payment: refunded, removed } = await payments.refundPayment(payment._id, admin({ amount: 10000, removeTokens: false }));
    assert.equal(refunded.refund.amount, 10000);
    assert.deepEqual(removed, { purchased: 0, bonus: 0 });
    assert.deepEqual(await balanceOf(user), PACK);
    assert.equal(fake.refundCalls[0].amount, 10000);
  });

  test('keepFee refunds the payment minus the Razorpay fee (goodwill refunds)', async () => {
    const user = await makeUser();
    const payment = await paidPack60(user);
    assert.equal(payment.fee, 470); // stored at capture
    const { payment: refunded } = await payments.refundPayment(payment._id, admin({ keepFee: true }));
    assert.equal(fake.refundCalls[0].amount, 19900 - 470);
    assert.equal(refunded.refund.amount, 19430);
    assert.equal(refunded.refund.feeKept, 470);
    assert.equal(emails.find((e) => e.type === 'refund').feeKept, 4.7);
  });

  test('keepFee reads the fee from Razorpay for older payments, and an explicit amount wins', async () => {
    const user = await makeUser();
    const older = await paidPack60(user);
    await Payment.updateOne({ _id: older._id }, { $unset: { fee: 1 } });
    const { payment: refunded } = await payments.refundPayment(older._id, admin({ keepFee: true }));
    assert.equal(refunded.refund.amount, 19430);
    assert.equal((await Payment.findById(older._id)).fee, 470);

    const other = await paidPack60(await makeUser());
    const { payment: partial } = await payments.refundPayment(other._id, admin({ keepFee: true, amount: 10000 }));
    assert.equal(partial.refund.amount, 10000);
    assert.equal(partial.refund.feeKept, undefined);
  });

  test('keepFee without a known fee refuses before anything happens', async () => {
    const user = await makeUser();
    const payment = await paidPack60(user);
    await Payment.updateOne({ _id: payment._id }, { $unset: { fee: 1 } });
    delete fake.payments.get(payment.paymentId).fee;
    await assert.rejects(payments.refundPayment(payment._id, admin({ keepFee: true })), (e) => e.code === 'fee_unknown' && e.statusCode === 422);
    assert.equal(fake.refundCalls.length, 0);
    assert.equal((await Payment.findById(payment._id)).refund, undefined);
    assert.deepEqual(await balanceOf(user), PACK);
  });

  test('double-clicking refund pays out once', async () => {
    const user = await makeUser();
    const payment = await paidPack60(user);
    const results = await Promise.allSettled(Array.from({ length: 4 }, () => payments.refundPayment(payment._id, admin())));
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(fake.refundCalls.length, 1);
    assert.deepEqual(await balanceOf(user), { purchased: 0, bonus: 0, total: 0 });
  });

  test('a Razorpay failure puts back exactly the removed tokens and the refund can be retried', async () => {
    const user = await makeUser();
    const payment = await paidPack60(user);
    await require('../utils/tokenCalculator').spendTokens(user._id, 10);
    fake.refundError = { error: { description: 'insufficient balance' } };
    await assert.rejects(payments.refundPayment(payment._id, admin()), (e) => e.code === 'gateway_error' && e.statusCode === 422 && /insufficient balance/.test(e.message));
    assert.deepEqual(await balanceOf(user), { purchased: 50, bonus: 0, total: 50 });
    const failed = await Payment.findById(payment._id);
    assert.equal(failed.status, 'paid');
    assert.equal(failed.refund.status, 'failed');

    fake.refundError = null;
    fake.refundStatus = 'pending';
    const { payment: refunded } = await payments.refundPayment(payment._id, admin());
    assert.equal(refunded.status, 'refunded');
    assert.equal(refunded.refund.status, 'pending');
    assert.deepEqual(await balanceOf(user), { purchased: 0, bonus: 0, total: 0 });

    await payments.handleWebhookEvent({ event: 'refund.processed', payload: { refund: { entity: { id: refunded.refund.razorpayRefundId } } } });
    assert.equal((await Payment.findById(payment._id)).refund.status, 'processed');
  });

  test('history lists purchases and bonus grants without refund options', async () => {
    const user = await makeUser();
    await paidPack60(user);
    await payments.recordBonusGrant(user._id, { tokens: 10, reason: 'Bug report', grantedBy: 'admin@example.com' });
    await payments.createOrder(user._id, 'pack_10'); // unpaid orders are not listed
    const list = await payments.listUserPayments(user._id);
    assert.deepEqual(list.map((p) => [p.type, p.status]), [['bonus', 'granted'], ['purchase', 'paid']]);
    assert.equal(list[0].reason, 'Bug report');
    assert.equal('refundable' in list[1], false);
  });

  // ---- webhook over HTTP, through the real body parsers ----

  test('webhook: signed raw body is accepted, anything else rejected', async () => {
    const express = require('express');
    const mongoSanitize = require('express-mongo-sanitize');
    const { applyBodyParsers } = require('../middleware/bodyParsers');
    const app = express();
    applyBodyParsers(app);
    app.use(mongoSanitize());
    app.use('/api/payment', require('../routes/payment'));
    const server = http.createServer(app).listen(0);
    const port = server.address().port;
    const post = (body, signature) => new Promise((resolve, reject) => {
      const req = http.request({ port, method: 'POST', path: '/api/payment/webhook', headers: { 'content-type': 'application/json', 'x-razorpay-signature': signature } }, (res) => {
        res.resume();
        res.on('end', () => resolve(res.statusCode));
      });
      req.on('error', reject);
      req.end(body);
    });

    try {
      const user = await makeUser();
      const { paid } = await buyPack60(user);
      // Spacing that JSON re-serialisation would change: the signature must
      // be checked over the exact bytes Razorpay sent.
      const body = `{ "event": "payment.captured",  "payload": { "payment": { "entity": ${JSON.stringify(fake.payments.get(paid.id))} } } }`;
      assert.equal(await post(body, 'bad'), 400);
      assert.deepEqual(await balanceOf(user), { purchased: 0, bonus: 0, total: 0 });
      assert.equal(await post(body, sign('webhook-secret', body)), 200);
      assert.deepEqual(await balanceOf(user), PACK);
      // Unknown orders are acknowledged (not ours) so Razorpay stops retrying.
      const foreign = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_x', order_id: 'order_unknown' } } } });
      assert.equal(await post(foreign, sign('webhook-secret', foreign)), 200);
      // There is no customer refund route.
      const status = await new Promise((resolve, reject) => {
        const req = http.request({ port, method: 'POST', path: '/api/payment/0123456789abcdef01234567/refund', headers: { 'content-type': 'application/json' } }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
        req.on('error', reject);
        req.end('{}');
      });
      assert.equal(status, 404);
    } finally {
      server.close();
    }
  });
});
