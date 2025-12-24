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
  SparklesIcon
} from '@heroicons/react/24/outline';

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
      // Prepare contact data
      const contactData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        category: formData.category
      };

      // Submit contact using the new contact API
      const response = await contactAPI.submitContact(contactData);

      if (response.success) {
        setSubmitStatus('success');
        toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');

        // Reset form
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
      description: 'Get help with your account and technical issues'
    },
    {
      icon: ClockIcon,
      title: 'Business Hours',
      details: ['Monday - Friday: 9 AM - 6 PM IST', 'Saturday: 10 AM - 4 PM IST', 'Sunday: Closed'],
      description: 'When I am available to respond'
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
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
        </div>

        {/* Content */}

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <div key={index} className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-6 text-center hover:shadow-2xl transition-all duration-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <info.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-700 mb-2">
                {info.title}
              </h3>
              <div className="space-y-1 mb-3">
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 dark:text-gray-500 text-sm">
                    {detail}
                  </p>
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-xs">
                {info.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Form */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-6">
              Send us a Message
            </h2>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-90/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-500">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-semibold">Message sent successfully!</span>
                </div>
                <p className="text-green-700 dark:text-green-500 text-sm mt-1">
                  We'll get back to you within 24 hours.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="font-semibold">Failed to send message</span>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  Please try again or contact us directly at support@resumebuilder.com
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 backdrop-blur-md bg-white/80 dark:bg-white border border-white/30 dark:border-orange-200/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 backdrop-blur-md bg-white/80 dark:bg-white border border-white/30 dark:border-orange-200/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="relative z-10">
                <label htmlFor="category" className="block text-sm font-medium text-gray-900 dark:text-gray-700 mb-2">
                  Category
                </label>
                <CustomDropdown
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(value) => handleInputChange({ target: { name: 'category', value } })}
                  options={categories}
                  placeholder="Select a category"
                  disableSearch={true}
                  className="w-full backdrop-blur-md bg-white/80 dark:bg-white border border-white/30 dark:border-orange-200/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                />
              </div>

              <div className="relative z-0">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-900 dark:text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 backdrop-blur-md bg-white/80 dark:bg-white border border-white/30 dark:border-orange-200/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div className="relative z-0">
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-gray-700 resize-none"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-700 mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-700 mb-2">
                    How quickly do you respond to support requests?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-500">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-700 mb-2">
                    What information should I include in my message?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-500">
                    Please include your account email, a clear description of the issue,
                    and any relevant screenshots or error messages to help us assist you better.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-700 mb-2">
                    How can I get support?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-500">
                    We provide comprehensive email support for all users. You can contact us via email
                    or through our contact form, and we'll respond within 24 hours during business days.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-700 mb-2">
                    Can I request new features?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-500">
                    Absolutely! We love hearing from our users. Use the "Feature Request"
                    category when submitting your message, and we'll consider it for future updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-700 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                Emergency Support
              </h3>
              <p className="text-gray-600 dark:text-gray-500 mb-3">
                For urgent technical issues affecting your ability to access your account or resumes:
              </p>
              <p className="text-red-600 dark:text-red-400 font-semibold">
                pranaydaspr@gmail.com
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Available 24/7 for critical issues
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
