import React, { useEffect, useRef } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import dotlottieLoaderAnimation from '../assets/dotlottie-loader.json';
import AnimatedBackground from './AnimatedBackground';

const DotLottieLoader = ({ 
  title = "Loading...", 
  subtitle = "Please wait while we process your request.",
  size = null // Will be calculated responsively if not provided
}) => {
  const canvasRef = useRef(null);
  const dotLottieRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !dotLottieRef.current) {
      const initializeAnimation = async () => {
        try {
          console.log('Canvas element:', canvasRef.current);
          console.log('Canvas dimensions:', canvasRef.current.width, 'x', canvasRef.current.height);
          console.log('Animation data keys:', Object.keys(dotlottieLoaderAnimation));
          console.log('Animation version:', dotlottieLoaderAnimation.v);
          console.log('Animation frame rate:', dotlottieLoaderAnimation.fr);
          
          // Create a new DotLottie instance with the animation data directly
          dotLottieRef.current = new DotLottie({
            canvas: canvasRef.current,
            autoplay: true,
            loop: true,
            data: dotlottieLoaderAnimation,
          });
          
          console.log('DotLottie instance created:', dotLottieRef.current);
          
          // Add event listeners to debug
          if (dotLottieRef.current) {
            dotLottieRef.current.addEventListener('ready', () => {
              console.log('DotLottie animation is ready');
            });
            
            dotLottieRef.current.addEventListener('play', () => {
              console.log('DotLottie animation started playing');
            });
            
            dotLottieRef.current.addEventListener('error', (event) => {
              console.error('DotLottie animation error:', event);
            });
          }
          
        } catch (error) {
          console.error('Error initializing DotLottie:', error);
          console.error('Error details:', error.message, error.stack);
          
          // Alternative approach: try loading as URL
          try {
            console.log('Trying fallback with blob URL...');
            // Convert the JSON data to a blob URL
            const jsonString = JSON.stringify(dotlottieLoaderAnimation);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            console.log('Blob URL created:', url);
            
            dotLottieRef.current = new DotLottie({
              canvas: canvasRef.current,
              autoplay: true,
              loop: true,
              src: url,
            });
            
            console.log('DotLottie animation loaded with blob URL');
            
            // Clean up the blob URL after a delay
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 1000);
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            console.error('Fallback error details:', fallbackError.message, fallbackError.stack);
          }
        }
      };

      // Add a small delay to ensure canvas is fully rendered
      setTimeout(initializeAnimation, 100);
    }

    return () => {
      if (dotLottieRef.current) {
        try {
          dotLottieRef.current.destroy();
          dotLottieRef.current = null;
        } catch (error) {
          console.error('Error destroying DotLottie:', error);
        }
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center justify-center bg-white dark:bg-transparent rounded-2xl shadow-xl dark:shadow-none dark:border-none p-8 mx-4">
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
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
      `}</style>
      
      {/* DotLottie Animation */}
      <div className="relative mb-4 sm:mb-6 fade-in">
        <canvas 
          ref={canvasRef}
          width={size || 200}
          height={size || 200}
          style={{ 
            width: size ? `${size}px` : 'clamp(150px, 20vw, 300px)', 
            height: size ? `${size}px` : 'clamp(150px, 20vw, 300px)',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
            backgroundColor: 'transparent'
          }}
        />
      </div>
      
      {/* Text Content */}
      <div className="text-center fade-in px-4" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 pulse-text">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xs sm:max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
      </div>
    </div>
  );
};

export default DotLottieLoader;
