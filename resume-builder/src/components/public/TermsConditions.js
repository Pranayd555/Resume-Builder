import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TermsConditions = () => {
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
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 flex items-center gap-3">
            <DocumentTextIcon className="w-10 h-10" />
            Terms & Conditions
          </h1>
          <p className="text-xl text-white/90">
            Please read these terms carefully before using our service
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          
          {/* Last Updated */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8">
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-green-500" />
              1. Acceptance of Terms
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                By accessing and using Resume Builder ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                These Terms of Service apply to all visitors, users, and others who access or use the Service.
              </p>
            </div>
          </section>

          {/* Description of Service */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              2. Description of Service
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Resume Builder is an online platform that provides tools and templates for creating professional resumes. Our service includes:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>• Resume templates and design tools</li>
                <li>• AI-powered content suggestions</li>
                <li>• ATS (Applicant Tracking System) compatibility analysis</li>
                <li>• Resume export in multiple formats (PDF, DOCX)</li>
                <li>• Cloud storage for resume data</li>
                <li>• Professional guidance and tips</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              3. User Accounts
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Creation</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                To use certain features of our Service, you must create an account. You agree to:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4 mb-4">
                <li>• Provide accurate, current, and complete information</li>
                <li>• Maintain and update your information to keep it accurate</li>
                <li>• Maintain the security of your password and account</li>
                <li>• Accept responsibility for all activities under your account</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Termination</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
              4. Acceptable Use Policy
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Prohibited Activities</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">You agree not to:</p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>• Use the Service for any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>• Violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>• Infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>• Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>• Submit false or misleading information</li>
                <li>• Upload or transmit viruses or any other type of malicious code</li>
                <li>• Attempt to gain unauthorized access to our Service or related systems</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              5. Privacy and Data Protection
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                We implement appropriate security measures to protect your personal information and resume data against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              6. Intellectual Property Rights
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Rights</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Resume Builder and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You retain ownership of the content you create using our Service. You grant us a limited license to store, process, and display your content as necessary to provide the Service.
              </p>
            </div>
          </section>

          {/* Subscription and Payment */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              7. Subscription and Payment Terms
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Free Plan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our free plan provides basic resume building features at no cost.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pro Plan</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Pro plan subscriptions are billed monthly or annually. All fees are non-refundable except as required by law or as specified in our refund policy.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Price Changes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We reserve the right to change our pricing at any time. Price changes will be communicated to existing subscribers with at least 30 days notice.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              8. Limitation of Liability
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                In no event shall Resume Builder, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Our total liability to you for any damages arising from or related to these terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              9. Changes to Terms
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              10. Contact Information
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p><strong>Email:</strong> legal@resumebuilder.com</p>
                <p><strong>Support:</strong> support@resumebuilder.com</p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
