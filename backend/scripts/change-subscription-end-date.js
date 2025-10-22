#!/usr/bin/env node

/**
 * Script to change a user's subscription end date
 * Usage: node change-subscription-end-date.js <user-email> <new-end-date>
 * 
 * Example:
 * node change-subscription-end-date.js user@example.com "2024-12-31"
 * node change-subscription-end-date.js user@example.com "2024-12-31T23:59:59.000Z"
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Load environment variables
require('dotenv').config();

async function changeSubscriptionEndDate(userEmail, newEndDate) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: userEmail.toLowerCase() });
    if (!user) {
      console.error(`❌ User with email "${userEmail}" not found`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.email})`);

    // Parse the new end date
    const parsedEndDate = new Date(newEndDate);
    if (isNaN(parsedEndDate.getTime())) {
      console.error(`❌ Invalid date format: "${newEndDate}"`);
      console.log('Please use formats like: "2024-12-31" or "2024-12-31T23:59:59.000Z"');
      process.exit(1);
    }

    // Find user's subscription
    const subscription = await Subscription.findOne({ user: user._id });
    if (!subscription) {
      console.error(`❌ No subscription found for user ${userEmail}`);
      process.exit(1);
    }

    console.log(`📋 Current subscription details:`);
    console.log(`   Plan: ${subscription.plan}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Current end date: ${subscription.endDate ? subscription.endDate.toISOString() : 'None'}`);
    console.log(`   Next billing date: ${subscription.billing?.nextBillingDate ? subscription.billing.nextBillingDate.toISOString() : 'None'}`);

    // Update subscription end date
    subscription.endDate = parsedEndDate;
    
    // Always set nextBillingDate to the same as endDate to trigger cleanup
    subscription.billing.nextBillingDate = parsedEndDate;
    
    // If the end date is in the past, set both dates to null to prevent recurring cleanup
    if (parsedEndDate < new Date()) {
      subscription.endDate = null;
      subscription.billing.nextBillingDate = null;
      console.log('✅ End date is in the past - set both dates to null to prevent recurring cleanup');
    } else {
      console.log('⚠️  Cleanup will be triggered on next API call when end date is reached');
    }
    
    // If the subscription is active and we're setting an end date, we might want to update the status
    if (subscription.status === 'active' && parsedEndDate < new Date()) {
      console.log('⚠️  Warning: Setting end date to a past date. Consider updating status to "canceled"');
    }

    await subscription.save();

    console.log(`✅ Successfully updated subscription end date to: ${parsedEndDate.toISOString()}`);

    // Also update the User model's subscriptionEnd if it exists
    if (user.subscriptionEnd !== undefined) {
      user.subscriptionEnd = parsedEndDate;
      await user.save();
      console.log(`✅ Also updated User model subscriptionEnd field`);
    }

    console.log('\n📊 Updated subscription details:');
    console.log(`   Plan: ${subscription.plan}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   New end date: ${subscription.endDate.toISOString()}`);
    console.log(`   Next billing date: ${subscription.billing?.nextBillingDate ? subscription.billing.nextBillingDate.toISOString() : 'None'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('❌ Usage: node change-subscription-end-date.js <user-email> <new-end-date>');
    console.log('\nExamples:');
    console.log('  node change-subscription-end-date.js user@example.com "2024-12-31"');
    console.log('  node change-subscription-end-date.js user@example.com "2024-12-31T23:59:59.000Z"');
    console.log('  node change-subscription-end-date.js user@example.com "2025-01-15T00:00:00.000Z"');
    process.exit(1);
  }

  const [userEmail, newEndDate] = args;
  
  console.log('🔄 Changing subscription end date...');
  console.log(`   User: ${userEmail}`);
  console.log(`   New end date: ${newEndDate}`);
  console.log('');

  await changeSubscriptionEndDate(userEmail, newEndDate);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { changeSubscriptionEndDate };
