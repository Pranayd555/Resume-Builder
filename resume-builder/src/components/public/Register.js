import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import { useAuth } from '../../contexts/AuthContext';
import { validators } from '../../models/dataModels';
import {
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  useRouteScrollToTop();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode(); // Set initial mode

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const validation = validators.validateRegistration(formData);

    // Add terms agreement validation
    if (!formData.agreeToTerms) {
      validation.errors.agreeToTerms = 'You must agree to the terms and conditions';
      validation.isValid = false;
    }

    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await register(formData);

    if (result.success) {
      // Always navigate to dashboard page
      navigate('/dashboard', {
        state: {
          requiresEmailVerification: result.requiresEmailVerification,
          email: formData.email
        }
      });
    }
  };


  const passwordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || 'bg-gray-300',
      percentage: (strength / 5) * 100,
    };
  };

  const passwordStrengthInfo = passwordStrength(formData.password);

  // Email verification modal is now handled on the resume-list page

  return (
    <div className="relative flex size-full min-h-screen flex-col justify-center overflow-x-hidden" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
      <div className="flex items-center justify-center px-4 py-8 relative z-10 w-full">
        <div className="w-[95%] md:w-[90%] mx-auto">
          <div className="bubble-card w-full">
            {/* Back to Home Button */}
            <div className="mb-4 text-center md:text-left">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm font-medium bg-white/50 dark:bg-black/50 px-4 py-2 rounded-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <img
                src={isDarkMode ? '/resume-builder-logo-512-dark.png' : '/resume-builder-logo-512-light.png'}
                alt="Presmistique - AI Resume Builder Logo"
                className="mx-auto h-24 w-auto mb-6 drop-shadow-lg"
              />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                Create Account
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Join us and start building your professional resume</p>
            </div>

            {/* Global Error */}
            {error && (
              <div className="bg-red-50/90 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 ml-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3 rounded-xl border bg-white/70 dark:bg-black/40 text-gray-900 dark:text-white backdrop-blur-sm ${validationErrors.firstName
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-white/40 dark:border-white/20 focus:border-blue-500 focus:ring-blue-500/30'
                      } focus:outline-none focus:ring-4 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm`}
                    placeholder="Enter your first name"
                    required
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1 ml-1 font-medium">{validationErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 ml-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3 rounded-xl border bg-white/70 dark:bg-black/40 text-gray-900 dark:text-white backdrop-blur-sm ${validationErrors.lastName
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-white/40 dark:border-white/20 focus:border-blue-500 focus:ring-blue-500/30'
                      } focus:outline-none focus:ring-4 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm`}
                    placeholder="Enter your last name"
                    required
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1 ml-1 font-medium">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 ml-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-5 py-3 rounded-xl border bg-white/70 dark:bg-black/40 text-gray-900 dark:text-white backdrop-blur-sm ${validationErrors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-white/40 dark:border-white/20 focus:border-blue-500 focus:ring-blue-500/30'
                    } focus:outline-none focus:ring-4 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm`}
                  placeholder="Enter your email address"
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1 ml-1 font-medium">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 ml-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3 pr-12 rounded-xl border bg-white/70 dark:bg-black/40 text-gray-900 dark:text-white backdrop-blur-sm ${validationErrors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-white/40 dark:border-white/20 focus:border-blue-500 focus:ring-blue-500/30'
                      } focus:outline-none focus:ring-4 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2 ml-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200/50 dark:bg-gray-600/50 rounded-full h-2 backdrop-blur-sm">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrengthInfo.color}`}
                          style={{ width: `${passwordStrengthInfo.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{passwordStrengthInfo.label}</span>
                    </div>
                  </div>
                )}

                {validationErrors.password && (
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1 ml-1 font-medium">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 ml-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3 pr-12 rounded-xl border bg-white/70 dark:bg-black/40 text-gray-900 dark:text-white backdrop-blur-sm ${validationErrors.confirmPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-white/40 dark:border-white/20 focus:border-blue-500 focus:ring-blue-500/30'
                      } focus:outline-none focus:ring-4 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1 ml-1 font-medium">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3 px-1">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white/50"
                />
                <div className="text-sm">
                  <label className="text-gray-800 dark:text-gray-200 font-medium">
                    I agree to the{' '}
                    <Link to="/terms-conditions" className="text-blue-700 dark:text-blue-400 hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy-policy" className="text-blue-700 dark:text-blue-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                  {validationErrors.agreeToTerms && (
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1 font-medium">{validationErrors.agreeToTerms}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-xl font-bold tracking-wide transition-all duration-300 transform ${isLoading
                  ? 'bg-gray-400/50 text-gray-100 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1'
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-400/30 dark:border-gray-500/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-gray-600 dark:text-gray-400 font-medium bg-white/30 dark:bg-black/30 backdrop-blur rounded-full">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
                  }}
                  className="w-full inline-flex justify-center py-3 px-4 border border-white/40 dark:border-white/10 rounded-xl shadow-sm text-sm font-semibold bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-white/20 hover:shadow-md transition-all duration-200 backdrop-blur-sm"
                  title="Sign up with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${process.env.REACT_APP_API_URL}/auth/linkedin`;
                  }}
                  className="w-full inline-flex justify-center py-3 px-4 border border-white/40 dark:border-white/10 rounded-xl shadow-sm text-sm font-semibold bg-white/60 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-white/20 hover:shadow-md transition-all duration-200 backdrop-blur-sm"
                  title="Sign up with LinkedIn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="ml-2">LinkedIn</span>
                </button>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;