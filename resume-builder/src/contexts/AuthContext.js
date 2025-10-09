import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { authAPI, apiHelpers } from '../services/api';
import { createUserModel, validators } from '../models/dataModels';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Track if we're already initializing to prevent duplicate calls
  const isInitializingRef = useRef(false);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent duplicate initialization calls
      if (isInitializingRef.current) {
        return;
      }
      
      try {
        isInitializingRef.current = true;
        const token = apiHelpers.getAuthToken();
        
        if (token) {
          // Verify token with backend
          const response = await authAPI.getCurrentUser();
          
          if (response.success) {
            const userData = createUserModel(response.data.user);
            apiHelpers.setCurrentUserData(userData);
            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
          } else {
            // Invalid token, clear auth data
            apiHelpers.clearAuthData();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        apiHelpers.clearAuthData();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      } finally {
        isInitializingRef.current = false;
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Validate credentials
      const validation = validators.validateLogin(credentials);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store auth data
        apiHelpers.setAuthToken(token);
        const userData = createUserModel(user);
        apiHelpers.setCurrentUserData(userData);
        
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
        toast.success('Login successful!');
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login with token (for OAuth callbacks)
  const loginWithToken = async (token) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Store the token
      apiHelpers.setAuthToken(token);
      
      // Get user data with the token
      const response = await authAPI.getCurrentUser();
      
      if (response.success) {
        const userData = createUserModel(response.data.user);
        apiHelpers.setCurrentUserData(userData);
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
        toast.success('Successfully signed in!');
        return { success: true, user: userData };
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Validate user data
      const validation = validators.validateRegistration(userData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, token, requiresEmailVerification } = response.data;
        
        // Store auth data
        apiHelpers.setAuthToken(token);
        const userModel = createUserModel(user);
        apiHelpers.setCurrentUserData(userModel);
        
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userModel });
        
        if (requiresEmailVerification) {
          toast.info('Registration successful! Please check your email for verification code.');
          return { 
            success: true, 
            user: userModel, 
            requiresEmailVerification: true 
          };
        } else {
          toast.success('Registration successful!');
          return { success: true, user: userModel };
        }
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      await authAPI.logout().catch(() => {
        // Ignore errors on logout endpoint
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data regardless of API call success
      apiHelpers.clearAuthData();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.info('Logged out successfully');
    }
  };

  // Update user profile (API call)
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      // Validate user data
      const validation = validators.validateUser(profileData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }

      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        const userData = createUserModel(response.data.user);
        apiHelpers.setCurrentUserData(userData);
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
        
        if (response.data.requiresEmailVerification) {
          toast.info('Profile updated! Please check your new email for verification code.');
          return { 
            success: true, 
            user: userData, 
            requiresEmailVerification: true 
          };
        } else {
          toast.success('Profile updated successfully!');
          return { success: true, user: userData };
        }
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Update user data locally (no API call)
  const updateUser = (userData) => {
    const updatedUser = createUserModel(userData);
    apiHelpers.setCurrentUserData(updatedUser);
    
    // Update token data if available
    if (userData.tokens !== undefined) {
      apiHelpers.setTokenBalance(userData.tokens);
    }
    
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updatedUser });
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      const response = await authAPI.changePassword(passwordData);
      
      if (response.success) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        throw new Error(response.error || 'Password change failed');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      if (!email || !validators.email(email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        toast.success('Password reset instructions sent to your email!');
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to send reset instructions');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Reset password
  const resetPassword = async (resetData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      if (!resetData.token || !resetData.password) {
        throw new Error('Reset token and new password are required');
      }

      if (resetData.password !== resetData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (resetData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const response = await authAPI.resetPassword(resetData);
      
      if (response.success) {
        toast.success('Password reset successful!');
        return { success: true };
      } else {
        throw new Error(response.error || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Verify email with OTP
  const verifyEmail = async (otp) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.verifyEmail(otp);
      
      if (response.success) {
        // Update user data to reflect verified status
        const updatedUser = { ...state.user, isEmailVerified: true };
        apiHelpers.setCurrentUserData(updatedUser);
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updatedUser });
        
        toast.success('Email verified successfully!');
        return { success: true };
      } else {
        throw new Error(response.error || 'Email verification failed');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.resendOtp();
      
      if (response.success) {
        toast.success('Verification code sent to your email!');
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to resend verification code');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Get email verification status
  const getEmailStatus = async () => {
    try {
      const response = await authAPI.getEmailStatus();
      
      if (response.success) {
        return { 
          success: true, 
          data: response.data 
        };
      } else {
        throw new Error(response.error || 'Failed to get email status');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has permission
  const hasPermission = (requiredPermission) => {
    if (!state.user) return false;
    
    // Basic role-based permissions
    const permissions = {
      admin: ['read', 'write', 'delete', 'admin'],
      user: ['read', 'write'],
    };
    
    const userPermissions = permissions[state.user.role] || [];
    return userPermissions.includes(requiredPermission);
  };

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    if (!state.user || !state.user.subscription) return false;
    
    const { subscription } = state.user;
    return subscription.isActive && new Date(subscription.endDate) > new Date();
  };

  // Get subscription plan
  const getSubscriptionPlan = () => {
    if (!state.user || !state.user.subscription) return 'free';
    return state.user.subscription.plan;
  };

  // Context value
  const contextValue = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    loginWithToken,
    register,
    logout,
    updateProfile,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendOtp,
    getEmailStatus,
    clearError,
    
    // Utilities
    hasPermission,
    hasActiveSubscription,
    getSubscriptionPlan,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext; 