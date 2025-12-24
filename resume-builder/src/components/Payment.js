import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CurrencyDollarIcon,
  ArrowLeftIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  // CreditCardIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from './AnimatedBackground';
// import { paymentAPI, apiHelpers } from '../services/api';

const Payment = () => {
  const navigate = useNavigate();
  const [tokenAmount, setTokenAmount] = useState(5);
  // const [loading, setLoading] = useState(false);
  // const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Token packages
  const tokenPackages = [
    { amount: 5, price: 49, bonus: 0 },
    { amount: 10, price: 89, bonus: 1 },
    { amount: 25, price: 199, bonus: 5 },
    { amount: 50, price: 349, bonus: 15 },
    { amount: 100, price: 599, bonus: 40 }
  ];

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpay = () => {
      if (window.Razorpay) {
        // setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      // script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => toast.error('Failed to load payment gateway');
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, []);

  /*
  const handleTokenPurchase = async () => {
    if (tokenAmount < 5 || tokenAmount % 5 !== 0) {
      toast.error('Token amount must be in multiples of 5');
      return;
    }

    const selectedPackage = tokenPackages.find(pkg => pkg.amount === tokenAmount);
    if (!selectedPackage) {
      toast.error('Invalid token amount');
      return;
    }

    await initiatePayment({
      type: 'tokens',
      amount: selectedPackage.price,
      tokens: tokenAmount + selectedPackage.bonus,
      description: `${tokenAmount} AI Tokens${selectedPackage.bonus > 0 ? ` + ${selectedPackage.bonus} Bonus` : ''}`
    });
  };


  const initiatePayment = async (paymentData) => {
    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading, please wait...');
      return;
    }

    setLoading(true);
    try {
      // Create order on backend
      const response = await paymentAPI.createOrder({
        amount: paymentData.amount,
        currency: 'INR',
        receipt: `${paymentData.type}_${Date.now()}`,
        metadata: {
          type: paymentData.type,
          tokens: paymentData.tokens,
          planId: paymentData.planId
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }

      const order = response.order;


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
        // Explicitly set mode to test for development
        mode: process.env.NODE_ENV === 'production' ? 'live' : 'test',
        // Add debug logging
        config: {
          display: {
            hide: []
          }
        },
        handler: async (response) => {
          try {
            // Complete payment and add tokens in one call
            const completeResponse = await paymentAPI.completeTokenPurchase({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              tokens: paymentData.tokens,
              amount: paymentData.amount,
              currency: 'INR',
              payment_method: 'razorpay',
              email: userData?.email || 'user@example.com',
              contact: userData?.phone || userData?.contact || '+919876543210'
            });

            if (completeResponse.success) {
              toast.success('Payment successful!');
              toast.success(`${paymentData.tokens} tokens added to your account!`);

              // Update token data with bonus tokens
              if (completeResponse.data?.tokens) {
                const tokenData = {
                  balance: completeResponse.data.tokens.balance || 0,
                  purchasedTokens: completeResponse.data.tokens.purchasedTokens || 0,
                  bonusTokens: completeResponse.data.tokens.bonusTokens || 0
                };
                apiHelpers.updateTokenData(tokenData);
              } else {
                // Final fallback: fetch latest token balance from API
                try {
                  const { analyticsAPI } = await import('../services/api');
                  const tokenResponse = await analyticsAPI.getTokenBalance();
                  if (tokenResponse.success && tokenResponse.data) {
                    apiHelpers.updateTokenData(tokenResponse.data);
                  }
                } catch (error) {
                  console.error('Failed to fetch updated token balance:', error);
                }
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
            setLoading(false);
            toast.info('Payment cancelled');
          },
          closed: () => {
            // Ensure loading is set to false if the modal is closed for any reason
            setLoading(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed. Please try again.');
        setLoading(false);
      });

      rzp1.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };
  */

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Disclaimer Marquee - Full width, sticks right below header */}
      <div className="relative z-20 pt-[64px]">
        <div className="w-full overflow-hidden bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-sm">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-seamless {
              display: inline-flex;
              animation: marquee 40s linear infinite;
            }
            .animate-marquee-seamless:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="py-2.5 flex overflow-hidden">
            <div className="animate-marquee-seamless whitespace-nowrap">
              <span className="text-yellow-600 dark:text-yellow-400 font-medium text-base px-4">
                It is still on development phase, to procure more tokens write a feedback, finding out an issue you have faced or require enhancement, our team will look into your feedback if valid will fix it and grant you with tokens, Generally if accepted tokens received within 24 hours.
              </span>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium text-base px-4">
                It is still on development phase, to procure more tokens write a feedback, finding out an issue you have faced or require enhancement, our team will look into your feedback if valid will fix it and grant you with tokens, Generally if accepted tokens received within 24 hours.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 pt-6 pb-8">

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center relative pt-2 pb-6">
            <button
              onClick={handleBack}
              className="absolute left-0 flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:dark:text-white transition-colors font-medium group"
            >
              <ArrowLeftIcon className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Buy AI Tokens
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Purchase tokens to use AI features. Tokens are used for AI-powered resume optimization.
          </p>
        </div>

        {/* Token Purchase Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Token Package
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Select a token package that fits your needs. Higher packages include bonus tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tokenPackages.map((pkg, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-2 ${tokenAmount === pkg.amount
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                onClick={() => setTokenAmount(pkg.amount)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.amount} Tokens
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    ₹{pkg.price}
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="text-green-600 font-medium mb-4">
                      +{pkg.bonus} Bonus Tokens
                    </div>
                  )}
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    ₹{Math.round(pkg.price / (pkg.amount + pkg.bonus))} per token
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            {/* Pay Now Button - Commented out for development phase */}
            {/* 
            <button
              onClick={handleTokenPurchase}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-5 h-5" />
                  Pay ₹{tokenPackages.find(pkg => pkg.amount === tokenAmount)?.price || 0}
                </>
              )}
            </button>
            */}

            {/* Contact Us Button */}
            <button
              onClick={() => navigate('/contact-us')}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <EnvelopeIcon className="w-6 h-6" />
              Contact Us to Earn Tokens
            </button>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Payment system is currently under maintenance. Please use contact us to request tokens.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced AI technology for resume optimization and ATS analysis.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Secure Payment
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Your payment information is secure with Razorpay integration.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Instant Access
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Get immediate access to all features after successful payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;