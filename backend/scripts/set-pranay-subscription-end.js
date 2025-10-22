const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

/**
 * Script to set Pranay's subscription to end tonight at 10 PM
 * Usage: node scripts/set-pranay-subscription-end.js
 */

async function setPranaySubscriptionEnd() {
  try {
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
    const user = await User.findOne({ email: 'pranay11@yopmail.com' });
    
    if (!user) {
      console.error('❌ User not found with email: pranay11@yopmail.com');
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
    console.log(`📅 Current end date: ${subscription.endDate || 'Not set'}`);
    console.log(`💳 Current next billing date: ${subscription.billing?.nextBillingDate || 'Not set'}`);

    // Set end date to tonight at 10 PM
    const tonight = new Date();
    tonight.setHours(21, 0, 0, 0); // 10:00 PM

    console.log(`⏰ Setting end date to: ${tonight.toLocaleString()}`);

    // Update subscription
    subscription.endDate = tonight;
    subscription.status = 'active'; // Keep as active until end date
    
    // Also update next billing date to tonight for consistency
    if (subscription.billing) {
      subscription.billing.nextBillingDate = tonight;
    }

    await subscription.save();

    console.log(`✅ Subscription updated successfully!`);
    console.log(`📅 New end date: ${subscription.endDate.toLocaleString()}`);
    console.log(`💳 New next billing date: ${subscription.billing?.nextBillingDate?.toLocaleString()}`);
    console.log(`📊 Status: ${subscription.status}`);

    // Calculate remaining time
    const now = new Date();
    const timeUntilEnd = subscription.endDate - now;
    
    if (timeUntilEnd > 0) {
      const hoursRemaining = Math.floor(timeUntilEnd / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60));

      console.log(`\n⏰ Time remaining: ${hoursRemaining} hours and ${minutesRemaining} minutes`);
      
      if (hoursRemaining < 1) {
        console.log(`⚠️  WARNING: Subscription expires in less than 1 hour!`);
      }
    } else {
      console.log(`\n⚠️  End date is in the past!`);
    }

    // Test the calculateRemainingDays method
    console.log(`\n🧪 Testing calculateRemainingDays method:`);
    const remainingDays = subscription.calculateRemainingDays();
    console.log(`📊 Remaining days (method): ${remainingDays}`);

  } catch (error) {
    console.error('❌ Error setting subscription end date:', error);
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
  setPranaySubscriptionEnd();
}

module.exports = setPranaySubscriptionEnd;
