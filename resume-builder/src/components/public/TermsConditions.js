import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  LockClosedIcon,
  CpuChipIcon,
  CreditCardIcon,
  ScaleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from '../AnimatedBackground';

const TermsConditions = () => {
  const navigate = useNavigate();
  useRouteScrollToTop();

  const handleBack = () => {
    navigate('/');
  };

  const sections = [
    {
      id: 1,
      title: "Acceptance of Terms",
      icon: ShieldCheckIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
      content: "By accessing and using Presmistique - AI Resume Builder (\"the Service\"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. These Terms of Service apply to all visitors, users, and others who access or use the Service."
    },
    {
      id: 2,
      title: "Description of Service",
      icon: DocumentTextIcon,
      color: "text-blue-500",
      bg: "bg-blue-50/50 dark:bg-blue-900/10",
      content: "Presmistique - AI Resume Builder is an online platform providing tools for professional resume creation. Our service includes templates, AI-powered content suggestions, ATS compatibility analysis, cloud storage, and professional guidance. Some features are token-based and require an active account.",
      list: [
        "Resume templates and design tools",
        "AI-powered content suggestions (token-based)",
        "ATS compatibility analysis and export",
        "Secure cloud storage for resume data",
        "Professional guidance and optimization tips"
      ]
    },
    {
      id: 3,
      title: "User Accounts",
      icon: UserGroupIcon,
      color: "text-indigo-500",
      bg: "bg-indigo-50/50 dark:bg-indigo-900/10",
      content: "To use certain features, you must create an account. You agree to provide accurate information, maintain account security, and accept responsibility for all activities under your account. We reserve the right to terminate accounts for violations of these terms."
    },
    {
      id: 4,
      title: "Acceptable Use Policy",
      icon: ExclamationTriangleIcon,
      color: "text-amber-500",
      bg: "bg-amber-50/50 dark:bg-amber-900/10",
      content: "You agree not to use the Service for unlawful purposes, infringe on intellectual property, harass others, submit false information, or attempt unauthorized access. Violation of these policies may result in immediate account termination."
    },
    {
      id: 5,
      title: "Privacy and Data Protection",
      icon: LockClosedIcon,
      color: "text-purple-500",
      bg: "bg-purple-50/50 dark:bg-purple-900/10",
      content: "Your privacy is paramount. We implement robust security measures to protect your personal information and resume data. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy."
    },
    {
      id: 6,
      title: "Intellectual Property",
      icon: CpuChipIcon,
      color: "text-cyan-500",
      bg: "bg-cyan-50/50 dark:bg-cyan-900/10",
      content: "The Service and its original content are the exclusive property of Presmistique - AI Resume Builder. You retain ownership of the content you create, granting us a limited license to store and process it to provide the Service."
    },
    {
      id: 7,
      title: "Token System & Payment",
      icon: CreditCardIcon,
      color: "text-rose-500",
      bg: "bg-rose-50/50 dark:bg-rose-900/10",
      content: "New users receive 5 free AI tokens. Additional tokens can be purchased securely via Razorpay. Tokens never expire and are delivered instantly. Pricing is subject to change with 30 days notice.",
      list: [
        "AI content suggestions: 1 token",
        "ATS compatibility analysis: 1 token",
        "Resume optimization: 1 token",
        "Smart formatting: 1 token"
      ]
    },
    {
      id: 8,
      title: "Limitation of Liability",
      icon: ScaleIcon,
      color: "text-slate-500",
      bg: "bg-slate-50/50 dark:bg-slate-900/10",
      content: "Presmistique - AI Resume Builder shall not be liable for indirect, incidental, or consequential damages resulting from your use of the Service. Our total liability is limited to the amount paid in the 12 months preceding any claim."
    }
  ];

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
            Terms & <span className="text-indigo-600 dark:text-indigo-400">Conditions</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Please read these terms carefully before using our service. They outline your rights, responsibilities, and our commitment to you.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section
              key={section.id}
              className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className={`flex-shrink-0 p-3 rounded-2xl ${section.bg} transition-transform group-hover:scale-110 duration-300`}>
                  <section.icon className={`w-8 h-8 ${section.color}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {section.id}. {section.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {section.content}
                  </p>
                  {section.list && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {section.list.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}

          {/* Contact Section */}
          <section className="bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <EnvelopeIcon className="w-8 h-8" />
                  Questions?
                </h2>
                <p className="text-indigo-100">
                  Our support team is here to help you with any legal or technical queries.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  to="/contact-us"
                  className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-center hover:bg-indigo-50 transition-colors"
                >
                  Contact Support
                </Link>
                <p className="text-center text-xs text-indigo-200">
                  Typical response time: Within 24 hours
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <footer className="mt-16 text-center text-slate-400 dark:text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} Presmistique - AI Resume Builder. All rights reserved.</p>
          <p className="mt-2 italic">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • Your continued use of the Service constitutes your acceptance of these Terms.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default TermsConditions;
