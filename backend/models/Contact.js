const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Contact Information
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
  
  // Contact Content
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
  
  // Category for better organization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['general', 'technical', 'billing', 'feature', 'bug', 'partnership'],
    default: 'general'
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
    enum: ['new', 'in-progress', 'responded', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
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
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    default: '',
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ category: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ email: 1 });

// Virtual for contact age
contactSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for formatted category
contactSchema.virtual('categoryFormatted').get(function() {
  return this.category.charAt(0).toUpperCase() + this.category.slice(1).replace('-', ' ');
});

// Virtual for formatted priority
contactSchema.virtual('priorityFormatted').get(function() {
  return this.priority.charAt(0).toUpperCase() + this.priority.slice(1);
});

// Virtual for response status
contactSchema.virtual('hasResponse').get(function() {
  return this.response && this.response.trim().length > 0;
});

// Virtual for days since creation
contactSchema.virtual('daysSinceCreation').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to set priority based on category
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set priority based on category
    switch (this.category) {
      case 'bug':
        this.priority = 'high';
        break;
      case 'billing':
        this.priority = 'high';
        break;
      case 'technical':
        this.priority = 'medium';
        break;
      case 'partnership':
        this.priority = 'medium';
        break;
      case 'feature':
        this.priority = 'low';
        break;
      case 'general':
      default:
        this.priority = 'medium';
        break;
    }
  }
  next();
});

// Static method to get contact statistics
contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        responded: { $sum: { $cond: [{ $eq: ['$status', 'responded'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    new: 0,
    inProgress: 0,
    responded: 0,
    resolved: 0,
    closed: 0
  };
};

// Static method to get contacts by category
contactSchema.statics.getByCategory = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Contact', contactSchema);
