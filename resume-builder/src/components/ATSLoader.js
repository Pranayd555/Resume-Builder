import React, { useState, useEffect } from 'react';

const ATSLoader = ({ 
  title = "Analyzing your resume...", 
  subtitle = "Our advanced algorithm is meticulously scanning your resume to provide a comprehensive ATS score.",
  showProgress = true 
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
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-orange-50/90 h-full w-full">
      {/* 3D Rotating Loader */}
      <div className="loader mb-8">
        <div className="inner one"></div>
        <div className="inner two"></div>
        <div className="inner three"></div>
      </div>
      
      {/* Title */}
      <h2 className="text-gray-900 dark:text-gray-100 text-2xl font-bold tracking-tight mb-2">
        {title}
      </h2>
      
      {/* Subtitle */}
      <p className="text-gray-600 dark:text-gray-400 text-base max-w-md">
        {subtitle}
      </p>
      
      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-sm mt-8">
          <div className="relative pt-1">
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700 relative">
              <div 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out relative overflow-hidden" 
                style={{width: `${progress}%`}}
              >
                {/* Flowing animation overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-flow"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments.</p>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Styles */}
      <style jsx>{`
        .loader {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          perspective: 800px;
          position: relative;
        }
        
        .inner {
          position: absolute;
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
        
        .inner.one {
          left: 0%;
          top: 0%;
          animation: rotate-one 1s linear infinite;
          border-bottom: 3px solid #10b981;
        }
        
        .inner.two {
          right: 0%;
          top: 0%;
          animation: rotate-two 1s linear infinite;
          border-right: 3px solid #10b981;
        }
        
        .inner.three {
          right: 0%;
          bottom: 0%;
          animation: rotate-three 1s linear infinite;
          border-top: 3px solid #10b981;
        }
        
        @keyframes rotate-one {
          0% {
            transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
          }
        }
        
        @keyframes rotate-two {
          0% {
            transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
          }
        }
        
        @keyframes rotate-three {
          0% {
            transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
          }
        }
        
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

export default ATSLoader;
