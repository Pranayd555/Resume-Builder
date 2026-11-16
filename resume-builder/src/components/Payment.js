import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CurrencyDollarIcon,
  ArrowLeftIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  KeyIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from './AnimatedBackground';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../services/api';
import { PRODUCT_NAME } from '../constants/brand';

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

/** Load Razorpay Checkout once; resolves false if it cannot be loaded. */
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT}"]`);
    const script = existing || document.createElement('script');
    script.addEventListener('load', () => resolve(true));
    script.addEventListener('error', () => resolve(false));
    if (!existing) {
      script.src = CHECKOUT_SCRIPT;
      document.body.appendChild(script);
    }
  });
}

const errorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const Payment = () => {
  const navigate = useNavigate();
  const { user, balance, refreshBalance } = useAuth();
  const [config, setConfig] = useState(null); // { enabled, keyId, packs }
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Show the latest balance (grants and refunds can change it server-side)
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Packs and prices come from the server, the only place they are defined
  useEffect(() => {
    let cancelled = false;
    paymentAPI.getConfig()
      .then((res) => {
        if (cancelled || !res?.success) return;
        setConfig(res.data);
        const packs = res.data.packs || [];
        setSelectedPackId((current) => current || (packs.find((p) => p.popular) || packs[0])?.id || null);
        if (res.data.enabled) loadCheckout();
      })
      .catch(() => {
        if (!cancelled) setConfig({ enabled: false, packs: [] });
      });
    return () => { cancelled = true; };
  }, []);

  const packs = config?.packs || [];
  const selectedPack = packs.find((pack) => pack.id === selectedPackId) || null;
  const paymentsEnabled = Boolean(config?.enabled);

  const confirmPayment = useCallback(async (response) => {
    try {
      const result = await paymentAPI.verifyPayment({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      });
      // The API layer applies the new balance from data.tokens.
      toast.success(result?.message || 'Payment successful. Tokens added to your account.');
      navigate('/analytics');
    } catch (error) {
      // Razorpay's webhook (or the reconcile job) will still credit a real payment.
      toast.info(errorMessage(error, 'We are confirming your payment. Your tokens will appear within a few minutes.'));
      setTimeout(() => refreshBalance(), 15000);
    } finally {
      setProcessing(false);
    }
  }, [navigate, refreshBalance]);

  const handlePurchase = async () => {
    if (!selectedPack || processing) return;
    setProcessing(true);
    try {
      if (!(await loadCheckout())) {
        throw new Error('Could not load the payment window. Please check your connection and try again.');
      }
      const res = await paymentAPI.createOrder(selectedPack.id);
      const order = res?.data;
      if (!order?.orderId) throw new Error(res?.message || 'Could not start the payment.');

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: PRODUCT_NAME,
        description: `${selectedPack.tokens} AI tokens${selectedPack.bonus > 0 ? ` + ${selectedPack.bonus} bonus` : ''}`,
        prefill: {
          name: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
          email: user?.email || ''
        },
        theme: { color: '#3B82F6' },
        handler: confirmPayment,
        modal: {
          ondismiss: () => setProcessing(false)
        }
      });
      checkout.on('payment.failed', (response) => {
        toast.error(response?.error?.description || 'Payment failed. You can try again.');
      });
      checkout.open();
    } catch (error) {
      toast.error(errorMessage(error, 'Could not start the payment. Please try again.'));
      setProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* While payments are off: how to get tokens instead */}
      {config && !paymentsEnabled && (
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
                It is still on development phase, to procure more tokens write a feedback, finding out an issue you have faced or require enhancement, our team will look into your feedback if valid will fix it and grant you with tokens, Generally if accepted tokens received within 48 hours.
              </span>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium text-base px-4">
                It is still on development phase, to procure more tokens write a feedback, finding out an issue you have faced or require enhancement, our team will look into your feedback if valid will fix it and grant you with tokens, Generally if accepted tokens received within 48 hours.
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Content Container */}
      <div className={`relative z-10 container mx-auto px-4 pb-8 ${config && !paymentsEnabled ? 'pt-6' : 'pt-[88px]'}`}>

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

          {/* Current balance */}
          {user?.isOwnApiKey ? (
            <p className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
              <KeyIcon className="w-4 h-4" />
              You're using your own Gemini API key, so AI actions don't use tokens.
            </p>
          ) : (
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30" data-testid="payment-token-balance">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="text-green-700 dark:text-green-300 font-semibold">
                  Your balance: {balance.total} {balance.total === 1 ? 'token' : 'tokens'}
                </div>
                <div className="text-green-600 dark:text-green-400 text-xs">
                  {balance.purchased} purchased (refundable) + {balance.bonus} bonus
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Token Purchase Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Token Package
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Pick a pack. Bigger packs cost less per token, and tokens never expire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {!config && (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">Loading packs…</div>
            )}
            {packs.map((pkg) => (
              <button
                type="button"
                key={pkg.id}
                aria-pressed={selectedPackId === pkg.id}
                className={`relative text-left bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-2 ${selectedPackId === pkg.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                onClick={() => setSelectedPackId(pkg.id)}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow">
                    Most popular
                  </span>
                )}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.tokens} Tokens
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
                    ₹{(pkg.price / (pkg.tokens + pkg.bonus)).toFixed(1)} per token
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            {paymentsEnabled ? (
              <>
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={processing || !selectedPack}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 mx-auto"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing…
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5" />
                      Pay ₹{selectedPack?.price ?? 0}
                    </>
                  )}
                </button>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                  Secure payment by Razorpay (UPI, cards, net banking, wallets). Tokens are added instantly,
                  never expire and are non-refundable. 1 token = 1 AI action; if an AI action fails, its token
                  is returned automatically. Charged twice or didn&apos;t get your tokens? Contact us and we&apos;ll fix it.
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto mb-2"
                >
                  <KeyIcon className="w-6 h-6" />
                  Bring your own key
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/contact-us')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <EnvelopeIcon className="w-6 h-6" />
                  Contact Us to Earn Tokens
                </button>
                {config && (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Payments are paused right now. Please use contact us to request tokens.
                  </p>
                )}
              </>
            )}
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