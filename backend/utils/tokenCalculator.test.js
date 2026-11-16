/**
 * Token balance tests.
 *
 *   node --test utils/tokenCalculator.test.js
 *
 * The pure-logic tests always run. The database tests (atomic spending,
 * concurrency, refunds to the right pool, the AI charge middleware, the
 * migration script) run when TOKEN_TEST_MONGODB_URI points at a throwaway
 * MongoDB, e.g. the root docker-compose one:
 *
 *   TOKEN_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/token-test node --test utils/tokenCalculator.test.js
 *
 * The database named in the URI is dropped at the end. CI runs both.
 */
const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');

const {
  toTokenBalance,
  tokenPayload,
  splitSpend
} = require('./tokenCalculator');

describe('toTokenBalance', () => {
  test('bonus only: total counts the bonus pool', () => {
    assert.deepEqual(toTokenBalance({ tokens: 0, bonusTokens: 5 }), { purchased: 0, bonus: 5, total: 5 });
  });
  test('purchased only', () => {
    assert.deepEqual(toTokenBalance({ tokens: 7, bonusTokens: 0 }), { purchased: 7, bonus: 0, total: 7 });
  });
  test('both pools', () => {
    assert.deepEqual(toTokenBalance({ tokens: 3, bonusTokens: 4 }), { purchased: 3, bonus: 4, total: 7 });
  });
  test('missing, null, negative, fractional and string values', () => {
    assert.deepEqual(toTokenBalance({}), { purchased: 0, bonus: 0, total: 0 });
    assert.deepEqual(toTokenBalance(null), { purchased: 0, bonus: 0, total: 0 });
    assert.deepEqual(toTokenBalance({ tokens: null, bonusTokens: undefined }), { purchased: 0, bonus: 0, total: 0 });
    assert.deepEqual(toTokenBalance({ tokens: -3, bonusTokens: 2 }), { purchased: 0, bonus: 2, total: 2 });
    assert.deepEqual(toTokenBalance({ tokens: 2.9, bonusTokens: '4' }), { purchased: 2, bonus: 4, total: 6 });
    assert.deepEqual(toTokenBalance({ tokens: 'abc', bonusTokens: NaN }), { purchased: 0, bonus: 0, total: 0 });
  });
});

describe('tokenPayload', () => {
  test('canonical fields plus legacy aliases', () => {
    assert.deepEqual(tokenPayload({ purchased: 0, bonus: 5, total: 5 }), {
      purchased: 0, bonus: 5, total: 5, balance: 5, purchasedTokens: 0, bonusTokens: 5
    });
  });
  test('accepts a raw user document', () => {
    const p = tokenPayload({ tokens: 2, bonusTokens: 3 });
    assert.equal(p.total, 5);
    assert.equal(p.balance, 5);
  });
});

describe('splitSpend (bonus first, then purchased)', () => {
  test('uses bonus first', () => {
    assert.deepEqual(splitSpend({ purchased: 10, bonus: 3 }, 2), { fromBonus: 2, fromPurchased: 0 });
  });
  test('spills into purchased when bonus runs out', () => {
    assert.deepEqual(splitSpend({ purchased: 10, bonus: 3 }, 5), { fromBonus: 3, fromPurchased: 2 });
  });
  test('bonus-only user can spend', () => {
    assert.deepEqual(splitSpend({ purchased: 0, bonus: 5 }, 1), { fromBonus: 1, fromPurchased: 0 });
  });
  test('purchased-only user can spend', () => {
    assert.deepEqual(splitSpend({ purchased: 5, bonus: 0 }, 1), { fromBonus: 0, fromPurchased: 1 });
  });
  test('insufficient returns null (zero balance blocked)', () => {
    assert.equal(splitSpend({ purchased: 0, bonus: 0 }, 1), null);
    assert.equal(splitSpend({ purchased: 1, bonus: 1 }, 3), null);
  });
  test('rejects a non-positive amount', () => {
    assert.throws(() => splitSpend({ purchased: 1, bonus: 1 }, 0));
  });
});

// ---------------------------------------------------------------------------
// Database tests
// ---------------------------------------------------------------------------
const MONGO_URI = process.env.TOKEN_TEST_MONGODB_URI;

