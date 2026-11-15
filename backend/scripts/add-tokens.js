#!/usr/bin/env node

/**
 * Add AI tokens to a user by email address.
 *
 * Usage: node scripts/add-tokens.js <email> <tokenCount> [--purchased] [--force]
 *
 *   By default the tokens go to the BONUS pool (not refundable). Use this for
 *   goodwill grants, feedback rewards and support fixes.
 *
 *   --purchased  add to the PURCHASED pool instead. Purchased tokens are
 *                refundable, so only use this to reconcile a real payment that
 *                failed to credit.
 *   --force      skip the dry run and write the change.
 *
 * Examples:
 *   node scripts/add-tokens.js user@example.com 50            # dry run
 *   node scripts/add-tokens.js user@example.com 50 --force    # +50 bonus
 *   node scripts/add-tokens.js user@example.com 25 --purchased --force
 *
 * The admin panel (Admin > Tokens) does the same for bonus tokens and also
 * records a transaction and emails the user; prefer it when possible.
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const { toTokenBalance, creditTokens } = require('../utils/tokenCalculator');

const describe = (b) => `${b.total} total (${b.purchased} purchased + ${b.bonus} bonus)`;

// Linear-time sanity check (no backtracking regex): one @, a dot after it, no spaces.
const looksLikeEmail = (value) => {
  if (typeof value !== 'string' || value.length > 254 || value.includes(' ')) return false;
  const at = value.indexOf('@');
  const dot = value.lastIndexOf('.');
  return at > 0 && at === value.lastIndexOf('@') && dot > at + 1 && dot < value.length - 1;
};

const addTokens = async (email, tokenCount, { purchased, force }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('firstName lastName email tokens bonusTokens');
  if (!user) {
    console.log(`❌ User with email "${email}" not found`);
    return false;
  }

  const pool = purchased ? 'purchased (refundable)' : 'bonus (not refundable)';
  const before = toTokenBalance(user);
  console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.email})`);
  console.log(`📊 Current balance: ${describe(before)}`);
  console.log(`📈 Adding ${tokenCount} ${pool} tokens`);

  if (!force) {
    console.log('\n💡 Dry run only. Re-run with --force to apply.');
    return false;
  }

  const after = await creditTokens(user._id, purchased ? { purchased: tokenCount } : { bonus: tokenCount });
  if (!after) {
    console.log(`❌ Failed to add tokens for "${email}"`);
    return false;
  }
  console.log(`\n✅ Tokens added. New balance: ${describe(after)}`);
  return true;
};

const showUsage = () => {
  console.log('📖 Usage: node scripts/add-tokens.js <email> <tokenCount> [--purchased] [--force]');
  console.log('   Default pool is bonus (not refundable). --purchased adds refundable tokens.');
  console.log('   Without --force the script only shows what it would do.');
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  const positional = args.filter(arg => !arg.startsWith('--'));
  const email = positional.find(arg => arg.includes('@'));
  const tokenCount = Number(positional.find(arg => /^\d+$/.test(arg)));
  const options = { purchased: args.includes('--purchased'), force: args.includes('--force') };

  if (!looksLikeEmail(email)) {
    console.log('❌ Please provide a valid email address');
    showUsage();
    process.exit(1);
  }
  if (!Number.isInteger(tokenCount) || tokenCount <= 0) {
    console.log('❌ Please provide a valid token count (positive integer)');
    showUsage();
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }

  let success = false;
  try {
    success = await addTokens(email, tokenCount, options);
  } catch (error) {
    console.error('❌ Error adding tokens:', error.message);
  }

  await mongoose.connection.close();
  process.exit(success ? 0 : 1);
};

main().catch((error) => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});
