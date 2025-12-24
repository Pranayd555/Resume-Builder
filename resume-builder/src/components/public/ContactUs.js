import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import { contactAPI } from '../../services/api';
import { toast } from 'react-toastify';
import CustomDropdown from '../CustomDropdown';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import AnimatedBackground from '../AnimatedBackground';

const ContactUs = () => {
  const navigate = useNavigate();
  useRouteScrollToTop();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleBack = () => {
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: formData.category
      };

      const response = await contactAPI.submitContact(contactData);

      if (response.success) {
        setSubmitStatus('success');
        toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        setSubmitStatus('error');
        toast.error(response.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      details: ['pranaydaspr@gmail.com'],
      description: 'Get help with your account and technical issues',
      color: 'text-blue-500',
      bg: 'bg-blue-50/50 dark:bg-blue-900/10'
    },
    {
      icon: ClockIcon,
      title: 'Business Hours',
      details: ['Mon - Fri: 9 AM - 6 PM IST', 'Sat: 10 AM - 4 PM IST'],
      description: 'When we are available to respond',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50/50 dark:bg-indigo-900/10'
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Payments' },
    {
      value: 'feature',
      label: 'Feature Request',
      badge: (
        <div className="flex items-center gap-1">
          <SparklesIcon className="w-3 h-3" />
          <span>Earn Tokens</span>
        </div>
      )
    },
    {
      value: 'bug',
      label: 'Bug Report',
      badge: (
        <div className="flex items-center gap-1">
          <SparklesIcon className="w-3 h-3" />
          <span>Earn Tokens</span>
        </div>
      )
    },
    { value: 'partnership', label: 'Partnership' }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AnimatedBackground />

      <main className="relative z-10 max-w-6xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
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
            Get in <span className="text-indigo-600 dark:text-indigo-400">Touch</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have questions or need assistance? Our team is here to help you build your future.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className={`w-12 h-12 rounded-2xl ${info.bg} flex items-center justify-center mb-4`}>
                  <info.icon className={`w-6 h-6 ${info.color}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{info.title}</h3>
                <div className="space-y-1 mb-3">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-slate-600 dark:text-slate-400 text-sm font-medium">{detail}</p>
                  ))}
                </div>
                <p className="text-slate-500 dark:text-slate-500 text-xs">{info.description}</p>
              </div>
            ))}

            {/* Emergency Support */}
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-100 dark:border-red-900/30">
              <h3 className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                Urgent?
              </h3>
              <p className="text-sm text-red-700/70 dark:text-red-400/70 mb-2">
                For critical issues affecting account access:
              </p>
              <p className="font-bold text-red-600 dark:text-red-400">pranaydaspr@gmail.com</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-indigo-600" />
                Send us a Message
              </h2>

              {submitStatus === 'success' && (
                <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-800 dark:text-emerald-400 font-bold">Message sent successfully!</p>
                    <p className="text-emerald-700/70 dark:text-emerald-400/70 text-sm">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Category</label>
                  <CustomDropdown
                    value={formData.category}
                    onChange={(value) => handleInputChange({ target: { name: 'category', value } })}
                    options={categories}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <footer className="mt-16 text-center text-slate-400 dark:text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} Resume Builder. All rights reserved.</p>
          <p className="mt-2 italic">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • We typically respond within 24 hours.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ContactUs;
