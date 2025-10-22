import { useState, useEffect, useCallback } from 'react';
import subscriptionService from '../services/subscriptionService';

/**
 * Custom hook for subscription management
 * Provides subscription data and methods with automatic updates
 */
export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load subscription data
  const loadSubscription = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionService.getSubscriptionData(forceRefresh);
      setSubscription(data);
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Start trial
  const startTrial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await subscriptionService.startTrial();
      setSubscription(result.data);
      return result;
    } catch (err) {
      console.error('Error starting trial:', err);
      setError(err.message || 'Failed to start trial');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Activate pro plan
  const activatePro = useCallback(async (planType) => {
    try {
      setLoading(true);
      setError(null);
      const result = await subscriptionService.activatePro(planType);
      setSubscription(result.data);
      return result;
    } catch (err) {
      console.error('Error activating pro plan:', err);
      setError(err.message || 'Failed to activate pro plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async (reason = '') => {
    try {
      setLoading(true);
      setError(null);
      const result = await subscriptionService.cancelSubscription(reason);
      setSubscription(result.data);
      return result;
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh subscription data
  const refreshSubscription = useCallback(async () => {
    return await loadSubscription(true);
  }, [loadSubscription]);

  // Check if user can create resume
  const canCreateResume = useCallback(() => {
    return subscriptionService.canCreateResume();
  }, []);

  // Check if user can access template
  const canAccessTemplate = useCallback((templateTier) => {
    return subscriptionService.canAccessTemplate(templateTier);
  }, []);

  // Check if user can use AI action
  const canUseAIAction = useCallback(() => {
    return subscriptionService.canUseAIAction();
  }, []);

  // Check if user is on trial
  const isOnTrial = useCallback(() => {
    return subscriptionService.isOnTrial();
  }, []);

  // Check if subscription is active
  const isActive = useCallback(() => {
    return subscriptionService.isActive();
  }, []);

  // Get remaining days
  const getRemainingDays = useCallback(() => {
    return subscriptionService.getRemainingDays();
  }, []);

  // Get trial remaining days
  const getTrialRemainingDays = useCallback(() => {
    return subscriptionService.getTrialRemainingDays();
  }, []);

  // Initialize subscription data
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Listen for subscription updates
  useEffect(() => {
    const unsubscribe = subscriptionService.addUpdateListener((updatedSubscription) => {
      setSubscription(updatedSubscription);
    });

    return unsubscribe;
  }, []);

  return {
    subscription,
    loading,
    error,
    startTrial,
    activatePro,
    cancelSubscription,
    refreshSubscription,
    canCreateResume,
    canAccessTemplate,
    canUseAIAction,
    isOnTrial,
    isActive,
    getRemainingDays,
    getTrialRemainingDays
  };
};

export default useSubscription;
