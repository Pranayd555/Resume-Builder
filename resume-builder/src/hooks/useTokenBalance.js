import { useState, useEffect } from 'react';
import { apiHelpers } from '../services/api';

/**
 * Custom hook for managing token balance across the app
 * Provides real-time token balance updates and localStorage integration
 */
export const useTokenBalance = () => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token balance from localStorage
  useEffect(() => {
    const storedBalance = apiHelpers.getTokenBalance();
    setTokenBalance(storedBalance);
    setIsLoading(false);
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

  return {
    tokenBalance,
    isLoading,
    updateTokenBalance,
    consumeTokens,
    addTokens,
    hasEnoughTokens
  };
};

export default useTokenBalance;
