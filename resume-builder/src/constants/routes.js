// Route constants for better maintainability and organization

// Public routes (accessible to everyone)
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin-login',
  REGISTER: '/register',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_CONDITIONS: '/terms-conditions',
  CANCELLATION_REFUNDS: '/cancellation-refunds',
  SHIPPING: '/shipping',
  CONTACT_US: '/contact-us',
  UNAUTHORIZED: '/unauthorized',
  AUTH_CALLBACK: '/auth/callback',
  ERROR: '/error',
  NETWORK_TIMEOUT: '/network-timeout'
};

// User routes (require authentication)
export const USER_ROUTES = {
  DASHBOARD: '/dashboard',
  RESUMES: '/resumes',
  RESUME_FORM: '/resume-form',
  TEMPLATE_SELECTION: '/template-selection',
  RESUME_PREVIEW: '/resume-preview',
  RESUME_TEMPLATES: '/resume-templates',
  FEEDBACK: '/feedback',
  PAYMENT: '/payment',
  PROFILE: '/profile',
  ANALYTICS: '/analytics',
  CREATE_TEMPLATE: '/create-template'
};

// Admin routes (require admin role)
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  PROFILE: '/admin/profile',
  USERS: '/admin/users',
  FEEDBACK: '/admin/feedback',
  CONTACTS: '/admin/contacts',
  TRANSACTIONS: '/admin/transactions',
  TOKENS: '/admin/tokens',
  RESUMES: '/admin/resumes',
  TEMPLATES: '/admin/templates',
  ANALYTICS: '/admin/analytics',
  EMAIL_TEST: '/admin/email-test',
  SETTINGS: '/admin/settings'
};

// Route categories for protection
export const ROUTE_CATEGORIES = {
  PUBLIC: 'public',
  AUTH: 'auth',
  USER: 'user',
  ADMIN: 'admin'
};

// Route protection configuration
export const ROUTE_PROTECTION = {
  // Public routes - no authentication required
  [PUBLIC_ROUTES.HOME]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.LOGIN]: { category: ROUTE_CATEGORIES.AUTH, requireAuth: false },
  [PUBLIC_ROUTES.ADMIN_LOGIN]: { category: ROUTE_CATEGORIES.AUTH, requireAuth: false },
  [PUBLIC_ROUTES.REGISTER]: { category: ROUTE_CATEGORIES.AUTH, requireAuth: false },
  [PUBLIC_ROUTES.PRIVACY_POLICY]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.TERMS_CONDITIONS]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.CANCELLATION_REFUNDS]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.SHIPPING]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.CONTACT_US]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.UNAUTHORIZED]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.AUTH_CALLBACK]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.ERROR]: { category: ROUTE_CATEGORIES.PUBLIC },
  [PUBLIC_ROUTES.NETWORK_TIMEOUT]: { category: ROUTE_CATEGORIES.PUBLIC },

  // User routes - require authentication
  [USER_ROUTES.DASHBOARD]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },
  [USER_ROUTES.RESUMES]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },
  [USER_ROUTES.RESUME_FORM]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },
  [USER_ROUTES.RESUME_TEMPLATES]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },
  [USER_ROUTES.FEEDBACK]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },
  [USER_ROUTES.PAYMENT]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },
  [USER_ROUTES.PROFILE]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },
  [USER_ROUTES.ANALYTICS]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },
  [USER_ROUTES.CREATE_TEMPLATE]: { category: ROUTE_CATEGORIES.USER, requireAuth: true },

  // Admin routes - require admin role
  [ADMIN_ROUTES.DASHBOARD]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.PROFILE]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.USERS]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.FEEDBACK]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.CONTACTS]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.TRANSACTIONS]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.TOKENS]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.RESUMES]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.TEMPLATES]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.ANALYTICS]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.EMAIL_TEST]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' },
  [ADMIN_ROUTES.SETTINGS]: { category: ROUTE_CATEGORIES.ADMIN, requireRole: 'admin' }
};

// Helper functions
export const getRouteProtection = (path) => {
  return ROUTE_PROTECTION[path] || { category: ROUTE_CATEGORIES.PUBLIC };
};

export const isPublicRoute = (path) => {
  return getRouteProtection(path).category === ROUTE_CATEGORIES.PUBLIC;
};

export const isAuthRoute = (path) => {
  return getRouteProtection(path).category === ROUTE_CATEGORIES.AUTH;
};

export const isUserRoute = (path) => {
  return getRouteProtection(path).category === ROUTE_CATEGORIES.USER;
};

export const isAdminRoute = (path) => {
  return getRouteProtection(path).category === ROUTE_CATEGORIES.ADMIN;
};

export const requiresAuth = (path) => {
  return getRouteProtection(path).requireAuth === true;
};

export const requiresRole = (path) => {
  return getRouteProtection(path).requireRole;
};
