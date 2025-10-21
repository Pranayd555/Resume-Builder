import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';
import AuthLoader from './AuthLoader';
import { toast } from 'react-toastify';
import { 
  CreditCardIcon, 
  CheckIcon,
  SparklesIcon,
  StarIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import api, { apiHelpers } from '../services/api';
import { useScrollToId } from '../hooks/useAutoScroll';

function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trialLoading, setTrialLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { scrollToId } = useScrollToId();
  
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
        // Load Razorpay script
        const loadRazorpay = () => {
          if (window.Razorpay) {
            setRazorpayLoaded(true);
            return;
          }

          // Check if script is already being loaded
          const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
          if (existingScript) {
            // Script is already being loaded, wait for it
            existingScript.onload = () => setRazorpayLoaded(true);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            setRazorpayLoaded(true);
            console.log('Razorpay script loaded successfully');
          };
          script.onerror = () => {
            console.error('Failed to load Razorpay script');
            toast.error('Failed to load payment gateway. Please refresh the page and try again.');
          };
          document.body.appendChild(script);
        };

        loadRazorpay();

        // Fetch subscription plans
        const plansResponse = await subscriptionAPI.getPlans();
        if (plansResponse.success) {
          // Transform backend plans to frontend format
          const transformedPlans = plansResponse.data.plans.map(plan => ({
            id: plan.id,
            name: plan.id === 'pro_monthly' ? 'Pro Monthly' : plan.id === 'pro_yearly' ? 'Pro Yearly' : plan.name,
            price: plan.price, // Use direct price from backend
            originalPrice: plan.id === 'pro_yearly' ? Math.round(plan.price * 1.3) : plan.id === 'pro_monthly' ? Math.round(plan.price * 1.3) : 0, // Add 30% markup for original price
            tokens: plan.limits.aiTokens,
            features: plan.features,
            popular: plan.id === 'pro_yearly', // Mark yearly as popular
            color: plan.id === 'free' ? 'gray' : plan.id === 'pro_monthly' ? 'blue' : (plan.id === 'pro_yearly') ? 'purple' : 'gray',
            trial: plan.id === 'free' // Only free plan has trial option
          }));
          setSubscriptionPlans(transformedPlans);
        }

        // Fetch subscription status
        const subscriptionResponse = await subscriptionAPI.getSubscriptionStatus();

        if (subscriptionResponse.success && subscriptionResponse.data?.subscription) {
          // Transform new subscription data to match frontend expectations
          const subscription = subscriptionResponse.data.subscription;
          setCurrentSubscription({
            plan: subscription.plan || 'free',
            status: subscription.status || 'active',
            isTrial: subscription.status === 'trialing',
            trialRemainingDays: subscription.trialRemainingDays || 0,
            remainingDays: subscription.remainingDays || 0,
            hasHadTrial: subscription.hasHadTrial || false,
            resumeLimit: subscription.features?.resumeLimit || 2,
            aiTokens: subscription.features?.freeTokens || 20,
            subscriptionStart: subscription.startDate,
            subscriptionEnd: subscription.billing?.nextBillingDate
          });
        } else {
          // Set default values if subscription data is not available
          setCurrentSubscription({
            plan: 'free',
            status: 'active',
            isTrial: false,
            trialRemainingDays: 0,
            remainingDays: 0,
            hasHadTrial: false,
            resumeLimit: 2,
            aiTokens: 20,
            subscriptionStart: new Date(),
            subscriptionEnd: null
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
            
            // Update user data in localStorage with subscription details
            apiHelpers.updateUserData(response.data.subscription);
            
            toast.success('Subscription activated successfully! Welcome to Pro!');
            navigate('/dashboard');
          }
        })
        .catch(error => {
          console.error('Error handling subscription success:', error);
          toast.error('Error activating subscription. Please contact support.');
        })
        .finally(() => {
          setSuccessLoading(false);
        });
    }
  }, [searchParams, navigate, successLoading]);




  const handleStartTrial = async () => {
    setTrialLoading(true);
    try {
      const response = await subscriptionAPI.startTrial();
      if (response.success) {
        // Transform response data to match frontend expectations
        const subscriptionData = response.data;
        setCurrentSubscription({
          plan: subscriptionData.subscriptionType,
          status: 'active',
          isTrial: true,
          trialRemainingDays: subscriptionData.trialRemainingDays || 3,
          hasHadTrial: true,
          resumeLimit: subscriptionData.resumeLimit,
          aiTokens: subscriptionData.aiTokens,
          subscriptionStart: subscriptionData.subscriptionStart,
          subscriptionEnd: subscriptionData.subscriptionEnd
        });
        
        // Update user data in localStorage with subscription details
        apiHelpers.updateUserData({
          plan: subscriptionData.subscriptionType,
          status: 'active',
          isTrial: true,
          trialRemainingDays: subscriptionData.trialRemainingDays || 3,
          hasHadTrial: true,
          resumeLimit: subscriptionData.resumeLimit,
          aiTokens: subscriptionData.aiTokens
        });
        
        toast.success('Trial started! You have 3 days to try Pro features.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      const errorMessage = error.response?.data?.error || 'Error starting trial. Please try again.';
      toast.error(errorMessage);
    } finally {
      setTrialLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    const billingCycle = plan.id === 'pro_yearly' ? 'yearly' : 'monthly';
    await initiatePayment({
      type: 'subscription',
      amount: plan.price,
      planId: plan.id,
      description: `${plan.name} - ${plan.tokens} AI Tokens`,
      billingCycle: billingCycle
    });
  };

  const initiatePayment = async (paymentData) => {
    if (!razorpayLoaded || !window.Razorpay) {
      toast.info('Loading payment gateway, please wait...');
      // Try to reload the script if it's not loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          toast.success('Payment gateway ready!');
          // Retry payment after script loads
          setTimeout(() => initiatePayment(paymentData), 1000);
        };
        script.onerror = () => {
          toast.error('Failed to load payment gateway. Please refresh the page and try again.');
        };
        document.body.appendChild(script);
      }
      return;
    }

    setPaymentLoading(true);
    try {
      // Create order on backend
      const response = await api.post('/payment/create-order', {
        amount: paymentData.amount,
        currency: 'INR',
        receipt: `${paymentData.type}_${Date.now()}`,
        metadata: {
          type: paymentData.type,
          tokens: paymentData.tokens,
          planId: paymentData.planId,
          billingCycle: paymentData.billingCycle
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      const order = response.data.order;

      // Get user data from localStorage
      const userData = apiHelpers.getCurrentUserData();

      // Configure Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Resume Builder Pro',
        description: paymentData.description,
        order_id: order.id,
        mode: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        handler: async (response) => {
          try {
            console.log('Razorpay payment response:', response);
            
            // Complete payment and activate subscription in one call
            const completeResponse = await api.post('/payment/complete-payment', {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan: paymentData.planId,
              amount: paymentData.amount,
              currency: 'INR',
              payment_method: 'razorpay',
              email: userData?.email || 'user@example.com',
              contact: userData?.phone || userData?.contact || '+919876543210',
              billingCycle: paymentData.billingCycle
            });

            if (completeResponse.data.success) {
              toast.success('Payment successful!');
              toast.success('Subscription activated successfully!');
              
              // Update token balance with total available tokens
              if (completeResponse.data.data?.tokens?.totalAvailable !== undefined) {
                apiHelpers.updateTokenBalance(completeResponse.data.data.tokens.totalAvailable);
              } else if (completeResponse.data.data?.totalTokenBalance !== undefined) {
                // Fallback to old structure
                apiHelpers.updateTokenBalance(completeResponse.data.data.totalTokenBalance);
              } else {
                // Final fallback: fetch latest token balance from API
                try {
                  const { analyticsAPI } = await import('../services/api');
                  const tokenResponse = await analyticsAPI.getTokenBalance();
                  if (tokenResponse.success && tokenResponse.data?.balance !== undefined) {
                    apiHelpers.updateTokenBalance(tokenResponse.data.balance);
                  }
                } catch (error) {
                  console.error('Failed to fetch updated token balance:', error);
                }
              }
              
              // Refresh subscription data
              const subscriptionResponse = await subscriptionAPI.getCurrentSubscription();
              if (subscriptionResponse.success) {
                setCurrentSubscription(subscriptionResponse.data.subscription);
                
                // Update user data in localStorage with subscription details
                apiHelpers.updateUserData(subscriptionResponse.data.subscription);
              }
              
              navigate('/dashboard');
            } else {
              throw new Error(completeResponse.data.message || 'Payment completion failed');
            }
          } catch (error) {
            console.error('Payment completion error:', error);
            toast.error(error.response?.data?.message || 'Payment completion failed');
          }
        },
        prefill: {
          name: userData?.name || 'User Name',
          email: userData?.email || 'user@example.com',
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed. Please try again.');
        setPaymentLoading(false);
      });

      rzp1.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setPaymentLoading(false);
    }
  };


  const handleBack = () => {
    navigate('/dashboard');
  };



  const isCurrentPlan = (plan) => {
    // If user is trialing pro_monthly, don't show "Current Plan" - show "Subscribe Now" instead
    if (currentSubscription?.status === 'trialing' && currentSubscription?.plan === 'pro_monthly' && plan.id === 'pro_monthly') {
      return false;
    }
    return currentSubscription?.plan === plan.id;
  };

  const canStartTrial = (plan) => {
    return plan.id === 'pro_monthly' && 
           currentSubscription?.plan === 'free' && 
           currentSubscription?.status !== 'trialing' &&
           !currentSubscription?.hasHadTrial;
  };



  if (loading || successLoading) {
    return (
      <AuthLoader 
        title={successLoading ? 'Activating your subscription...' : 'Loading subscription plans...'}
        subtitle={successLoading ? 'Setting up your premium features' : 'Fetching the latest plans for you'}
      />
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
              className="mr-4 sm:mr-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm flex-shrink-0 group"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 leading-tight">Choose Your Plan</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">Unlock premium features and create amazing resumes</p>
            </div>
          </div>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && currentSubscription.plan && (
          <div className="mb-8">
            <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-orange-200/30 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-600">
                      {currentSubscription?.plan ? 
                        currentSubscription.plan === 'pro_monthly' ? 'Pro Monthly Plan' :
                        currentSubscription.plan === 'pro_yearly' ? 'Pro Yearly Plan' :
                        currentSubscription.plan.charAt(0).toUpperCase() + currentSubscription.plan.slice(1) + ' Plan' :
                        'Loading...'
                      }
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        currentSubscription?.status === 'trialing' 
                          ? 'bg-orange-100 text-orange-800'
                          : currentSubscription?.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {currentSubscription?.status === 'trialing' ? 'Trial Active' : currentSubscription?.status || 'Loading'}
                      </span>
                      {currentSubscription?.isTrial && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⏰ {currentSubscription.trialRemainingDays} days left
                        </span>
                      )}
                      {currentSubscription?.plan === 'pro' && currentSubscription?.remainingDays && currentSubscription?.remainingDays <= 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          ⚠️ {currentSubscription.remainingDays} days left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                   <div className="flex flex-col sm:flex-row gap-1">
                    
                   <button
                      onClick={() => navigate('/payment')}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg"
                    >
                      Buy Tokens
                    </button>
                     {(currentSubscription?.status === 'trialing' || currentSubscription?.plan === 'free') && (
                       <button
                         onClick={() => scrollToId('subscribe-now')}
                         className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base"
                       >
                         Upgrade Now
                       </button>
                     )}
                     <button
                       onClick={() => navigate('/analytics')}
                       className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg"
                     >
                       Analytics
                     </button>
                   </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans Cards */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Subscription
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg pb-4">
              Get unlimited access to all features with our subscription plans.
            </p>
             </div>

           <div id="subscription-plans" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border-2 ${
                  plan.popular
                    ? 'border-purple-500 ring-2 ring-purple-200 scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                      <StarIcon className="w-4 h-4" />
                      Most Popular
                   </div>
                 </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    plan.color === 'gray' ? 'bg-gray-100' :
                    plan.color === 'blue' ? 'bg-blue-100' :
                    'bg-purple-100'
                  }`}>
                    {plan.color === 'gray' && <ShieldCheckIcon className="w-10 h-10 text-gray-600" />}
                    {plan.color === 'blue' && <BoltIcon className="w-10 h-10 text-blue-600" />}
                    {plan.color === 'purple' && <SparklesIcon className="w-10 h-10 text-purple-600" />}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        Free
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ₹{plan.price}
                        </span>
                        {plan.originalPrice > 0 && (
                          <span className="text-lg text-gray-500 line-through">
                            ₹{plan.originalPrice}
                          </span>
                        )}
                        {plan.id === 'pro_yearly' && (
                          <span className="text-sm text-gray-500">
                            /year
                          </span>
                        )}
                        {plan.id === 'pro_monthly' && (
                          <span className="text-sm text-gray-500">
                            /month
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {plan.tokens > 0 && (
                    <div className="text-gray-600 dark:text-gray-300 mb-6">
                      {plan.tokens} AI Tokens included
                       </div>
                     )}
           </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                   </div>
                 ))}
               </div>
               
                <div className="space-y-3">
                  {isCurrentPlan(plan) ? (
                    <button className="w-full py-4 rounded-xl font-semibold text-lg bg-gray-100 text-gray-700 cursor-not-allowed">
                     Current Plan
                   </button>
                 ) : (
                    <>
                      {plan.id === 'free' ? (
                        <button className="w-full py-4 rounded-xl font-semibold text-lg bg-gray-100 text-gray-700 cursor-not-allowed">
                     Free Plan
                   </button>
                 ) : (
                     <button
                          onClick={() => handleSubscribe(plan)}
                          disabled={paymentLoading || !razorpayLoaded || currentSubscription?.plan === 'pro' || (currentSubscription?.plan === 'pro_yearly' && plan.id === 'pro_monthly')}
                          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                            plan.popular
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                          } flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {paymentLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Processing...
                            </>
                          ) : !razorpayLoaded ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <CreditCardIcon id="subscribe-now" className="w-5 h-5" />
                              Subscribe Now
                            </>
                          )}
                     </button>
                      )}
                      {canStartTrial(plan) && (
                       <button
                         onClick={() => handleStartTrial()}
                         disabled={trialLoading}
                         className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                       >
                         {trialLoading ? 'Starting...' : 'Start Free Trial'}
                       </button>
                     )}
                      {(currentSubscription?.hasHadTrial && plan.id === 'pro_monthly' && currentSubscription?.plan !== 'pro_yearly') && (
                       <div className="text-center py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                         <p className="text-amber-800 text-xs font-medium">
                           ⏰ Trial used. Upgrade to continue.
                         </p>
                       </div>
                     )}
                      {(currentSubscription?.plan === 'pro_yearly' && plan.id === 'pro_monthly') && (
                       <div className="text-center py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg">
                         <p className="text-blue-800 text-xs font-medium">
                           ✅ You already have Pro Yearly (higher tier)
                         </p>
                       </div>
                     )}
                   </>
                 )}
               </div>
             </div>
            ))}
           </div>
         </div>

        {/* FAQ Section */}
        <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-orange-200/30 p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Everything you need to know about our subscription plans</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50 dark:bg-blue-50/50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Can I try Pro features for free?</h3>
              <p className="text-gray-600 leading-relaxed">Yes! You can start a 3-day free trial of Pro features without any payment information required. Each user can only use the free trial once.</p>
            </div>
            <div className="bg-green-50 dark:bg-green-50/50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">What are AI actions?</h3>
              <p className="text-gray-600 leading-relaxed">AI actions include rewriting content, summarizing sections, enhancing keywords, and adjusting tone to improve your resume.</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-50/50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600 leading-relaxed">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-50/50 rounded-xl p-6">
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
