#!/usr/bin/env node

/**
 * Script to migrate users and manage token allocation
 * Updated to work with current User model and RefundCalculator requirements
 * Usage: node simple-bonus-migration.js [--clear-transactions] [--add-metadata]
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Parse command line arguments
const args = process.argv.slice(2);
const clearTransactions = args.includes('--clear-transactions');
const addMetadata = args.includes('--add-metadata');
const dryRun = args.includes('--dry-run');

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

// Add metadata to transactions for RefundCalculator compatibility
const addMetadataToTransactions = (transactions) => {
  return transactions.map(txn => {
    if (!txn.metadata) {
      txn.metadata = {};
    }
    
    // If metadata doesn't have boughtTokens, try to infer from notes or set defaults
    if (!txn.metadata.boughtTokens && txn.notes) {
      const match = txn.notes.match(/(\d+)\s+AI\s+Tokens/i);
      if (match) {
        txn.metadata.boughtTokens = parseInt(match[1]);
      } else {
        txn.metadata.boughtTokens = 0;
      }
    }
    
    // Ensure bonusTokensAdded exists
    if (txn.metadata.bonusTokensAdded === undefined) {
      const match = txn.notes?.match(/\+\s*(\d+)\s+Bonus/i);
      txn.metadata.bonusTokensAdded = match ? parseInt(match[1]) : 0;
    }
    
    return txn;
  });
};

// Main migration function
const runMigration = async () => {
  try {
    console.log('🚀 Starting user migration...\n');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);

    if (users.length === 0) {
      console.log('ℹ️  No users found. Migration completed.');
      return true;
    }

    // Build update operations
    const updates = [];
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`\n📝 Processing user: ${user.email}`);
        console.log(`   Current tokens: ${user.tokens || 0}, Bonus: ${user.bonusTokens || 0}`);
        console.log(`   Transactions: ${user.razorpayTransactions?.length || 0}`);

        // Handle transactions
        let updatedTransactions = user.razorpayTransactions || [];
        
        if (addMetadata && updatedTransactions.length > 0) {
          console.log(`   📥 Adding metadata to ${updatedTransactions.length} transactions...`);
          updatedTransactions = addMetadataToTransactions(updatedTransactions);
        }

        if (clearTransactions) {
          console.log(`   🗑️  Clearing all transactions`);
          updatedTransactions = [];
        }

        // Update user
        if (!dryRun) {
          user.tokens = 5;           // Set to 20 regular tokens
          user.bonusTokens = 0;        // No bonus tokens
          user.razorpayTransactions = updatedTransactions;
          
          await user.save();
          console.log(`   ✅ Successfully updated`);
        } else {
          console.log(`   📋 [DRY RUN] Would update to: 20 tokens, 0 bonus`);
        }

        const totalTokens = (user.tokens || 0) + (user.bonusTokens || 0);
        console.log(`   📊 Result: 20 tokens (0 bonus) = 20 total`);
        
        processedCount++;

      } catch (error) {
        console.error(`   ❌ Error processing ${user.email}: ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully processed: ${processedCount} users`);
    console.log(`⚠️  Errors: ${errorCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log(`📋 Total users: ${users.length}`);
    
    if (dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No changes were saved');
    }

    if (clearTransactions) {
      console.log('🗑️  All transaction history cleared');
    }
    if (addMetadata) {
      console.log('📥 Metadata added to transactions for RefundCalculator');
    }

    // Verify the migration if not dry run
    if (!dryRun) {
      console.log('\n🔍 Verification:');
      const updatedUsers = await User.find({}).select('email tokens bonusTokens razorpayTransactions');
      
      let allValid = true;
      for (const user of updatedUsers) {
        const totalTokens = (user.tokens || 0) + (user.bonusTokens || 0);
        const hasMetadata = addMetadata ? 
          user.razorpayTransactions?.every(t => t.metadata?.boughtTokens !== undefined) : 
          true;
        
        const isValid = user.tokens === 20 && user.bonusTokens === 0 && hasMetadata;
        const status = isValid ? '✅' : '❌';
        
        console.log(`  ${status} ${user.email}: ${user.tokens} tokens (${user.bonusTokens} bonus) | Transactions: ${user.razorpayTransactions?.length || 0}`);
        
        if (!isValid) {
          allValid = false;
        }
      }
      
      if (allValid) {
        console.log('\n✅ All users verified successfully!');
      } else {
        console.log('\n⚠️  Some users may not have been updated correctly');
        return false;
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('🎯 User Migration Tool');
  console.log('=' .repeat(60));
  console.log('📋 This migration will:');
  console.log('   • Set ALL users to exactly 20 tokens and 0 bonus tokens');
  console.log('   • Optionally clear all payment history (use --clear-transactions)');
  console.log('   • Optionally add RefundCalculator metadata (use --add-metadata)');
  console.log('');
  console.log('⚙️ Available options:');
  console.log('   --clear-transactions  : Clear all payment history');
  console.log('   --add-metadata        : Add metadata to transactions for RefundCalculator');
  console.log('   --dry-run             : Test run without saving changes');
  console.log('');
  console.log('📝 Current settings:');
  console.log(`   Clear transactions: ${clearTransactions ? 'YES' : 'NO'}`);
  console.log(`   Add metadata: ${addMetadata ? 'YES' : 'NO'}`);
  console.log(`   Dry run: ${dryRun ? 'YES (no changes will be saved)' : 'NO'}`);
  console.log('─'.repeat(60));

  // Connect to database
  await connectDB();

  // Run migration
  const success = await runMigration();

  // Disconnect from database
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');

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
