const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  profileImage: {
    type: String,
    default: ''
  },

  // Feedback Content
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },

  // Rating
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },

  // Additional Information
  userAgent: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  },

  // Status and Management
  status: {
    type: String,
    enum: ['new', 'reviewed', 'responded', 'resolved'],
    default: 'new'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    default: '',
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },

  // Response Information
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  respondedAt: {
    type: Date,
    default: null
  },
  response: {
    type: String,
    default: '',
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ email: 1 });
feedbackSchema.index({ user: 1 });

// Virtual for feedback age
feedbackSchema.virtual('age').get(function () {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for formatted rating
feedbackSchema.virtual('formattedRating').get(function () {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Static method to get feedback stats
feedbackSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalFeedback: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalFeedback: 1,
        averageRating: { $round: ['$averageRating', 2] },
        ratingDistribution: 1
      }
    }
  ]);

  if (stats.length > 0) {
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });
    stats[0].ratingDistribution = distribution;
  }

  return stats.length > 0 ? stats[0] : {
    totalFeedback: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };
};

// Instance method to mark as reviewed
feedbackSchema.methods.markAsReviewed = function (adminUser) {
  this.status = 'reviewed';
  this.respondedBy = adminUser._id;
  this.respondedAt = new Date();
  return this.save();
};

// Instance method to add response
feedbackSchema.methods.addResponse = function (response, adminUser) {
  this.response = response;
  this.status = 'responded';
  this.respondedBy = adminUser._id;
  this.respondedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Feedback', feedbackSchema);