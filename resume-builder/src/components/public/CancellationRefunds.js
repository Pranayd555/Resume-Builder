import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import {
  ArrowLeftIcon,
  XCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from '../AnimatedBackground';

const CancellationRefunds = () => {
  const navigate = useNavigate();
  useRouteScrollToTop();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AnimatedBackground />

      <main className="relative z-10 max-w-4xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Cancellation & <span className="text-indigo-600 dark:text-indigo-400">Refunds</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We aim for transparency. This policy outlines how we handle account cancellations and refund requests for our token-based services.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Account Cancellation */}
          <section className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 p-3 rounded-2xl bg-red-50/50 dark:bg-red-900/10 transition-transform group-hover:scale-110 duration-300">
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Account Cancellation</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  You can cancel your account at any time. Since our service is token-based, there are no recurring subscriptions to manage.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Free Accounts</h4>
                    <p className="text-sm text-slate-500">Stop using the service anytime. No fees or penalties apply.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Token Usage</h4>
                    <p className="text-sm text-slate-500">Unused tokens remain in your account until you choose to use them.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Policy */}
          <section className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 transition-transform group-hover:scale-110 duration-300">
                <CreditCardIcon className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Refund Policy</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Refunds are eligible only for unused tokens and must meet the following conditions:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Request within 7 days of purchase
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Tokens must be completely unused
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Original payment method only
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Bonus tokens are non-refundable
                  </li>
                </ul>
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                  <p className="text-sm text-amber-800 dark:text-amber-400 flex items-start gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    Used tokens cannot be refunded as digital services are delivered instantly upon request.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Issues */}
          <section className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 transition-transform group-hover:scale-110 duration-300">
                <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Technical Failures</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  If an AI action fails due to technical errors or system malfunctions, the affected tokens will be automatically re-credited to your account. We do not issue cash refunds for technical glitches, but we ensure you get the service you paid for.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <EnvelopeIcon className="w-8 h-8" />
                  Need a Refund?
                </h2>
                <p className="text-indigo-100">
                  Contact our billing team with your Order ID and registered email address.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  to="/contact-us"
                  className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-center hover:bg-indigo-50 transition-colors"
                >
                  Contact Billing Team
                </Link>
                <p className="text-center text-xs text-indigo-200">
                  Processing time: 5-7 business days
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <footer className="mt-16 text-center text-slate-400 dark:text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} Presmistique - AI Resume Builder. All rights reserved.</p>
          <p className="mt-2 italic">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • Compliant with Indian Consumer Protection Rules, 2020.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default CancellationRefunds;
