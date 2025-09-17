import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import TemplateShowcase from './TemplateShowcase';
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  UserIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  useRouteScrollToTop();

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
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
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Resume Builder?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to create a standout resume that gets you noticed by employers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 hover:shadow-2xl transition-all duration-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-700 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase Section */}
      <TemplateShowcase />

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-6">
                <div className="text-4xl sm:text-5xl font-bold mb-2 text-gray-900 dark:text-gray-600">
                  {stat.number}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of professionals who have successfully created their resumes with our builder.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start Building Now'}
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-white/70 dark:bg-transparent border-t border-white/20 dark:border-none py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resume Builder</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Professional resume building made simple and effective.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {isAuthenticated ? (
                  <li><button onClick={() => navigate('/dashboard')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</button></li>
                ) : (
                  <>
                    <li><button onClick={() => navigate('/login')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Login</button></li>
                    <li><button onClick={() => navigate('/register')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Register</button></li>
                  </>
                )}
                <li>
                  <button 
                    onClick={toggleDarkMode} 
                    className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {isDarkMode ? (
                      <>
                        <SunIcon className="w-4 h-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <MoonIcon className="w-4 h-4" />
                        Dark Mode
                      </>
                    )}
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms-conditions')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms & Conditions</button></li>
                <li><button onClick={() => navigate('/cancellation-refunds')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Cancellation & Refunds</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Support</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><button onClick={() => navigate('/contact-us')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</button></li>
                <li><button onClick={() => navigate('/shipping')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Shipping</button></li>
                <li><button onClick={() => navigate('/feedback')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Feedback</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 dark:border-orange-200/30 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
