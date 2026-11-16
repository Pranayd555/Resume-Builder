/**
 * AI token balance: the single source of truth.
 *
 * A user has two pools on the User document. They stay separate because only
 * purchased tokens can be refunded (see utils/refundPolicy.js):
 *   tokens       -> purchased (bought through Razorpay, refundable)
 *   bonusTokens  -> bonus (signup, feedback, admin grants, package bonus; not refundable)
 *
 * Every API response that reports a balance uses tokenPayload(), which returns
 *   { purchased, bonus, total }
 * plus the older names (balance, purchasedTokens, bonusTokens) so clients that
 * still read them keep working.
 *
 * Spending order: bonus first, then purchased. This keeps refundable tokens as
 * long as possible. A pack can be refunded only while all of its tokens,
 * bonus included, are still in the balance (see utils/refundPolicy.js).
 *
 * All writes are single atomic MongoDB updates, so concurrent AI calls can
 * never overspend or push a pool below zero.
 */

// Lazily required so models/User.js can import the pure helpers below
// without a circular dependency.
const getUserModel = () => require('../models/User');
const mongoose = require('mongoose');

/**
 * Validate a user id and return it as a plain 24-hex-character string before
 * it goes into a query (Mongoose casts it to an ObjectId). Anything else, e.g.
 * an object such as { $ne: null } from a request body, is rejected. Queries
 * get plain strings only, never objects (prevents NoSQL injection).
 */
function toUserId(id) {
  const value = String(id);
  if (!/^[a-f0-9]{24}$/i.test(value) || !mongoose.Types.ObjectId.isValid(value)) {
    const err = new Error('Invalid user id');
    err.statusCode = 400;
    throw err;
  }
  return value;
}

/** Coerce a stored value to a non-negative whole number of tokens. */
function toCount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Read both pools from a user document (or any { tokens, bonusTokens } object).
 * Missing, null, negative or non-numeric values count as 0.
 */
function toTokenBalance(source) {
  const purchased = toCount(source?.tokens);
  const bonus = toCount(source?.bonusTokens);
  return { purchased, bonus, total: purchased + bonus };
}

/** The balance shape sent to clients. */
function tokenPayload(balance) {
  const { purchased, bonus, total } = typeof balance?.total === 'number'
    ? balance
    : toTokenBalance(balance);
  return {
    purchased,
    bonus,
    total,
    // Deprecated aliases, kept for older clients.
    balance: total,
    purchasedTokens: purchased,
    bonusTokens: bonus
  };
}

/**
 * How a spend of `amount` is split between the pools (bonus first).
 * Returns null when the balance is too low.
 */
function splitSpend(balance, amount = 1) {
  const need = toCount(amount);
  if (need < 1) throw new Error('Spend amount must be a positive integer');
  const { bonus, total } = toTokenBalance({ tokens: balance.purchased, bonusTokens: balance.bonus });
  if (total < need) return null;
  const fromBonus = Math.min(bonus, need);
  return { fromBonus, fromPurchased: need - fromBonus };
}

// Pool values as aggregation expressions; missing/null/negative read as 0.
const PURCHASED_EXPR = { $max: [0, { $ifNull: ['$tokens', 0] }] };
const BONUS_EXPR = { $max: [0, { $ifNull: ['$bonusTokens', 0] }] };

/** Query filter: user has at least `amount` tokens across both pools. */
function hasAtLeastFilter(amount) {
  return { $expr: { $gte: [{ $add: [PURCHASED_EXPR, BONUS_EXPR] }, amount] } };
}

/**
 * Update pipeline that spends `amount` tokens, bonus first. Both fields in one
 * $set stage read the document as it was before the stage, so the split is
 * computed from the same snapshot. Only safe together with hasAtLeastFilter().
 */
function buildSpendPipeline(amount) {
  return [{
    $set: {
      bonusTokens: { $max: [0, { $subtract: [BONUS_EXPR, amount] }] },
      tokens: {
        $subtract: [PURCHASED_EXPR, { $max: [0, { $subtract: [amount, BONUS_EXPR] }] }]
      }
    }
  }];
}

/** Update pipeline that removes up to the given amounts, never below zero. */
function buildDeductPipeline({ purchased = 0, bonus = 0 }) {
  return [{
    $set: {
      tokens: { $max: [0, { $subtract: [PURCHASED_EXPR, toCount(purchased)] }] },
      bonusTokens: { $max: [0, { $subtract: [BONUS_EXPR, toCount(bonus)] }] }
    }
  }];
}

const BALANCE_PROJECTION = { tokens: 1, bonusTokens: 1 };

function notFound() {
  const err = new Error('User not found');
  err.statusCode = 404;
  return err;
}

