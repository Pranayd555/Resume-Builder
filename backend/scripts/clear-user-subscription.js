#!/usr/bin/env node

/**
 * Script to clear a user's subscription and reset them to free plan
 * Usage: node clear-user-subscription.js <email> [--force]
 * Example: node clear-user-subscription.js user@example.com
 * Example: node clear-user-subscription.js user@example.com --force
 * 
 * This script will:
 * - Reset user subscription to 'free' plan
 * - Set AI tokens to 20 (free plan default)
 * - Set resume limit to 2 (free plan default)
 * - Clear subscription history
 * - Reset subscription-related fields
 * - Keep other user details intact
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Resume = require('../models/Resume');
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
    console.log(`📊 Current subscription: ${user.subscriptionType || 'Not set'}`);
    console.log(`🪙 Current AI tokens: ${user.aiTokens || 'Not set'}`);
    console.log(`📄 Current resume limit: ${user.resumeLimit || 'Not set'}`);
    console.log(`📅 Subscription start: ${user.subscriptionStart || 'Not set'}`);
    console.log(`📅 Subscription end: ${user.subscriptionEnd || 'Not set'}`);

    // Show what will happen
    console.log(`\n📋 Changes that will be made:`);
    console.log(`   • Subscription type: ${user.subscriptionType || 'Not set'} → free`);
    console.log(`   • AI tokens: ${user.aiTokens || 'Not set'} → 20`);
    console.log(`   • Resume limit: ${user.resumeLimit || 'Not set'} → 2`);
    console.log(`   • Subscription start: ${user.subscriptionStart || 'Not set'} → ${new Date().toISOString()}`);
    console.log(`   • Subscription end: ${user.subscriptionEnd || 'Not set'} → null`);
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
      // Update user subscription fields using the new simplified structure
      const userUpdateResult = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            subscriptionType: 'free',
            subscriptionStart: new Date(),
            subscriptionEnd: null,
            resumeLimit: 2,
            aiTokens: 20
          }
        },
        { new: true, session }
      );

      if (!userUpdateResult) {
        throw new Error('Failed to update user subscription');
      }

      // Clean up extra resumes for free users (keep only the oldest 2)
      const userResumes = await Resume.find({ user: user._id })
        .sort({ createdAt: 1 })
        .session(session);
      
      if (userResumes.length > 2) {
        const resumesToDelete = userResumes.slice(2);
        const resumeIdsToDelete = resumesToDelete.map(resume => resume._id);
        
        await Resume.deleteMany({ _id: { $in: resumeIdsToDelete } }).session(session);
        console.log(`🧹 Cleaned up ${resumesToDelete.length} extra resumes (kept oldest 2)`);
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      console.log(`\n✅ User subscription cleared successfully for "${email}"`);
      console.log(`📊 Updated subscription type: free`);
      console.log(`🪙 Updated AI tokens: 20`);
      console.log(`📄 Updated resume limit: 2`);
      console.log(`📅 Updated subscription start: ${new Date().toISOString()}`);
      console.log(`📅 Updated subscription end: null`);
      console.log(`🧹 Resume cleanup: completed`);
      
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
  console.log('   • Sets AI tokens to 20 (free plan default)');
  console.log('   • Sets resume limit to 2 (free plan default)');
  console.log('   • Clears subscription history');
  console.log('   • Removes extra resumes (keeps oldest 2)');
  console.log('   • Preserves all other user data (profile, etc.)');
  console.log('\n⚠️  Note: This action cannot be undone!');
  console.log('\n💡 Free Plan Features:');
  console.log('   • 2 resume creation limit');
  console.log('   • 20 AI tokens for actions');
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
