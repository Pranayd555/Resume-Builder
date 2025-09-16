import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  UserIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: DocumentTextIcon,
      title: "Professional Templates",
      description: "Choose from our collection of professionally designed resume templates that are ATS-friendly and visually appealing."
    },
    {
      icon: SparklesIcon,
      title: "AI-Powered Optimization",
      description: "Get AI-powered suggestions to improve your resume content and increase your chances of landing interviews."
    },
    {
      icon: ChartBarIcon,
      title: "ATS Score Analysis",
      description: "Analyze your resume's compatibility with Applicant Tracking Systems and get detailed feedback."
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We never share your personal information with third parties."
    }
  ];

  const stats = [
    { number: "10K+", label: "Resumes Created" },
    { number: "95%", label: "Success Rate" },
    { number: "50+", label: "Templates" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Build Your Perfect
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Resume in Minutes
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create professional, ATS-friendly resumes with our AI-powered builder. 
              Choose from premium templates and get expert guidance every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <UserIcon className="w-5 h-5" />
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Resume Builder?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to create a standout resume that gets you noticed by employers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl sm:text-5xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-lg opacity-90">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of professionals who have successfully created their resumes with our builder.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            Start Building Now
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Resume Builder</h3>
              <p className="text-gray-400">
                Professional resume building made simple and effective.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Register</button></li>
                <li><button onClick={() => navigate('/templates')} className="hover:text-white transition-colors">Templates</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms-conditions')} className="hover:text-white transition-colors">Terms & Conditions</button></li>
                <li><button onClick={() => navigate('/cancellation-refunds')} className="hover:text-white transition-colors">Cancellation & Refunds</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/contact-us')} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button onClick={() => navigate('/shipping')} className="hover:text-white transition-colors">Shipping</button></li>
                <li><button onClick={() => navigate('/feedback')} className="hover:text-white transition-colors">Feedback</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
