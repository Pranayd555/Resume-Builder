import React, { useState } from 'react';

const Tooltip = ({ 
  children, 
  content, 
  position = 'bottom', 
  delay = 300,
  className = '',
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl shadow-xl pointer-events-none transition-all duration-300 backdrop-blur-sm';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 translate-x-1/2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      {isVisible && content && (
        <div className={getPositionClasses()}>
          <div className={getArrowClasses()}></div>
          {typeof content === 'string' ? (
            <div className="whitespace-nowrap">{content}</div>
          ) : (
            content
          )}
        </div>
      )}
    </div>
  );
};

export default Tooltip; 