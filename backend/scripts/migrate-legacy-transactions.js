#!/usr/bin/env node
/**
 * Copy the old per-user `razorpayTransactions` arrays into the payments
 * collection (models/Payment.js), marked `legacy: true`, so payment history
 * and admin views keep showing them. Token balances are NOT changed.
 *
 *   node scripts/migrate-legacy-transactions.js            dry run (default)
 *   node scripts/migrate-legacy-transactions.js --apply    write Payment records
 *   node scripts/migrate-legacy-transactions.js --apply --unset
 *        also remove the old arrays from user documents afterwards
 *
 * Safe to re-run: records already copied (same payment/order id) are skipped.
 * Uses MONGODB_URI from backend/.env.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const APPLY = process.argv.includes('--apply');
const UNSET = process.argv.includes('--unset');

/** Drop undefined fields (the driver would store them as null). */
const compact = (obj) => Object.fromEntries(Object.entries(obj)
  .filter(([, v]) => v !== undefined)
  .map(([k, v]) => [k, v && v.constructor === Object ? compact(v) : v]));

const isBonus = (t) => t?.method === 'admin_bonus' || t?.metadata?.type === 'admin_bonus' || !(Number(t?.amount) > 0);

function toPayment(userId, t) {
  const created = t.createdAt ? new Date(t.createdAt) : new Date();
  if (isBonus(t)) {
    return {
      user: userId,
      type: 'bonus',
      status: 'granted',
      bonusTokens: Number(t.metadata?.bonusTokensAdded ?? t.metadata?.tokensAdded) || 0,
      amount: 0,
      reason: String(t.metadata?.reason || t.notes || 'Bonus tokens').slice(0, 200),
      grantedBy: String(t.metadata?.givenBy || ''),
      legacy: true,
      createdAt: created
    };
  }
  const refunded = t.status === 'refunded' || Boolean(t.refundedAt);
  const tokens = Number(t.metadata?.boughtTokens ?? t.metadata?.regularTokensAdded) || 0;
  return {
    user: userId,
    type: 'purchase',
    status: refunded ? 'refunded' : 'paid',
    tokens,
    bonusTokens: Number(t.metadata?.bonusTokensAdded) || 0,
    amount: Number(t.amount) || 0,
    currency: t.currency || 'INR',
    orderId: t.orderId ? String(t.orderId) : undefined,
    paymentId: t.paymentId || t.transactionId ? String(t.paymentId || t.transactionId) : undefined,
    method: t.method || 'razorpay',
    paidAt: t.capturedAt ? new Date(t.capturedAt) : created,
    credited: true,
    refund: refunded
      ? {
          status: 'processed',
          razorpayRefundId: t.metadata?.refundId ? String(t.metadata.refundId) : undefined,
          amount: Number(t.metadata?.refundAmount) || Number(t.amount) || 0,
          by: 'admin',
          reason: t.refundReason || undefined,
          requestedAt: t.refundRequestedAt || t.refundedAt,
          processedAt: t.refundedAt
        }
      : undefined,
    legacy: true,
    createdAt: created
  };
}

async function alreadyCopied(doc) {
  if (doc.type === 'purchase' && (doc.paymentId || doc.orderId)) {
    const or = [];
    if (doc.paymentId) or.push({ paymentId: doc.paymentId });
    if (doc.orderId) or.push({ orderId: doc.orderId });
    return Payment.exists({ $or: or });
  }
  return Payment.exists({ user: doc.user, type: 'bonus', legacy: true, createdAt: doc.createdAt });
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.collection('users');
  const cursor = users.find(
    { 'razorpayTransactions.0': { $exists: true } },
    { projection: { email: 1, razorpayTransactions: 1 } }
  );

  const counts = { users: 0, purchases: 0, bonuses: 0, skipped: 0 };
  for await (const user of cursor) {
    counts.users += 1;
    for (const t of user.razorpayTransactions) {
      const doc = toPayment(user._id, t);
      if (await alreadyCopied(doc)) {
        counts.skipped += 1;
        continue;
      }
      counts[doc.type === 'bonus' ? 'bonuses' : 'purchases'] += 1;
      if (APPLY) await Payment.collection.insertOne(compact({ ...doc, updatedAt: new Date() }));
    }
  }

  console.log(`${APPLY ? 'Copied' : 'Would copy'}: ${counts.purchases} purchases, ${counts.bonuses} bonus grants from ${counts.users} users (${counts.skipped} already copied).`);
  if (APPLY && UNSET) {
    const res = await users.updateMany({ razorpayTransactions: { $exists: true } }, { $unset: { razorpayTransactions: '' } });
    console.log(`Removed the old arrays from ${res.modifiedCount} users.`);
  } else if (!APPLY) {
    console.log('Dry run. Re-run with --apply to write.');
  }
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
