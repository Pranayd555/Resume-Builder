#!/usr/bin/env node

/**
 * Script to reset AI actions for a user by email address
 * Usage: node reset-ai-actions.js <email> [--force]
 * Example: node reset-ai-actions.js user@example.com
 * Example: node reset-ai-actions.js user@example.com --force
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

// Reset AI actions function
const resetAIActions = async (email, force = false) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      return false;
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.email})`);

    // Find user's subscription
    const subscription = await Subscription.findOne({ user: user._id });
    
    if (!subscription) {
      console.log(`❌ No subscription found for user "${email}"`);
      return false;
    }

    console.log(`📊 Current subscription details:`);
    console.log(`   Plan: ${subscription.plan}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   AI Actions Limit: ${subscription.features.aiActionsLimit}`);
    console.log(`   AI Actions Used This Cycle: ${subscription.usage.aiActionsThisCycle}`);
    console.log(`   Last Reset: ${subscription.usage.lastBillingCycleReset}`);
    console.log(`   Cycle Start: ${subscription.usage.cycleStartDate}`);

    // Check if user has any AI actions to reset
    if (subscription.usage.aiActionsThisCycle === 0) {
      console.log(`ℹ️ User "${email}" has no AI actions to reset (already at 0)`);
      if (!force) {
        console.log(`💡 Use --force flag to reset anyway`);
        return true;
      }
    }

    // Confirm action unless force flag is used
    if (!force) {
      console.log(`\n⚠️  This will reset AI actions for user "${email}"`);
      console.log(`   Current usage: ${subscription.usage.aiActionsThisCycle}/${subscription.features.aiActionsLimit}`);
      console.log(`   This action cannot be undone!`);
      console.log(`\n💡 Use --force flag to skip this confirmation`);
      return false;
    }

    // Reset AI actions using the built-in method
    const result = await subscription.resetAIActionCycle();

    if (result) {
      console.log(`\n✅ AI actions reset successfully for "${email}"`);
      console.log(`📊 Updated subscription details:`);
      console.log(`   AI Actions Used This Cycle: ${result.usage.aiActionsThisCycle}`);
      console.log(`   Last Reset: ${result.usage.lastBillingCycleReset}`);
      console.log(`   Cycle Start: ${result.usage.cycleStartDate}`);
      
      if (result.billing?.nextBillingDate) {
        console.log(`   Next Billing Date: ${result.billing.nextBillingDate}`);
      }
      
      return true;
    } else {
      console.log(`❌ Failed to reset AI actions for "${email}"`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error resetting AI actions:', error.message);
    return false;
  }
};

// Show usage information
const showUsage = () => {
  console.log('📖 Usage: node reset-ai-actions.js <email> [--force]');
  console.log('📖 Example: node reset-ai-actions.js user@example.com');
  console.log('📖 Example: node reset-ai-actions.js user@example.com --force');
  console.log('\n📋 Options:');
  console.log('   --force    Skip confirmation prompt and reset immediately');
  console.log('\n📋 What this script does:');
  console.log('   • Resets AI action usage counter to 0');
  console.log('   • Updates cycle start date to current time');
  console.log('   • Updates last billing cycle reset date');
  console.log('   • For paid users: recalculates next billing date');
  console.log('\n⚠️  Note: This action cannot be undone!');
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

  console.log(`🔄 Resetting AI actions for: ${email}`);
  if (force) {
    console.log('⚡ Force mode enabled - skipping confirmation');
  }
  console.log('─'.repeat(60));

  // Connect to database
  await connectDB();

  // Reset AI actions
  const success = await resetAIActions(email, force);

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
