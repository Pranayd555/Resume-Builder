import React, { useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

function EmailVerification({ 
  email, 
  onVerificationSuccess, 
  onSkip, 
  type = 'registration',
  showSkip = false 
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft]);

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    setError('');

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== 6) {
      setError('Please enter a complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyEmail(otpToVerify);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onVerificationSuccess && onVerificationSuccess();
        }, 1500);
      } else {
        setError(response.error || 'Invalid verification code');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed. Please try again.');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await authAPI.resendOtp();
      
      if (response.success) {
        setTimeLeft(60); // Reset timer to 60 seconds
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        // Show success message briefly
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(response.error || 'Failed to resend verification code');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  if (success && !isLoading) {
    return (
      <div className="text-center py-8">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Email Verified Successfully!
        </h3>
        <p className="text-gray-600">
          {type === 'registration' 
            ? 'Your account is now active. Redirecting...' 
            : type === 'profile-verification'
            ? 'Your email has been verified successfully!'
            : 'Your email has been updated and verified.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">{email}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message (for resend) */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 text-sm">New verification code sent!</span>
          </div>
        </div>
      )}

      {/* OTP Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Enter verification code
        </label>
        <div className="flex justify-center space-x-2 sm:space-x-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Timer and Resend */}
      <div className="text-center mb-6">
        {!canResend ? (
          <div className="flex items-center justify-center text-gray-600">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">
              Resend code in {formatTime(timeLeft)}
            </span>
          </div>
        ) : (
          <button
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            {isResending ? (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend verification code'
            )}
          </button>
        )}
      </div>

      {/* Verify Button */}
      <button
        onClick={() => handleVerifyOtp()}
        disabled={isLoading || otp.join('').length !== 6}
        className={`w-full py-3 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 ${
          isLoading || otp.join('').length !== 6
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
            Verifying...
          </div>
        ) : (
          'Verify Email'
        )}
      </button>

      {/* Skip Option */}
      {showSkip && (
        <div className="text-center mt-4">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}

export default EmailVerification;
