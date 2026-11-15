#!/usr/bin/env node

/**
 * Normalize the two token pools on every user: `tokens` (purchased) and
 * `bonusTokens` (bonus) become whole numbers >= 0. Missing, null, negative
 * or non-numeric values become 0; fractional values are rounded down.
 *
 * Why: older documents can lack `bonusTokens` (or hold null/negative values
 * from the old read-modify-save code). The app treats those as 0, but MongoDB
 * aggregations ($add) return null for a missing field, and they make the
 * stored data disagree with what users see.
 *
 * Safe to re-run: it only touches documents that are not already normalized,
 * and a second run finds nothing to change.
 *
 * Usage (from backend/):
 *   node scripts/normalize-token-balances.js            # dry run: report only
 *   node scripts/normalize-token-balances.js --apply    # write changes
 *
 * It uses MONGODB_URI from backend/.env. Run it against a local or staging
 * database first. Do not run it against production without a backup.
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const FIELDS = ['tokens', 'bonusTokens'];

// A field needs fixing if it is missing/null/non-numeric, negative, or fractional.
const needsFix = (field) => ({
  $or: [
    { [field]: { $not: { $type: 'number' } } },
    { [field]: { $lt: 0 } },
    { $expr: { $and: [{ $isNumber: `$${field}` }, { $ne: [`$${field}`, { $floor: `$${field}` }] }] } }
  ]
});

const FILTER = { $or: FIELDS.map(needsFix) };

const normalized = (field) => ({
  $cond: [{ $isNumber: `$${field}` }, { $max: [0, { $floor: `$${field}` }] }, 0]
});

const UPDATE = [{ $set: Object.fromEntries(FIELDS.map((f) => [f, normalized(f)])) }];

function describeTarget(uri) {
  try {
    const { hostname, pathname } = new URL(uri.replace(/^mongodb\+srv:/, 'http:').replace(/^mongodb:/, 'http:'));
    return `${hostname}${pathname}`;
  } catch {
    return '(unparsable MONGODB_URI)';
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set');
    process.exit(1);
  }

  console.log(`Target database: ${describeTarget(process.env.MONGODB_URI)}`);
  console.log(apply ? 'Mode: APPLY (writing changes)' : 'Mode: dry run (no changes)');

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const affected = await User.find(FILTER).select('email tokens bonusTokens').lean();
    console.log(`Users needing normalization: ${affected.length}`);
    for (const u of affected.slice(0, 50)) {
      console.log(`  ${u.email}: tokens=${JSON.stringify(u.tokens)} bonusTokens=${JSON.stringify(u.bonusTokens)}`);
    }
    if (affected.length > 50) console.log(`  ...and ${affected.length - 50} more`);

    if (!apply) {
      console.log('\nDry run only. Re-run with --apply to write changes.');
      return;
    }

    const result = await User.updateMany(FILTER, UPDATE);
    console.log(`\n✅ Updated ${result.modifiedCount} user(s).`);
    const remaining = await User.countDocuments(FILTER);
    console.log(`Users still needing normalization: ${remaining}`);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { FILTER, UPDATE };
