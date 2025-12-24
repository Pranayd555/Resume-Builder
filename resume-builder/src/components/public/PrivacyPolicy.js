import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ShareIcon,
  LockClosedIcon,
  FingerPrintIcon,
  CpuChipIcon,
  FaceSmileIcon,
  EnvelopeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from '../AnimatedBackground';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  useRouteScrollToTop();

  const handleBack = () => {
    navigate('/');
  };

  const sections = [
    {
      id: 1,
      title: "Information We Collect",
      icon: UserCircleIcon,
      color: "text-blue-500",
      bg: "bg-blue-50/50 dark:bg-blue-900/10",
      content: "We collect information you provide directly to us when you create an account, build resumes, or contact support. This includes personal details, resume content, and payment information processed securely through Razorpay.",
      list: [
        "Name, email, and contact details",
        "Resume content and personal info",
        "Account settings and preferences",
        "Token purchase and usage history",
        "AI feature usage patterns"
      ]
    },
    {
      id: 2,
      title: "How We Use Your Information",
      icon: EyeIcon,
      color: "text-indigo-500",
      bg: "bg-indigo-50/50 dark:bg-indigo-900/10",
      content: "Your data is used to provide and improve our services, process transactions, and deliver AI-powered features. We analyze usage patterns to enhance our AI models and ensure a seamless user experience.",
      list: [
        "Provide and maintain services",
        "Process resume creation/editing",
        "Deliver AI-powered features",
        "Manage accounts and tokens",
        "Technical support and updates"
      ]
    },
    {
      id: 3,
      title: "Information Sharing",
      icon: ShareIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50/50 dark:bg-emerald-900/10",
      content: "We do not sell your personal information. Sharing only occurs with your consent or with trusted partners like Razorpay for payments and AI providers for feature delivery (using anonymized data)."
    },
    {
      id: 4,
      title: "Data Security",
      icon: LockClosedIcon,
      color: "text-rose-500",
      bg: "bg-rose-50/50 dark:bg-rose-900/10",
      content: "We implement industry-standard security measures, including end-to-end encryption and secure cloud storage, to protect your data against unauthorized access or disclosure.",
      list: [
        "End-to-end data encryption",
        "Secure Razorpay integration",
        "Regular security audits",
        "Strict access controls"
      ]
    },
    {
      id: 5,
      title: "Your Rights",
      icon: FingerPrintIcon,
      color: "text-amber-500",
      bg: "bg-amber-50/50 dark:bg-amber-900/10",
      content: "You have full control over your data. You can access, update, or delete your information at any time. You also have the right to opt-out of marketing and request a copy of your data.",
      list: [
        "Access and update personal info",
        "Delete account and data",
        "Opt-out of communications",
        "Request data portability"
      ]
    },
    {
      id: 6,
      title: "AI & Token Processing",
      icon: CpuChipIcon,
      color: "text-cyan-500",
      bg: "bg-cyan-50/50 dark:bg-cyan-900/10",
      content: "When using AI features, your resume data is processed securely to provide suggestions and ATS analysis. We do not use your personal data to train public AI models."
    },
    {
      id: 7,
      title: "Cookies & Tracking",
      icon: ShieldCheckIcon,
      color: "text-purple-500",
      bg: "bg-purple-50/50 dark:bg-purple-900/10",
      content: "We use cookies to enhance your experience and analyze site traffic. You can manage your cookie preferences through your browser settings at any time."
    },
    {
      id: 8,
      title: "Children's Privacy",
      icon: FaceSmileIcon,
      color: "text-teal-500",
      bg: "bg-teal-50/50 dark:bg-teal-900/10",
      content: "Our services are not intended for children under 13. We do not knowingly collect information from children. If we discover such data, we will delete it immediately."
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
            Privacy <span className="text-indigo-600 dark:text-indigo-400">Policy</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Your privacy is our priority. This policy explains how we collect, use, and protect your personal information when you use Resume Builder.
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
                  Privacy Concerns?
                </h2>
                <p className="text-indigo-100">
                  If you have any questions about your data or our privacy practices, please reach out.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  to="/contact-us"
                  className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-center hover:bg-indigo-50 transition-colors"
                >
                  Contact Privacy Team
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
          <p>© {new Date().getFullYear()} Resume Builder. All rights reserved.</p>
          <p className="mt-2 italic">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • We are committed to protecting your personal data and your right to privacy.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PrivacyPolicy;