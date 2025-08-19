import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { isAuthenticated, isLoading } = useAuth();
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
            <p className="text-gray-600">Please wait while we authenticate you.</p>
          </div>
        </div>
      </div>
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

  // If auth is not required but user is authenticated, redirect to main app
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/resume-list" replace />;
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

// Subscription-based protection
export const SubscriptionProtectedRoute = ({ 
  children, 
  requiredPlan = 'pro', 
  redirectTo = '/subscription' 
}) => {
  const { isAuthenticated, isLoading, hasActiveSubscription, getSubscriptionPlan } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Checking Subscription...</h3>
            <p className="text-gray-600">Please wait while we verify your access.</p>
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

  // Check subscription requirements
  const userPlan = getSubscriptionPlan();
  const hasValidSubscription = hasActiveSubscription();
  
  const planHierarchy = {
    free: 0,
    pro: 1,
    enterprise: 2,
  };

  const hasRequiredPlan = planHierarchy[userPlan] >= planHierarchy[requiredPlan];

  if (!hasValidSubscription || !hasRequiredPlan) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location, 
          requiredPlan,
          currentPlan: userPlan,
          hasValidSubscription
        }} 
        replace 
      />
    );
  }

  // Render the protected content
  return children;
};

// Role-based protection
export const RoleProtectedRoute = ({ 
  children, 
  requiredRole = 'user', 
  redirectTo = '/unauthorized' 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Checking Permissions...</h3>
            <p className="text-gray-600">Please wait while we verify your access.</p>
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
  const roleHierarchy = {
    user: 0,
    admin: 1,
  };

  const hasRequiredRole = roleHierarchy[user.role] >= roleHierarchy[requiredRole];

  if (!hasRequiredRole) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location, 
          requiredRole,
          currentRole: user.role
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
  const { requiredRole, currentRole } = location.state || {};

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        
        <p className="text-gray-600 mb-6">
          You don't have the required permissions to access this page.
        </p>
        
        {requiredRole && currentRole && (
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>Required Role:</strong> {requiredRole}
            </p>
            <p className="text-sm text-red-800">
              <strong>Your Role:</strong> {currentRole}
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
            onClick={() => window.location.href = '/resume-list'}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute; 