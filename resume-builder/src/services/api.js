import axios from 'axios';
import { createApiConfig } from '../config/timeouts';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
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
    const config = createApiConfig('/auth/login');
    const response = await api.post('/auth/login', credentials, config);
    return response.data;
  },

  register: async (userData) => {
    const config = createApiConfig('/auth/register');
    const response = await api.post('/auth/register', userData, config);
    return response.data;
  },

  logout: async () => {
    const config = createApiConfig('/auth/logout');
    const response = await api.post('/auth/logout', {}, config);
    return response.data;
  },

  getCurrentUser: async () => {
    const config = createApiConfig('/auth/me');
    const response = await api.get('/auth/me', config);
    return response.data;
  },

  updateProfile: async (userData) => {
    const config = createApiConfig('/auth/profile');
    const response = await api.put('/auth/profile', userData, config);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const config = createApiConfig('/auth/password');
    const response = await api.put('/auth/password', passwordData, config);
    return response.data;
  },

  forgotPassword: async (email) => {
    const config = createApiConfig('/auth/forgot-password');
    const response = await api.post('/auth/forgot-password', { email }, config);
    return response.data;
  },

  resetPassword: async (resetData) => {
    const config = createApiConfig('/auth/reset-password');
    const response = await api.post('/auth/reset-password', resetData, config);
    return response.data;
  },

  // OTP Verification methods
  verifyEmail: async (otp) => {
    const config = createApiConfig('/auth/verify-email');
    const response = await api.post('/auth/verify-email', { otp }, config);
    return response.data;
  },

  resendOtp: async () => {
    const config = createApiConfig('/auth/resend-otp');
    const response = await api.post('/auth/resend-otp', {}, config);
    return response.data;
  },

  getEmailStatus: async () => {
    const config = createApiConfig('/auth/email-status');
    const response = await api.get('/auth/email-status', config);
    return response.data;
  },

  deleteAccount: async () => {
    const config = createApiConfig('/auth/account');
    const response = await api.delete('/auth/account', config);
    return response.data;
  },
};

