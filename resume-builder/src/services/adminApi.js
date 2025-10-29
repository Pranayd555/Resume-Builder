// Admin API service for centralized API calls and error handling
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response, errorMessage = 'An error occurred') => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorMessage);
  }
  return response.json();
};

// Helper function to handle errors
const handleError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  const message = error.message || defaultMessage;
  
  // Handle authentication errors
  if (message.includes('No authentication token') || 
      message.includes('401') || 
      message.includes('Unauthorized') ||
      message.includes('token failed')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }
  
  toast.error(message);
  throw error;
};

// Feedback API calls
export const feedbackApi = {
  // Get all feedbacks with pagination and filtering
  getFeedbacks: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/feedback?${queryParams}`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch feedbacks');
    } catch (error) {
      handleError(error, 'Failed to fetch feedbacks');
    }
  },

  // Get single feedback by ID
  getFeedback: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch feedback');
    } catch (error) {
      handleError(error, 'Failed to fetch feedback');
    }
  },

  // Update feedback status
  updateStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return await handleApiResponse(response, 'Failed to update feedback status');
    } catch (error) {
      handleError(error, 'Failed to update feedback status');
    }
  },

  // Add response to feedback
  addResponse: async (id, response) => {
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/feedback/${id}/response`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ response })
      });
      return await handleApiResponse(apiResponse, 'Failed to add response');
    } catch (error) {
      handleError(error, 'Failed to add response');
    }
  },

  // Add admin notes to feedback
  addNotes: async (id, adminNotes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${id}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminNotes })
      });
      return await handleApiResponse(response, 'Failed to add notes');
    } catch (error) {
      handleError(error, 'Failed to add notes');
    }
  },

  // Delete feedback
  deleteFeedback: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to delete feedback');
    } catch (error) {
      handleError(error, 'Failed to delete feedback');
    }
  },

  // Get feedback statistics
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/stats/overview`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch feedback statistics');
    } catch (error) {
      handleError(error, 'Failed to fetch feedback statistics');
    }
  }
};

// Contact API calls
export const contactApi = {
  // Get all contacts with pagination and filtering
  getContacts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/contact?${queryParams}`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch contacts');
    } catch (error) {
      handleError(error, 'Failed to fetch contacts');
    }
  },

  // Get single contact by ID
  getContact: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch contact');
    } catch (error) {
      handleError(error, 'Failed to fetch contact');
    }
  },

  // Update contact status
  updateStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      return await handleApiResponse(response, 'Failed to update contact status');
    } catch (error) {
      handleError(error, 'Failed to update contact status');
    }
  },

  // Update contact priority
  updatePriority: async (id, priority) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${id}/priority`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ priority })
      });
      return await handleApiResponse(response, 'Failed to update contact priority');
    } catch (error) {
      handleError(error, 'Failed to update contact priority');
    }
  },

  // Add response to contact
  addResponse: async (id, response) => {
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/contact/${id}/response`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ response })
      });
      return await handleApiResponse(apiResponse, 'Failed to add response');
    } catch (error) {
      handleError(error, 'Failed to add response');
    }
  },

  // Add admin notes to contact
  addNotes: async (id, adminNotes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${id}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminNotes })
      });
      return await handleApiResponse(response, 'Failed to add notes');
    } catch (error) {
      handleError(error, 'Failed to add notes');
    }
  },

  // Delete contact
  deleteContact: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to delete contact');
    } catch (error) {
      handleError(error, 'Failed to delete contact');
    }
  },

  // Get contact statistics
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/stats/overview`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch contact statistics');
    } catch (error) {
      handleError(error, 'Failed to fetch contact statistics');
    }
  }
};

// Analytics API calls
export const analyticsApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/admin/dashboard`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch dashboard stats');
    } catch (error) {
      handleError(error, 'Failed to fetch dashboard stats');
    }
  },

  // Get charts data
  getChartsData: async (period = '30d') => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/admin/charts?period=${period}`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch charts data');
    } catch (error) {
      handleError(error, 'Failed to fetch charts data');
    }
  }
};

// Users API calls
export const usersApi = {
  // Get all users with pagination and filtering
  getUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch users');
    } catch (error) {
      handleError(error, 'Failed to fetch users');
    }
  },

  // Get single user by ID
  getUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to fetch user');
    } catch (error) {
      handleError(error, 'Failed to fetch user');
    }
  },

  // Update user status
  updateUserStatus: async (id, isActive) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });
      return await handleApiResponse(response, 'Failed to update user status');
    } catch (error) {
      handleError(error, 'Failed to update user status');
    }
  },

  // Add tokens to user
  addTokensToUser: async (id, tokenData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/tokens`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tokenData)
      });
      return await handleApiResponse(response, 'Failed to add tokens to user');
    } catch (error) {
      handleError(error, 'Failed to add tokens to user');
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleApiResponse(response, 'Failed to delete user');
    } catch (error) {
      handleError(error, 'Failed to delete user');
    }
  }
};

// Generic API utilities
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Clear authentication
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Handle authentication errors
  handleAuthError: (error) => {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      apiUtils.clearAuth();
      window.location.href = '/login';
    }
  }
};

const adminAPI = {
  feedbackApi,
  contactApi,
  analyticsApi,
  usersApi,
  apiUtils
};

export { adminAPI };
export default adminAPI;