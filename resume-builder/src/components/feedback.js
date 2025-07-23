import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackAPI, apiHelpers } from '../services/api';
import { toast } from 'react-toastify';

function Feedback() {
  const navigate = useNavigate();
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
      // Submit feedback to API
      const response = await feedbackAPI.submitFeedback(feedback);
      
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
    navigate('/resume-list');
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
            <p className="text-gray-600 mt-1">We'd love to hear from you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100/30 to-blue-100/30 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Have questions or suggestions? We'd love to hear from you. Reach out to us through any of these channels.
              </p>
              
              <div className="space-y-6">
                <div className="group p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-blue-100/30 border border-blue-200/30 hover:from-blue-100/70 hover:to-blue-200/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">Email</p>
                      <p className="text-gray-600 group-hover:text-gray-800 transition-colors">pranaydaspr@gmail.com</p>
                      <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-4 rounded-xl bg-gradient-to-r from-green-50/50 to-green-100/30 border border-green-200/30 hover:from-green-100/70 hover:to-green-200/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">Phone</p>
                      <p className="text-gray-600 group-hover:text-gray-800 transition-colors">+91 891805854</p>
                      <p className="text-sm text-gray-500 mt-1">Available Mon-Fri, 9AM-6PM IST</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-4 rounded-xl bg-gradient-to-r from-purple-50/50 to-purple-100/30 border border-purple-200/30 hover:from-purple-100/70 hover:to-purple-200/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">Address</p>
                      <p className="text-gray-600 group-hover:text-gray-800 transition-colors">Gaighata, N 24 Parganas, WB, India - 743249</p>
                      <p className="text-sm text-gray-500 mt-1">West Bengal, India</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional info section */}
              <div className="mt-8 p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/30 rounded-xl border border-gray-200/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900">Response Time</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We typically respond to all inquiries within 24 hours during business days. For urgent matters, please use the phone number above.
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={feedback.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={feedback.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={feedback.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                  placeholder="Tell us about your experience..."
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
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
