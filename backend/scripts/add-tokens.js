#!/usr/bin/env node

/**
 * Script to add tokens to a user by email address
 * Usage: node add-tokens.js <email> <tokenCount> [--force]
 * Example: node add-tokens.js user@example.com 50
 * Example: node add-tokens.js user@example.com 100 --force
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

// Add tokens function
const addTokens = async (email, tokenCount, force = false) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      return false;
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`📊 Current token balance: ${user.tokens}`);

    // Validate token count
    if (!Number.isInteger(tokenCount) || tokenCount <= 0) {
      console.log(`❌ Token count must be a positive integer`);
      return false;
    }

    // Show what will happen
    const newBalance = user.tokens + tokenCount;
    console.log(`📈 Tokens to add: ${tokenCount}`);
    console.log(`💰 New balance will be: ${newBalance}`);

    // Confirm action unless force flag is used
    if (!force) {
      console.log(`\n⚠️  This will add ${tokenCount} tokens to user "${email}"`);
      console.log(`   Current balance: ${user.tokens}`);
      console.log(`   New balance: ${newBalance}`);
      console.log(`   This action cannot be undone!`);
      console.log(`\n💡 Use --force flag to skip this confirmation`);
      return false;
    }

    // Add tokens using the built-in method
    const result = await user.addTokens(tokenCount);

    if (result) {
      console.log(`\n✅ Tokens added successfully for "${email}"`);
      console.log(`📊 Updated token balance: ${result.tokens}`);
      console.log(`💰 Tokens added: ${tokenCount}`);
      console.log(`📈 Previous balance: ${user.tokens}`);
      console.log(`🎯 New balance: ${result.tokens}`);
      
      return true;
    } else {
      console.log(`❌ Failed to add tokens for "${email}"`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error adding tokens:', error.message);
    return false;
  }
};

// Show usage information
const showUsage = () => {
  console.log('📖 Usage: node add-tokens.js <email> <tokenCount> [--force]');
  console.log('📖 Example: node add-tokens.js user@example.com 50');
  console.log('📖 Example: node add-tokens.js user@example.com 100 --force');
  console.log('\n📋 Options:');
  console.log('   --force    Skip confirmation prompt and add tokens immediately');
  console.log('\n📋 What this script does:');
  console.log('   • Adds specified number of tokens to user account');
  console.log('   • Updates user token balance in database');
  console.log('   • Shows before and after token balances');
  console.log('   • Validates email format and token count');
  console.log('\n⚠️  Note: This action cannot be undone!');
  console.log('\n💡 Token System Info:');
  console.log('   • Users start with 20 tokens by default');
  console.log('   • Tokens are used for AI actions and premium features');
  console.log('   • Token balance is stored in user.tokens field');
};

// Main execution
const main = async () => {
  const args = process.argv.slice(2);
  
  // Check if help is requested
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  // Check if email and token count are provided
  const email = args.find(arg => !arg.startsWith('--') && !Number.isInteger(parseInt(arg)));
  const tokenCount = parseInt(args.find(arg => !arg.startsWith('--') && Number.isInteger(parseInt(arg))));
  const force = args.includes('--force');
  
  if (!email) {
    console.log('❌ Please provide an email address');
    showUsage();
    process.exit(1);
  }

  if (!tokenCount || isNaN(tokenCount)) {
    console.log('❌ Please provide a valid token count (positive integer)');
    showUsage();
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Please provide a valid email address');
    process.exit(1);
  }

  console.log(`🪙 Adding tokens for: ${email}`);
  console.log(`📊 Token count: ${tokenCount}`);
  if (force) {
    console.log('⚡ Force mode enabled - skipping confirmation');
  }
  console.log('─'.repeat(60));

  // Connect to database
  await connectDB();

  // Add tokens
  const success = await addTokens(email, tokenCount, force);

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
