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
import { LEGAL_LAST_UPDATED } from '../../constants/legal';
import { SUPPORT_EMAIL } from '../../constants/brand';

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
      content: "We collect what you give us when you create an account, build resumes or contact support. If you sign in with Google or LinkedIn, we receive your name, email address and profile picture from them. Payments are handled by Razorpay; we receive the payment status and reference, not your card or bank details.",
      list: [
        "Name, email and contact details",
        "Resume content you enter or import",
        "Account settings and preferences",
        "Token purchases and usage history",
        "Which AI features you use and when"
      ]
    },
    {
      id: 2,
      title: "How We Use Your Information",
      icon: EyeIcon,
      color: "text-indigo-500",
      bg: "bg-indigo-50/50 dark:bg-indigo-900/10",
      content: "We use your data to run the service: to save and display your resumes, create PDFs, run the AI features you ask for, process token purchases, and help you when you contact support. We look at aggregate usage to fix problems and improve the product.",
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
      content: "We do not sell your personal information. We share data only with the service providers we need to run Presmistique, and only for that purpose.",
      list: [
        "Google (Gemini API): the resume text and job description needed for an AI feature you use",
        "Razorpay: payment processing for token packs",
        "Google and LinkedIn: sign-in, if you choose those options",
        "Cloudflare: website hosting, security and cookie-free traffic statistics",
        "Our email provider: account and support emails"
      ]
    },
    {
      id: 4,
      title: "Data Security",
      icon: LockClosedIcon,
      color: "text-rose-500",
      bg: "bg-rose-50/50 dark:bg-rose-900/10",
      content: "We use reasonable technical and organisational measures to protect your data. No online service can guarantee complete security, but we work to keep your information safe.",
      list: [
        "HTTPS encryption for all data in transit",
        "Passwords stored only as secure hashes",
        "Your own AI API key encrypted at rest",
        "Access to personal data limited to what is needed to run the service"
      ]
    },
    {
      id: 5,
      title: "Your Rights",
      icon: FingerPrintIcon,
      color: "text-amber-500",
      bg: "bg-amber-50/50 dark:bg-amber-900/10",
      content: "You can see and update your information in your profile, and delete your account from your profile page at any time. To request a copy of your data, or for any other privacy request, email us at the address below.",
      list: [
        "Access and update your information",
        "Delete your account",
        "Ask for a copy of your data"
      ]
    },
    {
      id: 6,
      title: "AI & Token Processing",
      icon: CpuChipIcon,
      color: "text-cyan-500",
      bg: "bg-cyan-50/50 dark:bg-cyan-900/10",
      content: "When you use an AI feature, the text it needs (for example a resume section, or your resume and a job description) is sent to Google's Gemini API to produce the result. We don't train AI models on your data. If you use your own Gemini API key, the request runs on your Google account under Google's terms; on Google's free tier those terms may allow Google to use the content to improve its products."
    },
    {
      id: 7,
      title: "Cookies & Tracking",
      icon: ShieldCheckIcon,
      color: "text-purple-500",
      bg: "bg-purple-50/50 dark:bg-purple-900/10",
      content: "We use a session cookie while you sign in with Google or LinkedIn, and your browser's local storage to keep you logged in and remember settings such as dark mode. We don't use advertising or cross-site tracking cookies. Site traffic is measured with Cloudflare Web Analytics, which does not use cookies."
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
            Your privacy is our priority. This policy explains how we collect, use, and protect your personal information when you use Presmistique - AI Resume Builder.
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
                  Questions about your data or a privacy request? Email <a href={`mailto:${SUPPORT_EMAIL}`} className="underline font-semibold text-white">{SUPPORT_EMAIL}</a> or use the contact form.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  to="/contact-us"
                  className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-center hover:bg-indigo-50 transition-colors"
                >
                  Contact us
                </Link>
                <p className="text-center text-xs text-indigo-200">
                  Typical response time: Within 48 hours
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <footer className="mt-16 text-center text-slate-600 dark:text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Presmistique - AI Resume Builder. All rights reserved.</p>
          <p className="mt-2 italic">
            Last updated: {LEGAL_LAST_UPDATED}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PrivacyPolicy;