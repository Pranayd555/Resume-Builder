const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  // Owner
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Basic Info
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  // Personal Information
  personalInfo: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, 'Website URL cannot exceed 200 characters']
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: [200, 'LinkedIn URL cannot exceed 200 characters']
    },
    github: {
      type: String,
      trim: true,
      maxlength: [200, 'GitHub URL cannot exceed 200 characters']
    },
    profilePicture: {
      type: String,
      trim: true,
      maxlength: [5000, 'Profile picture URL cannot exceed 500 characters']
    },
    isAddPhoto: {
      type: Boolean,
      default: false
    }
  },

  // Profile Summary
  summary: {
    type: String,
    trim: true,
    maxlength: [10000, 'Summary cannot exceed 10000 characters']
  },

  // Fresher status
  isFresher: {
    type: Boolean,
    default: false
  },

  // Work Experience
  workExperience: [{
    jobTitle: {
      type: String,
      required: function () {
        return !this.parent().isFresher;
      },
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      required: function () {
        return !this.parent().isFresher;
      },
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: function () {
        return !this.parent().isFresher;
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    isCurrentJob: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters']
    },
    achievements: [{
      type: String,
      trim: true,
      maxlength: [500, 'Achievement cannot exceed 500 characters']
    }]
  }],

  // Education
  education: [{
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters']
    },
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
      maxlength: [100, 'Institution cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return this.startDate ? value > this.startDate : true;
        },
        message: 'End date must be after start date'
      }
    },
    isCurrentlyStudying: {
      type: Boolean,
      default: false
    },
    gpa: {
      type: Number,
      min: [0, 'GPA cannot be negative'],
      max: [100.0, 'GPA cannot exceed 100.0']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters']
    }
  }],

  // Skills
  skills: [{
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
      maxlength: [500, 'Category cannot exceed 500 characters']
    },
    items: [{
      name: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true,
        maxlength: [500, 'Skill name cannot exceed 500 characters']
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
        validate: {
          validator: function (value) {
            return value === null || value === undefined || ['beginner', 'intermediate', 'advanced', 'expert'].includes(value);
          },
          message: 'Level must be one of: beginner, intermediate, advanced, expert'
        }
      }
    }]
  }],

  // Projects
  projects: [{
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters']
    },
    technologies: [{
      type: String,
      trim: true,
      maxlength: [50, 'Technology cannot exceed 50 characters']
    }],
    url: {
      type: String,
      trim: true,
      maxlength: [200, 'URL cannot exceed 200 characters']
    },
    githubUrl: {
      type: String,
      trim: true,
      maxlength: [200, 'GitHub URL cannot exceed 200 characters']
    },
    startDate: Date,
    endDate: Date
  }],

  // Achievements/Awards
  achievements: [{
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [10000, 'Description cannot exceed 10000 characters']
    },
    date: Date,
    issuer: {
      type: String,
      trim: true,
      maxlength: [100, 'Issuer cannot exceed 100 characters']
    }
  }],

  // Certifications
  certifications: [{
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    issuer: {
      type: String,
      required: [true, 'Issuer is required'],
      trim: true,
      maxlength: [100, 'Issuer cannot exceed 100 characters']
    },
    date: Date,
    expiryDate: Date,
    credentialId: {
      type: String,
      trim: true,
      maxlength: [100, 'Credential ID cannot exceed 100 characters']
    },
    url: {
      type: String,
      trim: true,
      maxlength: [200, 'URL cannot exceed 200 characters']
    }
  }],

  // Languages
  languages: [{
    name: {
      type: String,
      required: [true, 'Language name is required'],
      trim: true,
      maxlength: [50, 'Language name cannot exceed 50 characters']
    },
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native'],
      default: 'basic'
    }
  }],

  // Custom Fields
  customFields: [{
    title: {
      type: String,
      required: [true, 'Custom field title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
      type: String,
      trim: true,
      maxlength: [10000, 'Content cannot exceed 10000 characters']
    },
    type: {
      type: String,
      enum: ['text', 'list', 'date'],
      default: 'text'
    }
  }],

  // Template and Styling
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: false // Will be set when user selects template
  },
  styling: {
    primaryColor: {
      type: String,
      default: '#2563eb'
    },
    secondaryColor: {
      type: String,
      default: '#64748b'
    },
    fontFamily: {
      type: String,
      default: 'Inter'
    },
    fontSize: {
      type: Number,
      default: 12,
      min: 8,
      max: 18
    },
    // Template editing options
    template: {
      headerLevel: {
        type: String,
        enum: ['h1', 'h2', 'h3', 'h4', 'h5'],
        default: 'h3'
      },
      headerFontSize: {
        type: Number,
        min: 12,
        max: 24,
        default: 18
      },
      fontSize: {
        type: Number,
        min: 12,
        max: 18,
        default: 14
      },
      lineSpacing: {
        type: Number,
        min: 1,
        max: 3,
        default: 1.5
      },
      sectionSpacing: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      primaryFont: {
        type: String,
        enum: ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Raleway', 'Inter', 'Source Sans Pro', 'Ubuntu', 'Merriweather', 'Playfair Display', 'Oswald', 'Work Sans', 'PT Sans', 'Quicksand', 'Noto Sans', 'Rubik', 'Josefin Sans', 'Manrope', 'Arial', 'Calibri', 'Times New Roman', 'Verdana', 'Helvetica', 'Georgia', 'Cambria', 'Garamond', 'Trebuchet MS', 'Book Antiqua'],
        default: 'Arial'
      },
      secondaryFont: {
        type: String,
        enum: ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Raleway', 'Inter', 'Source Sans Pro', 'Ubuntu', 'Merriweather', 'Playfair Display', 'Oswald', 'Work Sans', 'PT Sans', 'Quicksand', 'Noto Sans', 'Rubik', 'Josefin Sans', 'Manrope', 'Arial', 'Calibri', 'Times New Roman', 'Verdana', 'Helvetica', 'Georgia', 'Cambria', 'Garamond', 'Trebuchet MS', 'Book Antiqua'],
        default: 'Arial'
      },
      colors: {
        primary: {
          type: String,
          default: null,
          validate: {
            validator: function (v) {
              return v === null || /^#[0-9A-Fa-f]{6}$/.test(v);
            },
            message: 'Primary color must be null or a valid hex color'
          }
        },
        secondary: {
          type: String,
          default: null,
          validate: {
            validator: function (v) {
              return v === null || /^#[0-9A-Fa-f]{6}$/.test(v);
            },
            message: 'Secondary color must be null or a valid hex color'
          }
        },
        accent: {
          type: String,
          default: null,
          validate: {
            validator: function (v) {
              return v === null || /^#[0-9A-Fa-f]{6}$/.test(v);
            },
            message: 'Accent color must be null or a valid hex color'
          }
        },
        text: {
          type: String,
          default: null,
          validate: {
            validator: function (v) {
              return v === null || /^#[0-9A-Fa-f]{6}$/.test(v);
            },
            message: 'Text color must be null or a valid hex color'
          }
        }
      }
    },
    // Header styling options (keeping for backward compatibility)
    header: {
      size: {
        type: String,
        enum: ['small', 'medium', 'large', 'extra-large'],
        default: 'medium'
      },
      textSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      labelSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      spacing: {
        type: String,
        enum: ['compact', 'normal', 'spacious'],
        default: 'normal'
      }
    }
  },

  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
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

  // ATS Analysis
  atsAnalysis: {
    overall_score: {
      type: Number,
      min: 0,
      max: 100
    },
    category_scores: {
      keyword_skill_match: {
        type: Number,
        min: 0,
        max: 40
      },
      experience_alignment: {
        type: Number,
        min: 0,
        max: 20
      },
      section_completeness: {
        type: Number,
        min: 0,
        max: 15
      },
      project_impact: {
        type: Number,
        min: 0,
        max: 10
      },
      formatting: {
        type: Number,
        min: 0,
        max: 10
      },
      bonus_skills: {
        type: Number,
        min: 0,
        max: 5
      }
    },
    missing_keywords: [{
      type: String,
      trim: true
    }],
    strengths: [{
      type: String,
      trim: true
    }],
    weaknesses: [{
      type: String,
      trim: true
    }],
    ats_warnings: [{
      type: String,
      trim: true
    }],
    recommendations: [{
      type: String,
      trim: true
    }],
    job_description_hash: {
      type: String,
      trim: true
    },
    analyzed_at: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      // Transform dates to YYYY-MM-DD format for frontend
      if (ret.workExperience) {
        ret.workExperience = ret.workExperience.map(exp => ({
          ...exp,
          startDate: exp.startDate ? exp.startDate.toISOString().split('T')[0] : null,
          endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : null
        }));
      }
      if (ret.education) {
        ret.education = ret.education.map(edu => ({
          ...edu,
          startDate: edu.startDate ? edu.startDate.toISOString().split('T')[0] : null,
          endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : null
        }));
      }
      if (ret.projects) {
        ret.projects = ret.projects.map(proj => ({
          ...proj,
          startDate: proj.startDate ? proj.startDate.toISOString().split('T')[0] : null,
          endDate: proj.endDate ? proj.endDate.toISOString().split('T')[0] : null
        }));
      }
      if (ret.achievements) {
        ret.achievements = ret.achievements.map(ach => ({
          ...ach,
          date: ach.date ? ach.date.toISOString().split('T')[0] : null
        }));
      }
      if (ret.certifications) {
        ret.certifications = ret.certifications.map(cert => ({
          ...cert,
          date: cert.date ? cert.date.toISOString().split('T')[0] : null,
          expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : null
        }));
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for total work experience
resumeSchema.virtual('totalExperience').get(function () {
  if (!this.workExperience || this.workExperience.length === 0) return 0;

  const totalMs = this.workExperience.reduce((total, job) => {
    const startDate = new Date(job.startDate);
    const endDate = job.endDate ? new Date(job.endDate) : new Date();
    return total + (endDate - startDate);
  }, 0);

  return Math.floor(totalMs / (1000 * 60 * 60 * 24 * 365)); // Convert to years
});

// Virtual for completion percentage
resumeSchema.virtual('completionPercentage').get(function () {
  let completed = 0;
  let total = 8; // Total sections to check

  if (this.personalInfo.fullName) completed++;
  if (this.personalInfo.email) completed++;
  if (this.summary) completed++;
  if (this.workExperience && this.workExperience.length > 0) completed++;
  if (this.education && this.education.length > 0) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  if (this.projects && this.projects.length > 0) completed++;
  if (this.achievements && this.achievements.length > 0) completed++;

  return Math.round((completed / total) * 100);
});

// Index for performance
resumeSchema.index({ user: 1, status: 1 });
resumeSchema.index({ user: 1, updatedAt: -1 });
resumeSchema.index({ template: 1 });
resumeSchema.index({ status: 1, isPublic: 1 });

// Pre-save middleware to clean and validate data
resumeSchema.pre('save', function (next) {
  // Clean skills data - remove null levels and set default
  if (this.skills && this.skills.length > 0) {
    this.skills.forEach(skill => {
      if (skill.items && skill.items.length > 0) {
        skill.items.forEach(item => {
          if (item.level === null || item.level === undefined) {
            item.level = 'intermediate';
          }
        });
      }
    });
  }

  // Clean languages data - set default proficiency if missing
  if (this.languages && this.languages.length > 0) {
    this.languages.forEach(lang => {
      if (!lang.proficiency) {
        lang.proficiency = 'basic';
      }
    });
  }

  // Clean work experience for freshers
  if (this.isFresher) {
    this.workExperience = [];
  }

  // Reset ATS analysis if resume content is modified
  const contentFields = [
    'personalInfo', 'summary', 'workExperience', 'education',
    'skills', 'projects', 'achievements', 'certifications',
    'languages', 'customFields', 'isFresher'
  ];

  const isContentModified = contentFields.some(field => this.isModified(field));
  if (isContentModified && this.atsAnalysis) {
    // Reset ATS analysis data
    this.atsAnalysis = {
      overall_score: null,
      category_scores: {
        keyword_skill_match: null,
        experience_alignment: null,
        section_completeness: null,
        project_impact: null,
        formatting: null,
        bonus_skills: null
      },
      missing_keywords: [],
      strengths: [],
      weaknesses: [],
      ats_warnings: [],
      recommendations: [],
      job_description_hash: null,
      analyzed_at: null
    };
  }

  // Update analytics
  if (this.isModified('analytics.views')) {
    this.analytics.lastViewed = new Date();
  }

  next();
});

module.exports = mongoose.model('Resume', resumeSchema);