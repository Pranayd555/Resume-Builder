const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    required: true,
    enum: ['free', 'pro_monthly', 'pro_yearly'],
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive', 'cancelled', 'trialing'],
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  trialEndDate: {
    type: Date,
  },
  freeTokens: {
    type: Number,
    default: 0,
  },
  freeTokensUsed: {
    type: Number,
    default: 0,
  },
  resumeCount: {
    type: Number,
    default: 0,
  },
  maxResumes: {
    type: Number,
    default: 2,
  },
}, {
  timestamps: true,
});

// Virtual to check if subscription is currently active
subscriptionSchema.virtual('isActive').get(function () {
  return this.status === 'active' && (!this.endDate || this.endDate > new Date());
});

// Ensure plan defaults and limits are set consistently
subscriptionSchema.pre('save', function (next) {
  if (this.plan === 'free') {
    this.maxResumes = 2;
    this.freeTokens = this.freeTokens ?? 0;
  } else if (this.plan === 'pro_monthly') {
    this.maxResumes = 5;
    this.freeTokens = this.freeTokens ?? 150;
  } else if (this.plan === 'pro_yearly') {
    this.maxResumes = 5;
    this.freeTokens = this.freeTokens ?? 150;
  }
  next();
});

subscriptionSchema.index({ user: 1 }, { unique: true });
subscriptionSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

