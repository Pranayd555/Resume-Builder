const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Subscription Details
  plan: {
    type: String,
    enum: ['free', 'pro_monthly', 'pro_yearly'],
    required: [true, 'Subscription plan is required'],
    default: 'free'
  },
  
  // Billing Information
  billing: {
    cycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: function() {
        return this.plan !== 'free' && this.status !== 'trialing';
      },
      default: 'monthly'
    },
    amount: {
      type: Number,
      required: function() {
        return this.plan !== 'free' && this.status !== 'trialing';
      },
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    nextBillingDate: {
      type: Date,
      required: function() {
        return this.plan !== 'free' && this.status === 'active' && this.status !== 'trialing';
      }
    },
    trialEnd: Date,
    trialType: {
      type: String,
      enum: ['free', null],
      default: null
    },
    discountCode: String,
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    }
  },
  
  // Subscription Status
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing', 'suspended'],
    required: [true, 'Subscription status is required'],
    default: 'active'
  },
  
  // Dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: function() {
      return this.status === 'canceled';
    }
  },
  canceledAt: Date,
  cancelReason: {
    type: String,
    maxlength: [500, 'Cancel reason cannot exceed 500 characters']
  },
  
  // Payment Integration - Removed Stripe integration
  
  // Subscription Expiration Data
  expiredResumeData: {
    keptResumes: [mongoose.Schema.Types.ObjectId],
    markedForDeletion: [mongoose.Schema.Types.ObjectId],
    deletionDate: Date,
    originalCount: Number
  },
  
  // Features and Limits
  features: {
    resumeLimit: {
      type: Number,
      default: function() {
        // Trial users get Pro plan limits
        if (this.status === 'trialing') {
          return 5;
        }
        const limits = {
          free: 2,
          pro_monthly: 5,
          pro_yearly: 5
        };
        return limits[this.plan] || 2;
      }
    },
    templateAccess: {
      type: [String],
      default: function() {
        const access = {
          free: ['free'],
          pro_monthly: ['free', 'premium'],
          pro_yearly: ['free', 'premium']
        };
        return access[this.plan] || ['free'];
      }
    },
    exportFormats: {
      type: [String],
      default: function() {
        const formats = {
          free: ['pdf'],
          pro_monthly: ['pdf'],
          pro_yearly: ['pdf']
        };
        return formats[this.plan] || ['pdf'];
      }
    },
    aiActionsLimit: {
      type: String,
      default: function() {
        const limits = {
          free: 'token-based',
          pro_monthly: 'token-based',
          pro_yearly: 'token-based'
        };
        return limits[this.plan] || 'token-based';
      }
    },
    freeTokens: {
      type: Number,
      default: function() {
        if (this.status === 'trialing') {
          return 0;
        }
        const tokens = {
          free: 0,
          pro_monthly: 150,
          pro_yearly: 300
        };
        return tokens[this.plan] || 0;
      }
    },
    aiReview: {
      type: Boolean,
      default: function() {
        return this.plan === 'pro_monthly' || this.plan === 'pro_yearly';
      }
    },
    prioritySupport: {
      type: Boolean,
      default: function() {
        return this.plan === 'pro_monthly' || this.plan === 'pro_yearly';
      }
    },
    customBranding: {
      type: Boolean,
      default: function() {
        return this.plan === 'pro_yearly';
      }
    },
    unlimitedExports: {
      type: Boolean,
      default: function() {
        return this.plan === 'pro_monthly' || this.plan === 'pro_yearly';
      }
    }
  },
  
  // Usage Tracking (Subscription cycle-based for AI, Total for resumes)
  usage: {
    resumesCreated: {
      type: Number,
      default: 0
    },
    aiActionsThisCycle: {
      type: Number,
      default: 0
    },
    freeTokensUsed: {
      type: Number,
      default: 0
    },
    cycleStartDate: {
      type: Date,
      default: Date.now
    },
    lastBillingCycleReset: {
      type: Date,
      default: Date.now
    }
  },
  
  // Payment History
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      required: true
    },
    paymentId: String,
    invoiceId: String,
    description: String,
    paidAt: Date,
    failureReason: String,
    refundedAt: Date,
    refundReason: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Notifications
  notifications: {
    billingReminder: {
      type: Boolean,
      default: true
    },
    paymentFailed: {
      type: Boolean,
      default: true
    },
    subscriptionExpiry: {
      type: Boolean,
      default: true
    },
    featureUpdates: {
      type: Boolean,
      default: true
    }
  },
  
  // Trial History
  hasHadTrial: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    },
    campaign: String,
    referrer: String,
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subscription remaining days
subscriptionSchema.virtual('remainingDays').get(function() {
  if (this.status !== 'active' || !this.billing.nextBillingDate) return 0;
  
  const now = new Date();
  const nextBilling = new Date(this.billing.nextBillingDate);
  const diffTime = nextBilling - now;
  
  // Use Math.floor to get complete days remaining, not partial days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
});

