import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';

function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trialLoading, setTrialLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Use a single ref to track initialization
  const hasInitialized = useRef(false);

  // Single initialization effect
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    const initializeComponent = async () => {
      try {
        // Fetch plans and subscription in parallel
        const [plansResponse, subscriptionResponse] = await Promise.all([
          subscriptionAPI.getPlans(),
          subscriptionAPI.getCurrentSubscription()
        ]);

        if (plansResponse.success) {
          setPlans(plansResponse.data.plans);
        }

        if (subscriptionResponse.success) {
          setCurrentSubscription(subscriptionResponse.data.subscription);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error during initialization:', error);
        setLoading(false);
      }
    };

    initializeComponent();
  }, []); // Empty dependency array - only run once

  // Handle subscription success separately
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && !successLoading) {
      setSuccessLoading(true);
      
      subscriptionAPI.handleSubscriptionSuccess(sessionId)
        .then(response => {
          if (response.success) {
            setCurrentSubscription(response.data.subscription);
            alert('Subscription activated successfully! Welcome to Pro!');
            navigate('/resume-list');
          }
        })
        .catch(error => {
          console.error('Error handling subscription success:', error);
          alert('Error activating subscription. Please contact support.');
        })
        .finally(() => {
          setSuccessLoading(false);
        });
    }
  }, [searchParams, navigate, successLoading]);

  const fetchBillingHistory = async () => {
    try {
      const response = await subscriptionAPI.getBillingHistory();
      if (response.success) {
        setBillingHistory(response.data.history);
      }
    } catch (error) {
      console.error('Error fetching billing history:', error);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleStartTrial = async (trialType) => {
    if (!selectedPlan || selectedPlan.id === 'free') return;
    
    setTrialLoading(true);
    try {
      const response = await subscriptionAPI.startTrial(trialType);
      if (response.success) {
        setCurrentSubscription(response.data.subscription);
        alert(`Trial started! You have ${trialType === 'free' ? '3' : '7'} days to try Pro features.`);
        navigate('/resume-list');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Error starting trial. Please try again.');
    } finally {
      setTrialLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || selectedPlan.id === 'free') return;
    
    try {
      const response = await subscriptionAPI.createCheckoutSession(selectedPlan.id, billingCycle);
      if (response.success) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error creating checkout session. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription || currentSubscription.plan === 'free') return;
    
    const reason = prompt('Please provide a reason for cancellation (optional):');
    setCancelLoading(true);
    
    try {
      const response = await subscriptionAPI.cancelSubscription(reason);
      if (response.success) {
        setCurrentSubscription(prev => ({
          ...prev,
          status: 'canceled',
          endDate: response.data.endDate
        }));
        alert('Subscription will be canceled at the end of your billing period.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Error canceling subscription. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/resume-list');
  };

  const getPrice = (plan) => {
    return billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
  };

  const getSavings = (plan) => {
    if (plan.price.monthly === 0) return 0;
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    return monthlyTotal - yearlyPrice;
  };

  const isCurrentPlan = (plan) => {
    return currentSubscription?.plan === plan.id;
  };

  const canStartTrial = (plan) => {
    return plan.id === 'pro' && 
           currentSubscription?.plan === 'free' && 
           currentSubscription?.status !== 'trialing' &&
           !currentSubscription?.hasHadTrial;
  };

  const toggleManagement = () => {
    setShowManagement(!showManagement);
    if (!showManagement && currentSubscription?.plan !== 'free') {
      fetchBillingHistory();
    }
  };

  if (loading || successLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {successLoading ? 'Activating your subscription...' : 'Loading subscription plans...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={handleBack}
              className="mr-4 sm:mr-6 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm flex-shrink-0"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">Choose Your Plan</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">Unlock premium features and create amazing resumes</p>
            </div>
          </div>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && currentSubscription.plan !== 'free' && (
          <div className="mb-8">
            {/* Main Current Plan Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200/50">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Plan Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {currentSubscription.plan.charAt(0).toUpperCase() + currentSubscription.plan.slice(1)} Plan
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            currentSubscription.status === 'trialing' 
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : currentSubscription.status === 'active'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              currentSubscription.status === 'trialing' 
                                ? 'bg-orange-400'
                                : currentSubscription.status === 'active'
                                ? 'bg-green-400'
                                : 'bg-gray-400'
                            }`}></span>
                            {currentSubscription.status === 'trialing' ? 'Trial Active' : currentSubscription.status}
                          </span>
                          {currentSubscription.isTrial && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              ⏰ {currentSubscription.trialRemainingDays} days left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Resumes Created</span>
                          <span className="text-sm text-gray-600">
                            {currentSubscription.usage?.resumesCreated || 0} / {currentSubscription.features?.resumeLimit || 1}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, ((currentSubscription.usage?.resumesCreated || 0) / (currentSubscription.features?.resumeLimit || 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>


                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Resumes Exported</span>
                          <span className="text-sm text-gray-600">
                            {currentSubscription.usage?.exportsThisMonth || 0} / {currentSubscription.features?.resumeLimit || 1}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, ((currentSubscription.usage?.exportsThisMonth || 0) / (currentSubscription.features?.resumeLimit || 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>


                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">AI Actions This Month</span>
                          <span className="text-sm text-gray-600">
                            {currentSubscription.usage?.aiActionsThisMonth || 0} / {currentSubscription.features?.aiActionsLimit || 2}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, ((currentSubscription.usage?.aiActionsThisMonth || 0) / (currentSubscription.features?.aiActionsLimit || 2)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 lg:flex-shrink-0">
                    {currentSubscription.status === 'trialing' && (
            <button
              onClick={handleSubscribe}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Upgrade Now
                        </div>
            </button>
          )}
                    <button
                      onClick={toggleManagement}
                      className="bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200/50"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        {showManagement ? 'Hide Details' : 'Manage Subscription'}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Management Details */}
            {showManagement && (
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Subscription Details
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Subscription Info */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                          </svg>
                          Billing Information
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Plan:</span>
                            <span className="font-medium text-gray-900">{currentSubscription.plan.charAt(0).toUpperCase() + currentSubscription.plan.slice(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Billing Cycle:</span>
                            <span className="font-medium text-gray-900">{currentSubscription.billing?.cycle || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium text-gray-900">${currentSubscription.billing?.amount || 0} {currentSubscription.billing?.currency || 'USD'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Next Billing:</span>
                            <span className="font-medium text-gray-900">{currentSubscription.billing?.nextBillingDate ? new Date(currentSubscription.billing.nextBillingDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Remaining Days:</span>
                            <span className="font-medium text-gray-900">{currentSubscription.remainingDays || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Usage Statistics
                        </h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Resumes Created</span>
                            <span className="text-sm font-medium text-gray-900">
                              {currentSubscription.usage?.resumesCreated || 0} / {currentSubscription.features?.resumeLimit || 1}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Exports This Month</span>
                            <span className="text-sm font-medium text-gray-900">{currentSubscription.usage?.exportsThisMonth || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">AI Actions This Month</span>
                            <span className="text-sm font-medium text-gray-900">
                              {currentSubscription.usage?.aiActionsThisMonth || 0} / {currentSubscription.features?.aiActionsLimit || 2}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
        </div>

                  {/* Billing History */}
                  {billingHistory.length > 0 && (
                    <div className="mt-8">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Recent Billing History
                      </h5>
                      <div className="space-y-3">
                        {billingHistory.slice(0, 5).map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                payment.status === 'succeeded' ? 'bg-green-400' : 
                                payment.status === 'pending' ? 'bg-yellow-400' : 
                                payment.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">${payment.amount} {payment.currency}</p>
                                <p className="text-sm text-gray-600">{payment.description || 'Subscription payment'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                payment.status === 'succeeded' ? 'text-green-600' : 
                                payment.status === 'pending' ? 'text-yellow-600' : 
                                payment.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </p>
                              <p className="text-xs text-gray-500">{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancel Subscription */}
                  {currentSubscription.status === 'active' && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Cancel Subscription
                        </h5>
                        <p className="text-sm text-gray-600 mb-4">
                          Your subscription will remain active until the end of your current billing period.
                        </p>
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-white/20">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Yearly
                {billingCycle === 'yearly' && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    Save 34%
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 flex flex-col min-h-[600px] ${
                selectedPlan?.id === plan.id
                  ? 'border-blue-500 shadow-2xl'
                  : 'border-white/20 hover:border-blue-300/50'
              } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-6 flex flex-col h-full">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${getPrice(plan)}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-600 text-lg">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Save ${getSavings(plan).toFixed(2)} per year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-left">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-sm flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium leading-relaxed break-words text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3 mt-auto">
                  {isCurrentPlan(plan) ? (
                    <button
                      disabled
                      className="w-full py-4 px-6 rounded-xl font-semibold bg-gray-100 text-gray-700 cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <>
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                    selectedPlan?.id === plan.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white transform scale-105'
                      : plan.id === 'free'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 hover:from-blue-100 hover:to-purple-100'
                  }`}
                >
                        Select Plan
                      </button>
                      
                      {canStartTrial(plan) && (
                        <button
                          onClick={() => handleStartTrial('free')}
                          disabled={trialLoading}
                          className="w-full py-3 px-6 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          {trialLoading ? 'Starting Trial...' : 'Start 3-Day Free Trial'}
                        </button>
                      )}
                      
                      {plan.id === 'pro' && currentSubscription?.hasHadTrial && (
                        <div className="text-center py-3 px-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-amber-800 text-sm font-medium">
                            ⏰ You've already used your free trial
                          </p>
                          <p className="text-amber-700 text-xs mt-1">
                            Upgrade to Pro to continue using premium features
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 sm:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Everything you need to know about our subscription plans</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Can I try Pro features for free?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Yes! You can start a 3-day free trial of Pro features without any payment information required. Each user can only use the free trial once.</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                What are AI actions?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">AI actions include rewriting content, summarizing sections, enhancing keywords, and adjusting tone to improve your resume.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscription;
