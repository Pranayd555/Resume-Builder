const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Template Details
  category: {
    type: String,
    required: [true, 'Template category is required'],
    enum: ['modern', 'classic', 'creative', 'minimalist', 'professional', 'academic'],
    default: 'modern'
  },
  
  // Visual Preview
  preview: {
    thumbnail: {
      url: {
        type: String,
        required: [true, 'Thumbnail URL is required']
      },
      publicId: String
    },
    fullPreview: {
      url: String,
      publicId: String
    }
  },
  
  // Template Structure
  layout: {
    type: {
      type: String,
      enum: ['single-column', 'two-column', 'three-column', 'sidebar'],
      required: [true, 'Layout type is required']
    },
    sections: [{
      name: {
        type: String,
        required: [true, 'Section name is required'],
        enum: [
          'personalInfo',
          'summary',
          'workExperience',
          'education',
          'skills',
          'projects',
          'achievements',
          'certifications',
          'languages',
          'customField',
          'customFields'
        ]
      },
      position: {
        type: Number,
        required: [true, 'Section position is required']
      },
      isRequired: {
        type: Boolean,
        default: false
      },
      isVisible: {
        type: Boolean,
        default: true
      },
      customization: {
        allowReordering: {
          type: Boolean,
          default: true
        },
        allowHiding: {
          type: Boolean,
          default: true
        },
        allowCustomStyling: {
          type: Boolean,
          default: true
        }
      }
    }]
  },
  
  // Styling Configuration
  styling: {
    colors: {
      primary: {
        type: String,
        default: '#2563eb'
      },
      secondary: {
        type: String,
        default: '#64748b'
      },
      accent: {
        type: String,
        default: '#0ea5e9'
      },
      text: {
        type: String,
        default: '#1f2937'
      },
      background: {
        type: String,
        default: '#ffffff'
      }
    },
    fonts: {
      primary: {
        type: String,
        default: 'Inter'
      },
      secondary: {
        type: String,
        default: 'Inter'
      },
      sizes: {
        heading: {
          type: Number,
          default: 24
        },
        subheading: {
          type: Number,
          default: 18
        },
        body: {
          type: Number,
          default: 12
        },
        small: {
          type: Number,
          default: 10
        }
      }
    },
    spacing: {
      margins: {
        top: {
          type: Number,
          default: 20
        },
        bottom: {
          type: Number,
          default: 20
        },
        left: {
          type: Number,
          default: 20
        },
        right: {
          type: Number,
          default: 20
        }
      },
      padding: {
        sections: {
          type: Number,
          default: 15
        },
        elements: {
          type: Number,
          default: 10
        }
      }
    },
    borders: {
      style: {
        type: String,
        enum: ['none', 'solid', 'dashed', 'dotted'],
        default: 'none'
      },
      width: {
        type: Number,
        default: 1
      },
      color: {
        type: String,
        default: '#e5e7eb'
      },
      radius: {
        type: Number,
        default: 4
      }
    }
  },
  
  // Availability
  availability: {
    tier: {
      type: String,
      enum: ['free', 'pro_monthly', 'pro_yearly', 'enterprise'],
      required: [true, 'Availability tier is required'],
      default: 'free'
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Template Code/Configuration
  templateCode: {
    html: {
      type: String,
      required: [true, 'HTML template is required']
    },
    css: {
      type: String,
      required: [true, 'CSS styles are required']
    },
    javascript: {
      type: String,
      default: ''
    },
    variables: [{
      name: {
        type: String,
        required: [true, 'Variable name is required']
      },
      type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'color', 'font'],
        required: [true, 'Variable type is required']
      },
      defaultValue: mongoose.Schema.Types.Mixed,
      description: String
    }]
  },
  
  // Creator Info
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Usage Statistics
  usage: {
    totalUses: {
      type: Number,
      default: 0
    },
    uniqueUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Reviews
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tags for searchability
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Version Control
  version: {
    type: String,
    default: '1.0.0'
  },
  changelog: [{
    version: {
      type: String,
      required: true
    },
    changes: [{
      type: String,
      required: true
    }],
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
templateSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for popularity score
templateSchema.virtual('popularityScore').get(function() {
  const usageWeight = 0.6;
  const ratingWeight = 0.4;
  
  const normalizedUsage = Math.min(this.usage.totalUses / 1000, 1);
  const normalizedRating = this.averageRating / 5;
  
  return (normalizedUsage * usageWeight) + (normalizedRating * ratingWeight);
});

// Index for performance
templateSchema.index({ category: 1, 'availability.tier': 1 });
templateSchema.index({ 'availability.isPublic': 1, 'availability.isActive': 1 });
templateSchema.index({ creator: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ 'usage.totalUses': -1 });
templateSchema.index({ 'usage.rating.average': -1 });

// Pre-save middleware to update usage statistics
templateSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.usage.rating.count = this.reviews.length;
    this.usage.rating.average = this.averageRating;
  }
  next();
});

// Method to increment usage
templateSchema.methods.incrementUsage = function(userId) {
  return this.updateOne({
    $inc: { 'usage.totalUses': 1 },
    $addToSet: { 'usage.uniqueUsers': userId }
  });
};

// Method to add review
templateSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review from same user
  this.reviews = this.reviews.filter(review => !review.user.equals(userId));
  
  // Add new review
  this.reviews.push({
    user: userId,
    rating,
    comment,
    createdAt: new Date()
  });
  
  return this.save();
};

module.exports = mongoose.model('Template', templateSchema);