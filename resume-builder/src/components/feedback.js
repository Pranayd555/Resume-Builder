import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackAPI, apiHelpers } from '../services/api';
import { useRouteScrollToTop } from '../hooks/useAutoScroll';
import { toast } from 'react-toastify';
import { 
  ChevronLeftIcon, 
  EnvelopeIcon, 
  ClockIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

function Feedback() {
  const navigate = useNavigate();
  useRouteScrollToTop();
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit feedback to API (public, no auth required)
      const response = await feedbackAPI.submitFeedbackPublic(feedback);
      
      console.log('Feedback submitted successfully:', response);
      
      // Reset form
      setFeedback({
        name: '',
        email: '',
        subject: '',
        message: '',
        rating: 5
      });
      
      // Show success message
      toast.success('Thank you for your feedback! We appreciate your input.');
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = apiHelpers.formatError(error);
      toast.error(`Failed to submit feedback: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="mr-4 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Feedback</h1>
            <p className="text-gray-600 dark:text-gray-200 mt-1">I'd love to hear from you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100/30 to-blue-100/30 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
                <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Have questions or suggestions about Resume Builder? I'd love to hear from you. As a solo developer, 
                your feedback is incredibly valuable for improving the application.
              </p>
              
              <div className="space-y-6">
                <div className="group p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-blue-100/30 border border-blue-200/30 hover:from-blue-100/70 hover:to-blue-200/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <EnvelopeIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">Email Support</p>
                      <p className="text-gray-600 group-hover:text-gray-800 transition-colors">pranaydaspr@gmail.com</p>
                      <p className="text-sm text-gray-500 mt-1">I'll respond within 24 hours</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-4 rounded-xl bg-gradient-to-r from-green-50/50 to-green-100/30 border border-green-200/30 hover:from-green-100/70 hover:to-green-200/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <ClockIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">Business Hours</p>
                      <p className="text-gray-600 group-hover:text-gray-800 transition-colors">Monday - Friday: 9 AM - 6 PM IST</p>
                      <p className="text-sm text-gray-500 mt-1">When I am available to respond</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional info section */}
              <div className="mt-8 p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 rounded-xl border border-gray-200/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                    <InformationCircleIcon className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">Response Time</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  I typically respond to all inquiries within 24 hours during business days. Your feedback helps me improve 
                  Resume Builder and add features that matter to you.
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Share Your Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">Name</label>
                <input
                  type="text"
                  value={feedback.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  value={feedback.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">Subject</label>
                <input
                  type="text"
                  value={feedback.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleInputChange('rating', star)}
                      className={`text-3xl transition-all duration-200 hover:scale-110 ${
                        star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-3 font-medium">{feedback.rating}/5</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">Message</label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500"
                  placeholder="Tell me about your experience with Resume Builder..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Share Feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
