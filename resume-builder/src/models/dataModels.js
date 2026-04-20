// Data models and utilities for frontend data structures

// User model
export const createUserModel = (data = {}) => ({
  id: data.id || data._id || '',
  firstName: data.firstName || '',
  lastName: data.lastName || '',
  email: data.email || '',
  phone: data.phone || '',
  location: data.location || '',
  bio: data.bio || '',
  geminiApiKey: data.geminiApiKey || '',
  geminiModel: data.geminiModel || '',
  isOwnApiKey: data.isOwnApiKey || false,
  profilePicture: data.profilePicture || { url: '', publicId: '' },
  googleId: data.googleId || null,
  linkedinId: data.linkedinId || null,
  isEmailVerified: data.isEmailVerified || false,
  isActive: data.isActive || true,
  role: data.role || 'user',
  tokens: data.tokens || 0,
  subscription: data.subscription || createSubscriptionModel(),
  usage: data.usage || createUsageModel(),
  preferences: data.preferences || createPreferencesModel(),
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
});

// Subscription model
export const createSubscriptionModel = (data = {}) => ({
  plan: data.plan || 'free',
  status: data.status || 'active',
  features: {
    resumeLimit: data.features?.resumeLimit || (data.plan === 'trial' ? 5 : 2),
    templateAccess: data.features?.templateAccess || ['free'],
    exportFormats: data.features?.exportFormats || ['pdf'],
    aiActionsLimit: data.features?.aiActionsLimit || 10,
    aiReview: data.features?.aiReview || false,
    prioritySupport: data.features?.prioritySupport || false,
    customBranding: data.features?.customBranding || false,
    unlimitedExports: data.features?.unlimitedExports || false
  },
  usage: {
    resumesCreated: data.usage?.resumesCreated || 0,
    aiActionsThisMonth: data.usage?.aiActionsThisMonth || 0
  },
  billing: data.billing || {},
  ...data
});

// Usage model
export const createUsageModel = (data = {}) => ({
  resumesCreated: data.resumesCreated || 0,
  templatesUsed: data.templatesUsed || [],
  lastLogin: data.lastLogin || null,
  loginCount: data.loginCount || 0,
});

// Preferences model
export const createPreferencesModel = (data = {}) => ({
  theme: data.theme || 'system',
  language: data.language || 'en',
  emailNotifications: data.emailNotifications === undefined ? true : data.emailNotifications,
  marketingEmails: data.marketingEmails === undefined ? false : data.marketingEmails,
});

// Resume model
export const createResumeModel = (data = {}) => ({
  id: data.id || data._id || '',
  user: data.user || '',
  title: data.title || '',
  template: data.template || null,
  personalInfo: data.personalInfo || createPersonalInfoModel(),
  summary: data.summary || '',
  isFresher: data.isFresher || false,
  workExperience: data.workExperience || [createWorkExperienceModel()],
  education: data.education || [createEducationModel()],
  skills: data.skills || [createSkillCategoryModel()],
  projects: data.projects || [createProjectModel()],
  achievements: data.achievements || [''],
  certifications: data.certifications || [createCertificationModel()],
  languages: data.languages || [createLanguageModel()],
  customFields: data.customFields || [createCustomFieldModel()],
  styling: data.styling || createStylingModel(),
  status: data.status || 'draft',
  isPublic: data.isPublic || false,
  isActive: data.isActive || false,
  analytics: data.analytics || createAnalyticsModel(),
  atsAnalysis: data.atsAnalysis ? createATSAnalysisModel(data.atsAnalysis) : null, // ATS analysis data
  extractedText: data.extractedText || '', // Store extracted text from uploaded resume
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
});

// Personal info model
export const createPersonalInfoModel = (data = {}) => ({
  fullName: data.fullName || '',
  email: data.email || '',
  phone: data.phone || '',
  address: data.address || '',
  website: data.website || '',
  linkedin: data.linkedin || '',
  github: data.github || '',
});

// Work experience model
export const createWorkExperienceModel = (data = {}) => ({
  jobTitle: data.jobTitle || '',
  company: data.company || '',
  location: data.location || '',
  startDate: data.startDate || '',
  endDate: data.endDate || '',
  isCurrentJob: data.isCurrentJob || false,
  description: data.description || '',
  achievements: data.achievements || [''],
});

// Education model
export const createEducationModel = (data = {}) => ({
  degree: data.degree || '',
  institution: data.institution || '',
  location: data.location || '',
  startDate: data.startDate || '',
  endDate: data.endDate || '',
  isCurrentlyStudying: data.isCurrentlyStudying || false,
  gpa: data.gpa || null,
  description: data.description || '',
});