// Resume API calls
export const resumeAPI = {
  getResumes: async (params = {}) => {
    const config = createApiConfig('/resumes', { params });
    const response = await api.get('/resumes', config);
    return response.data;
  },

  getResumeById: async (resumeId) => {
    const config = createApiConfig('/resumes');
    const response = await api.get(`/resumes/${resumeId}`, config);
    return response.data;
  },

  createResume: async (resumeData) => {
    const config = createApiConfig('/resumes');
    const response = await api.post('/resumes', resumeData, config);
    return response.data;
  },

  // NEW: Save resume form data (Step 1)
  saveFormData: async (formData) => {
    const config = createApiConfig('/resumes/form-data');
    const response = await api.post('/resumes/form-data', formData, config);
    return response.data;
  },

  // NEW: Auto-save resume draft
  autoSaveDraft: async (formData, resumeId = null) => {
    const config = createApiConfig('/resumes/auto-save');
    const response = await api.post('/resumes/auto-save', {
      ...formData,
      resumeId
    }, config);
    return response.data;
  },

  // NEW: Mark resume as completed
  markAsCompleted: async (resumeId) => {
    const config = createApiConfig('/resumes/complete');
    const response = await api.put(`/resumes/${resumeId}/complete`, {}, config);
    return response.data;
  },

  // NEW: Update resume with selected template (Step 2)
  selectTemplate: async (resumeId, templateData) => {
    const config = createApiConfig('/resumes/template');
    const response = await api.put(`/resumes/${resumeId}/template`, templateData, config);
    return response.data;
  },

  // NEW: Update template styling options
  updateTemplateStyling: async (resumeId, templateStyling) => {
    const config = createApiConfig('/resumes/template-styling');
    const response = await api.put(`/resumes/${resumeId}/template-styling`, templateStyling, config);
    return response.data;
  },

  // NEW: Update resume colors
  updateColors: async (resumeId, colors) => {
    const config = createApiConfig('/resumes/colors');
    const response = await api.put(`/resumes/${resumeId}/colors`, { colors }, config);
    return response.data;
  },

  // NEW: Update individual color
  updateIndividualColor: async (resumeId, colorType, colorValue) => {
    const config = createApiConfig('/resumes/colors/individual');
    const response = await api.put(`/resumes/${resumeId}/colors/individual`, { 
      colorType, 
      colorValue 
    }, config);
    return response.data;
  },

  // NEW: Get color presets
  getColorPresets: async () => {
    const config = createApiConfig('/resumes/color-presets');
    const response = await api.get('/resumes/color-presets', config);
    return response.data;
  },



  // NEW: Download resume as PDF
  downloadPDF: async (resumeId, timestamp = null) => {
    const config = createApiConfig('/resumes/download/pdf', {
      responseType: 'blob',
      params: timestamp ? { t: timestamp } : {}
    });
    const response = await api.get(`/resumes/${resumeId}/download/pdf`, config);
    return response;
  },

  // NEW: Get preview PDF images
  getPreviewPdfImages: async (resumeId) => {
    const config = createApiConfig('/resumes/preview/pdf-images');
    const response = await api.get(`/resumes/${resumeId}/preview/pdf-images`, config);
    return response.data;
  },


  // NEW: Download resume as DOCX
  downloadDOCX: async (resumeId) => {
    const config = createApiConfig('/resumes/download/docx', {
      responseType: 'blob'
    });
    const response = await api.get(`/resumes/${resumeId}/download/docx`, config);
    return response;
  },

  updateResume: async (resumeId, resumeData) => {
    const config = createApiConfig('/resumes');
    const response = await api.put(`/resumes/${resumeId}`, resumeData, config);
    return response.data;
  },

  deleteResume: async (resumeId) => {
    const config = createApiConfig('/resumes');
    const response = await api.delete(`/resumes/${resumeId}`, config);
    return response.data;
  },

  duplicateResume: async (resumeId) => {
    const config = createApiConfig('/resumes/duplicate');
    const response = await api.post(`/resumes/${resumeId}/duplicate`, {}, config);
    return response.data;
  },

  downloadResume: async (resumeId, format = 'pdf') => {
    const config = createApiConfig('/resumes/download', {
      params: { format },
      responseType: 'blob',
    });
    const response = await api.get(`/resumes/${resumeId}/download`, config);
    return response;
  },

  getResumeAnalytics: async (resumeId) => {
    const config = createApiConfig('/resumes/analytics');
    const response = await api.get(`/resumes/${resumeId}/analytics`, config);
    return response.data;
  },

  toggleActive: async (resumeId) => {
    const config = createApiConfig('/resumes/toggle-active');
    const response = await api.put(`/resumes/${resumeId}/toggle-active`, {}, config);
    return response.data;
  },
};

// Analytics API calls
export const analyticsAPI = {
  trackResumeView: async (resumeId) => {
    const config = createApiConfig('/analytics/resume');
    const response = await api.post(`/analytics/resume/${resumeId}/view`, {}, config);
    return response.data;
  },

  trackResumeDownload: async (resumeId, format = 'pdf') => {
    const config = createApiConfig('/analytics/resume');
    const response = await api.post(`/analytics/resume/${resumeId}/download`, { format }, config);
    return response.data;
  },

  trackTemplateUsage: async (templateId) => {
    const config = createApiConfig('/analytics/template');
    const response = await api.post(`/analytics/template/${templateId}/use`, {}, config);
    return response.data;
  },

  getAnalyticsSummary: async () => {
    const config = createApiConfig('/analytics/summary');
    const response = await api.get('/analytics/summary', config);
    return response.data;
  },

  getTokenBalance: async () => {
    const config = createApiConfig('/analytics/tokens');
    const response = await api.get('/analytics/tokens', config);
    return response.data;
  },
};

