#!/usr/bin/env node

/**
 * Script to reset AI actions for a user by email address
 * Usage: node reset-ai-actions.js <email> [--force]
 * Example: node reset-ai-actions.js user@example.com
 * Example: node reset-ai-actions.js user@example.com --force
 */

const mongoose = require('mongoose');
const User = require('../models/User');
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

    console.log(`📊 Current user details:`);
    console.log(`   Tokens: ${user.tokens}`);
    console.log(`   Usage: ${JSON.stringify(user.usage, null, 2)}`);

    // Check if user has any usage to reset
    if (!user.usage || Object.keys(user.usage).length === 0) {
      console.log(`ℹ️ User "${email}" has no usage data to reset`);
      if (!force) {
        console.log(`💡 Use --force flag to reset anyway`);
        return true;
      }
    }

    // Confirm action unless force flag is used
    if (!force) {
      console.log(`\n⚠️  This will reset usage data for user "${email}"`);
      console.log(`   Current usage: ${JSON.stringify(user.usage, null, 2)}`);
      console.log(`   This action cannot be undone!`);
      console.log(`\n💡 Use --force flag to skip this confirmation`);
      return false;
    }

    // Reset usage data
    user.usage = {
      resumesCreated: 0,
      aiActionsUsed: 0,
      lastReset: new Date()
    };
    
    await user.save();

    console.log(`\n✅ Usage data reset successfully for "${email}"`);
    console.log(`📊 Updated user details:`);
    console.log(`   Tokens: ${user.tokens}`);
    console.log(`   Usage: ${JSON.stringify(user.usage, null, 2)}`);
    
    return true;

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
  console.log('   • Resets user usage data to 0');
  console.log('   • Updates last reset timestamp');
  console.log('   • Clears AI actions and resume creation counters');
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
