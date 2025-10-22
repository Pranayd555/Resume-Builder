import { useState, useEffect } from 'react';
import { apiHelpers, analyticsAPI } from '../services/api';

/**
 * Custom hook for managing token balance across the app
 * Provides real-time token balance updates and localStorage integration
 */
// Global state to prevent multiple API calls
let isFetchingTokenBalance = false;
let tokenBalancePromise = null;

export const useTokenBalance = () => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token balance from API and localStorage
  useEffect(() => {
    const fetchTokenBalance = async () => {
      // If already fetching, wait for the existing promise
      if (isFetchingTokenBalance && tokenBalancePromise) {
        try {
          const result = await tokenBalancePromise;
          setTokenBalance(result);
          setIsLoading(false);
          return;
        } catch (error) {
          // Fallback to localStorage if shared fetch fails
          const storedBalance = apiHelpers.getTokenBalance();
          setTokenBalance(storedBalance);
          setIsLoading(false);
          return;
        }
      }

      // Start new fetch
      isFetchingTokenBalance = true;
      tokenBalancePromise = (async () => {
        try {
          // First try to get from API
          const response = await analyticsAPI.getTokenBalance();
          if (response.success && response.data?.balance !== undefined) {
            const apiBalance = response.data.balance;
            // Update localStorage with API data
            apiHelpers.setTokenBalance(apiBalance);
            return apiBalance;
          } else {
            // Fallback to localStorage if API fails
            return apiHelpers.getTokenBalance();
          }
        } catch (error) {
          console.error('Failed to fetch token balance from API:', error);
          // Fallback to localStorage if API fails
          return apiHelpers.getTokenBalance();
        } finally {
          isFetchingTokenBalance = false;
          tokenBalancePromise = null;
        }
      })();

      try {
        const result = await tokenBalancePromise;
        setTokenBalance(result);
      } catch (error) {
        // Fallback to localStorage if shared fetch fails
        const storedBalance = apiHelpers.getTokenBalance();
        setTokenBalance(storedBalance);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenBalance();
  }, []);

  // Listen for token balance updates from other components
  useEffect(() => {
    const handleTokenBalanceUpdate = (event) => {
      setTokenBalance(event.detail.balance);
    };

    const handleTokenDataUpdate = (event) => {
      if (event.detail.balance !== undefined) {
        setTokenBalance(event.detail.balance);
      }
    };

    window.addEventListener('tokenBalanceUpdated', handleTokenBalanceUpdate);
    window.addEventListener('tokenDataUpdated', handleTokenDataUpdate);
    
    return () => {
      window.removeEventListener('tokenBalanceUpdated', handleTokenBalanceUpdate);
      window.removeEventListener('tokenDataUpdated', handleTokenDataUpdate);
    };
  }, []);

  // Function to update token balance
  const updateTokenBalance = (newBalance) => {
    apiHelpers.updateTokenBalance(newBalance);
  };

  // Function to consume tokens
  const consumeTokens = (amount) => {
    const currentBalance = apiHelpers.getTokenBalance();
    const newBalance = Math.max(0, currentBalance - amount);
    updateTokenBalance(newBalance);
    return newBalance;
  };

  // Function to add tokens
  const addTokens = (amount) => {
    const currentBalance = apiHelpers.getTokenBalance();
    const newBalance = currentBalance + amount;
    updateTokenBalance(newBalance);
    return newBalance;
  };

  // Function to check if user has enough tokens
  const hasEnoughTokens = (requiredAmount) => {
    return tokenBalance >= requiredAmount;
  };

  // Function to refresh token balance from API
  const refreshTokenBalance = async () => {
    // If already fetching, wait for the existing promise
    if (isFetchingTokenBalance && tokenBalancePromise) {
      try {
        const result = await tokenBalancePromise;
        setTokenBalance(result);
        return result;
      } catch (error) {
        return tokenBalance;
      }
    }

    // Start new fetch
    isFetchingTokenBalance = true;
    tokenBalancePromise = (async () => {
      try {
        const response = await analyticsAPI.getTokenBalance();
        if (response.success && response.data?.balance !== undefined) {
          const apiBalance = response.data.balance;
          apiHelpers.setTokenBalance(apiBalance);
          return apiBalance;
        }
        return tokenBalance;
      } catch (error) {
        console.error('Failed to refresh token balance:', error);
        return tokenBalance;
      } finally {
        isFetchingTokenBalance = false;
        tokenBalancePromise = null;
      }
    })();

    try {
      const result = await tokenBalancePromise;
      setTokenBalance(result);
      return result;
    } catch (error) {
      return tokenBalance;
    }
  };

  return {
    tokenBalance,
    isLoading,
    updateTokenBalance,
    consumeTokens,
    addTokens,
    hasEnoughTokens,
    refreshTokenBalance
  };
};

export default useTokenBalance;