// Virtual for subscription value
subscriptionSchema.virtual('monthlyValue').get(function() {
  if (this.plan === 'free') return 0;
  
  if (this.billing.cycle === 'monthly') {
    return this.billing.amount;
  } else {
    return this.billing.amount / 12;
  }
});

// Virtual for is expired
subscriptionSchema.virtual('isExpired').get(function() {
  if (this.plan === 'free') return false;
  
  return this.status === 'canceled' && 
         this.endDate && 
         new Date() > new Date(this.endDate);
});

// Virtual for is trial
subscriptionSchema.virtual('isTrial').get(function() {
  return this.status === 'trialing' && 
         this.billing.trialEnd && 
         new Date() < new Date(this.billing.trialEnd);
});

// Virtual for trial remaining days
subscriptionSchema.virtual('trialRemainingDays').get(function() {
  if (!this.isTrial) return 0;
  
  const now = new Date();
  const trialEnd = new Date(this.billing.trialEnd);
  const diffTime = trialEnd - now;
  
  // Use Math.floor to get complete days remaining, not partial days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
});

// Index for performance
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
// Removed Stripe indexes
subscriptionSchema.index({ 'billing.nextBillingDate': 1 });

// Method to check if trial is still active
subscriptionSchema.methods.isTrialActive = function() {
  if (this.status !== 'trialing' || (this.plan !== 'pro_monthly' && this.plan !== 'pro_yearly')) {
    return false;
  }
  
  if (!this.billing?.trialEnd) {
    return false;
  }
  
  const now = new Date();
  const trialEnd = new Date(this.billing.trialEnd);
  
  return trialEnd > now;
};

// Method to check if trial has expired
subscriptionSchema.methods.hasTrialExpired = function() {
  if (this.status !== 'trialing' || (this.plan !== 'pro_monthly' && this.plan !== 'pro_yearly')) {
    return false;
  }
  
  if (!this.billing?.trialEnd) {
    return true; // No trial end date means expired
  }
  
  const now = new Date();
  const trialEnd = new Date(this.billing.trialEnd);
  
  return trialEnd <= now;
};

