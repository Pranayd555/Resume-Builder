import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Lottie from "lottie-react";
import journey404Animation from '../../assets/journey_404_animation.json';
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import AnimatedBackground from '../AnimatedBackground';
import { useAuth } from '../../contexts/AuthContext';
import { SUPPORT_EMAIL } from '../../constants/brand';

// Friendlier copy for the error codes routes pass in (see App.js).
const ERROR_COPY = {
  'Network Timeout': {
    title: 'Connection timed out',
    subtitle: "We couldn't reach our server. Check your internet connection and try again.",
  },
};

const ErrorPage = ({
  errorCode,
  title = ERROR_COPY[errorCode]?.title || 'Something went wrong',
  subtitle = ERROR_COPY[errorCode]?.subtitle || 'Something went wrong on our side. Please try again, or go back to the home page.',
  showLoginButton = true,
  showBackButton = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get error details from navigation state
  // Raw error text from API calls isn't shown to users; the page keeps to plain language.
  const { from } = location.state || {};

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12 sm:pt-12 px-4 relative">
      <AnimatedBackground />
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .pulse-button {
          animation: pulseButton 2s ease-in-out infinite;
        }
        
        @keyframes pulseButton {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pulse-button { animation: none; }
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto w-full">
        {/* Animation Container with Overlay Text */}
        <div className="mt-2 sm:mt-3 mb-2 sm:mb-3 flex justify-center relative">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative">
            <Lottie
              animationData={journey404Animation}
              loop={true}
              autoplay={true}
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid meet'
              }}
            />

            {/* Text Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 px-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-2 sm:mb-3">
                {from === 'dashboard' ? "We couldn't load your resumes" : title}
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Spacer for overlay text */}
        <div className="h-12 sm:h-14 md:h-12 lg:h-12"></div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          {showLoginButton && !isAuthenticated && (
            <button
              type="button"
              onClick={handleLogin}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 pulse-button"
            >
              Log in
            </button>
          )}

          {showBackButton && (
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-gray-700 text-sm sm:text-base font-semibold rounded-lg border-2 border-gray-300 shadow-lg hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" />
              Go Back
            </button>
          )}

          <button
            type="button"
            onClick={handleGoHome}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-100 text-gray-700 text-sm sm:text-base font-semibold rounded-lg border border-gray-300 shadow-lg hover:bg-gray-200 hover:border-gray-400 transform hover:scale-105 transition-all duration-200"
          >
            <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" />
            Home
          </button>
        </div>

        {/* Additional Help Text */}
        <div className="mt-4 sm:mt-5 text-xs sm:text-sm text-gray-500 px-4">
          <p>If the problem continues, email <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