// Skill category model
export const createSkillCategoryModel = (data = {}) => ({
  category: data.category || '',
  items: data.items || [createSkillItemModel()],
});

// Skill item model
export const createSkillItemModel = (data = {}) => ({
  name: data.name || '',
  level: data.level || 'intermediate',
});

// Project model
export const createProjectModel = (data = {}) => ({
  name: data.name || '',
  description: data.description || '',
  technologies: data.technologies || [''],
  url: data.url || '',
  githubUrl: data.githubUrl || '',
  startDate: data.startDate || '',
  endDate: data.endDate || '',
  isOngoing: data.isOngoing || false,
  achievements: data.achievements || [''],
});

// Certification model
export const createCertificationModel = (data = {}) => ({
  name: data.name || '',
  issuer: data.issuer || '',
  issueDate: data.issueDate || '',
  expiryDate: data.expiryDate || '',
  credentialId: data.credentialId || '',
  url: data.url || '',
  description: data.description || '',
});

// Language model
export const createLanguageModel = (data = {}) => ({
  name: data.name || '',
  proficiency: data.proficiency || 'intermediate',
});

// Custom field model
export const createCustomFieldModel = (data = {}) => ({
  title: data.title || '',
  content: data.content || '',
  type: data.type || 'text',
});

// Styling model
export const createStylingModel = (data = {}) => ({
  primaryColor: data.primaryColor || '#3B82F6',
  secondaryColor: data.secondaryColor || '#64748B',
  fontSize: data.fontSize || 'medium',
  fontFamily: data.fontFamily || 'Inter',
  lineHeight: data.lineHeight || 'normal',
  margins: data.margins || 'normal',
  headerStyle: data.headerStyle || 'default',
  sectionSpacing: data.sectionSpacing || 'normal',
});

// Analytics model (simplified)
export const createAnalyticsModel = (data = {}) => ({
  views: data.views || 0,
  downloads: data.downloads || 0,
  lastViewed: data.lastViewed || null,
  lastDownloaded: data.lastDownloaded || null
});

// ATS Analysis model
export const createATSAnalysisModel = (data = {}) => ({
  overall_score: data.overall_score || null,
  category_scores: data.category_scores || {
    keyword_skill_match: 0,
    experience_alignment: 0,
    section_completeness: 0,
    project_impact: 0,
    formatting: 0,
    bonus_skills: 0
  },
  strengths: data.strengths || [],
  weaknesses: data.weaknesses || [],
  recommendations: data.recommendations || [],
  missing_keywords: data.missing_keywords || [],
  ats_warnings: data.ats_warnings || [],
  job_description_hash: data.job_description_hash || null,
  analyzed_at: data.analyzed_at || null
});

// Template model
export const createTemplateModel = (data = {}) => ({
  id: data.id || data._id || '',
  name: data.name || '',
  category: data.category || 'professional',
  description: data.description || '',
  preview: data.preview || { url: '', publicId: '' },
  templateCode: data.templateCode || '',
  styling: data.styling || createStylingModel(),
  availability: data.availability || createAvailabilityModel(),
  tags: data.tags || [],
  author: data.author || '',
  usage: data.usage || createTemplateUsageModel(),
  isActive: data.isActive || true,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString(),
});

// Template availability model
export const createAvailabilityModel = (data = {}) => ({
  tier: data.tier || 'free',
  isActive: data.isActive || true,
  countries: data.countries || [],
});

// Template usage model
export const createTemplateUsageModel = (data = {}) => ({
  totalUsage: data.totalUsage || 0,
  monthlyUsage: data.monthlyUsage || 0,
  rating: data.rating || 0,
  reviews: data.reviews || 0,
});

