import React, { useState, useEffect } from 'react';
import Lottie from "lottie-react";
import craftingDocumentAnimation from '../../assets/crafting_document.json';

const AILoader = ({ 
  title = "Analyzing your resume...", 
  subtitle = "Our advanced AI is meticulously scanning your resume to provide a comprehensive ATS score.",
  showProgress = true,
  compact = false
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressSteps = [25, 50, 60, 75];
    let currentStep = 0;
    
    // Initial progress steps
    const stepInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setProgress(progressSteps[currentStep]);
        currentStep++;
      } else {
        clearInterval(stepInterval);
      }
    }, 1000); // 1 second between each step

    // After 5 seconds, go to 90%
    const timeoutId = setTimeout(() => {
      setProgress(90);
    }, 5000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center text-center w-full ${compact ? 'p-3' : 'p-6 sm:p-8'}`}>
      {/* Lottie Animation */}
      <div className={`${compact ? 'mb-3 w-24 h-24' : 'mb-4 sm:mb-6 w-32 h-32 sm:w-40 sm:h-40'} flex items-center justify-center`}>
        <Lottie 
          animationData={craftingDocumentAnimation} 
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
      
      {/* Title */}
      <h2 className={`text-gray-900 font-bold tracking-tight mb-2 ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}>
        {title}
      </h2>
      
      {/* Subtitle */}
      <p className={`text-gray-600 leading-relaxed ${compact ? 'text-xs max-w-xs' : 'text-sm sm:text-base max-w-sm'}`}>
        {subtitle}
      </p>
      
      {/* Progress Bar */}
      {showProgress && (
        <div className={`w-full ${compact ? 'max-w-xs mt-3' : 'max-w-xs sm:max-w-sm mt-4 sm:mt-6'}`}>
          <div className="relative pt-1">
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200 relative">
              <div 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out relative overflow-hidden" 
                style={{width: `${progress}%`}}
              >
                {/* Flowing animation overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-flow"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">This may take a few moments.</p>
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes flow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-flow {
          animation: flow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AILoader;
