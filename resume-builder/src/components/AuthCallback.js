import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLoader from './AuthLoader';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      return;
    }

    const handleCallback = async () => {
      try {
        hasProcessed.current = true;
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        console.log('AuthCallback: Processing OAuth callback', { token: !!token, error });

        if (error) {
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        if (token) {
          // Store the token and update auth context
          const result = await loginWithToken(token);
          if (result.success) {
            navigate('/dashboard', { replace: true });
          } else {
            setError(result.error || 'Authentication failed');
            setLoading(false);
          }
        } else {
          setError('No authentication token received.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [loginWithToken, navigate, searchParams]); // Include all dependencies

  if (loading) {
    return (
      <AuthLoader 
        title="Completing authentication..."
        subtitle="Please wait while we complete your login process."
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AuthCallback; 