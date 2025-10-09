const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.linkedinId;
    },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  // Profile Info
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Profile Picture - Either uploaded photo OR avatar URL (mutually exclusive)
  profilePicture: {
    type: {
      type: String,
      enum: ['uploaded', 'avatar'],
      required: false
    },
    // For uploaded photos
    uploadedPhoto: {
      url: String,          // Original/large image (400x400)
      thumbnailUrl: String, // Medium thumbnail (150x150)
      avatarUrl: String,    // Small avatar (50x50)
      originalPath: String, // Local file path for original image
      thumbnailPath: String, // Local file path for thumbnail
      avatarPath: String,   // Local file path for avatar
      fileName: String      // Base filename for reference
    },
    // For avatar URLs
    avatarUrl: {
      type: String,
      trim: true
    }
  },
  
  // OAuth IDs
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  linkedinId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      }
    },
    // Stripe integration removed
  },
  
  // Usage Limits
  usage: {
    resumesCreated: {
      type: Number,
      default: 0
    },
    templatesUsed: [{
      templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template'
      },
      usedAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    }
  },
  
  // Token System
  tokens: {
    type: Number,
    default: 20,
    min: 0
  },
  
  // Razorpay Transaction History (last 20 transactions)
  razorpayTransactions: [{
    transactionId: {
      type: String,
      required: true
    },
    orderId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
      required: true
    },
    paymentId: String,
    signature: String,
    method: String,
    bank: String,
    wallet: String,
    vpa: String,
    email: String,
    contact: String,
    fee: Number,
    tax: Number,
    errorCode: String,
    errorDescription: String,
    errorSource: String,
    errorStep: String,
    errorReason: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    capturedAt: Date,
    refundedAt: Date,
    notes: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Security
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  emailOtp: String,
  emailOtpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for subscription status
userSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscription.isActive && this.subscription.endDate > new Date();
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  // Guard against users without a password (e.g., OAuth accounts)
  if (!this.password || typeof this.password !== 'string') {
    return false;
  }
  if (!enteredPassword || typeof enteredPassword !== 'string') {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Method to generate refresh token
userSchema.methods.getRefreshToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: '30d' 
    }
  );
};

// Method to check subscription limits
userSchema.methods.canCreateResume = function() {
  const limits = {
    free: 3,
    pro: Infinity,
    enterprise: Infinity
  };
  
  return this.usage.resumesCreated < limits[this.subscription.plan];
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we have exceeded max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 10 * 60 * 1000 }; // 10 min
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to generate email OTP
userSchema.methods.generateEmailOtp = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiration (10 minutes)
  this.emailOtp = otp;
  this.emailOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return otp;
};

// Method to verify email OTP
userSchema.methods.verifyEmailOtp = function(otp) {
  // Check if OTP exists and hasn't expired
  if (!this.emailOtp || !this.emailOtpExpire) {
    return false;
  }
  
  if (Date.now() > this.emailOtpExpire) {
    return false;
  }
  
  // Verify OTP
  if (this.emailOtp !== otp) {
    return false;
  }
  
  // Clear OTP and mark email as verified
  this.emailOtp = undefined;
  this.emailOtpExpire = undefined;
  this.isEmailVerified = true;
  
  return true;
};

// Method to clear email OTP
userSchema.methods.clearEmailOtp = function() {
  this.emailOtp = undefined;
  this.emailOtpExpire = undefined;
};

// Method to check if user has enough tokens
userSchema.methods.hasTokens = function(requiredTokens = 1) {
  return this.tokens >= requiredTokens;
};

// Method to consume tokens
userSchema.methods.consumeTokens = function(tokensToConsume = 1) {
  if (this.tokens < tokensToConsume) {
    throw new Error('Insufficient tokens');
  }
  this.tokens -= tokensToConsume;
  return this.save();
};

// Method to add tokens
userSchema.methods.addTokens = function(tokensToAdd) {
  this.tokens += tokensToAdd;
  return this.save();
};

// Method to add Razorpay transaction (maintains last 20 transactions)
userSchema.methods.addRazorpayTransaction = function(transactionData) {
  // Add new transaction to the beginning of the array
  this.razorpayTransactions.unshift(transactionData);
  
  // Keep only the last 20 transactions
  if (this.razorpayTransactions.length > 20) {
    this.razorpayTransactions = this.razorpayTransactions.slice(0, 20);
  }
  
  return this.save();
};

// Method to update transaction status
userSchema.methods.updateTransactionStatus = function(transactionId, status, additionalData = {}) {
  const transaction = this.razorpayTransactions.find(t => t.transactionId === transactionId);
  if (transaction) {
    transaction.status = status;
    Object.assign(transaction, additionalData);
    
    // Set timestamps based on status
    if (status === 'captured') {
      transaction.capturedAt = new Date();
    } else if (status === 'refunded') {
      transaction.refundedAt = new Date();
    }
    
    return this.save();
  }
  return false;
};

// Method to get transaction history
userSchema.methods.getTransactionHistory = function(limit = 20) {
  return this.razorpayTransactions.slice(0, limit);
};

// Method to get transaction by ID
userSchema.methods.getTransactionById = function(transactionId) {
  return this.razorpayTransactions.find(t => t.transactionId === transactionId);
};

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ linkedinId: 1 });
userSchema.index({ 'razorpayTransactions.transactionId': 1 });
userSchema.index({ 'razorpayTransactions.orderId': 1 });
// Stripe indexes removed

module.exports = mongoose.model('User', userSchema); 