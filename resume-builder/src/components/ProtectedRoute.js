import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLoader from './AuthLoader';

// Role hierarchy and permissions
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const ROLE_HIERARCHY = {
  [ROLES.USER]: 0,
  [ROLES.ADMIN]: 1
};

// Route categories for better organization
export const ROUTE_CATEGORIES = {
  PUBLIC: 'public',
  AUTH: 'auth',
  USER: 'user',
  ADMIN: 'admin'
};

const ProtectedRoute = ({ children, requireAuth = true, requireRole = null, redirectTo = '/' }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // FOR TESTING: Always show AuthLoader
  const showLoader = false; // Set to false when done testing

  // Show loading spinner while auth status is being determined
  if (isLoading || showLoader) {
    return (
      <AuthLoader 
        title="Authenticating..."
        subtitle="Please wait while we verify your credentials."
      />
    );
  }

  // If auth is required and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If auth is not required but user is authenticated, redirect to appropriate dashboard
  if (!requireAuth && isAuthenticated) {
    const dashboardRoute = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  // Check role requirements if specified
  if (requireRole && isAuthenticated) {
    const hasRequiredRole = ROLE_HIERARCHY[user?.role] >= ROLE_HIERARCHY[requireRole];

    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            from: location, 
            requiredRole: requireRole,
            currentRole: user?.role
          }} 
          replace 
        />
      );
    }
  }

  // Render the protected content
  return children;
};

// Higher-order component version
export const withProtectedRoute = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};


// Role-based protection with enhanced features
export const RoleProtectedRoute = ({ 
  children, 
  requiredRole = ROLES.USER, 
  redirectTo = '/unauthorized',
  fallbackRoute = null,
  allowHigherRoles = true
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Checking Permissions...</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your access.</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role requirements
  const hasRequiredRole = allowHigherRoles 
    ? ROLE_HIERARCHY[user?.role] >= ROLE_HIERARCHY[requiredRole]
    : user?.role === requiredRole;

  if (!hasRequiredRole) {
    // If fallback route is provided and user has a valid role, redirect there
    if (fallbackRoute && user?.role) {
      return <Navigate to={fallbackRoute} replace />;
    }
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location, 
          requiredRole,
          currentRole: user?.role
        }} 
        replace 
      />
    );
  }

  // Render the protected content
  return children;
};

// Unauthorized page component
export const UnauthorizedPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { requiredRole, currentRole } = location.state || {};

  const getDashboardRoute = () => {
    if (user?.role === ROLES.ADMIN) {
      return '/admin/dashboard';
    }
    return '/dashboard';
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [ROLES.USER]: 'User',
      [ROLES.ADMIN]: 'Administrator'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You don't have the required permissions to access this page.
        </p>
        
        {requiredRole && currentRole && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-400">
              <strong>Required Role:</strong> {getRoleDisplayName(requiredRole)}
            </p>
            <p className="text-sm text-red-800 dark:text-red-400">
              <strong>Your Role:</strong> {getRoleDisplayName(currentRole)}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Go Back
          </button>
          
          <button
            onClick={() => window.location.href = getDashboardRoute()}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute; 