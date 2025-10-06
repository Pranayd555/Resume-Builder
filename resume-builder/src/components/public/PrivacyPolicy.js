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
                create or edit a resume, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Resume content and personal information you include</li>
                <li>Account preferences and settings</li>
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
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Protect against fraudulent or illegal activity</li>
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
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">4. Data Security</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, 
                analyze usage patterns, and provide personalized content. You can control 
                cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">7. Children's Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not 
                knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of 
                any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4">9. Contact Us</h2>
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