import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';

function PrivacyPolicy() {
  const navigate = useNavigate();
  useRouteScrollToTop();

  const handleBack = () => {
    navigate('/dashboard');
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
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        </div>

        {/* Content */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-8">
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                create or edit a resume, purchase tokens, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Resume content and personal information you include</li>
                <li>Account preferences and settings</li>
                <li>Token purchase and usage history</li>
                <li>AI feature usage patterns and preferences</li>
                <li>Payment information (processed securely through Razorpay)</li>
                <li>Communication history with our support team</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your resume creation and editing requests</li>
                <li>Deliver AI-powered features and token-based services</li>
                <li>Process token purchases and manage your account balance</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve AI features</li>
                <li>Protect against fraudulent or illegal activity</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>With your explicit permission</li>
                <li>With payment processors (Razorpay) for transaction processing</li>
                <li>With AI service providers for feature delivery (anonymized data only)</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">4. Data Security</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. Our security measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>End-to-end encryption for all data transmission</li>
                <li>Secure payment processing through Razorpay</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication protocols</li>
                <li>Secure cloud storage with industry-standard encryption</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Access and update your personal information</li>
                <li>View your token balance and usage history</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data (including resume data)</li>
                <li>Withdraw consent for data processing</li>
                <li>Request data portability</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">6. AI and Token Data Processing</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                When you use our AI-powered features, we process your resume data to provide:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Content suggestions and improvements</li>
                <li>ATS compatibility analysis</li>
                <li>Resume optimization recommendations</li>
                <li>Formatting and structure enhancements</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                Your resume data is processed securely and is not used to train AI models or shared with third parties. 
                Token usage is tracked for billing purposes and service improvement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, 
                analyze usage patterns, and provide personalized content. You can control 
                cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not 
                knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of 
                any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">10. Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-50/50 dark:to-purple-50/50 p-6 rounded-xl border border-blue-100 dark:border-blue-100/50">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Email:</strong> privacy@resumebuilder.com<br />
                  <strong>Address:</strong> 123 Resume Street, Tech City, TC 12345<br />
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy; 