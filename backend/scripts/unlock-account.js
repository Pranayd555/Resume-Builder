#!/usr/bin/env node

/**
 * Script to unlock a user account by email address
 * Usage: node unlock-account.js <email>
 * Example: node unlock-account.js user@example.com
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

// Unlock account function
const unlockAccount = async (email) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      return false;
    }

    // Check if account is currently locked
    if (!user.isLocked) {
      console.log(`ℹ️ Account for "${email}" is not currently locked`);
      return true;
    }

    // Unlock the account
    const result = await User.findByIdAndUpdate(
      user._id,
      {
        $unset: { 
          loginAttempts: 1, 
          lockUntil: 1 
        }
      },
      { new: true }
    );

    if (result) {
      console.log(`✅ Account unlocked successfully for "${email}"`);
      console.log(`📊 Login attempts reset to 0`);
      console.log(`🔓 Lock removed`);
      return true;
    } else {
      console.log(`❌ Failed to unlock account for "${email}"`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error unlocking account:', error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  // Check if email is provided
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Please provide an email address');
    console.log('Usage: node unlock-account.js <email>');
    console.log('Example: node unlock-account.js user@example.com');
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ Please provide a valid email address');
    process.exit(1);
  }

  console.log(`🔓 Attempting to unlock account for: ${email}`);
  console.log('─'.repeat(50));

  // Connect to database
  await connectDB();

  // Unlock the account
  const success = await unlockAccount(email);

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

// Run the script
main().catch((error) => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});

