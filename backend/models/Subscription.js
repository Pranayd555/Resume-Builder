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
    enum: ['free', 'pro'],
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
      }
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
      enum: ['free', 'paid', null],
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
  
  // Payment Integration
  stripe: {
    customerId: {
      type: String,
      required: function() {
        return this.plan !== 'free' && this.status !== 'trialing';
      }
    },
    subscriptionId: {
      type: String,
      required: function() {
        return this.plan !== 'free' && this.status !== 'trialing';
      }
    },
    priceId: String,
    invoiceId: String,
    paymentMethodId: String
  },
  
  // Features and Limits
  features: {
    resumeLimit: {
      type: Number,
      default: function() {
        const limits = {
          free: 1,
          pro: 50
        };
        return limits[this.plan] || 1;
      }
    },
    templateAccess: {
      type: [String],
      default: function() {
        const access = {
          free: ['free'],
          pro: ['free', 'pro']
        };
        return access[this.plan] || ['free'];
      }
    },
    exportFormats: {
      type: [String],
      default: function() {
        const formats = {
          free: ['pdf'],
          pro: ['pdf', 'docx']
        };
        return formats[this.plan] || ['pdf'];
      }
    },
    aiActionsLimit: {
      type: Number,
      default: function() {
        const limits = {
          free: 2,
          pro: 100
        };
        return limits[this.plan] || 2;
      }
    },
    aiReview: {
      type: Boolean,
      default: function() {
        return this.plan === 'pro';
      }
    },
    prioritySupport: {
      type: Boolean,
      default: function() {
        return this.plan === 'pro';
      }
    },
    customBranding: {
      type: Boolean,
      default: function() {
        return this.plan === 'pro';
      }
    },
    watermark: {
      type: Boolean,
      default: function() {
        return this.plan === 'free';
      }
    },
    unlimitedExports: {
      type: Boolean,
      default: function() {
        return this.plan === 'pro';
      }
    }
  },
  
  // Usage Tracking
  usage: {
    resumesCreated: {
      type: Number,
      default: 0
    },
    exportsThisMonth: {
      type: Number,
      default: 0
    },
    aiActionsThisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
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
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      required: true
    },
    stripePaymentIntentId: String,
    stripeInvoiceId: String,
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
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
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
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
});

// Index for performance
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ 'stripe.customerId': 1 });
subscriptionSchema.index({ 'stripe.subscriptionId': 1 });
subscriptionSchema.index({ 'billing.nextBillingDate': 1 });

