const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

/**
 * Script to set a user's trial to end at a specific time
 * Usage: node scripts/set-trial-end.js <user-email> [minutes-from-now]
 * Example: node scripts/set-trial-end.js pranay11@yopmail.com 30
 */

async function setTrialEnd() {
  try {
    // Get command line arguments
    const userEmail = process.argv[2];
    const minutesFromNow = parseInt(process.argv[3]) || 30; // Default to 30 minutes from now

    if (!userEmail) {
      console.error('❌ Please provide user email as first argument');
      console.error('Usage: node scripts/set-trial-end.js <user-email> [minutes-from-now]');
      console.error('Example: node scripts/set-trial-end.js pranay11@yopmail.com 30');
      process.exit(1);
    }

    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set!');
      console.error('Please create a .env file in the backend directory with your MongoDB connection string.');
      console.error('Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    console.log(`📍 Using URI: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error(`❌ User not found with email: ${userEmail}`);
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.email})`);

    // Find user's subscription
    let subscription = await Subscription.findOne({ user: user._id });
    
    if (!subscription) {
      console.error('❌ No subscription found for this user');
      process.exit(1);
    }

    console.log(`📋 Current subscription: ${subscription.plan} (${subscription.status})`);
    console.log(`📅 Current trial end: ${subscription.billing?.trialEnd || 'Not set'}`);
    console.log(`🎯 Has had trial: ${subscription.hasHadTrial}`);

    // Set trial end time
    const trialEndTime = new Date();
    trialEndTime.setMinutes(trialEndTime.getMinutes() + minutesFromNow);

    console.log(`⏰ Setting trial end to: ${trialEndTime.toLocaleString()}`);
    console.log(`⏱️  Trial will end in ${minutesFromNow} minutes`);

    // Update subscription to trialing status with trial end
    subscription.status = 'trialing';
    subscription.plan = 'pro_monthly'; // Set to pro plan for trial
    subscription.hasHadTrial = true; // Mark that they've had a trial
    
    // Set trial billing information
    if (!subscription.billing) {
      subscription.billing = {};
    }
    subscription.billing.trialEnd = trialEndTime;
    subscription.billing.trialType = 'free';
    subscription.billing.cycle = 'monthly';
    subscription.billing.currency = 'INR';

    // Set trial features
    subscription.features.resumeLimit = 5;
    subscription.features.templateAccess = ['free', 'premium'];
    subscription.features.exportFormats = ['pdf'];
    subscription.features.aiActionsLimit = 'token-based';
    subscription.features.freeTokens = 0; // No free tokens during trial
    subscription.features.aiReview = true;
    subscription.features.prioritySupport = true;
    subscription.features.customBranding = false;
    subscription.features.unlimitedExports = true;

    // Reset usage for trial
    subscription.usage = {
      resumesCreated: 0,
      aiActionsThisCycle: 0,
      freeTokensUsed: 0,
      cycleStartDate: new Date(),
      lastBillingCycleReset: new Date()
    };

    await subscription.save();

    console.log(`✅ Trial set successfully!`);
    console.log(`📅 Trial end date: ${subscription.billing.trialEnd.toLocaleString()}`);
    console.log(`📊 Status: ${subscription.status}`);
    console.log(`📋 Plan: ${subscription.plan}`);
    console.log(`🎯 Has had trial: ${subscription.hasHadTrial}`);

    // Calculate remaining time
    const now = new Date();
    const timeUntilEnd = subscription.billing.trialEnd - now;
    
    if (timeUntilEnd > 0) {
      const hoursRemaining = Math.floor(timeUntilEnd / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60));

      console.log(`\n⏰ Time remaining: ${hoursRemaining} hours and ${minutesRemaining} minutes`);
      
      if (minutesRemaining < 5) {
        console.log(`⚠️  WARNING: Trial expires in less than 5 minutes!`);
      } else if (minutesRemaining < 30) {
        console.log(`⚠️  WARNING: Trial expires in less than 30 minutes!`);
      }
    } else {
      console.log(`\n⚠️  Trial end date is in the past!`);
    }

    // Test trial methods
    console.log(`\n🧪 Testing trial methods:`);
    console.log(`📊 Is trial active: ${subscription.isTrialActive()}`);
    console.log(`📊 Has trial expired: ${subscription.hasTrialExpired()}`);
    console.log(`📊 Can start trial: ${subscription.canStartTrial()}`);
    console.log(`📊 Trial remaining days: ${subscription.trialRemainingDays}`);

    // Test localStorage API response
    console.log(`\n🧪 Testing localStorage API response:`);
    const hasUsedTrial = subscription.hasHadTrial || false;
    const isTrialActive = subscription.isTrialActive();
    const hasTrialExpired = subscription.hasTrialExpired();
    
    console.log(`📊 hasHadTrial: ${hasUsedTrial}`);
    console.log(`📊 trialUsage.hasUsedTrial: ${hasUsedTrial}`);
    console.log(`📊 trialUsage.isTrialActive: ${isTrialActive}`);
    console.log(`📊 trialUsage.hasTrialExpired: ${hasTrialExpired}`);
    console.log(`📊 trialUsage.canStartTrial: ${subscription.canStartTrial()}`);

  } catch (error) {
    console.error('❌ Error setting trial end:', error);
    logger.error('Script error:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  setTrialEnd();
}

module.exports = setTrialEnd;
