import React from 'react';
import Lottie from "lottie-react";
import manRobotWorkAnimation from '../assets/man_robot_work.json';
import AnimatedBackground from './AnimatedBackground';

const ResumePreviewLoader = ({ 
  title = "Crafting Your Professional Story...", 
  subtitle = "Our digital elves are working their magic on your resume." 
}) => {
  
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center justify-center bg-white dark:bg-transparent rounded-2xl shadow-xl dark:shadow-none dark:border-none p-8 mx-4">
      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        
        .pulse-text {
          animation: pulseText 2s ease-in-out infinite;
        }
        
        @keyframes pulseText {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        
        .progress-bar {
          background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
          background-size: 200% 100%;
          animation: progressFlow 3s ease-in-out infinite;
        }
        
        @keyframes progressFlow {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
      `}</style>
      
      
      {/* Main Animation Container */}
      <div className="relative mb-6 sm:mb-8 flex justify-center items-center">
        {/* Primary Lottie Animation */}
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
          <Lottie 
            animationData={manRobotWorkAnimation} 
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
        </div>
      </div>
      
      {/* Text Content */}
      <div className="text-center px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-3 sm:mb-4 pulse-text">
          {title}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-sm sm:max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-6 sm:mt-8 w-48 sm:w-64 md:w-80 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-4">
        <div className="progress-bar h-full rounded-full"></div>
      </div>
      
      {/* Loading Dots */}
      <div className="mt-4 sm:mt-6 flex space-x-2">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      </div>
    </div>
  );
};

export default ResumePreviewLoader;