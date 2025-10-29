#!/usr/bin/env node

/**
 * Script to add 20 bonus tokens to all users and clear payment history
 * Usage: node simple-bonus-migration.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('🚀 Starting bonus tokens migration...');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);

    if (users.length === 0) {
      console.log('ℹ️  No users found. Migration completed.');
      return true;
    }

    // Reset all users to exactly 20 tokens and clear payment history
    const result = await User.updateMany(
      {}, // Update all users
      {
        $set: {
          tokens: 0, // Set exactly 20 regular tokens
          bonusTokens: 20, // No bonus tokens
          razorpayTransactions: [] // Clear all payment history
        }
      }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} users`);

    // Verify the migration
    const updatedUsers = await User.find({}).select('email tokens bonusTokens');
    console.log('🔍 Verification:');
    updatedUsers.forEach(user => {
      const totalTokens = (user.tokens || 0) + (user.bonusTokens || 0);
      console.log(`  - ${user.email}: ${user.tokens || 0} tokens (${user.bonusTokens || 0} bonus) = ${totalTokens} total`);
    });

    console.log('🎉 Migration completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🎯 Bonus Tokens Migration Tool');
  console.log('===============================');
  console.log('📋 This migration will:');
  console.log('   • Reset ALL users to exactly 20 tokens');
  console.log('   • Clear all payment history and transactions');
  console.log('   • Remove all previous tokens (bonus and regular)');
  console.log('   • Give users a fresh start');
  console.log('─'.repeat(60));

  // Connect to database
  await connectDB();

  // Run migration
  const success = await runMigration();

  // Disconnect from database
  await mongoose.connection.close();
  console.log('✅ Database connection closed');

  // Exit with appropriate code
  process.exit(success ? 0 : 1);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Received SIGINT. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Received SIGTERM. Closing database connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main().catch((error) => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});
