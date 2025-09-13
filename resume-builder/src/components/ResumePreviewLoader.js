import React from 'react';
import Lottie from "lottie-react";
import manRobotWorkAnimation from '../assets/man_robot_work.json';

const ResumePreviewLoader = ({ 
  title = "Crafting Your Professional Story...", 
  subtitle = "Our digital elves are working their magic on your resume." 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 backdrop-blur-sm">
      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
        
        .floating-particles {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }
      `}</style>
      
      {/* Floating Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-300 rounded-full floating-particles" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-300 rounded-full floating-particles" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-pink-300 rounded-full floating-particles" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-1.5 h-1.5 bg-indigo-300 rounded-full floating-particles" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-cyan-300 rounded-full floating-particles" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-yellow-300 rounded-full floating-particles" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/2 right-1/6 w-1.5 h-1.5 bg-green-300 rounded-full floating-particles" style={{ animationDelay: '2.5s' }}></div>
      </div>
      
      {/* Main Animation Container */}
      <div className="relative mb-6 sm:mb-8 fade-in flex justify-center items-center">
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
      <div className="text-center fade-in px-4" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-3 sm:mb-4 pulse-text">
          {title}
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-sm sm:max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-6 sm:mt-8 w-48 sm:w-64 md:w-80 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden fade-in mx-4" style={{ animationDelay: '1s' }}>
        <div className="progress-bar h-full rounded-full"></div>
      </div>
      
      {/* Loading Dots */}
      <div className="mt-4 sm:mt-6 flex space-x-2 fade-in" style={{ animationDelay: '1.5s' }}>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default ResumePreviewLoader;