// Method to expire trial
subscriptionSchema.methods.expireTrial = function() {
  if (this.status === 'trialing' && (this.plan === 'pro_monthly' || this.plan === 'pro_yearly')) {
    this.status = 'active';
    this.plan = 'free';
    this.billing.trialEnd = undefined;
    this.billing.trialType = undefined;
    
    // Reset to free plan features
    this.features.resumeLimit = 2;
    this.features.templateAccess = ['free'];
    this.features.exportFormats = ['pdf'];
    this.features.aiActionsLimit = 'token-based';
    this.features.freeTokens = 0;
    this.features.aiReview = false;
    this.features.prioritySupport = false;
    this.features.customBranding = false;
    this.features.unlimitedExports = false;
    
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save middleware to check trial expiration
subscriptionSchema.pre('save', function(next) {
  // Check if trial has expired
  if (this.status === 'trialing' && (this.plan === 'pro_monthly' || this.plan === 'pro_yearly') && this.hasTrialExpired()) {
    this.status = 'active';
    this.plan = 'free';
    this.billing.trialEnd = undefined;
    this.billing.trialType = undefined;
    
    // Reset to free plan features
    this.features.resumeLimit = 2;
    this.features.templateAccess = ['free'];
    this.features.exportFormats = ['pdf'];
    this.features.aiActionsLimit = 'token-based';
    this.features.freeTokens = 0;
    this.features.aiReview = false;
    this.features.prioritySupport = false;
    this.features.customBranding = false;
    this.features.unlimitedExports = false;
  }
  
  // Update features based on plan
  if (this.isModified('plan') || this.isModified('status')) {
    // Trial users get Pro plan limits
    if (this.status === 'trialing') {
      this.features.resumeLimit = 5;
      this.features.templateAccess = ['free', 'premium'];
      this.features.exportFormats = ['pdf'];
      this.features.aiActionsLimit = 'token-based';
      this.features.freeTokens = 0; // No free tokens during trial
      this.features.aiReview = true;
      this.features.prioritySupport = true;
      this.features.customBranding = this.plan === 'pro_yearly';
      this.features.unlimitedExports = true;
    } else {
      const limits = {
        free: 2,
        pro_monthly: 5,
        pro_yearly: 5
      };
      
      const templateAccess = {
        free: ['free'],
        pro_monthly: ['free', 'premium'],
        pro_yearly: ['free', 'premium']
      };
      
      const exportFormats = {
        free: ['pdf'],
        pro_monthly: ['pdf'],
        pro_yearly: ['pdf']
      };
      
      const aiLimits = {
        free: 'token-based',
        pro_monthly: 'token-based',
        pro_yearly: 'token-based'
      };
      
      const freeTokens = {
        free: 0,
        pro_monthly: 150,
        pro_yearly: 300
      };
      
      this.features.resumeLimit = limits[this.plan] || 2;
      this.features.templateAccess = templateAccess[this.plan] || ['free'];
      this.features.exportFormats = exportFormats[this.plan] || ['pdf'];
      this.features.aiActionsLimit = aiLimits[this.plan] || 'token-based';
      this.features.freeTokens = freeTokens[this.plan] || 0;
      this.features.aiReview = this.plan === 'pro_monthly' || this.plan === 'pro_yearly';
      this.features.prioritySupport = this.plan === 'pro_monthly' || this.plan === 'pro_yearly';
      this.features.customBranding = this.plan === 'pro_yearly';
      this.features.unlimitedExports = this.plan === 'pro_monthly' || this.plan === 'pro_yearly';
    }
  }
  next();
});

// Ensure subscription cycle window is aligned to billing cycle; reset counters if cycle changed
function ensureSubscriptionCycleWindow(subscriptionDoc) {
  const now = new Date();
  
  // Ensure usage object exists
  if (!subscriptionDoc.usage) {
    subscriptionDoc.usage = {
      resumesCreated: 0,
      aiActionsThisCycle: 0,
      cycleStartDate: subscriptionDoc.startDate || now,
      lastBillingCycleReset: now
    };
    return;
  }
  
  // For free users, reset monthly (calendar month)
  if (subscriptionDoc.plan === 'free') {
    const currentMonthStartUtc = new Date(now.getFullYear(), now.getMonth(), 1);
    const stored = subscriptionDoc.usage.lastBillingCycleReset;
    
    if (!stored || new Date(stored).getTime() !== currentMonthStartUtc.getTime()) {
      subscriptionDoc.usage.lastBillingCycleReset = currentMonthStartUtc;
      subscriptionDoc.usage.aiActionsThisCycle = 0;
      subscriptionDoc.usage.cycleStartDate = currentMonthStartUtc;
    }
    return;
  }
  
  // For paid users, check if billing cycle has passed
  if (subscriptionDoc.billing?.nextBillingDate) {
    const nextBilling = new Date(subscriptionDoc.billing.nextBillingDate);
    const lastReset = new Date(subscriptionDoc.usage.lastBillingCycleReset);
    
    // If we've passed the next billing date, reset the cycle
    if (now >= nextBilling && lastReset < nextBilling) {
      subscriptionDoc.usage.lastBillingCycleReset = now;
      subscriptionDoc.usage.aiActionsThisCycle = 0;
      subscriptionDoc.usage.cycleStartDate = now;
      
      // Update next billing date for the next cycle
      // Always monthly billing
      subscriptionDoc.billing.nextBillingDate = new Date(nextBilling.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}

// Method to check if user can create resume (total limit, not weekly)
subscriptionSchema.methods.canCreateResume = async function() {
  const Resume = require('./Resume');
  
  // Count actual resumes in database for this user
  const actualResumeCount = await Resume.countDocuments({ user: this.user });
  
  // Update the usage tracking to reflect actual count
  this.usage.resumesCreated = actualResumeCount;
  
  return actualResumeCount < this.features.resumeLimit;
};

// Method to check if user can access template
subscriptionSchema.methods.canAccessTemplate = function(templateTier) {
  // Trial users get full template access
  if (this.isTrialActive()) {
    return true; // Full access during trial
  }
  return this.features.templateAccess.includes(templateTier);
};

// Method to check if user can export in format (unlimited exports for both tiers)
subscriptionSchema.methods.canExportFormat = function(format) {
  // Free: pdf only; Pro or trial: pdf + docx
  if (this.isTrialActive() || this.plan === 'pro_monthly' || this.plan === 'pro_yearly') {
    return ['pdf'].includes(format);
  }
  return ['pdf'].includes(format);
};

// Method to check if user can use AI action (token-based system)
subscriptionSchema.methods.canUseAIAction = async function() {
  ensureSubscriptionCycleWindow(this);
  
  // For token-based system, check if user has any tokens available (purchased + free)
  if (this.features.aiActionsLimit === 'token-based') {
    // Get user's purchased tokens
    const User = require('./User');
    const user = await User.findById(this.user).select('tokens');
    const purchasedTokens = user?.tokens || 0;
    
    // Calculate remaining free tokens
    const freeTokensUsed = this.usage.freeTokensUsed || 0;
    const remainingFreeTokens = Math.max(0, (this.features.freeTokens || 0) - freeTokensUsed);
    
    // User can use AI if they have any tokens (purchased + remaining free)
    const totalAvailableTokens = purchasedTokens + remainingFreeTokens;
    return totalAvailableTokens > 0;
  }
  
  // Fallback for non-token-based systems
  return this.usage.aiActionsThisCycle < this.features.aiActionsLimit;
};

// Method to ensure subscription cycle window and save if changed
subscriptionSchema.methods.ensureSubscriptionCycleWindowAndSave = function() {
  const beforeCount = this.usage.aiActionsThisCycle;
  ensureSubscriptionCycleWindow(this);
  const afterCount = this.usage.aiActionsThisCycle;
  
  // If the count changed (reset happened), save the document
  return this.save();
};


// Method to check if user can start a trial
subscriptionSchema.methods.canStartTrial = function() {
  return !this.hasHadTrial && this.plan === 'free' && this.status !== 'trialing';
};

// Method to increment usage (subscription cycle-based)
subscriptionSchema.methods.incrementUsage = async function(type) {
  switch (type) {
    case 'resume':
      this.usage.resumesCreated += 1;
      break;
    case 'aiAction':
      ensureSubscriptionCycleWindow(this);
      if (this.features.aiActionsLimit === 'token-based') {
        // For token-based system, handle token deduction properly
        const User = require('./User');
        const user = await User.findById(this.user).select('tokens');
        
        // Calculate remaining free tokens
        const freeTokensUsed = this.usage.freeTokensUsed || 0;
        const remainingFreeTokens = Math.max(0, (this.features.freeTokens || 0) - freeTokensUsed);
        
        if (remainingFreeTokens > 0) {
          // Use free tokens first
          this.usage.freeTokensUsed += 1;
        } else if (user.tokens > 0) {
          // Use purchased tokens when free tokens are exhausted
          await user.consumeTokens(1);
        } else {
          // No tokens available
          throw new Error('No tokens available');
        }
      } else {
        // For traditional system, increment AI actions
        this.usage.aiActionsThisCycle += 1;
      }
      break;
  }
  return this.save();
};

// Method to get actual resume count since subscription started
subscriptionSchema.methods.getActualResumeCount = async function() {
  const Resume = require('./Resume');
  
  // Get the subscription start date
  let startDate;
  
  if (this.status === 'trialing' && this.billing?.trialEnd) {
    // For trial users, count from trial start (trialEnd - trial duration)
    const trialDuration = this.billing.trialType === 'free' ? 3 : 3; // days
    startDate = new Date(this.billing.trialEnd);
    startDate.setDate(startDate.getDate() - trialDuration);
  } else if (this.createdAt) {
    // For regular subscriptions, count from subscription creation
    startDate = this.createdAt;
  } else {
    // Fallback to current date if no start date found
    startDate = new Date();
  }
  
  // Count resumes created after the subscription/trial started
  const resumeCount = await Resume.countDocuments({
    user: this.user,
    createdAt: { $gte: startDate }
  });
  
  return resumeCount;
};

// Method to recalculate and update resume count
subscriptionSchema.methods.recalculateResumeCount = async function() {
  const actualCount = await this.getActualResumeCount();
  this.usage.resumesCreated = actualCount;
  return this.save();
};

// Method to add payment record
subscriptionSchema.methods.addPayment = function(paymentData) {
  this.paymentHistory.push({
    amount: paymentData.amount,
    currency: paymentData.currency || 'INR',
    status: paymentData.status,
    paymentId: paymentData.paymentId,
    invoiceId: paymentData.invoiceId,
    description: paymentData.description,
    paidAt: paymentData.paidAt || new Date(),
    failureReason: paymentData.failureReason,
    metadata: paymentData.metadata
  });
  
  return this.save();
};

// Method to start trial
subscriptionSchema.methods.startTrial = function(trialType = 'free', days = 3, planType = 'pro_monthly') {
  this.status = 'trialing';
  this.plan = planType;
  this.billing.trialType = trialType;
  this.billing.trialEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  this.hasHadTrial = true;
  
  return this.save();
};

// Method to manually reset AI action cycle (for admin/testing purposes)
subscriptionSchema.methods.resetAIActionCycle = function() {
  this.usage.aiActionsThisCycle = 0;
  this.usage.freeTokensUsed = 0; // Reset free tokens used
  this.usage.lastBillingCycleReset = new Date();
  this.usage.cycleStartDate = new Date();
  
  // For paid users, also update next billing date
  if (this.billing?.nextBillingDate) {
    const now = new Date();
    // Always monthly billing
    this.billing.nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  
  return this.save();
};

// Method to fix trial subscription features (for existing trial subscriptions)
subscriptionSchema.methods.fixTrialFeatures = function() {
  if (this.status === 'trialing') {
    this.features.resumeLimit = 5;
    this.features.templateAccess = ['free', 'premium'];
    this.features.exportFormats = ['pdf'];
    this.features.aiActionsLimit = 'token-based';
    this.features.freeTokens = 0;
    this.features.aiReview = true;
    this.features.prioritySupport = true;
    this.features.customBranding = this.plan === 'pro_yearly';
    this.features.unlimitedExports = true;
  }
  return this.save();
};

// Method to get subscription status for API responses
subscriptionSchema.methods.getSubscriptionStatus = function() {
  return {
    plan: this.plan,
    status: this.status,
    isActive: this.status === 'active' || this.status === 'trialing',
    isTrial: this.isTrial,
    isExpired: this.isExpired,
    remainingDays: this.remainingDays,
    trialRemainingDays: this.trialRemainingDays,
    features: this.features,
    usage: this.usage,
    billing: this.billing,
    startDate: this.startDate,
    endDate: this.endDate
  };
};

// Method to activate pro plan
subscriptionSchema.methods.activatePro = function(planType, billingCycle = 'monthly') {
  this.plan = planType === 'monthly' ? 'pro_monthly' : 'pro_yearly';
  this.status = 'active';
  this.billing.cycle = billingCycle;
  this.billing.amount = planType === 'monthly' ? 999 : 9999; // Example amounts in paise
  this.billing.currency = 'INR';
  
  // Set next billing date
  const now = new Date();
  if (billingCycle === 'monthly') {
    this.billing.nextBillingDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else {
    this.billing.nextBillingDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  
  // Clear trial data
  this.billing.trialEnd = undefined;
  this.billing.trialType = undefined;
  
  return this.save();
};

// Method to cancel subscription
subscriptionSchema.methods.cancelSubscription = function(reason = '') {
  this.status = 'canceled';
  this.endDate = new Date();
  this.canceledAt = new Date();
  this.cancelReason = reason;
  
  return this.save();
};

// Method to reset to free plan
subscriptionSchema.methods.resetToFreePlan = function() {
  this.plan = 'free';
  this.status = 'active';
  this.billing = {
    cycle: undefined,
    amount: undefined,
    currency: 'INR',
    nextBillingDate: undefined,
    trialEnd: undefined,
    trialType: undefined
  };
  this.endDate = undefined;
  this.canceledAt = undefined;
  this.cancelReason = undefined;
  
  // Reset features to free plan
  this.features.resumeLimit = 2;
  this.features.templateAccess = ['free'];
  this.features.exportFormats = ['pdf'];
  this.features.aiActionsLimit = 'token-based';
  this.features.freeTokens = 0;
  this.features.aiReview = false;
  this.features.prioritySupport = false;
  this.features.customBranding = false;
  this.features.unlimitedExports = false;
  
  return this.save();
};




// Static method to create trial subscription
subscriptionSchema.statics.createTrial = function(userId, trialType = 'free', days = 3, planType = 'pro_monthly') {
  return new this({
    user: userId,
    plan: planType, // Can be 'pro_monthly' or 'pro_yearly'
    status: 'trialing',
    hasHadTrial: true,
    billing: {
      trialType: trialType,
      trialEnd: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    },
    features: {
      resumeLimit: 5, // Trial users get Pro plan limits
      templateAccess: ['free', 'premium'],
      exportFormats: ['pdf'],
      aiActionsLimit: 'token-based',
      freeTokens: 0, // No free tokens during trial
      aiReview: true,
      prioritySupport: true,
      customBranding: planType === 'pro_yearly',
      unlimitedExports: true
    },
    usage: {
      resumesCreated: 0,
      aiActionsThisCycle: 0,
      freeTokensUsed: 0,
      cycleStartDate: new Date(),
      lastBillingCycleReset: new Date()
    }
  });
};

// Static method to get or create subscription for user
subscriptionSchema.statics.getOrCreateSubscription = async function(userId) {
  let subscription = await this.findOne({ user: userId });
  
  if (!subscription) {
    // Create default free subscription
    subscription = new this({
      user: userId,
      plan: 'free',
      status: 'active',
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
      }
    });
    
    await subscription.save();
  }
  
  return subscription;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);