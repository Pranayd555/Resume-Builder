import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const CancellationRefunds = () => {
  const navigate = useNavigate();
  useRouteScrollToTop();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cancellation & Refunds</h1>
        </div>

        {/* Content */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
          
          {/* Account Cancellation Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6 flex items-center gap-3">
              <XCircleIcon className="w-8 h-8 text-red-500" />
              Account Cancellation Policy
            </h2>
            <div className="bg-green-200/20 dark:bg-green-200/20 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free Account</h3>
              <p className="text-gray-600 mb-4">
                Your free account can be cancelled at any time without any charges or penalties. 
                Simply stop using the service or contact me directly.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No cancellation fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Immediate account deactivation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Data export available before cancellation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Unused tokens are forfeited</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">Token-Based Service</h3>
              <p className="text-gray-600 dark:text-gray-600 mb-4">
                Since our service is token-based, there are no recurring subscriptions to cancel. 
                You can stop purchasing tokens at any time and continue using your existing tokens.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No recurring charges</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tokens never expire</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use tokens at your own pace</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Basic features remain available</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Refund Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6 flex items-center gap-3">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
              Refund & Cancellation Policy
            </h2>
            
            <div className="bg-blue-50 dark:bg-blue-200/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700">Policy Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-600">Effective Date: January 2024 | Last Updated: January 2024</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-600">
                Thank you for purchasing AI tokens through Resume Builder. We value your trust and aim to maintain transparency about how refunds and cancellations are handled.
              </p>
            </div>

            {/* Nature of Service */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mb-4">1. Nature of Service</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our platform provides access to AI-based digital services, where each token corresponds to a single AI action or request. 
                As the service is delivered digitally and instantly upon token use, refunds are governed by specific conditions outlined below.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Example:</strong> If a token is used for an AI prompt, analysis, or generation task, it is counted as consumed and cannot be refunded.
                </p>
              </div>
            </div>

            {/* Non-Refundable Items */}
            <div className="bg-red-50 dark:bg-red-200/20 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">2. Non-Refundable Items</h3>
              <p className="text-gray-600 dark:text-gray-600 mb-4">
                Once a token has been used to trigger an AI response, it is considered consumed and non-refundable. 
                Since digital services are delivered immediately, we cannot reclaim or reverse the content generated.
              </p>
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircleIcon className="w-5 h-5" />
                <span className="font-semibold">Used tokens are permanently non-refundable</span>
              </div>
            </div>

            {/* Refunds for Unused Tokens */}
            <div className="bg-green-50 dark:bg-green-200/20 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">3. Refunds for Unused Tokens</h3>
              <p className="text-gray-600 dark:text-gray-600 mb-4">
                Refunds are eligible only for unused tokens and must meet the following conditions:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-600 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>The refund request is made within 7 days of the purchase date</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Tokens must remain unused (i.e., not linked to any AI request)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>The refund amount will be proportional to the number of unused tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Refunds will be processed to the original payment method via Razorpay within 5–7 business days</span>
                </li>
              </ul>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Example:</strong> If you purchased 100 tokens and used 10, you may request a refund for the remaining 90 tokens within the refund period.
                </p>
              </div>
            </div>

            {/* AI Errors or Failed Responses */}
            <div className="bg-blue-50 dark:bg-blue-200/20 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">4. AI Errors or Failed Responses</h3>
              <p className="text-gray-600 dark:text-gray-600 mb-4">
                If an AI action fails due to technical errors, timeouts, system malfunctions, or incomplete responses, 
                the system will automatically re-credit the affected token(s) to your account.
              </p>
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Cash refunds will not be issued for such cases. You can also manually report issues via the "Contact Us" section.
                </p>
              </div>
            </div>

            {/* User Dissatisfaction */}
            <div className="bg-orange-50 dark:bg-orange-200/20 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">5. User Dissatisfaction</h3>
              <p className="text-gray-600 dark:text-gray-600 mb-4">
                AI-generated results may vary depending on input quality and context. We do not provide refunds for dissatisfaction with AI output 
                (e.g., "I didn't like the result") unless the system clearly fails to deliver a valid response.
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Tip:</strong> We encourage users to refine their input or retry the service.
                </p>
              </div>
            </div>
          </section>

          {/* Refund Request Process */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6">
              6. Refund Request Process
            </h2>
            <div className="bg-gray-50 dark:bg-cyan-200/20 rounded-2xl p-6 mb-6">
              <p className="text-gray-600 dark:text-gray-600 mb-6">
                To request a refund, email us at <strong>pranaydaspr@gmail.com</strong> with the following information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Required Information</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Registered email ID</li>
                    <li>• Payment ID / Order ID</li>
                    <li>• Reason for refund</li>
                    <li>• Number of unused tokens</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Processing Timeline</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Review: 2-3 business days</li>
                    <li>• Processing: 5-7 business days</li>
                    <li>• Method: Original payment via Razorpay</li>
                    <li>• Notification: Email confirmation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cancellations */}
            <div className="bg-purple-50 dark:bg-purple-200/20 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">7. Cancellations</h3>
              <p className="text-gray-600 dark:text-gray-600">
                Since tokens are credited instantly after payment, cancellations of completed orders are not possible. 
                However, you may request a refund for unused tokens as per the above policy.
              </p>
            </div>

            {/* Disputes & Chargebacks */}
            <div className="bg-yellow-50 dark:bg-yellow-200/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">8. Disputes & Chargebacks</h3>
              <p className="text-gray-600 dark:text-gray-600">
                In case of payment disputes or chargebacks raised via Razorpay or your bank, please reach out to our support team first. 
                We aim to resolve issues amicably and transparently before formal escalation.
              </p>
            </div>
          </section>

          {/* How to Cancel Account */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6">
              How to Cancel Your Account
            </h2>
            <div className="bg-red-50 dark:bg-red-200/20 rounded-2xl p-6">
              <ol className="space-y-4 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">1</span>
                  <span>Go to your Profile page</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">2</span>
                  <span>Click the "Delete Account" button</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">3</span>
                  <span>Confirm deletion in the popup</span>
                </li>
              </ol>
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-200/60 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-600 font-semibold">
                  ⚠️ Account and all associated data deleted immediately. This action cannot be undone.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6">
              9. Contact Us
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6">
              <p className="text-gray-600 dark:text-gray-600 mb-4">
                For any queries or assistance related to refunds, please contact:
              </p>
              <div className="space-y-2 text-gray-600 dark:text-gray-600">
                <p><strong>📧 Email:</strong> pranaydaspr@gmail.com</p>
                <p><strong>🌐 Website:</strong> Resume Builder Platform</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
                <p><strong>Business Hours:</strong> Monday - Friday, 9 AM - 6 PM IST</p>
              </div>
            </div>

            {/* Legal Compliance Note */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300">Legal Compliance</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                This policy is in accordance with the Indian Consumer Protection (E-Commerce) Rules, 2020, and Razorpay's merchant guidelines. 
                By purchasing tokens on our platform, you acknowledge and agree to this Refund & Cancellation Policy.
              </p>
            </div>
          </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefunds;