describe('database token operations', { skip: !MONGO_URI && 'TOKEN_TEST_MONGODB_URI not set' }, () => {
  let mongoose;
  let User;
  let ledger;

  before(async () => {
    mongoose = require('mongoose');
    await mongoose.connect(MONGO_URI);
    User = require('../models/User');
    ledger = require('./tokenCalculator');
  });

  after(async () => {
    if (!mongoose) return;
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  let seq = 0;
  const makeUser = (tokens, bonusTokens) =>
    User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `token-test-${Date.now()}-${seq++}@example.com`,
      password: 'Password123!',
      tokens,
      bonusTokens
    });
  const raw = async (id) => User.collection.findOne({ _id: id }, { projection: { tokens: 1, bonusTokens: 1 } });

  test('spend: bonus first, then purchased', async () => {
    const user = await makeUser(2, 1);
    const first = await ledger.spendTokens(user._id, 1);
    assert.equal(first.ok, true);
    assert.deepEqual(first.spent, { fromBonus: 1, fromPurchased: 0 });
    assert.deepEqual(first.balance, { purchased: 2, bonus: 0, total: 2 });

    const second = await ledger.spendTokens(user._id, 1);
    assert.deepEqual(second.spent, { fromBonus: 0, fromPurchased: 1 });
    assert.deepEqual(await ledger.getTokenBalance(user._id), { purchased: 1, bonus: 0, total: 1 });
  });

  test('spend: a multi-token spend splits across pools', async () => {
    const user = await makeUser(5, 2);
    const r = await ledger.spendTokens(user._id, 4);
    assert.deepEqual(r.spent, { fromBonus: 2, fromPurchased: 2 });
    assert.deepEqual(await raw(user._id), { _id: user._id, tokens: 3, bonusTokens: 0 });
  });

  test('spend: bonus-only user is allowed (the reported bug)', async () => {
    const user = await makeUser(0, 5);
    const r = await ledger.spendTokens(user._id, 1);
    assert.equal(r.ok, true);
    assert.deepEqual(r.balance, { purchased: 0, bonus: 4, total: 4 });
  });

  test('spend: zero balance is refused and nothing changes', async () => {
    const user = await makeUser(0, 0);
    const r = await ledger.spendTokens(user._id, 1);
    assert.equal(r.ok, false);
    assert.deepEqual(r.balance, { purchased: 0, bonus: 0, total: 0 });
    assert.deepEqual(await raw(user._id), { _id: user._id, tokens: 0, bonusTokens: 0 });
  });

  test('spend: legacy document without bonusTokens / with negative tokens', async () => {
    const user = await makeUser(0, 0);
    await User.collection.updateOne({ _id: user._id }, { $unset: { bonusTokens: '' }, $set: { tokens: 2 } });
    const r = await ledger.spendTokens(user._id, 1);
    assert.equal(r.ok, true);
    assert.deepEqual(await raw(user._id), { _id: user._id, tokens: 1, bonusTokens: 0 });

    await User.collection.updateOne({ _id: user._id }, { $set: { tokens: -4, bonusTokens: 1 } });
    const r2 = await ledger.spendTokens(user._id, 1);
    assert.equal(r2.ok, true, 'negative purchased reads as 0, bonus 1 is spendable');
    assert.deepEqual(await raw(user._id), { _id: user._id, tokens: 0, bonusTokens: 0 });
  });

  test('concurrency: 25 parallel spends on a balance of 5 never overspend', async () => {
    const user = await makeUser(2, 3);
    const results = await Promise.all(Array.from({ length: 25 }, () => ledger.spendTokens(user._id, 1)));
    const ok = results.filter(r => r.ok);
    assert.equal(ok.length, 5);
    assert.equal(ok.reduce((n, r) => n + r.spent.fromBonus, 0), 3);
    assert.equal(ok.reduce((n, r) => n + r.spent.fromPurchased, 0), 2);
    assert.deepEqual(await raw(user._id), { _id: user._id, tokens: 0, bonusTokens: 0 });
  });

  test('refundSpend puts tokens back into the pool they came from', async () => {
    const user = await makeUser(3, 1);
    const r = await ledger.spendTokens(user._id, 2); // 1 bonus + 1 purchased
    const balance = await ledger.refundSpend(user._id, r.spent);
    assert.deepEqual(balance, { purchased: 3, bonus: 1, total: 4 });
  });

  test('creditTokens with an opId is applied once under concurrency', async () => {
    const user = await makeUser(0, 0);
    const attempts = await Promise.all(Array.from({ length: 5 }, () =>
      ledger.creditTokens(user._id, { purchased: 25, bonus: 5 }, { opId: 'credit:abc' })
    ));
    assert.equal(attempts.filter(Boolean).length, 1);
    const fresh = await User.findById(user._id);
    assert.deepEqual(fresh.tokenBalance, { purchased: 25, bonus: 5, total: 30 });
    assert.equal(await ledger.isOpApplied(user._id, 'credit:abc'), true);
    assert.equal(await ledger.isOpApplied(user._id, 'credit:other'), false);
  });

  test('deductForRefund removes a pack only while all of it is unused', async () => {
    const user = await makeUser(25, 6);
    assert.equal(await ledger.deductForRefund(user._id, { purchased: 25, bonus: 7 }, { opId: 'refund:a:1' }), null, 'bonus short by one');
    assert.deepEqual(await raw(user._id), { _id: user._id, tokens: 25, bonusTokens: 6 });
    assert.deepEqual(await ledger.deductForRefund(user._id, { purchased: 25, bonus: 5 }, { opId: 'refund:a:2' }), { purchased: 0, bonus: 1, total: 1 });
    assert.equal(await ledger.deductForRefund(user._id, { purchased: 0, bonus: 0 }, { opId: 'refund:a:2' }), null, 'same op twice');
  });

  test('deductForRefund with clamp never goes below zero and is applied once', async () => {
    const user = await makeUser(10, 2);
    const results = await Promise.all([1, 2, 3].map(() =>
      ledger.deductForRefund(user._id, { purchased: 25, bonus: 5 }, { opId: 'refund:b:1', clamp: true })
    ));
    assert.equal(results.filter(Boolean).length, 1);
    assert.deepEqual(results.find(Boolean), { purchased: 0, bonus: 0, total: 0 });
  });

  test('getTokenBalance throws 404 for a missing user', async () => {
    await assert.rejects(ledger.getTokenBalance(new mongoose.Types.ObjectId()), (e) => e.statusCode === 404);
  });

  test('User virtual tokenBalance is serialized for clients', async () => {
    const user = await makeUser(0, 5);
    const json = JSON.parse(JSON.stringify(user));
    assert.deepEqual(json.tokenBalance, { purchased: 0, bonus: 5, total: 5 });
    assert.deepEqual(user.toObject().tokenBalance, { purchased: 0, bonus: 5, total: 5 });
  });

  test('appliedTokenOps is not returned with the user by default', async () => {
    const user = await makeUser(0, 0);
    await ledger.creditTokens(user._id, { bonus: 1 }, { opId: 'bonus:x' });
    const fresh = await User.findById(user._id);
    assert.equal(fresh.appliedTokenOps, undefined);
  });

  test('User model keeps its auth behaviour (password hashing, OTP, JWT)', async () => {
    const user = await makeUser(0, 0);
    const withPassword = await User.findById(user._id).select('+password');
    assert.notEqual(withPassword.password, 'Password123!');
    assert.equal(await withPassword.matchPassword('Password123!'), true);
    for (const method of ['getSignedJwtToken', 'generateEmailOtp', 'verifyEmailOtp', 'incLoginAttempts', 'resetLoginAttempts', 'clearEmailOtp']) {
      assert.equal(typeof withPassword[method], 'function', method);
    }
  });

  // ---- chargeAIToken middleware ----
  const fakeRes = () => {
    const res = new EventEmitter();
    res.statusCode = 200;
    res.done = new Promise((resolve) => { res._resolve = resolve; });
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (body) => { res.body = body; res.emit('finish'); res._resolve(); return res; };
    return res;
  };
  const runCharge = async (user) => {
    const { chargeAIToken } = require('../middleware/auth');
    const req = { user };
    const res = fakeRes();
    let nextCalled = false;
    await chargeAIToken(req, res, () => { nextCalled = true; });
    return { req, res, nextCalled };
  };

  test('chargeAIToken: success keeps the charge and reports the new balance', async () => {
    const user = await makeUser(1, 1);
    const { req, res, nextCalled } = await runCharge(user);
    assert.equal(nextCalled, true);
    assert.equal(req.tokens.total, 1);
    assert.equal(req.tokens.bonus, 0, 'bonus spent first');
    res.json({ success: true, data: { tokens: req.tokens } });
    await res.done;
    await new Promise((r) => setImmediate(r));
    assert.deepEqual(await ledger.getTokenBalance(user._id), { purchased: 1, bonus: 0, total: 1 });
  });

  test('chargeAIToken: a failed action refunds to the same pool and attaches the balance', async () => {
    const user = await makeUser(0, 2);
    const { req, res } = await runCharge(user);
    assert.equal(req.tokens.total, 1);
    res.status(500).json({ success: false, error: 'AI failed', data: { tokens: req.tokens } });
    await res.done;
    assert.deepEqual(res.body.tokens.total, 2);
    assert.equal(res.body.data.tokens, undefined, 'stale pre-refund balance removed');
    assert.deepEqual(await ledger.getTokenBalance(user._id), { purchased: 0, bonus: 2, total: 2 }, 'refunded to bonus, not purchased');
  });

  test('chargeAIToken: zero balance gets 403 with the balance and next() is not called', async () => {
    const user = await makeUser(0, 0);
    const { res, nextCalled } = await runCharge(user);
    await res.done;
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.limitReached, true);
    assert.equal(res.body.tokens.total, 0);
  });

  // ---- migration ----
  test('normalize-token-balances: fixes bad values and is idempotent', async () => {
    const { FILTER, UPDATE } = require('../scripts/normalize-token-balances');
    const a = await makeUser(3, 2);
    const b = await makeUser(0, 0);
    const c = await makeUser(0, 0);
    await User.collection.updateOne({ _id: b._id }, { $unset: { bonusTokens: '' }, $set: { tokens: -2 } });
    await User.collection.updateOne({ _id: c._id }, { $set: { tokens: 4.7, bonusTokens: null } });

    assert.equal(await User.countDocuments(FILTER), 2);
    const first = await User.updateMany(FILTER, UPDATE);
    assert.equal(first.modifiedCount, 2);
    assert.deepEqual(await raw(a._id), { _id: a._id, tokens: 3, bonusTokens: 2 });
    assert.deepEqual(await raw(b._id), { _id: b._id, tokens: 0, bonusTokens: 0 });
    assert.deepEqual(await raw(c._id), { _id: c._id, tokens: 4, bonusTokens: 0 });

    const second = await User.updateMany(FILTER, UPDATE);
    assert.equal(second.modifiedCount, 0);
  });
});
