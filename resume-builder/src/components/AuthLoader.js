import React from 'react';
import Lottie from "lottie-react";
import meditationLoaderAnimation from '../assets/meditation_loader.json';

const AuthLoader = ({ 
  title = "Authenticating...", 
  subtitle = "Please wait while we verify your credentials.",
  compact = false
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        {/* Lottie Animation */}
        <div className={`${compact ? 'w-32 h-32 sm:w-40 sm:h-40' : 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72'} flex items-center justify-center`}>
          <Lottie 
            animationData={meditationLoaderAnimation} 
            loop={true}
            autoplay={true}
            style={{ 
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid meet'
            }}
          />
        </div>
        
        {/* Text Content */}
        <div className="text-center">
          <h3 className={`text-gray-900 dark:text-gray-200 mb-2 font-semibold ${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl lg:text-3xl'}`}>
            {title}
          </h3>
          <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-sm sm:text-base' : 'text-sm sm:text-base md:text-lg lg:text-xl'} max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoader;
