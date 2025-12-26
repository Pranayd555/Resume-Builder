import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  BoltIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from '../AnimatedBackground';

const Shipping = () => {
  const navigate = useNavigate();
  useRouteScrollToTop();

  const handleBack = () => {
    navigate('/');
  };

  const features = [
    {
      icon: <BoltIcon className="w-6 h-6 text-indigo-600" />,
      title: "Instant Access",
      description: "Get immediate access to all resume templates and tools upon registration. No waiting, no shipping."
    },
    {
      icon: <CloudArrowUpIcon className="w-6 h-6 text-indigo-600" />,
      title: "Cloud Storage",
      description: "Your resumes are securely stored in the cloud, accessible from any device, anywhere in the world."
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />,
      title: "Secure Delivery",
      description: "Digital exports (PDF) are generated instantly and delivered directly to your device."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-gray-900">
      <AnimatedBackground />

      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
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
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Digital Delivery & Service
            </h1>
            <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
              Presmistique - AI Resume Builder is a 100% digital platform. We provide instant access to professional tools without the need for physical shipping.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Info Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-gray-700 overflow-hidden">
            <div className="p-8 sm:p-12">
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <ClockIcon className="w-6 h-6 mr-3 text-indigo-600" />
                  Service Timeline
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-4">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Free & Pro Access</h4>
                      <p className="text-slate-600 dark:text-gray-400 text-sm">Immediate activation upon account creation or upgrade.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-4">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">Token Purchases</h4>
                      <p className="text-slate-600 dark:text-gray-400 text-sm">AI tokens are credited to your account instantly after successful payment.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Availability & Support</h2>
                <div className="bg-slate-50/50 dark:bg-gray-700/50 rounded-2xl p-6 border border-slate-100 dark:border-gray-600">
                  <p className="text-slate-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                    Our services are available 24/7 globally. While we strive for 99.9% uptime, occasional maintenance may occur. We'll always notify you in advance.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-gray-600">
                    <div className="flex items-center text-slate-700 dark:text-gray-200">
                      <EnvelopeIcon className="w-5 h-5 mr-3 text-indigo-600" />
                      <span className="font-medium">pranaydaspr@gmail.com</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                      Response within 24 hours
                    </span>
                  </div>
                </div>
              </section>

              <div className="text-center">
                <p className="text-xs text-slate-400 dark:text-gray-500">
                  Last updated: December 2025 • Presmistique - AI Resume Builder Digital Services
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
