import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import TemplateShowcase from './TemplateShowcase';
import { USER_ROUTES, ADMIN_ROUTES, PUBLIC_ROUTES } from '../../constants/routes';
import {
  DocumentTextIcon,
  SparklesIcon,
  ArrowRightIcon,
  UserIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Fade, Slide, Roll, AttentionSeeker } from 'react-awesome-reveal';
import { publicAPI } from '../../services/api';
import { FlipText, WaveText } from '../../utils/animated-elements';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  useRouteScrollToTop();

  const [homeData, setHomeData] = useState({
    stats: {
      totalResumes: "10K+",
      totalUsers: "5K+",
      totalTemplates: "50+",
      resumesCreatedToday: "100+",
      averageAtsScore: "85%"
    },
    testimonials: [],
    loading: true
  });

  useEffect(() => {
    const fetchHomeStats = async () => {
      try {
        const data = await publicAPI.getHomeStats();
        if (data.success) {
          const { stats, testimonials } = data.data;
          setHomeData({
            stats: {
              totalResumes: `${(stats.totalResumes / 1000).toFixed(1)}K+`,
              totalUsers: `${(stats.totalUsers / 1000).toFixed(1)}K+`,
              totalTemplates: `${stats.totalTemplates}+`,
              resumesCreatedToday: `${stats.resumesCreatedToday}+`,
              averageAtsScore: `${stats.averageAtsScore}%`
            },
            testimonials,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching home stats:', error);
        setHomeData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchHomeStats();
  }, []);

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
    { number: homeData.stats.totalResumes, label: "Resumes Created" },
    { number: homeData.stats.averageAtsScore, label: "Avg. ATS Score" },
    { number: homeData.stats.totalTemplates, label: "Templates" },
    { number: homeData.stats.resumesCreatedToday, label: "Created Today" }
  ];

  // Helper function to get the correct dashboard route
  const getDashboardRoute = () => {
    if (user && user.role === 'admin') {
      return ADMIN_ROUTES.DASHBOARD;
    }
    return USER_ROUTES.DASHBOARD;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <img
              src={isDarkMode ? "/resume-builder-logo-512-dark.png" : "/resume-builder-logo-512-light.png"}
              alt="Resume Builder Logo"
              className="mx-auto mb-8 w-32 h-32 rounded-full shadow-lg"
            />
            <h1
              className="text-2xl sm:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 inline-grid gap-2 sm:gap-4"
            >
              <FlipText className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text whitespace-nowrap">
                Build Your Perfect
              </FlipText>
              <FlipText className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text whitespace-nowrap">
                Resume in Minutes
              </FlipText>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              <WaveText>
                Create professional, ATS-friendly resumes with our AI-powered builder.
                Choose from premium templates and get expert guidance every step of the way.
              </WaveText>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <AttentionSeeker duration={3000}>
                  <button
                    onClick={() => navigate(getDashboardRoute())}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </AttentionSeeker>
              ) : (
                <>
                  <AttentionSeeker duration={3000}>
                    <button
                      onClick={() => navigate(PUBLIC_ROUTES.REGISTER)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      Get Started Free
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </AttentionSeeker>
                  <AttentionSeeker duration={3000}>
                    <button
                      onClick={() => navigate(PUBLIC_ROUTES.LOGIN)}
                      className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <UserIcon className="w-5 h-5" />
                      Login
                    </button>
                  </AttentionSeeker>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Roll key={index} delay={index * 100}>
                <div className="text-center backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-6">
                  <div className="text-4xl sm:text-5xl font-bold mb-2 text-gray-900 dark:text-gray-600">
                    {stat.number}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </Roll>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <Slide direction="right">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our Resume Builder?
              </h2>
            </Slide>
            <Slide direction="left">
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to create a standout resume that gets you noticed by employers.
              </p>
            </Slide>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Roll key={index} delay={index * 100}>
                <div className="text-center p-6 backdrop-blur-md bg-white/70 dark:bg-orange-50/95 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 hover:shadow-2xl transition-all duration-200">
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
              </Roll>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase Section */}
      <TemplateShowcase />

      {/* Testimonials Section */}
      {homeData.testimonials.length > 0 && (
        <section className="py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="text-center">
              <Slide direction="up">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                  <ChatBubbleLeftRightIcon className="w-10 h-10 text-blue-600" />
                  What Our Users Say
                </h2>
              </Slide>
            </div>
          </div>

          <div className="relative">
            {/* Gradient Overlays for smooth fading at edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none mt-4 mb-4" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none mt-4 mb-4" />

            <div className="flex animate-marquee py-4">
              {/* Duplicate the testimonials to create a seamless loop */}
              {[...homeData.testimonials, ...homeData.testimonials].map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-80 sm:w-96 mx-4">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 italic flex-grow">
                      "{testimonial.message}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Verified User</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Slide direction="up">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Land Your Dream Job?
            </h2>
          </Slide>
          <div className="font-semibold py-4 inline-block">
            <WaveText className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of professionals who have successfully created their resumes with our builder.
            </WaveText>
          </div>
          <Fade direction="top-right">
            <button
              onClick={() => navigate(isAuthenticated ? getDashboardRoute() : PUBLIC_ROUTES.REGISTER)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Building Now'}
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </Fade>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-white/70 dark:bg-transparent border-t border-white/20 dark:border-none py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Slide direction="left">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resume Builder</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Professional resume building made simple and effective.
                </p>
              </div>
            </Slide>

            <Slide direction="up">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  {isAuthenticated ? (
                    <li><button onClick={() => navigate(getDashboardRoute())} className="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</button></li>
                  ) : (
                    <>
                      <li><button onClick={() => navigate(PUBLIC_ROUTES.LOGIN)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Login</button></li>
                      <li><button onClick={() => navigate(PUBLIC_ROUTES.REGISTER)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Register</button></li>
                      <li><button onClick={() => navigate(PUBLIC_ROUTES.ADMIN_LOGIN)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Login as Admin</button></li>
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
            </Slide>


            <Slide direction="up">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Legal</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li><button onClick={() => navigate(PUBLIC_ROUTES.PRIVACY_POLICY)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => navigate(PUBLIC_ROUTES.TERMS_CONDITIONS)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms & Conditions</button></li>
                  <li><button onClick={() => navigate(PUBLIC_ROUTES.CANCELLATION_REFUNDS)} className="hover:text-gray-900 dark:hover:text-white transition-colors text-align-left">Cancellation & Refunds</button></li>
                </ul>
              </div>
            </Slide>


            <Slide direction="right">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Support</h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li><button onClick={() => navigate(PUBLIC_ROUTES.CONTACT_US)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</button></li>
                  <li><button onClick={() => navigate(PUBLIC_ROUTES.SHIPPING)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Shipping</button></li>
                  <li><button onClick={() => navigate(USER_ROUTES.FEEDBACK)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Feedback</button></li>
                </ul>
              </div>
            </Slide>
          </div>
          <div className="border-t border-white/20 dark:border-orange-200/30 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

