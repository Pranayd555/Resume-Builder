import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';

function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trialLoading, setTrialLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
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
        // Fetch subscription
        const subscriptionResponse = await subscriptionAPI.getCurrentSubscription();

        if (subscriptionResponse.success) {
          // Store subscription plus weekly usage summary (if provided by backend)
          setCurrentSubscription({
            ...subscriptionResponse.data.subscription,
            weekly: subscriptionResponse.data.weekly || null,
          });
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
  };

  // Define features for comparison table
  const features = [
    { name: 'Resume Creation', free: '2 total', pro: '5 total' },
    { name: 'Template Access', free: 'Free templates only', pro: 'All templates' },
    { name: 'AI Actions', free: '1 per week', pro: 'Unlimited' },
    { name: 'Export Formats', free: 'PDF only', pro: 'PDF + DOCX' },
    { name: 'Resume Feedback', free: 'Basic', pro: 'ATS score + grammar analysis' },
    { name: 'Cloud Storage', free: 'No', pro: 'Unlimited cloud history' },
    { name: 'Support', free: 'Email support', pro: 'Priority support' },
    { name: 'Exports', free: 'Unlimited', pro: 'Unlimited exports' }
  ];

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
    <div className="min-h-screen pt-16">
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
        {currentSubscription && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {currentSubscription.plan.charAt(0).toUpperCase() + currentSubscription.plan.slice(1)} Plan
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        currentSubscription.status === 'trialing' 
                          ? 'bg-orange-100 text-orange-800'
                          : currentSubscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {currentSubscription.status === 'trialing' ? 'Trial Active' : currentSubscription.status}
                      </span>
                      {currentSubscription.isTrial && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⏰ {currentSubscription.trialRemainingDays} days left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {currentSubscription.status === 'trialing' && (
                    <button
                      onClick={handleSubscribe}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Upgrade Now
                    </button>
                  )}
                  <button
                    onClick={toggleManagement}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    {showManagement ? 'Hide Details' : 'Manage'}
                  </button>
                </div>
              </div>
            </div>

            {/* Subscription Management Details */}
            {showManagement && (
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Subscription Details</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Billing Information</h5>
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
                    </div>
                  </div>
                </div>

                {/* Cancel Subscription */}
                {currentSubscription.status === 'active' && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="bg-red-50 rounded-xl p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Cancel Subscription</h5>
                      <p className="text-sm text-gray-600 mb-4">
                        Your subscription will remain active until the end of your current billing period.
                      </p>
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Yearly
                {billingCycle === 'yearly' && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Save 34%
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

                          {/* Pricing Table */}
         <div className="max-w-4xl mx-auto mb-12">
           {/* Desktop Table */}
           <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-visible">
             {/* Table Header */}
             <div className="grid grid-cols-3 bg-gradient-to-r from-gray-50 to-blue-50 relative">
               <div className="p-6 border-r border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-900">Features</h3>
               </div>
               <div className="p-6 border-r border-gray-200 text-center">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">Free</h3>
                 <div className="text-3xl font-bold text-gray-900 mb-1">$0</div>
                 <p className="text-sm text-gray-600">Forever free</p>
               </div>
               <div className="p-6 text-center relative">
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                   <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                     Most Popular
                   </span>
                 </div>
                 <div className="pt-2">
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
                   <div className="text-3xl font-bold text-gray-900 mb-1">
                     ${billingCycle === 'monthly' ? '9.99' : '79.99'}
                   </div>
                   <p className="text-sm text-gray-600">
                     /{billingCycle === 'monthly' ? 'month' : 'year'}
                   </p>
                   {billingCycle === 'yearly' && (
                     <p className="text-sm text-green-600 font-medium mt-1">
                       Save ${(9.99 * 12 - 79.99).toFixed(2)} per year
                     </p>
                   )}
                 </div>
               </div>
             </div>

             {/* Table Body */}
             <div className="divide-y divide-gray-200">
               {features.map((feature, index) => (
                 <div key={index} className="grid grid-cols-3">
                   <div className="p-6 border-r border-gray-200 flex items-center">
                     <span className="text-gray-900 font-medium">{feature.name}</span>
                   </div>
                   <div className="p-6 border-r border-gray-200 flex items-center justify-center">
                     <span className="text-gray-600 text-sm">{feature.free}</span>
                   </div>
                   <div className="p-6 flex items-center justify-center">
                     <span className="text-gray-900 font-medium text-sm">{feature.pro}</span>
                   </div>
                 </div>
               ))}
             </div>

             {/* Table Footer - Action Buttons */}
             <div className="grid grid-cols-3 bg-gray-50 border-t border-gray-200">
               <div className="p-6 border-r border-gray-200"></div>
               <div className="p-6 border-r border-gray-200 text-center">
                 {isCurrentPlan({ id: 'free' }) ? (
                   <button className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-not-allowed">
                     Current Plan
                   </button>
                 ) : (
                   <button className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200">
                     Current Plan
                   </button>
                 )}
               </div>
               <div className="p-6 text-center space-y-3">
                 {isCurrentPlan({ id: 'pro' }) ? (
                   <button className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-not-allowed">
                     Current Plan
                   </button>
                 ) : (
                   <>
                     <button
                       onClick={() => handlePlanSelect({ id: 'pro' })}
                       className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                     >
                       Select Plan
                     </button>
                     {canStartTrial({ id: 'pro' }) && (
                       <button
                         onClick={() => handleStartTrial('free')}
                         disabled={trialLoading}
                         className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                       >
                         {trialLoading ? 'Starting...' : 'Start Free Trial'}
                       </button>
                     )}
                     {currentSubscription?.hasHadTrial && (
                       <div className="text-center py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                         <p className="text-amber-800 text-xs font-medium">
                           ⏰ Trial used. Upgrade to continue.
                         </p>
                       </div>
                     )}
                   </>
                 )}
               </div>
             </div>
           </div>

                        {/* Mobile Cards */}
             <div className="lg:hidden space-y-6">
               {/* Free Plan Card */}
               <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6">
               <div className="text-center mb-6">
                 <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
                 <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
                 <p className="text-sm text-gray-600">Forever free</p>
               </div>
               
               <div className="space-y-4 mb-6">
                 {features.map((feature, index) => (
                   <div key={index} className="flex items-center justify-between">
                     <span className="text-gray-900 font-medium text-sm">{feature.name}</span>
                     <span className="text-gray-600 text-sm">{feature.free}</span>
                   </div>
                 ))}
               </div>
               
               <div className="text-center">
                 {isCurrentPlan({ id: 'free' }) ? (
                   <button className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-not-allowed">
                     Current Plan
                   </button>
                 ) : (
                   <button className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200">
                     Current Plan
                   </button>
                 )}
               </div>
             </div>

             {/* Pro Plan Card */}
             <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-6 relative">
               <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                 <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border-2 border-white">
                   Most Popular
                 </span>
               </div>
               
               <div className="text-center mb-6 pt-2">
                 <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                 <div className="text-4xl font-bold text-gray-900 mb-1">
                   ${billingCycle === 'monthly' ? '9.99' : '79.99'}
                 </div>
                 <p className="text-sm text-gray-600">
                   /{billingCycle === 'monthly' ? 'month' : 'year'}
                 </p>
                 {billingCycle === 'yearly' && (
                   <p className="text-sm text-green-600 font-medium mt-1">
                     Save ${(9.99 * 12 - 79.99).toFixed(2)} per year
                   </p>
                 )}
               </div>
               
               <div className="space-y-4 mb-6">
                 {features.map((feature, index) => (
                   <div key={index} className="flex items-center justify-between">
                     <span className="text-gray-900 font-medium text-sm">{feature.name}</span>
                     <span className="text-gray-900 font-medium text-sm">{feature.pro}</span>
                   </div>
                 ))}
               </div>
               
               <div className="text-center space-y-3">
                 {isCurrentPlan({ id: 'pro' }) ? (
                   <button className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium cursor-not-allowed">
                     Current Plan
                   </button>
                 ) : (
                   <>
                     <button
                       onClick={() => handlePlanSelect({ id: 'pro' })}
                       className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                     >
                       Select Plan
                     </button>
                     {canStartTrial({ id: 'pro' }) && (
                       <button
                         onClick={() => handleStartTrial('free')}
                         disabled={trialLoading}
                         className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                       >
                         {trialLoading ? 'Starting...' : 'Start Free Trial'}
                       </button>
                     )}
                     {currentSubscription?.hasHadTrial && (
                       <div className="text-center py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                         <p className="text-amber-800 text-xs font-medium">
                           ⏰ Trial used. Upgrade to continue.
                         </p>
                       </div>
                     )}
                   </>
                 )}
               </div>
             </div>
           </div>
         </div>

        {/* FAQ Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Everything you need to know about our subscription plans</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Can I try Pro features for free?</h3>
              <p className="text-gray-600 leading-relaxed">Yes! You can start a 3-day free trial of Pro features without any payment information required. Each user can only use the free trial once.</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">What are AI actions?</h3>
              <p className="text-gray-600 leading-relaxed">AI actions include rewriting content, summarizing sections, enhancing keywords, and adjusting tone to improve your resume.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600 leading-relaxed">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-600 leading-relaxed">We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscription;
