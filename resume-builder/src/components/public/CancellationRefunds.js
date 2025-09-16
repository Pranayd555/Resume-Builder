import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const CancellationRefunds = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Cancellation & Refunds
          </h1>
          <p className="text-xl text-white/90">
            Our transparent cancellation and refund policy
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          
          {/* Cancellation Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <XCircleIcon className="w-8 h-8 text-red-500" />
              Cancellation Policy
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Free Plan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our free plan can be cancelled at any time without any charges or penalties. 
                Simply stop using the service or contact our support team.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No cancellation fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Immediate access termination</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Data export available</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pro Plan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Pro plan subscriptions can be cancelled at any time. Your access will continue 
                until the end of your current billing period.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Cancel anytime from your account settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No cancellation fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Access continues until period end</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Automatic downgrade to free plan</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Refund Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
              Refund Policy
            </h2>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">30-Day Money-Back Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We offer a 30-day money-back guarantee for all Pro plan subscriptions. 
                If you're not satisfied with our service, we'll provide a full refund.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Full refund within 30 days of purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No questions asked policy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Refund processed within 5-7 business days</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Refund Exceptions</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Refunds may not be available in the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>More than 30 days after purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Violation of terms of service</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Fraudulent or suspicious activity</span>
                </li>
              </ul>
            </div>
          </section>

          {/* How to Cancel */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              How to Cancel Your Subscription
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <ol className="space-y-4 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">1</span>
                  <span>Log into your account and go to your Profile page</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">2</span>
                  <span>Click on the "Subscription" tab</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">3</span>
                  <span>Click "Cancel Subscription" button</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">4</span>
                  <span>Confirm your cancellation</span>
                </li>
              </ol>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Need Help?
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about cancellations or refunds, please don't hesitate to contact us:
              </p>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p><strong>Email:</strong> support@resumebuilder.com</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
                <p><strong>Business Hours:</strong> Monday - Friday, 9 AM - 6 PM EST</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CancellationRefunds;