/** Current balance from the database. Throws (404) if the user is missing. */
async function getTokenBalance(userId) {
  const user = await getUserModel().findById(toUserId(userId)).select(BALANCE_PROJECTION).lean();
  if (!user) throw notFound();
  return toTokenBalance(user);
}

/**
 * Atomically spend `amount` tokens (bonus first).
 * @returns {Promise<{ok: true, balance, spent: {fromBonus, fromPurchased}} | {ok: false, balance}>}
 */
async function spendTokens(userId, amount = 1) {
  const need = toCount(amount);
  if (need < 1) throw new Error('Spend amount must be a positive integer');

  const before = await getUserModel().findOneAndUpdate(
    { _id: toUserId(userId), ...hasAtLeastFilter(need) },
    buildSpendPipeline(need),
    { new: false, projection: BALANCE_PROJECTION, lean: true }
  );

  if (!before) {
    // Either not enough tokens or no such user; getTokenBalance throws for the latter.
    return { ok: false, balance: await getTokenBalance(userId) };
  }

  const prior = toTokenBalance(before);
  const spent = splitSpend(prior, need);
  const balance = {
    purchased: prior.purchased - spent.fromPurchased,
    bonus: prior.bonus - spent.fromBonus,
    total: prior.total - need
  };
  return { ok: true, balance, spent };
}

// Each credit or deduction tied to a payment carries an operation id, e.g.
// "credit:<paymentId>". The id is recorded on the user in the same atomic
// write, and a write whose id is already recorded does nothing, so retries
// (browser callback + webhook + reconcile job) can never apply it twice.
const MAX_APPLIED_OPS = 200;
const pushOp = (opId) => ({ appliedTokenOps: { $each: [String(opId)], $slice: -MAX_APPLIED_OPS } });

/**
 * Atomically add tokens to either pool. With `opId`, nothing happens if that
 * operation was already applied.
 * @returns {Promise<{purchased, bonus, total} | null>} null if the user is
 *   missing or the operation was already applied.
 */
async function creditTokens(userId, { purchased = 0, bonus = 0 } = {}, { opId } = {}) {
  const update = { $inc: { tokens: toCount(purchased), bonusTokens: toCount(bonus) } };
  const query = { _id: toUserId(userId) };
  if (opId !== undefined) {
    query.appliedTokenOps = { $ne: String(opId) };
    update.$push = pushOp(opId);
  }
  const user = await getUserModel().findOneAndUpdate(
    query,
    update,
    { new: true, projection: BALANCE_PROJECTION, lean: true }
  );
  return user ? toTokenBalance(user) : null;
}

/** Put back tokens taken by spendTokens(), into the pools they came from. */
async function refundSpend(userId, spent) {
  const balance = await creditTokens(userId, {
    purchased: spent.fromPurchased,
    bonus: spent.fromBonus
  });
  if (!balance) throw notFound();
  return balance;
}

/** Whether an operation id has already been applied to the user. */
async function isOpApplied(userId, opId) {
  const found = await getUserModel().exists({ _id: toUserId(userId), appliedTokenOps: String(opId) });
  return Boolean(found);
}

/**
 * Remove a refunded pack's tokens. By default only if the user still holds
 * all of them (the pack is unused); otherwise nothing changes and null is
 * returned. With `clamp: true` (admin goodwill refund) each pool is reduced
 * as far as possible, never below zero. Also null if `opId` was already applied.
 */
async function deductForRefund(userId, { purchased = 0, bonus = 0 }, { opId, clamp = false }) {
  const p = toCount(purchased);
  const b = toCount(bonus);
  const op = String(opId);
  const query = { _id: toUserId(userId), appliedTokenOps: { $ne: op } };
  let update;
  if (clamp) {
    update = [
      ...buildDeductPipeline({ purchased: p, bonus: b }),
      {
        $set: {
          appliedTokenOps: {
            $slice: [{ $concatArrays: [{ $ifNull: ['$appliedTokenOps', []] }, [op]] }, -MAX_APPLIED_OPS]
          }
        }
      }
    ];
  } else {
    query.$expr = { $and: [{ $gte: [PURCHASED_EXPR, p] }, { $gte: [BONUS_EXPR, b] }] };
    update = { $inc: { tokens: -p, bonusTokens: -b }, $push: pushOp(op) };
  }
  const user = await getUserModel().findOneAndUpdate(
    query,
    update,
    { new: true, projection: BALANCE_PROJECTION, lean: true }
  );
  return user ? toTokenBalance(user) : null;
}

module.exports = {
  // pure helpers
  toUserId,
  toTokenBalance,
  tokenPayload,
  splitSpend,
  hasAtLeastFilter,
  buildSpendPipeline,
  buildDeductPipeline,
  // database operations
  getTokenBalance,
  spendTokens,
  creditTokens,
  refundSpend,
  isOpApplied,
  deductForRefund
};
