// Unified Timeout Configuration for Different API Types
// Based on the nature and complexity of operations

export const API_TIMEOUTS = {
  // Authentication APIs - Fast operations
  AUTH: 10000, // 10 seconds
  
  // CRUD Operations - Standard database operations
  CRUD: 15000, // 15 seconds
  
  // File Uploads - Medium complexity
  UPLOAD: 60000, // 60 seconds
  
  // AI Operations - Long processing
  AI: 180000, // 3 minutes
  
  // AI Resume Parsing - Very long with model initialization
  AI_PARSING: 300000, // 5 minutes
  
  // PDF/DOCX Generation - Document processing
  DOCUMENT_GENERATION: 120000, // 2 minutes
  
  // Analytics - Standard operations
  ANALYTICS: 15000, // 15 seconds
  
  // Subscription/Payment - External API calls
  PAYMENT: 30000, // 30 seconds
};

// API Endpoint to Timeout Mapping
export const API_ENDPOINT_TIMEOUTS = {
  // Authentication endpoints
  '/auth/login': API_TIMEOUTS.AUTH,
  '/auth/register': API_TIMEOUTS.AUTH,
  '/auth/logout': API_TIMEOUTS.AUTH,
  '/auth/me': API_TIMEOUTS.AUTH,
  '/auth/profile': API_TIMEOUTS.AUTH,
  '/auth/password': API_TIMEOUTS.AUTH,
  '/auth/forgot-password': API_TIMEOUTS.AUTH,
  '/auth/reset-password': API_TIMEOUTS.AUTH,
  '/auth/verify-email': API_TIMEOUTS.AUTH,
  '/auth/resend-otp': API_TIMEOUTS.AUTH,
  '/auth/email-status': API_TIMEOUTS.AUTH,
  '/auth/account': API_TIMEOUTS.AUTH,
  
  // Resume CRUD operations
  '/resumes': API_TIMEOUTS.CRUD,
  '/resumes/form-data': API_TIMEOUTS.CRUD,
  '/resumes/auto-save': API_TIMEOUTS.CRUD,
  '/resumes/complete': API_TIMEOUTS.CRUD,
  '/resumes/template': API_TIMEOUTS.CRUD,
  '/resumes/template-styling': API_TIMEOUTS.CRUD,
  '/resumes/duplicate': API_TIMEOUTS.CRUD,
  '/resumes/toggle-active': API_TIMEOUTS.CRUD,
  '/resumes/analytics': API_TIMEOUTS.CRUD,
  
  // Template operations
  '/templates': API_TIMEOUTS.CRUD,
  '/templates/category': API_TIMEOUTS.CRUD,
  
  // User operations
  '/users/profile': API_TIMEOUTS.CRUD,
  '/users/stats': API_TIMEOUTS.CRUD,
  
  // File upload operations
  '/uploads': API_TIMEOUTS.UPLOAD,
  '/uploads/profile-picture': API_TIMEOUTS.UPLOAD,
  
  // AI Resume Parsing (heavy operations)
  '/uploads/parse-resume': API_TIMEOUTS.AI_PARSING,
  '/ai/ats-score': API_TIMEOUTS.AI_PARSING,
  
  // AI Operations
  '/ai/rewrite': API_TIMEOUTS.AI,
  '/ai/summarize': API_TIMEOUTS.AI,
  '/ai/adjust-tone': API_TIMEOUTS.AI,
  '/ai/enhance-keywords': API_TIMEOUTS.AI,
  '/ai/usage': API_TIMEOUTS.AI,
  
  // Document generation
  '/resumes/download/pdf': API_TIMEOUTS.DOCUMENT_GENERATION,
  '/resumes/download/docx': API_TIMEOUTS.DOCUMENT_GENERATION,
  '/resumes/download': API_TIMEOUTS.DOCUMENT_GENERATION,
  
  // Analytics
  '/analytics/summary': API_TIMEOUTS.ANALYTICS,
  '/analytics/resume': API_TIMEOUTS.ANALYTICS,
  '/analytics/template': API_TIMEOUTS.ANALYTICS,
  
  // Subscription/Payment operations
  '/subscriptions/current': API_TIMEOUTS.PAYMENT,
  '/subscriptions/plans': API_TIMEOUTS.PAYMENT,
  '/subscriptions/start-trial': API_TIMEOUTS.PAYMENT,
  '/subscriptions/create-checkout-session': API_TIMEOUTS.PAYMENT,
  '/subscriptions/success': API_TIMEOUTS.PAYMENT,
  '/subscriptions/cancel': API_TIMEOUTS.PAYMENT,
  '/subscriptions/reactivate': API_TIMEOUTS.PAYMENT,
  '/subscriptions/billing-history': API_TIMEOUTS.PAYMENT,
  '/subscriptions/update-payment-method': API_TIMEOUTS.PAYMENT,
  
  // Feedback operations
  '/feedback': API_TIMEOUTS.CRUD,
};

/**
 * Get timeout for a specific API endpoint
 * @param {string} endpoint - The API endpoint path
 * @returns {number} - Timeout in milliseconds
 */
export const getTimeoutForEndpoint = (endpoint) => {
  // Remove query parameters and trailing slashes
  const cleanEndpoint = endpoint.split('?')[0].replace(/\/$/, '');
  
  // Check for exact match first
  if (API_ENDPOINT_TIMEOUTS[cleanEndpoint]) {
    return API_ENDPOINT_TIMEOUTS[cleanEndpoint];
  }
  
  // Check for pattern matches
  for (const [pattern, timeout] of Object.entries(API_ENDPOINT_TIMEOUTS)) {
    if (cleanEndpoint.includes(pattern)) {
      return timeout;
    }
  }
  
  // Default timeout for unmatched endpoints
  return API_TIMEOUTS.CRUD;
};

/**
 * Get timeout for API type
 * @param {string} type - The API type (AUTH, CRUD, UPLOAD, AI, etc.)
 * @returns {number} - Timeout in milliseconds
 */
export const getTimeoutForType = (type) => {
  return API_TIMEOUTS[type] || API_TIMEOUTS.CRUD;
};

/**
 * Create axios config with appropriate timeout
 * @param {string} endpoint - The API endpoint
 * @param {object} additionalConfig - Additional axios config
 * @returns {object} - Axios config with timeout
 */
export const createApiConfig = (endpoint, additionalConfig = {}) => {
  const timeout = getTimeoutForEndpoint(endpoint);
  return {
    timeout,
    ...additionalConfig
  };
};
