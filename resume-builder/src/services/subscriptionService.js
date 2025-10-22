import api from './api';

/**
 * Subscription Service
 * Handles subscription data management with localStorage integration
 * Uses the new Subscription model as primary source
 */

const SUBSCRIPTION_STORAGE_KEY = 'subscriptionData';
const SUBSCRIPTION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

class SubscriptionService {
  constructor() {
    this.subscriptionData = null;
    this.lastUpdate = null;
    this.updateListeners = new Set();
  }

  /**
   * Get subscription data from localStorage or fetch from API
   */
  async getSubscriptionData(forceRefresh = false) {
    try {
      // Check if we need to refresh data
      const shouldRefresh = forceRefresh || 
        !this.subscriptionData || 
        !this.lastUpdate || 
        (Date.now() - this.lastUpdate) > SUBSCRIPTION_UPDATE_INTERVAL;

      if (shouldRefresh) {
        // Fetch fresh data from API
        const response = await api.get('/subscriptions/localstorage');
        this.subscriptionData = response.data.data;
        this.lastUpdate = Date.now();
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Notify listeners
        this.notifyListeners();
      } else {
        // Load from localStorage if available
        this.loadFromLocalStorage();
      }

      return this.subscriptionData;
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      
      // Fallback to localStorage data
      this.loadFromLocalStorage();
      return this.subscriptionData;
    }
  }

  /**
   * Save subscription data to localStorage
   */
  saveToLocalStorage() {
    if (this.subscriptionData) {
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify({
        data: this.subscriptionData,
        lastUpdated: this.lastUpdate
      }));
    }
  }

  /**
   * Load subscription data from localStorage
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.subscriptionData = parsed.data;
        this.lastUpdate = parsed.lastUpdated;
      }
    } catch (error) {
      console.error('Error loading subscription from localStorage:', error);
      this.subscriptionData = this.getDefaultSubscriptionData();
    }
  }

  /**
   * Get default subscription data for free users
   */
  getDefaultSubscriptionData() {
    return {
      plan: 'free',
      status: 'active',
      isActive: true,
      isTrial: false,
      isExpired: false,
      remainingDays: null,
      trialRemainingDays: 0,
      features: {
        resumeLimit: 2,
        templateAccess: ['free'],
        exportFormats: ['pdf'],
        aiActionsLimit: 'token-based',
        freeTokens: 0,
        aiReview: false,
        prioritySupport: false,
        customBranding: false,
        unlimitedExports: false
      },
      usage: {
        resumesCreated: 0,
        aiActionsThisCycle: 0,
        freeTokensUsed: 0
      },
      billing: {
        cycle: null,
        amount: null,
        currency: 'INR',
        nextBillingDate: null,
        trialEnd: null
      },
      startDate: new Date().toISOString(),
      endDate: null,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Start trial
   */
  async startTrial() {
    try {
      const response = await api.post('/subscriptions/start-trial-new');
      this.subscriptionData = response.data.data;
      this.lastUpdate = Date.now();
      this.saveToLocalStorage();
      this.notifyListeners();
      return response.data;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }

  /**
   * Activate pro plan
   */
  async activatePro(planType) {
    try {
      const response = await api.post('/subscriptions/activate-pro', { planType });
      this.subscriptionData = response.data.data;
      this.lastUpdate = Date.now();
      this.saveToLocalStorage();
      this.notifyListeners();
      return response.data;
    } catch (error) {
      console.error('Error activating pro plan:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(reason = '') {
    try {
      const response = await api.post('/subscriptions/cancel-new', { reason });
      this.subscriptionData = response.data.data;
      this.lastUpdate = Date.now();
      this.saveToLocalStorage();
      this.notifyListeners();
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Get current subscription status
   */
  getCurrentSubscription() {
    return this.subscriptionData || this.getDefaultSubscriptionData();
  }

  /**
   * Check if user can create resume
   */
  canCreateResume() {
    const subscription = this.getCurrentSubscription();
    return subscription.usage.resumesCreated < subscription.features.resumeLimit;
  }

  /**
   * Check if user can access template
   */
  canAccessTemplate(templateTier) {
    const subscription = this.getCurrentSubscription();
    return subscription.features.templateAccess.includes(templateTier);
  }

  /**
   * Check if user can use AI action
   */
  canUseAIAction() {
    const subscription = this.getCurrentSubscription();
    
    if (subscription.features.aiActionsLimit === 'token-based') {
      // For token-based system, check if user has any tokens available
      // This would need to be enhanced with actual token checking
      return true; // Simplified for now
    }
    
    return subscription.usage.aiActionsThisCycle < subscription.features.aiActionsLimit;
  }

  /**
   * Check if user is on trial
   */
  isOnTrial() {
    const subscription = this.getCurrentSubscription();
    return subscription.isTrial && subscription.trialRemainingDays > 0;
  }

  /**
   * Check if subscription is active
   */
  isActive() {
    const subscription = this.getCurrentSubscription();
    return subscription.isActive && !subscription.isExpired;
  }

  /**
   * Get remaining days
   */
  getRemainingDays() {
    const subscription = this.getCurrentSubscription();
    return subscription.remainingDays || 0;
  }

  /**
   * Get trial remaining days
   */
  getTrialRemainingDays() {
    const subscription = this.getCurrentSubscription();
    return subscription.trialRemainingDays || 0;
  }

  /**
   * Add listener for subscription updates
   */
  addUpdateListener(callback) {
    this.updateListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.updateListeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of subscription updates
   */
  notifyListeners() {
    this.updateListeners.forEach(callback => {
      try {
        callback(this.subscriptionData);
      } catch (error) {
        console.error('Error in subscription update listener:', error);
      }
    });
  }

  /**
   * Clear subscription data
   */
  clearSubscriptionData() {
    this.subscriptionData = null;
    this.lastUpdate = null;
    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
    this.notifyListeners();
  }

  /**
   * Force refresh subscription data
   */
  async refreshSubscriptionData() {
    return await this.getSubscriptionData(true);
  }
}

// Create singleton instance
const subscriptionService = new SubscriptionService();

export default subscriptionService;
