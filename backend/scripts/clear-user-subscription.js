#!/usr/bin/env node

/**
 * Script to clear a user's subscription and reset them to free plan
 * Usage: node clear-user-subscription.js <email> [--force]
 * Example: node clear-user-subscription.js user@example.com
 * Example: node clear-user-subscription.js user@example.com --force
 * 
 * This script will:
 * - Reset user subscription to 'free' plan
 * - Set tokens to 20 (free plan default)
 * - Clear all Razorpay transaction history
 * - Reset subscription-related fields
 * - Keep other user details intact
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
require('dotenv').config();

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

// Clear user subscription function
const clearUserSubscription = async (email, force = false) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      return false;
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`📊 Current subscription: ${user.subscription.plan}`);
    console.log(`🪙 Current tokens: ${user.tokens}`);
    console.log(`💳 Transaction history entries: ${user.razorpayTransactions.length}`);

    // Show what will happen
    console.log(`\n📋 Changes that will be made:`);
    console.log(`   • Subscription plan: ${user.subscription.plan} → free`);
    console.log(`   • Subscription status: ${user.subscription.isActive} → true`);
    console.log(`   • Tokens: ${user.tokens} → 20`);
    console.log(`   • Transaction history: ${user.razorpayTransactions.length} → 0`);
    console.log(`   • Usage tracking will be reset`);
    console.log(`   • All other user data will be preserved`);

    // Confirm action unless force flag is used
    if (!force) {
      console.log(`\n⚠️  This will reset user "${email}" to free subscription`);
      console.log(`   This action cannot be undone!`);
      console.log(`\n💡 Use --force flag to skip this confirmation`);
      return false;
    }

    // Start transaction to ensure atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update user subscription fields
      const userUpdateResult = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            'subscription.plan': 'free',
            'subscription.isActive': true,
            'subscription.startDate': new Date(),
            'subscription.endDate': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            'tokens': 20,
            'usage.resumesCreated': 0,
            'usage.templatesUsed': [],
            'usage.loginCount': 0
          },
          $unset: {
            'razorpayTransactions': 1
          }
        },
        { new: true, session }
      );

      if (!userUpdateResult) {
        throw new Error('Failed to update user subscription');
      }

      // Handle subscription model - either update existing or create new
      let subscription = await Subscription.findOne({ user: user._id }).session(session);
      
      if (subscription) {
        // Update existing subscription
        subscription.plan = 'free';
        subscription.status = 'active';
        subscription.startDate = new Date();
        subscription.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        subscription.canceledAt = undefined;
        subscription.cancelReason = undefined;
        subscription.billing = {
          cycle: 'monthly',
          amount: 0,
          currency: 'INR',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          trialEnd: undefined,
          trialType: null,
          discountCode: undefined,
          discountAmount: 0
        };
        subscription.features = {
          resumeLimit: 2,
          templateAccess: ['free'],
          exportFormats: ['pdf'],
          aiActionsLimit: 'token-based',
          freeTokens: 0,
          aiReview: false,
          prioritySupport: false,
          customBranding: false,
          unlimitedExports: false
        };
        subscription.usage = {
          resumesCreated: 0,
          aiActionsThisCycle: 0,
          freeTokensUsed: 0,
          cycleStartDate: new Date(),
          lastBillingCycleReset: new Date()
        };
        subscription.paymentHistory = [];
        subscription.hasHadTrial = false;
        
        await subscription.save({ session });
      } else {
        // Create new subscription record
        subscription = new Subscription({
          user: user._id,
          plan: 'free',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          billing: {
            cycle: 'monthly',
            amount: 0,
            currency: 'INR',
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            trialEnd: undefined,
            trialType: null,
            discountCode: undefined,
            discountAmount: 0
          },
          features: {
            resumeLimit: 2,
            templateAccess: ['free'],
            exportFormats: ['pdf'],
            aiActionsLimit: 'token-based',
            freeTokens: 0,
            aiReview: false,
            prioritySupport: false,
            customBranding: false,
            unlimitedExports: false
          },
          usage: {
            resumesCreated: 0,
            aiActionsThisCycle: 0,
            freeTokensUsed: 0,
            cycleStartDate: new Date(),
            lastBillingCycleReset: new Date()
          },
          paymentHistory: [],
          hasHadTrial: false
        });
        
        await subscription.save({ session });
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      console.log(`\n✅ User subscription cleared successfully for "${email}"`);
      console.log(`📊 Updated subscription: free`);
      console.log(`🪙 Updated tokens: 20`);
      console.log(`💳 Transaction history: cleared`);
      console.log(`📈 Usage tracking: reset`);
      console.log(`🎯 Subscription model: ${subscription ? 'updated' : 'created'}`);
      
      return true;

    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error clearing user subscription:', error.message);
    return false;
  }
};

// Show usage information
const showUsage = () => {
  console.log('📖 Usage: node clear-user-subscription.js <email> [--force]');
  console.log('📖 Example: node clear-user-subscription.js user@example.com');
  console.log('📖 Example: node clear-user-subscription.js user@example.com --force');
  console.log('\n📋 Options:');
  console.log('   --force    Skip confirmation prompt and clear subscription immediately');
  console.log('\n📋 What this script does:');
  console.log('   • Resets user subscription to free plan');
  console.log('   • Sets tokens to 20 (free plan default)');
  console.log('   • Clears all Razorpay transaction history');
  console.log('   • Resets usage tracking and subscription fields');
  console.log('   • Updates or creates subscription model record');
  console.log('   • Preserves all other user data (profile, resumes, etc.)');
  console.log('\n⚠️  Note: This action cannot be undone!');
  console.log('\n💡 Free Plan Features:');
  console.log('   • 2 resume creation limit');
  console.log('   • 20 tokens for AI actions');
  console.log('   • Free templates only');
  console.log('   • PDF export only');
  console.log('   • No premium features');
};

// Main execution
const main = async () => {
  const args = process.argv.slice(2);
  
  // Check if help is requested
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  // Check if email is provided
  const email = args.find(arg => !arg.startsWith('--'));
  const force = args.includes('--force');
  
  if (!email) {
    console.log('❌ Please provide an email address');
    showUsage();
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Please provide a valid email address');
    process.exit(1);
  }

  console.log(`🔄 Clearing subscription for: ${email}`);
  if (force) {
    console.log('⚡ Force mode enabled - skipping confirmation');
  }
  console.log('─'.repeat(60));

  // Connect to database
  await connectDB();

  // Clear user subscription
  const success = await clearUserSubscription(email, force);

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
