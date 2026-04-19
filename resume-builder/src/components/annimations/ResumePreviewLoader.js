import React, { useEffect, useState } from 'react';
import Lottie from "lottie-react";
import manRobotWorkAnimation from '../../assets/man_robot_work.json';
import AnimatedBackground from '../AnimatedBackground';

const OUT_MS = 300;

const DEFAULT_SUBTITLES = [
  "Analyzing your resume...",
  "Extracting key skills...",
  "Matching industry standards...",
  "Optimizing content...",
  "Almost there...",
  "Wrapping up...",
];

const ResumePreviewLoader = ({
  title = "Our digital elves are working their magic on your resume.",
  subtitle,
}) => {

  // Guard: normalize whatever arrives into a safe string array
  const subtitles = Array.isArray(subtitle) && subtitle.length > 0
    ? subtitle
    : DEFAULT_SUBTITLES;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    // stop cycling once we're on the last subtitle
    if (index === subtitles.length - 1) return;

    const randomDelay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1500;

    const hold = setTimeout(() => {
      setPhase('exit');

      const swap = setTimeout(() => {
        setIndex(i => Math.min(i + 1, subtitles.length - 1));
        setPhase('enter');
      }, OUT_MS);

      return () => clearTimeout(swap);
    }, randomDelay);

    return () => clearTimeout(hold);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, subtitles.length, setPhase]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center justify-center bg-white dark:bg-transparent rounded-2xl shadow-xl dark:shadow-none dark:border-none p-8 mx-4">
        <style>{`
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
            0%, 100% { opacity: 0.7; }
            50%       { opacity: 1;   }
          }
          .progress-bar {
            background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            background-size: 200% 100%;
            animation: progressFlow 3s ease-in-out infinite;
          }
          @keyframes progressFlow {
            0%   { background-position:  200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        {/* Lottie */}
        <div className="relative mb-6 sm:mb-8 flex justify-center items-center">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
            <Lottie
              animationData={manRobotWorkAnimation}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
              rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-3 sm:mb-4 pulse-text">
            {title}
          </h2>

          {/* Subtitle slot — one item visible at a time */}
          <div className="h-10 overflow-hidden flex items-center justify-center relative">
            <span
              className={[
                'absolute text-base sm:text-lg md:text-xl',
                'text-gray-700 dark:text-gray-300',
                'transition-all duration-300 ease-in-out',
                phase === 'enter'
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-4',
              ].join(' ')}
            >
              {subtitles[index]}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 sm:mt-8 w-48 sm:w-64 md:w-80 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-4">
          <div className="progress-bar h-full rounded-full"></div>
        </div>

        {/* Bounce dots */}
        <div className="mt-4 sm:mt-6 flex space-x-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500   rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-pink-500   rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewLoader;