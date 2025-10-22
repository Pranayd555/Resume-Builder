import React from 'react';
import { useSubscriptionCountdown } from '../hooks/useSubscriptionCountdown';

/**
 * Subscription Countdown Timer Component
 * Shows countdown when subscription expires today
 */
const SubscriptionCountdown = ({ className = '', showIcon = true, variant = 'default', urgencyLevel = 'medium' }) => {
  const {
    timeRemaining,
    isExpired,
    isResetting,
    isExpiringToday,
    shouldShowDaysRemaining,
    daysRemaining,
    displayMessage,
    formatTime
  } = useSubscriptionCountdown();

  // Don't render if not showing days remaining and not expiring today
  if (!shouldShowDaysRemaining && !isExpiringToday) {
    return null;
  }

  // Get styling based on urgency level
  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          icon: '🔥',
          pulse: 'animate-pulse'
        };
      case 'high':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-800 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-800',
          icon: '⚠️',
          pulse: ''
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: '⏰',
          pulse: ''
        };
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-800 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          icon: '📅',
          pulse: ''
        };
    }
  };

  const urgencyStyles = getUrgencyStyles();

  // Get variant styles for responsive design
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'px-2 py-1 text-xs sm:text-sm';
      case 'large':
        return 'px-3 py-2 text-sm sm:text-base';
      case 'banner':
        return 'px-4 py-3 text-base sm:text-lg font-semibold';
      default:
        return 'px-2 py-1 text-xs sm:text-sm';
    }
  };

  // Get responsive layout classes
  const getResponsiveClasses = () => {
    return 'inline-flex items-center rounded-full font-medium border transition-all duration-200 hover:shadow-md';
  };

  return (
    <div className={`${getResponsiveClasses()} ${urgencyStyles.bg} ${urgencyStyles.text} ${urgencyStyles.border} ${getVariantStyles()} ${urgencyStyles.pulse} ${className}`}>
      {showIcon && (
        <span className="mr-1 sm:mr-2 text-sm sm:text-base">
          {isResetting ? '🔄' : urgencyStyles.icon}
        </span>
      )}
      
      <span className="flex items-center flex-wrap">
        {isResetting ? (
          <span className="animate-pulse text-xs sm:text-sm">
            {displayMessage}
          </span>
        ) : isExpired ? (
          <span className="animate-pulse text-xs sm:text-sm">
            {displayMessage}
          </span>
        ) : shouldShowDaysRemaining ? (
          <span className="text-xs sm:text-sm">
            ⏰ {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
          </span>
        ) : timeRemaining ? (
          <span className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Plan expires today in </span>
            <span className="sm:hidden">Expires in </span>
            <span className="font-mono font-semibold">
              {formatTime(timeRemaining)}
            </span>
          </span>
        ) : (
          <span className="text-xs sm:text-sm">{displayMessage}</span>
        )}
      </span>

      {/* Animated dots for loading state */}
      {isResetting && (
        <span className="ml-1 sm:ml-2">
          <span className="animate-bounce text-xs">.</span>
          <span className="animate-bounce text-xs" style={{ animationDelay: '0.1s' }}>.</span>
          <span className="animate-bounce text-xs" style={{ animationDelay: '0.2s' }}>.</span>
        </span>
      )}
    </div>
  );
};

export default SubscriptionCountdown;
