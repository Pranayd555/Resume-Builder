import axios from 'axios';
import { createApiConfig } from '../config/timeouts';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle unauthorized access
    if (error?.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }

    // Extract user-friendly error message
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

    error.userMessage = backendMessage;
    return Promise.reject(error);
  }
);

// Admin Analytics API calls
export const adminAnalyticsAPI = {
  // Get admin dashboard statistics
  getDashboardStats: async () => {
    const config = createApiConfig('/analytics/admin/dashboard');
    const response = await api.get('/analytics/admin/dashboard', config);
    return response.data;
  },

  // Get admin analytics charts data
  getChartsData: async (period = '30d') => {
    const config = createApiConfig('/analytics/admin/charts', { params: { period } });
    const response = await api.get('/analytics/admin/charts', config);
    return response.data;
  },
};

// Admin Users API calls
export const adminUsersAPI = {
  // Get all users with pagination
  getUsers: async (params = {}) => {
    const config = createApiConfig('/users', { params });
    const response = await api.get('/users', config);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const config = createApiConfig('/users');
    const response = await api.get(`/users/${userId}`, config);
    return response.data;
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId, isActive) => {
    const config = createApiConfig('/users');
    const response = await api.put(`/users/${userId}/status`, { isActive }, config);
    return response.data;
  },

  // Add tokens to user account
  addTokensToUser: async (userId, tokenData) => {
    const config = createApiConfig('/users');
    const response = await api.post(`/users/${userId}/add-tokens`, tokenData, config);
    return response.data;
  },
};

// Admin Templates API calls
export const adminTemplatesAPI = {
  // Get all templates
  getTemplates: async (params = {}) => {
    const config = createApiConfig('/templates', { params });
    const response = await api.get('/templates', config);
    return response.data;
  },

  // Get template by ID
  getTemplateById: async (templateId) => {
    const config = createApiConfig('/templates');
    const response = await api.get(`/templates/${templateId}`, config);
    return response.data;
  },

  // Create new template
  createTemplate: async (templateData) => {
    const config = createApiConfig('/templates');
    const response = await api.post('/templates', templateData, config);
    return response.data;
  },

  // Update template
  updateTemplate: async (templateId, templateData) => {
    const config = createApiConfig('/templates');
    const response = await api.put(`/templates/${templateId}`, templateData, config);
    return response.data;
  },

  // Delete template
  deleteTemplate: async (templateId) => {
    const config = createApiConfig('/templates');
    const response = await api.delete(`/templates/${templateId}`, config);
    return response.data;
  },

  // Seed default templates
  seedTemplates: async () => {
    const config = createApiConfig('/templates/seed');
    const response = await api.post('/templates/seed', {}, config);
    return response.data;
  },

  // Get template statistics
  getTemplateStats: async (templateId) => {
    const config = createApiConfig('/templates');
    const response = await api.get(`/templates/${templateId}/stats`, config);
    return response.data;
  },
};

// Admin Contact API calls
export const adminContactAPI = {
  // Get all contacts with pagination and filters
  getContacts: async (params = {}) => {
    const config = createApiConfig('/contact', { params });
    const response = await api.get('/contact', config);
    return response.data;
  },

  // Get contact by ID
  getContactById: async (contactId) => {
    const config = createApiConfig('/contact');
    const response = await api.get(`/contact/${contactId}`, config);
    return response.data;
  },

  // Update contact status
  updateContactStatus: async (contactId, statusData) => {
    const config = createApiConfig('/contact');
    const response = await api.put(`/contact/${contactId}/status`, statusData, config);
    return response.data;
  },

  // Add response to contact
  addContactResponse: async (contactId, responseData) => {
    const config = createApiConfig('/contact');
    const response = await api.put(`/contact/${contactId}/response`, responseData, config);
    return response.data;
  },

  // Get contact statistics
  getContactStats: async () => {
    const config = createApiConfig('/contact');
    const response = await api.get('/contact/stats/overview', config);
    return response.data;
  },

  // Delete contact
  deleteContact: async (contactId) => {
    const config = createApiConfig('/contact');
    const response = await api.delete(`/contact/${contactId}`, config);
    return response.data;
  },
};

