const mongoose = require("mongoose");

const { Schema } = mongoose;

// ── Sub Schemas ─────────────────────────────

const SocialSchema = new Schema({
  linkedin: String,
  github: String,
  twitter: String,
  dribbble: String,
  instagram: String,
}, { _id: false });

const MetricSchema = new Schema({
  value: String,
  label: String,
  color: String,
}, { _id: false });

const ExperienceSchema = new Schema({
  period: String,
  role: String,
  company: String,
  description: String,
  bullets: [String],
  isCurrent: Boolean,
}, { _id: false });

const SkillSchema = new Schema({
  label: String,
  icon: String,
  detail: String,
  color: String,
}, { _id: false });

const ProjectSchema = new Schema({
  title: String,
  category: String,
  type: String,
  description: String,
  image: String,
  tags: [String],
  link: String,
  isFeatured: Boolean,
}, { _id: false });

const EducationSchema = new Schema({
  year: String,
  degree: String,
  institution: String,
  detail: String,
}, { _id: false });

const CertificationSchema = new Schema({
  icon: String,
  label: String,
}, { _id: false });

const TestimonialSchema = new Schema({
  quote: String,
  name: String,
  title: String,
  avatar: String,
}, { _id: false });

const CTASchema = new Schema({
  heading: String,
  subtext: String,
  primaryLabel: String,
  secondaryLabel: String,
}, { _id: false });

// ── Main Schema ─────────────────────────────

const PortfolioSchema = new Schema(
  {
    // Owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // Only one portfolio per user
    },

    // Basic Info
    title: {
      type: String,
      required: [true, 'Portfolio title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    // Source Resume
    resumeUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: false // Portfolio can be created from scratch
    },

    // Template and Styling
    template: {
      type: String,
      enum: ['modern-interactive', 'minimalist-pro', 'creative-developer', 'corporate-executive'],
      default: 'modern-interactive'
    },
    // Identity
    name: String,
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true // Only one portfolio per user
    },
    title: String,
    tagline: String,
    bio: String,
    avatar: String,
    availabilityBadge: String,
    yearsOfExperience: String,

    // Current Status
    currentRole: String,
    currentCompany: String,
    location: String,
    email: String,
    cvUrl: String,

    // Socials
    socials: SocialSchema,

    // Metrics
    metrics: [MetricSchema],

    // Experience
    experience: [ExperienceSchema],

    // Skills
    skills: [SkillSchema],

    // Extra
    languages: [String],
    certifications: [String],
    coreCompetencies: [String],

    // Projects
    projects: [ProjectSchema],

    // Education
    education: [EducationSchema],

    certificationsList: [CertificationSchema],

    // Testimonials
    testimonials: [TestimonialSchema],

    // CTA
    cta: CTASchema,

    // Customization Options
    customization: {
      // Colors
      primaryColor: {
        type: String,
        default: '#3B82F6',
        trim: true,
        maxlength: [7, 'Color hex should be valid']
      },
      secondaryColor: {
        type: String,
        default: '#64748B',
        trim: true,
        maxlength: [7, 'Color hex should be valid']
      },
      accentColor: {
        type: String,
        default: '#0EA5E9',
        trim: true,
        maxlength: [7, 'Color hex should be valid']
      },
      backgroundColor: {
        type: String,
        default: '#FFFFFF',
        trim: true,
        maxlength: [7, 'Color hex should be valid']
      },
      textColor: {
        type: String,
        default: '#1F2937',
        trim: true,
        maxlength: [7, 'Color hex should be valid']
      },

      // Section-specific colors
      sectionColors: {
        workExperience: {
          type: String,
          default: '#3B82F6'
        },
        projects: {
          type: String,
          default: '#8B5CF6'
        },
        skills: {
          type: String,
          default: '#10B981'
        },
        certifications: {
          type: String,
          default: '#F59E0B'
        },
        languages: {
          type: String,
          default: '#EF4444'
        }
      },

      // Fonts
      primaryFont: {
        type: String,
        default: 'InterVar, system-ui, sans-serif',
        trim: true,
        maxlength: [200, 'Font name cannot exceed 200 characters']
      },
      secondaryFont: {
        type: String,
        default: 'InterVar, system-ui, sans-serif',
        trim: true,
        maxlength: [200, 'Font name cannot exceed 200 characters']
      },

      // Font Sizes
      headingFontSize: {
        type: String,
        default: 'large',
        enum: ['small', 'medium', 'large']
      },
      bodyFontSize: {
        type: String,
        default: 'medium',
        enum: ['small', 'medium', 'large']
      },

      // Spacing
      spacing: {
        type: String,
        default: 'normal',
        enum: ['compact', 'normal', 'spacious']
      },

      // Section Visibility
      visibleSections: {
        summary: {
          type: Boolean,
          default: true
        },
        workExperience: {
          type: Boolean,
          default: true
        },
        projects: {
          type: Boolean,
          default: true
        },
        skills: {
          type: Boolean,
          default: true
        },
        certifications: {
          type: Boolean,
          default: true
        },
        languages: {
          type: Boolean,
          default: true
        }
      }
    },

    // Publication Status
    isLive: {
      type: Boolean,
      default: false
    },

    liveLink: {
      type: String,
      trim: true,
      maxlength: [500, 'Live link cannot exceed 500 characters'],
      sparse: true, // Allow null values without unique constraint issues
      unique: function () {
        return this.isLive; // Only enforce unique when portfolio is live
      }
    },

    // Analytics
    analytics: {
      views: {
        type: Number,
        default: 0
      },
      lastViewed: Date,
      downloads: {
        type: Number,
        default: 0
      },
      lastDownloaded: Date,
      shares: {
        type: Number,
        default: 0
      }
    },
    // Status
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },

    // Deletion Management
    markedForDeletion: {
      type: Boolean,
      default: false
    },
    deletionDate: Date,
    deletionReason: {
      type: String,
      enum: ['subscription_expired', 'user_request', 'admin_action', null],
      default: null
    }
  },
  {
    timestamps: true,
  }
);


// Indexes for performance
PortfolioSchema.index({ user: 1 });
PortfolioSchema.index({ user: 1, isLive: 1 });
PortfolioSchema.index({ liveLink: 1 });

// Pre-save middleware
PortfolioSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Generate live link if portfolio is being published
  if (this.isLive && !this.liveLink) {
    // Generate a unique slug from user ID and portfolio ID
    this.liveLink = `/portfolio/${this.username}`;
  }

  // Clear live link if portfolio is being unpublished
  if (!this.isLive) {
    this.liveLink = null;
  }

  next();
});

// Method to get completion percentage
PortfolioSchema.methods.getCompletionPercentage = function () {
  let completed = 0;
  let total = 6; // Total sections

  if (this.personalInfo.fullName && this.personalInfo.email) completed++;
  if (this.summary) completed++;
  if (this.workExperience && this.workExperience.length > 0) completed++;
  if (this.projects && this.projects.length > 0) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  if (this.template) completed++;

  return Math.round((completed / total) * 100);
};

module.exports = mongoose.model('Portfolio', PortfolioSchema);