// Template API calls
export const templateAPI = {
  getTemplates: async (params = {}) => {
    const config = createApiConfig('/templates', { params });
    const response = await api.get('/templates', config);
    return response.data;
  },

  // Public template fetching (no auth token required)
  getTemplatesPublic: async (params = {}) => {
    const response = await api.get('/templates', {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return response.data;
  },

  getTemplateById: async (templateId) => {
    const config = createApiConfig('/templates');
    const response = await api.get(`/templates/${templateId}`, config);
    return response.data;
  },

  getTemplatesByCategory: async (category) => {
    const config = createApiConfig('/templates/category');
    const response = await api.get(`/templates/category/${category}`, config);
    return response.data;
  },
};

// Subscription API calls
export const subscriptionAPI = {
  getCurrentSubscription: async () => {
    const config = createApiConfig('/subscriptions/current');
    const response = await api.get('/subscriptions/current', config);
    return response.data;
  },

  getPlans: async () => {
    const config = createApiConfig('/subscriptions/plans');
    const response = await api.get('/subscriptions/plans', config);
    return response.data;
  },

  getTrialInfo: async () => {
    const config = createApiConfig('/subscriptions/trial-info');
    const response = await api.get('/subscriptions/trial-info', config);
    return response.data;
  },

  getTrialEligibility: async () => {
    const config = createApiConfig('/subscriptions/current');
    const response = await api.get('/subscriptions/current', config);
    return response.data;
  },

  startTrial: async (trialType) => {
    const config = createApiConfig('/subscriptions/start-trial');
    const response = await api.post('/subscriptions/start-trial', { trialType }, config);
    return response.data;
  },

  createCheckoutSession: async (planId, billingCycle) => {
    const config = createApiConfig('/subscriptions/create-checkout-session');
    const response = await api.post('/subscriptions/create-checkout-session', { 
      plan: planId, 
      billing: billingCycle 
    }, config);
    return response.data;
  },

  handleSubscriptionSuccess: async (sessionId) => {
    const config = createApiConfig('/subscriptions/success');
    const response = await api.post('/subscriptions/success', { sessionId }, config);
    return response.data;
  },

  cancelSubscription: async (reason) => {
    const config = createApiConfig('/subscriptions/cancel');
    const response = await api.post('/subscriptions/cancel', { reason }, config);
    return response.data;
  },

  reactivateSubscription: async () => {
    const config = createApiConfig('/subscriptions/reactivate');
    const response = await api.post('/subscriptions/reactivate', {}, config);
    return response.data;
  },

  getBillingHistory: async () => {
    const config = createApiConfig('/subscriptions/billing-history');
    const response = await api.get('/subscriptions/billing-history', config);
    return response.data;
  },

  updatePaymentMethod: async (paymentMethodId) => {
    const config = createApiConfig('/subscriptions/update-payment-method');
    const response = await api.post('/subscriptions/update-payment-method', { paymentMethodId }, config);
    return response.data;
  },
};

// Upload API calls
export const uploadAPI = {
  uploadFile: async (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const config = createApiConfig('/uploads', {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const response = await api.post('/uploads', formData, config);
    return response.data;
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const config = createApiConfig('/uploads/profile-picture', {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const response = await api.post('/uploads/profile-picture', formData, config);
    return response.data;
  },

  deleteProfilePicture: async () => {
    const config = createApiConfig('/uploads/profile-picture');
    const response = await api.delete('/uploads/profile-picture', config);
    return response.data;
  },

  deleteFile: async (fileId) => {
    const config = createApiConfig('/uploads');
    const response = await api.delete(`/uploads/${fileId}`, config);
    return response.data;
  },

  uploadResume: async (formData) => {
    const config = createApiConfig('/uploads/parse-resume', {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const response = await api.post('/uploads/parse-resume', formData, config);
    return response.data;
  },
};

// AI services have been moved to aiService.js

// User API calls
export const userAPI = {
  getUserProfile: async (userId) => {
    const config = createApiConfig('/users');
    const response = await api.get(`/users/${userId}`, config);
    return response.data;
  },

  updateUserProfile: async (userData) => {
    const config = createApiConfig('/users/profile');
    const response = await api.put('/users/profile', userData, config);
    return response.data;
  },

  getUserStats: async () => {
    const config = createApiConfig('/users/stats');
    const response = await api.get('/users/stats', config);
    return response.data;
  },
};

// Feedback API calls
export const feedbackAPI = {
  submitFeedback: async (feedbackData) => {
    const config = createApiConfig('/feedback');
    const response = await api.post('/feedback', feedbackData, config);
    return response.data;
  },

  // Public feedback submission (no auth token required)
  submitFeedbackPublic: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return response.data;
  },

  getFeedback: async (params = {}) => {
    const config = createApiConfig('/feedback', { params });
    const response = await api.get('/feedback', config);
    return response.data;
  },

  getFeedbackById: async (feedbackId) => {
    const config = createApiConfig('/feedback');
    const response = await api.get(`/feedback/${feedbackId}`, config);
    return response.data;
  },

  getFeedbackStats: async () => {
    const config = createApiConfig('/feedback/stats');
    const response = await api.get('/feedback/stats', config);
    return response.data;
  },

  updateFeedbackStatus: async (feedbackId, statusData) => {
    const config = createApiConfig('/feedback');
    const response = await api.put(`/feedback/${feedbackId}/status`, statusData, config);
    return response.data;
  },

  addFeedbackResponse: async (feedbackId, responseData) => {
    const config = createApiConfig('/feedback');
    const response = await api.put(`/feedback/${feedbackId}/response`, responseData, config);
    return response.data;
  },

  deleteFeedback: async (feedbackId) => {
    const config = createApiConfig('/feedback');
    const response = await api.delete(`/feedback/${feedbackId}`, config);
    return response.data;
  },

  getTestimonials: async (params = {}) => {
    const config = createApiConfig('/feedback/public/testimonials', { params });
    const response = await api.get('/feedback/public/testimonials', config);
    return response.data;
  },
};

// Contact API
export const contactAPI = {
  submitContact: async (contactData) => {
    const response = await api.post('/contact', contactData);
    return response.data;
  },

  getContacts: async (params = {}) => {
    const config = createApiConfig('/contact', { params });
    const response = await api.get('/contact', config);
    return response.data;
  },

  getContactById: async (contactId) => {
    const config = createApiConfig('/contact');
    const response = await api.get(`/contact/${contactId}`, config);
    return response.data;
  },

  updateContactStatus: async (contactId, statusData) => {
    const config = createApiConfig('/contact');
    const response = await api.put(`/contact/${contactId}/status`, statusData, config);
    return response.data;
  },

  addContactResponse: async (contactId, responseData) => {
    const config = createApiConfig('/contact');
    const response = await api.put(`/contact/${contactId}/response`, responseData, config);
    return response.data;
  },

  getContactStats: async () => {
    const config = createApiConfig('/contact/stats/overview');
    const response = await api.get('/contact/stats/overview', config);
    return response.data;
  },

  deleteContact: async (contactId) => {
    const config = createApiConfig('/contact');
    const response = await api.delete(`/contact/${contactId}`, config);
    return response.data;
  }
};

// Helper functions
export const apiHelpers = {
  //normalize url
    normalizeUrl: (url) => {
      try {
        // Ensure any localhost:5000 absolute URL is swapped to our backend origin
        const apiOrigin = new URL(process.env.REACT_APP_API_URL).origin;
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
    localStorage.removeItem('tokenBalance');
    localStorage.removeItem('tokenData');
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

  // Token management functions
  setTokenBalance: (balance) => {
    localStorage.setItem('tokenBalance', JSON.stringify(balance));
  },

  getTokenBalance: () => {
    const balance = localStorage.getItem('tokenBalance');
    return balance ? JSON.parse(balance) : 0;
  },

  setTokenData: (tokenData) => {
    localStorage.setItem('tokenData', JSON.stringify(tokenData));
  },

  getTokenData: () => {
    const tokenData = localStorage.getItem('tokenData');
    return tokenData ? JSON.parse(tokenData) : null;
  },

  clearTokenData: () => {
    localStorage.removeItem('tokenBalance');
    localStorage.removeItem('tokenData');
  },

  // Update token balance across the app
  updateTokenBalance: (newBalance) => {
    apiHelpers.setTokenBalance(newBalance);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('tokenBalanceUpdated', { 
      detail: { balance: newBalance } 
    }));
  },

  // Update token data across the app
  updateTokenData: (tokenData) => {
    apiHelpers.setTokenData(tokenData);
    if (tokenData.balance !== undefined) {
      apiHelpers.setTokenBalance(tokenData.balance);
    }
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('tokenDataUpdated', { 
      detail: tokenData 
    }));
  },

  // Update user data with subscription information
  updateUserData: (subscriptionData) => {
    const currentUserData = apiHelpers.getCurrentUserData();
    if (currentUserData) {
      const updatedUserData = {
        ...currentUserData,
        subscription: subscriptionData
      };
      apiHelpers.setCurrentUserData(updatedUserData);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('userDataUpdated', {
        detail: updatedUserData
      }));
    }
  },
};

export default api;