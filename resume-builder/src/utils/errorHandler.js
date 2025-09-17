import { toast } from 'react-toastify';
import { getTimeoutForType } from '../config/timeouts';

/**
 * Handle network timeout errors and redirect to error page
 * @param {Error} error - The error object
 * @param {Function} navigate - React Router navigate function
 * @param {Object} options - Additional options
 */
export const handleNetworkTimeout = (error, navigate, options = {}) => {
  const {
    redirectPath = '/network-timeout'
  } = options;

  // Check if it's a network timeout error
  const isNetworkTimeout = 
    error?.message?.includes('timeout') ||
    error?.message?.includes('ECONNRESET') ||
    error?.message?.includes('Network Error') ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ETIMEDOUT' ||
    error?.response?.status === 408 ||
    error?.response?.status === 504;

  if (isNetworkTimeout) {
      
    // Redirect to error page
    if (navigate) {
      navigate(redirectPath);
    }
    
    return true;
  }
  
  return false;
};

/**
 * Handle general API errors
 * @param {Error} error - The error object
 * @param {Function} navigate - React Router navigate function
 * @param {Object} options - Additional options
 */
export const handleApiError = (error, navigate, options = {}) => {
  const {
    showToast = true,
    customMessage = null
  } = options;

  // First check for network timeout
  if (handleNetworkTimeout(error, navigate, { showToast, customMessage })) {
    return;
  }

  // Handle other common errors
  let errorMessage = customMessage || 'An unexpected error occurred. Please try again.';
  
  if (error?.response?.status === 401) {
    errorMessage = 'Session expired. Please login again.';
    if (navigate) {
      navigate('/');
    }
  } else if (error?.response?.status === 403) {
    errorMessage = 'Access denied. You do not have permission to perform this action.';
  } else if (error?.response?.status === 404) {
    errorMessage = 'The requested resource was not found.';
  } else if (error?.response?.status >= 500) {
    errorMessage = 'Server error. Please try again later.';
    if (navigate) {
      navigate('/error');
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }

  if (showToast) {
    toast.error(errorMessage);
  }
};

/**
 * Create a timeout wrapper for API calls
 * @param {Promise} apiCall - The API call promise
 * @param {string|number} timeoutTypeOrMs - API type (AUTH, CRUD, etc.) or timeout in milliseconds
 * @returns {Promise} - Promise that rejects on timeout
 */
export const withTimeout = (apiCall, timeoutTypeOrMs = 'CRUD') => {
  const timeoutMs = typeof timeoutTypeOrMs === 'string' 
    ? getTimeoutForType(timeoutTypeOrMs) 
    : timeoutTypeOrMs;
    
  return Promise.race([
    apiCall,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeoutMs);
    })
  ]);
};

/**
 * Retry mechanism for failed API calls
 * @param {Function} apiCall - The API call function
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} delayMs - Delay between retries in milliseconds (default: 1000)
 * @returns {Promise} - Promise that resolves with the API response
 */
export const withRetry = async (apiCall, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
};
