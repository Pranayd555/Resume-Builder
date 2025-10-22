import { useState, useEffect, useCallback, useRef } from 'react';
import { useSubscription } from './useSubscription';
import { toast } from 'react-toastify';
import subscriptionService from '../services/subscriptionService';

/**
 * Custom hook for subscription countdown timer
 * Handles countdown display and automatic subscription reset for both trial and subscription
 */
export const useSubscriptionCountdown = () => {
  const { subscription, refreshSubscription } = useSubscription();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hasResetBeenCalled, setHasResetBeenCalled] = useState(false);
  const resetTimeoutRef = useRef(null);

  // Get remaining days for both trial and subscription users
  const getRemainingDaysValue = useCallback(() => {
    if (!subscription) return 0;
    
    // For free plan users, return 0 (no countdown needed)
    if (subscription.status === 'active' || subscription.plan === 'free') {
      return 0;
    }
    
    // For trial users, use trialRemainingDays
    if (subscription.status === 'trialing' || subscription.isTrial) {
      return subscription.trialRemainingDays || 0;
    }
    
    // For subscription users, use remainingDays
    return subscription.remainingDays || 0;
  }, [subscription]);


  // Check if subscription/trial expires today
  const isExpiringToday = useCallback(() => {
    if (!subscription) return false;
    
    // For free plan users, never expiring
    if (subscription.status === 'active' || subscription.plan === 'free') {
      return false;
    }
    
    // Use remainingDays to check if expiring today (0 days remaining)
    const days = getRemainingDaysValue();
    return days <= 0;
  }, [subscription, getRemainingDaysValue]);

  // Check if should show days remaining (when < 3 days)
  const shouldShowDaysRemaining = useCallback(() => {
    if (!subscription) return false;
    
    // For free plan users, never show days remaining
    if (subscription.status === 'active' || subscription.plan === 'free') {
      return false;
    }
    
    const days = getRemainingDaysValue();
    return days > 0 && days < 3;
  }, [subscription, getRemainingDaysValue]);

  // Reset subscription to free plan (external function)
  const resetSubscription = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isResetting || hasResetBeenCalled) {
      return;
    }

    try {
      setIsResetting(true);
      setHasResetBeenCalled(true);
      
      // Call subscription service to reset subscription
      const response = await subscriptionService.resetToFreePlan();
      
      if (response.success) {
        // Refresh subscription data
        await refreshSubscription();
        
        // Show success message with proper details
        toast.success(response.message || 'Your subscription has been reset to the free plan', {
          position: 'top-right',
          autoClose: 5000,
        });

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('subscriptionReset', {
          detail: { 
            plan: 'free', 
            status: 'active',
            message: response.message,
            data: response.data 
          }
        }));
      } else {
        throw new Error(response.error || 'Failed to reset subscription');
      }
    } catch (error) {
      console.error('Error resetting subscription:', error);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Failed to reset subscription. Please contact support.';
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsResetting(false);
    }
  }, [refreshSubscription, isResetting, hasResetBeenCalled]);

  // Update days remaining and timer
  useEffect(() => {
    if (!subscription) {
      setTimeRemaining(null);
      setIsExpired(false);
      setHasResetBeenCalled(false);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
      return;
    }

    // For free plan users, don't run countdown logic
    if (subscription.status === 'active' || subscription.plan === 'free') {
      setTimeRemaining(null);
      setIsExpired(false);
      setHasResetBeenCalled(false);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
      return;
    }

    // Reset the flags when subscription changes
    setHasResetBeenCalled(false);
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    // Only start timer if expiring today
    if (!isExpiringToday()) {
      setTimeRemaining(null);
      setIsExpired(false);
      return;
    }

    // Local function to calculate time remaining
    const calculateTimeRemainingLocal = () => {
      if (!subscription) return null;
      
      const now = new Date();
      let endDate;
      
      if (subscription.status === 'trialing') {
        endDate = new Date(subscription.billing.trialEnd);
      } else if (subscription.endDate) {
        endDate = new Date(subscription.endDate);
      } else {
        return null;
      }
      
      const timeDiff = endDate.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, total: 0 };
      }
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      return {
        hours,
        minutes,
        seconds,
        total: timeDiff
      };
    };

    // Local function to reset subscription
    const resetSubscriptionLocal = async () => {
      // Prevent multiple simultaneous calls
      if (isResetting || hasResetBeenCalled) {
        return;
      }

      try {
        setIsResetting(true);
        setHasResetBeenCalled(true);
        
        // Call subscription service to reset subscription
        const response = await subscriptionService.resetToFreePlan();
        
        if (response.success) {
          // Refresh subscription data
          await refreshSubscription();
          
          // Show success message with proper details
          toast.success(response.message || 'Your subscription has been reset to the free plan', {
            position: 'top-right',
            autoClose: 5000,
          });

          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('subscriptionReset', {
            detail: { 
              plan: 'free', 
              status: 'active',
              message: response.message,
              data: response.data 
            }
          }));
        } else {
          throw new Error(response.error || 'Failed to reset subscription');
        }
      } catch (error) {
        console.error('Error resetting subscription:', error);
        
        // Show more specific error message
        const errorMessage = error.response?.data?.error || 
                            error.message || 
                            'Failed to reset subscription. Please contact support.';
        
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 5000,
        });
      } finally {
        setIsResetting(false);
      }
    };

    const updateTimer = () => {
      // Don't update if reset has already been called
      if (hasResetBeenCalled) {
        return;
      }
      
      const time = calculateTimeRemainingLocal();
      
      if (time && time.total > 0) {
        setTimeRemaining(time);
        setIsExpired(false);
      } else {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        setIsExpired(true);
        
        // Auto-reset subscription when timer hits 0 (only once, with debounce)
        if (!isResetting && !hasResetBeenCalled && !resetTimeoutRef.current) {
          const timeout = setTimeout(() => {
            resetSubscriptionLocal();
            resetTimeoutRef.current = null;
          }, 1000); // 1 second debounce
          resetTimeoutRef.current = timeout;
        }
      }
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
  }, [subscription, isExpiringToday, isResetting, hasResetBeenCalled, refreshSubscription]);

  // Format time for display
  const formatTime = useCallback((time) => {
    if (!time) return null;
    
    const { hours, minutes, seconds } = time;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // Get display message
  const getDisplayMessage = useCallback(() => {
    if (!subscription) {
      return null;
    }

    // For free plan users, no display message
    if (subscription.status === 'active' || subscription.plan === 'free') {
      return null;
    }

    const days = getRemainingDaysValue();
    const planType = subscription.status === 'trialing' || subscription.isTrial ? 'Trial' : 'Plan';

    // Show days remaining when < 3 days and not expiring today
    if (shouldShowDaysRemaining()) {
      return `${planType} expires in ${days} day${days !== 1 ? 's' : ''}`;
    }

    // Show timer when expiring today
    if (isExpiringToday()) {
      if (isExpired) {
        return `${planType} expired - resetting to free plan...`;
      }

      if (timeRemaining && timeRemaining.total > 0) {
        return `${planType} expires today in ${formatTime(timeRemaining)}`;
      }

      return `${planType} expires today`;
    }

    return null;
  }, [subscription, shouldShowDaysRemaining, isExpiringToday, isExpired, timeRemaining, formatTime, getRemainingDaysValue]);

  // Get urgency level for styling
  const getUrgencyLevel = useCallback(() => {
    if (!timeRemaining) return 'low';
    
    const totalMinutes = timeRemaining.hours * 60 + timeRemaining.minutes;
    
    if (totalMinutes <= 30) return 'critical';
    if (totalMinutes <= 60) return 'high';
    if (totalMinutes <= 120) return 'medium';
    return 'low';
  }, [timeRemaining]);

  return {
    timeRemaining,
    isExpired,
    isResetting,
    isExpiringToday: isExpiringToday(),
    shouldShowDaysRemaining: shouldShowDaysRemaining(),
    daysRemaining: getRemainingDaysValue(),
    displayMessage: getDisplayMessage(),
    urgencyLevel: getUrgencyLevel(),
    formatTime: (time) => formatTime(time),
    resetSubscription
  };
};

export default useSubscriptionCountdown;