// Method to check if trial is still active
subscriptionSchema.methods.isTrialActive = function() {
  if (this.status !== 'trialing' || this.plan !== 'pro') {
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
  if (this.status !== 'trialing' || this.plan !== 'pro') {
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
  if (this.status === 'trialing' && this.plan === 'pro') {
    this.status = 'active';
    this.plan = 'free';
    this.billing.trialEnd = undefined;
    this.billing.trialType = undefined;
    
    // Reset to free plan features
    this.features.resumeLimit = 1;
    this.features.templateAccess = ['free'];
    this.features.exportFormats = ['pdf'];
    this.features.aiActionsLimit = 2;
    this.features.aiReview = false;
    this.features.prioritySupport = false;
    this.features.customBranding = false;
    this.features.watermark = true;
    this.features.unlimitedExports = false;
    
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save middleware to check trial expiration
subscriptionSchema.pre('save', function(next) {
  // Check if trial has expired
  if (this.status === 'trialing' && this.plan === 'pro' && this.hasTrialExpired()) {
    this.status = 'active';
    this.plan = 'free';
    this.billing.trialEnd = undefined;
    this.billing.trialType = undefined;
    
    // Reset to free plan features
    this.features.resumeLimit = 1;
    this.features.templateAccess = ['free'];
    this.features.exportFormats = ['pdf'];
    this.features.aiActionsLimit = 2;
    this.features.aiReview = false;
    this.features.prioritySupport = false;
    this.features.customBranding = false;
    this.features.watermark = true;
    this.features.unlimitedExports = false;
  }
  
  // Update features based on plan
  if (this.isModified('plan')) {
    const limits = {
      free: 1,
      pro: 50
    };
    
    const templateAccess = {
      free: ['free'],
      pro: ['free', 'pro']
    };
    
    const exportFormats = {
      free: ['pdf'],
      pro: ['pdf', 'docx']
    };
    
    const aiLimits = {
      free: 2,
      pro: 100
    };
    
    this.features.resumeLimit = limits[this.plan] || 1;
    this.features.templateAccess = templateAccess[this.plan] || ['free'];
    this.features.exportFormats = exportFormats[this.plan] || ['pdf'];
    this.features.aiActionsLimit = aiLimits[this.plan] || 2;
    this.features.aiReview = this.plan === 'pro';
    this.features.prioritySupport = this.plan === 'pro';
    this.features.customBranding = this.plan === 'pro';
    this.features.watermark = this.plan === 'free';
    this.features.unlimitedExports = this.plan === 'pro';
  }
  next();
});

// Method to check if user can create resume
subscriptionSchema.methods.canCreateResume = function() {
  // Trial users get Pro limits
  if (this.isTrialActive()) {
    return this.usage.resumesCreated < 50; // Pro limit during trial
  }
  return this.usage.resumesCreated < this.features.resumeLimit;
};

// Method to check if user can access template
subscriptionSchema.methods.canAccessTemplate = function(templateTier) {
  // Trial users get full template access
  if (this.isTrialActive()) {
    return true; // Full access during trial
  }
  return this.features.templateAccess.includes(templateTier);
};

// Method to check if user can export in format
subscriptionSchema.methods.canExportFormat = function(format) {
  // Trial users get all export formats
  if (this.isTrialActive()) {
    return ['pdf', 'docx'].includes(format);
  }
  return this.features.exportFormats.includes(format);
};

// Method to check if user can use AI action
subscriptionSchema.methods.canUseAIAction = function() {
  // Trial users get Pro AI limits
  if (this.isTrialActive()) {
    return this.usage.aiActionsThisMonth < 100; // Pro limit during trial
  }
  return this.usage.aiActionsThisMonth < this.features.aiActionsLimit;
};

// Method to check if export should have watermark
subscriptionSchema.methods.shouldAddWatermark = function() {
  // Trial users get no watermark
  if (this.isTrialActive()) {
    return false;
  }
  return this.features.watermark;
};

// Method to check if user can start a trial
subscriptionSchema.methods.canStartTrial = function() {
  return !this.hasHadTrial && this.plan === 'free' && this.status !== 'trialing';
};

// Method to increment usage
subscriptionSchema.methods.incrementUsage = function(type) {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  // Reset monthly counters if it's a new month
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    // Reset counters first
    this.usage.exportsThisMonth = 0;
    this.usage.aiActionsThisMonth = 0;
    this.usage.lastResetDate = now;
  }
  
  // Increment the appropriate counter
  switch (type) {
    case 'resume':
      this.usage.resumesCreated += 1;
      break;
    case 'export':
      this.usage.exportsThisMonth += 1;
      break;
    case 'aiAction':
      this.usage.aiActionsThisMonth += 1;
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
    const trialDuration = this.billing.trialType === 'free' ? 3 : 7; // days
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
    currency: paymentData.currency || 'USD',
    status: paymentData.status,
    stripePaymentIntentId: paymentData.stripePaymentIntentId,
    stripeInvoiceId: paymentData.stripeInvoiceId,
    description: paymentData.description,
    paidAt: paymentData.paidAt || new Date(),
    failureReason: paymentData.failureReason,
    metadata: paymentData.metadata
  });
  
  return this.save();
};

// Method to start trial
subscriptionSchema.methods.startTrial = function(trialType = 'free', days = 3) {
  this.status = 'trialing';
  this.plan = 'pro';
  this.billing.trialType = trialType;
  this.billing.trialEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  this.hasHadTrial = true;
  
  return this.save();
};

// Static method to create trial subscription
subscriptionSchema.statics.createTrial = function(userId, trialType = 'free', days = 3) {
  return new this({
    user: userId,
    plan: 'pro',
    status: 'trialing',
    hasHadTrial: true,
    billing: {
      trialType: trialType,
      trialEnd: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    },
    usage: {
      resumesCreated: 0,
      exportsThisMonth: 0,
      aiActionsThisMonth: 0,
      lastResetDate: new Date()
    }
  });
};

module.exports = mongoose.model('Subscription', subscriptionSchema); 