// Admin Feedback API calls
export const adminFeedbackAPI = {
  // Get all feedback with pagination and filters
  getFeedback: async (params = {}) => {
    const config = createApiConfig('/feedback', { params });
    const response = await api.get('/feedback', config);
    return response.data;
  },

  // Get feedback by ID
  getFeedbackById: async (feedbackId) => {
    const config = createApiConfig('/feedback');
    const response = await api.get(`/feedback/${feedbackId}`, config);
    return response.data;
  },

  // Update feedback status
  updateFeedbackStatus: async (feedbackId, statusData) => {
    const config = createApiConfig('/feedback');
    const response = await api.put(`/feedback/${feedbackId}/status`, statusData, config);
    return response.data;
  },

  // Add response to feedback
  addFeedbackResponse: async (feedbackId, responseData) => {
    const config = createApiConfig('/feedback');
    const response = await api.put(`/feedback/${feedbackId}/response`, responseData, config);
    return response.data;
  },

  // Get feedback statistics
  getFeedbackStats: async () => {
    const config = createApiConfig('/feedback');
    const response = await api.get('/feedback/stats', config);
    return response.data;
  },

  // Delete feedback
  deleteFeedback: async (feedbackId) => {
    const config = createApiConfig('/feedback');
    const response = await api.delete(`/feedback/${feedbackId}`, config);
    return response.data;
  },
};

// Admin Email Test API calls
export const adminEmailAPI = {
  // Test email connection
  testEmailConnection: async () => {
    const config = createApiConfig('/email-test/connection');
    const response = await api.get('/email-test/connection', config);
    return response.data;
  },

  // Send test email
  sendTestEmail: async (emailData) => {
    const config = createApiConfig('/email-test/send');
    const response = await api.post('/email-test/send', emailData, config);
    return response.data;
  },
};

// Admin Resume API calls
export const adminResumeAPI = {
  // Get all resumes with pagination
  getResumes: async (params = {}) => {
    const config = createApiConfig('/resumes', { params });
    const response = await api.get('/resumes', config);
    return response.data;
  },

  // Get resume by ID
  getResumeById: async (resumeId) => {
    const config = createApiConfig('/resumes');
    const response = await api.get(`/resumes/${resumeId}`, config);
    return response.data;
  },

  // Update resume status
  updateResumeStatus: async (resumeId, statusData) => {
    const config = createApiConfig('/resumes');
    const response = await api.put(`/resumes/${resumeId}/status`, statusData, config);
    return response.data;
  },

  // Delete resume
  deleteResume: async (resumeId) => {
    const config = createApiConfig('/resumes');
    const response = await api.delete(`/resumes/${resumeId}`, config);
    return response.data;
  },

  // Get resume analytics
  getResumeAnalytics: async (resumeId) => {
    const config = createApiConfig('/resumes');
    const response = await api.get(`/resumes/${resumeId}/analytics`, config);
    return response.data;
  },
};

// Admin System API calls
export const adminSystemAPI = {
  // Get system health
  getSystemHealth: async () => {
    const config = createApiConfig('/admin/system/health');
    const response = await api.get('/admin/system/health', config);
    return response.data;
  },

  // Get system logs
  getSystemLogs: async (params = {}) => {
    const config = createApiConfig('/admin/system/logs', { params });
    const response = await api.get('/admin/system/logs', config);
    return response.data;
  },

  // Clear system cache
  clearSystemCache: async () => {
    const config = createApiConfig('/admin/system/cache');
    const response = await api.post('/admin/system/cache/clear', {}, config);
    return response.data;
  },
};

// Export all admin APIs as a single object
export const adminAPI = {
  analytics: adminAnalyticsAPI,
  users: adminUsersAPI,
  templates: adminTemplatesAPI,
  contact: adminContactAPI,
  feedback: adminFeedbackAPI,
  email: adminEmailAPI,
  resume: adminResumeAPI,
  system: adminSystemAPI,
};

export default adminAPI;
