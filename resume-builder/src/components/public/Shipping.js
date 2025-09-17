import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import { ArrowLeftIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Shipping = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shipping Information</h1>
        </div>

        {/* Content */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
          
          {/* Digital Service Notice */}
          <section className="mb-12">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-4 flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-blue-500" />
                Digital Service - No Physical Shipping
              </h2>
              <p className="text-gray-600 dark:text-gray-500 mb-4">
                Resume Builder is a digital service that provides online resume building tools and templates. 
                We do not ship physical products. All our services are delivered digitally through our web platform.
              </p>
              <p className="text-gray-600 dark:text-gray-500">
                Your resumes, templates, and all related content are accessible immediately upon account creation and subscription activation.
              </p>
            </div>
          </section>

          {/* Service Delivery */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6 flex items-center gap-3">
              <ClockIcon className="w-8 h-8 text-green-500" />
              Service Delivery Timeline
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">Free Plan</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-500">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Immediate access upon registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Basic templates available instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-500 mt-0.5 flex-shrink-0" />
                    <span>PDF export functionality</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">Pro Plan</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-500">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Immediate activation after payment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>All premium features unlocked instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Advanced templates and AI features</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Digital Downloads */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6">
              Digital Downloads & Exports
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-400 mb-4">Available Formats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl mb-2">📄</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-700 mb-2">PDF</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">High-quality, print-ready format</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl mb-2">📝</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-700 mb-2">DOCX</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Editable Microsoft Word format</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-xl">
                  <div className="text-2xl mb-2">🌐</div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-700 mb-2">HTML</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Web-friendly format</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-gray-400 mb-2">Download Process</h4>
                <ol className="space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>1. Complete your resume using our builder</li>
                  <li>2. Click the "Download" or "Export" button</li>
                  <li>3. Choose your preferred format</li>
                  <li>4. File downloads immediately to your device</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Cloud Storage */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6">
              Cloud Storage & Access
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-400 mb-4">Your Data is Safe</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                All your resume data is securely stored in our cloud infrastructure. You can access your resumes from any device, anywhere, at any time.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-400 mb-3">Storage Features</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Unlimited resume storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Automatic backups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Version history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Cross-device synchronization</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-400 mb-3">Security Measures</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>End-to-end encryption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Secure data centers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Regular security audits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>GDPR compliance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6 flex items-center gap-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
              Service Availability
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-4">Uptime Commitment</h3>
              <p className="text-gray-600 dark:text-gray-500 mb-4">
                We strive to maintain 99.9% uptime for our service. However, we cannot guarantee uninterrupted access due to:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-500 ml-4">
                <li>• Scheduled maintenance windows</li>
                <li>• Technical issues beyond our control</li>
                <li>• Internet connectivity problems</li>
                <li>• Third-party service dependencies</li>
              </ul>
              
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-gray-500 mb-2">Maintenance Notices</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  We will provide advance notice of scheduled maintenance through email notifications and in-app announcements.
                </p>
              </div>
            </div>
          </section>

          {/* Support & Contact */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-700 mb-6">
              Support & Contact
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-500 mb-4">
                If you experience any issues with service delivery or have questions about accessing your account:
              </p>
              <div className="space-y-2 text-gray-600 dark:text-gray-500">
                <p><strong>Email Support:</strong> support@resumebuilder.com</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
                <p><strong>Business Hours:</strong> Monday - Friday, 9 AM - 6 PM EST</p>
                <p><strong>Emergency Support:</strong> Available for Pro subscribers</p>
              </div>
            </div>
          </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
