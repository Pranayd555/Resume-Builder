import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10 seconds to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Normalize API error responses in one place and avoid duplicate UI toasts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the backend returned a Blob (e.g., when responseType is 'blob'), try to parse JSON error
    if (error?.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        if (error.response) {
          error.response.data = JSON.parse(text);
        }
      } catch (_) {
        // Leave as-is if parsing fails
      }
    }

    // Extract a single user-friendly message from backend
    let backendMessage = 'An unexpected error occurred';
    
    if (error?.response?.data) {
      if (error.response.data.error) {
        backendMessage = error.response.data.error;
      } else if (Array.isArray(error.response.data.errors)) {
        backendMessage = error.response.data.errors.map((e) => e.msg || e.message).join(', ');
      }
    } else if (error?.message) {
      backendMessage = error.message;
    }

    // Attach normalized message for callers to use
    error.userMessage = backendMessage;

    // Special handling for unauthorized: clear and redirect only for token-related issues
    // Don't redirect for login failures (invalid credentials)
    if (error?.response?.status === 401 && error?.response?.data?.error !== 'Invalid credentials') {
      // Only redirect if it's not a login failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return; // stop
    }

    // Do NOT toast here to prevent duplicate messages; components can toast using error.userMessage
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },
};

// Resume API calls
export const resumeAPI = {
  getResumes: async (params = {}) => {
    const response = await api.get('/resumes', { params });
    return response.data;
  },

  getResumeById: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}`);
    return response.data;
  },

  createResume: async (resumeData) => {
    const response = await api.post('/resumes', resumeData);
    return response.data;
  },

  // NEW: Save resume form data (Step 1)
  saveFormData: async (formData) => {
    const response = await api.post('/resumes/form-data', formData);
    return response.data;
  },

  // NEW: Auto-save resume draft
  autoSaveDraft: async (formData, resumeId = null) => {
    const response = await api.post('/resumes/auto-save', {
      ...formData,
      resumeId
    });
    return response.data;
  },

  // NEW: Mark resume as completed
  markAsCompleted: async (resumeId) => {
    const response = await api.put(`/resumes/${resumeId}/complete`);
    return response.data;
  },

  // NEW: Update resume with selected template (Step 2)
  selectTemplate: async (resumeId, templateData) => {
    const response = await api.put(`/resumes/${resumeId}/template`, templateData);
    return response.data;
  },

  // NEW: Update template styling options
  updateTemplateStyling: async (resumeId, templateStyling) => {
    const response = await api.put(`/resumes/${resumeId}/template-styling`, templateStyling);
    return response.data;
  },



  // NEW: Download resume as PDF
  downloadPDF: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/download/pdf`, {
      responseType: 'blob'
    });
    return response;
  },

  // NEW: Download resume as DOCX
  downloadDOCX: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/download/docx`, {
      responseType: 'blob'
    });
    return response;
  },

  updateResume: async (resumeId, resumeData) => {
    const response = await api.put(`/resumes/${resumeId}`, resumeData);
    return response.data;
  },

  deleteResume: async (resumeId) => {
    const response = await api.delete(`/resumes/${resumeId}`);
    return response.data;
  },

  duplicateResume: async (resumeId) => {
    const response = await api.post(`/resumes/${resumeId}/duplicate`);
    return response.data;
  },

  downloadResume: async (resumeId, format = 'pdf') => {
    const response = await api.get(`/resumes/${resumeId}/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  getResumeAnalytics: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/analytics`);
    return response.data;
  },

  toggleActive: async (resumeId) => {
    const response = await api.put(`/resumes/${resumeId}/toggle-active`);
    return response.data;
  },
};

// Analytics API calls
export const analyticsAPI = {
  trackResumeView: async (resumeId) => {
    const response = await api.post(`/analytics/resume/${resumeId}/view`);
    return response.data;
  },

  trackResumeDownload: async (resumeId, format = 'pdf') => {
    const response = await api.post(`/analytics/resume/${resumeId}/download`, { format });
    return response.data;
  },

  trackTemplateUsage: async (templateId) => {
    const response = await api.post(`/analytics/template/${templateId}/use`);
    return response.data;
  },

  getAnalyticsSummary: async () => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
};

// Template API calls
export const templateAPI = {
  getTemplates: async (params = {}) => {
    const response = await api.get('/templates', { params });
    return response.data;
  },

  getTemplateById: async (templateId) => {
    const response = await api.get(`/templates/${templateId}`);
    return response.data;
  },

  getTemplatesByCategory: async (category) => {
    const response = await api.get(`/templates/category/${category}`);
    return response.data;
  },
};

// Subscription API calls
export const subscriptionAPI = {
  getCurrentSubscription: async () => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  getPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  getTrialInfo: async () => {
    const response = await api.get('/subscriptions/trial-info');
    return response.data;
  },

  getTrialEligibility: async () => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  startTrial: async (trialType) => {
    const response = await api.post('/subscriptions/start-trial', { trialType });
    return response.data;
  },

  createCheckoutSession: async (planId, billingCycle) => {
    const response = await api.post('/subscriptions/create-checkout-session', { 
      plan: planId, 
      billing: billingCycle 
    });
    return response.data;
  },

  handleSubscriptionSuccess: async (sessionId) => {
    const response = await api.post('/subscriptions/success', { sessionId });
    return response.data;
  },

  cancelSubscription: async (reason) => {
    const response = await api.post('/subscriptions/cancel', { reason });
    return response.data;
  },

  reactivateSubscription: async () => {
    const response = await api.post('/subscriptions/reactivate');
    return response.data;
  },

  getBillingHistory: async () => {
    const response = await api.get('/subscriptions/billing-history');
    return response.data;
  },

  updatePaymentMethod: async (paymentMethodId) => {
    const response = await api.post('/subscriptions/update-payment-method', { paymentMethodId });
    return response.data;
  },
};

// Upload API calls
export const uploadAPI = {
  uploadFile: async (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file uploads
    });
    return response.data;
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/uploads/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file uploads
    });
    return response.data;
  },

  deleteProfilePicture: async () => {
    const response = await api.delete('/uploads/profile-picture');
    return response.data;
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/uploads/${fileId}`);
    return response.data;
  },

  uploadResume: async (formData) => {
    const response = await api.post('/uploads/parse-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // Increased to 5 minutes for AI model initialization
    });
    return response.data;
  },
};

