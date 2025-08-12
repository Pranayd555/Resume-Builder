// API Configuration for different environments
const API_CONFIG = {
  // Development (local)
  development: {
    baseURL: 'http://localhost:5000/api'
  },
  // Production (Render)
  production: {
    baseURL: 'https://resume-builder-m5ef.onrender.com/api'
  },
  // Staging (if you have a staging environment)
  staging: {
    baseURL: 'https://resume-builder-m5ef.onrender.com/api' // Same as production for now
  }
};

// Get the current environment
const getEnvironment = () => {
  // Force production URL for now to fix the 404 issue
  return 'https://resume-builder-m5ef.onrender.com/api';
  
  // Original logic (commented out for debugging)
  // if (process.env.REACT_APP_API_URL) {
  //   // If environment variable is set, use it
  //   return process.env.REACT_APP_API_URL;
  // }
  
  // // Otherwise, use environment-based configuration
  // const env = process.env.NODE_ENV || 'development';
  // return API_CONFIG[env]?.baseURL || API_CONFIG.development.baseURL;
};

export const API_BASE_URL = getEnvironment();

// Log the API URL being used (for debugging)
console.log('🔗 API Base URL:', API_BASE_URL); 