// Validation utilities
export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replaceAll(/\s/g, ''));
  },

  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  required: (value) => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return value && value.length <= max;
  },

  dateRange: (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  },

  validateUser: (user) => {
    const errors = {};
    
    if (!validators.required(user.firstName)) {
      errors.firstName = 'First name is required';
    }
    
    if (!validators.required(user.lastName)) {
      errors.lastName = 'Last name is required';
    }
    
    if (!validators.required(user.email)) {
      errors.email = 'Email is required';
    } else if (!validators.email(user.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (user.phone && !validators.phone(user.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateResume: (resume) => {
    const errors = {};
    
    if (!validators.required(resume.title)) {
      errors.title = 'Resume title is required';
    }
    
    if (!validators.required(resume.personalInfo.fullName)) {
      errors.fullName = 'Full name is required';
    }
    
    if (!validators.required(resume.personalInfo.email)) {
      errors.email = 'Email is required';
    } else if (!validators.email(resume.personalInfo.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    // Validate work experience (skip if user is a fresher)
    if (!resume.isFresher) {
      resume.workExperience.forEach((exp, index) => {
        // Check if this is a filled work experience entry
        if (exp.jobTitle || exp.company || exp.startDate || exp.endDate || exp.description) {
          // If any field is filled, required fields must be present
          if (!validators.required(exp.jobTitle)) {
            errors[`workExperience_${index}_jobTitle`] = 'Job title is required';
          }
          if (!validators.required(exp.company)) {
            errors[`workExperience_${index}_company`] = 'Company name is required';
          }
          if (!validators.required(exp.startDate)) {
            errors[`workExperience_${index}_startDate`] = 'Start date is required';
          }
          
          // Validate date range if both dates are provided
          if (exp.startDate && exp.endDate && !exp.isCurrentJob) {
            if (!validators.dateRange(exp.startDate, exp.endDate)) {
              errors[`workExperience_${index}_dateRange`] = 'End date must be after start date';
            }
          }
        }
      });
    }
    
    // Validate education
    resume.education.forEach((edu, index) => {
      // Check if this is a filled education entry
      if (edu.degree || edu.institution || edu.startDate || edu.endDate || edu.description) {
        // If any field is filled, required fields must be present
        if (!validators.required(edu.degree)) {
          errors[`education_${index}_degree`] = 'Degree is required';
        }
        if (!validators.required(edu.institution)) {
          errors[`education_${index}_institution`] = 'Institution is required';
        }
        if (!validators.required(edu.startDate)) {
          errors[`education_${index}_startDate`] = 'Start date is required';
        }
        
        // Validate date range if both dates are provided
        if (edu.startDate && edu.endDate && !edu.isCurrentlyStudying) {
          if (!validators.dateRange(edu.startDate, edu.endDate)) {
            errors[`education_${index}_dateRange`] = 'End date must be after start date';
          }
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateLogin: (credentials) => {
    const errors = {};
    
    if (!validators.required(credentials.email)) {
      errors.email = 'Email is required';
    } else if (!validators.email(credentials.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!validators.required(credentials.password)) {
      errors.password = 'Password is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateRegistration: (userData) => {
    const errors = {};
    
    if (!validators.required(userData.firstName)) {
      errors.firstName = 'First name is required';
    }
    
    if (!validators.required(userData.lastName)) {
      errors.lastName = 'Last name is required';
    }
    
    if (!validators.required(userData.email)) {
      errors.email = 'Email is required';
    } else if (!validators.email(userData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!validators.required(userData.password)) {
      errors.password = 'Password is required';
    } else if (!validators.minLength(userData.password, 8)) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

// Form field generators
export const formFields = {
  personalInfo: [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: false },
    { name: 'address', label: 'Address', type: 'text', required: false },
    { name: 'website', label: 'Website', type: 'url', required: false },
    { name: 'linkedin', label: 'LinkedIn', type: 'url', required: false },
    { name: 'github', label: 'GitHub', type: 'url', required: false },
  ],

  workExperience: [
    { name: 'jobTitle', label: 'Job Title', type: 'text', required: true },
    { name: 'company', label: 'Company', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: false },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date', required: false },
    { name: 'isCurrentJob', label: 'Current Job', type: 'checkbox', required: false },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
  ],

  education: [
    { name: 'degree', label: 'Degree', type: 'text', required: true },
    { name: 'institution', label: 'Institution', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: false },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date', required: false },
    { name: 'isCurrentlyStudying', label: 'Currently Studying', type: 'checkbox', required: false },
    { name: 'gpa', label: 'GPA', type: 'number', required: false },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
  ],
};

// Constants
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing',
  SUSPENDED: 'suspended',
};

export const TRIAL_TYPES = {
  FREE: 'free',
  PAID: 'paid',
};

export const RESUME_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
};

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

export const LANGUAGE_PROFICIENCY = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  FLUENT: 'fluent',
  NATIVE: 'native',
};

export const TEMPLATE_CATEGORIES = {
  PROFESSIONAL: 'professional',
  MODERN: 'modern',
  CREATIVE: 'creative',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  RU: 'ru',
  ZH: 'zh',
  JA: 'ja',
  KO: 'ko',
}; 