// AI API calls
export const aiAPI = {
  generateATSScore: async (resumeId, inputType, jobDescription = null, jobDescriptionFile = null) => {
    const formData = new FormData();
    formData.append('resumeId', resumeId);
    formData.append('inputType', inputType);
    
    if (inputType === 'text' && jobDescription) {
      formData.append('jobDescription', jobDescription);
    } else if (inputType === 'file' && jobDescriptionFile) {
      formData.append('jobDescriptionFile', jobDescriptionFile);
    }

    const response = await api.post('/ai/ats-score', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for ATS analysis
    });
    return response.data;
  },

  rewriteContent: async (content, tone = 'professional', style = 'action-oriented') => {
    const response = await api.post('/ai/rewrite', {
      content,
      tone,
      style
    });
    return response.data;
  },

  summarizeContent: async (content, maxLength = 150) => {
    const response = await api.post('/ai/summarize', {
      content,
      maxLength
    });
    return response.data;
  },

  // ATS-based AI endpoints
  adjustTone: async (resumeId, requestData) => {
    const response = await api.post('/ai/adjust-tone', {
      resumeId,
      ...requestData
    }, {
      timeout: 120000, // 2 minutes for AI processing
    });
    return response.data;
  },

  enhanceKeywords: async (resumeId, requestData) => {
    const response = await api.post('/ai/enhance-keywords', {
      resumeId,
      ...requestData
    }, {
      timeout: 120000, // 2 minutes for AI processing
    });
    return response.data;
  },

  getAIUsage: async () => {
    const response = await api.get('/ai/usage');
    return response.data;
  },

  getATSAnalysis: async (resumeId) => {
    const response = await api.get(`/ai/ats-score/${resumeId}`);
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUserProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Feedback API calls
export const feedbackAPI = {
  submitFeedback: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },

  getFeedback: async (params = {}) => {
    const response = await api.get('/feedback', { params });
    return response.data;
  },

  getFeedbackById: async (feedbackId) => {
    const response = await api.get(`/feedback/${feedbackId}`);
    return response.data;
  },

  getFeedbackStats: async () => {
    const response = await api.get('/feedback/stats');
    return response.data;
  },

  updateFeedbackStatus: async (feedbackId, statusData) => {
    const response = await api.put(`/feedback/${feedbackId}/status`, statusData);
    return response.data;
  },

  addFeedbackResponse: async (feedbackId, responseData) => {
    const response = await api.put(`/feedback/${feedbackId}/response`, responseData);
    return response.data;
  },

  deleteFeedback: async (feedbackId) => {
    const response = await api.delete(`/feedback/${feedbackId}`);
    return response.data;
  },

  getTestimonials: async (params = {}) => {
    const response = await api.get('/feedback/public/testimonials', { params });
    return response.data;
  },
};

// Helper functions
export const apiHelpers = {
  //normalize url
    normalizeUrl: (url) => {
      try {
        // Ensure any localhost:5000 absolute URL is swapped to our backend origin
        const apiOrigin = new URL(API_BASE_URL).origin;
        const resolved = new URL(url, apiOrigin); // resolves relative paths against apiOrigin
        const isLocalhost5000 = resolved.origin.startsWith('http://localhost:5000');
        if (isLocalhost5000) {
          return `${apiOrigin}${resolved.pathname}${resolved.search || ''}${resolved.hash || ''}`;
        }
        return resolved.href;
      } catch (_) {
        return url;
      }
    },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  },

  // Get auth token
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Format error message
  formatError: (error) => {
    if (error?.response?.data?.error) {
      return error.response.data.error;
    } else if (error?.response?.data?.errors) {
      return error.response.data.errors.map(err => err.msg).join(', ');
    } else if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get current user data
  getCurrentUserData: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  // Set current user data
  setCurrentUserData: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  },
};

export default api; 