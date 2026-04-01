import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useRouteScrollToTop } from '../../hooks/useAutoScroll';
import TemplateShowcase from './TemplateShowcase';
import { USER_ROUTES, ADMIN_ROUTES, PUBLIC_ROUTES } from '../../constants/routes';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  ChatBubbleLeftRightIcon,
  BugAntIcon,
  GiftIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  HeartIcon,
  CloudArrowUpIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { Slide, Roll, AttentionSeeker } from 'react-awesome-reveal';
import { publicAPI } from '../../services/api';
import { FlipText, WaveText } from '../../utils/animated-elements';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  useRouteScrollToTop();
  const currentYear = new Date().getFullYear();
  const githubRepoUrl =
    process.env.REACT_APP_GITHUB_REPO_URL || 'https://github.com/Pranayd555/Resume-Builder';

  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.9]);
  const textY = useTransform(scrollY, [0, 300], [0, -20]);
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

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

  // const sentence = {
  //   hidden: { opacity: 1 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       delay: 0.2,
  //       staggerChildren: 0.08, // Controls the speed of the "build"
  //     },
  //   },
  // };

  // const word = {
  //   hidden: { opacity: 0, y: 10 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       duration: 0.5,
  //       ease: "easeOut",
  //     },
  //   },
  // };

  return (
    <div className="min-h-screen">
      {/* Top Announcement Banner */}
      {!isAuthenticated && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-indigo-600 text-white py-2 px-4 text-center text-sm font-bold sticky top-0 z-[100] shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <SparklesIcon className="w-5 h-5 animate-spin-slow" />
            <span>Limited Offer: Get 5 AI Tokens Free + 100% Free Resume Generation!</span>
            <button
              onClick={() => navigate(PUBLIC_ROUTES.REGISTER)}
              className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs hover:bg-indigo-50 transition-colors"
            >
              Claim Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center mb-12">
            <motion.div
              style={{ scale, opacity }}
              className="relative"
            >
              <img
                src={isDarkMode ? "/resume-builder-logo-512-dark.png" : "/resume-builder-logo-512-light.png"}
                alt="Presmistique Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl shadow-2xl mb-6 transform transition-transform hover:rotate-3"
              />
            </motion.div>
            <motion.div
              style={{ y: textY, opacity: textOpacity }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter">
                <FlipText className="block whitespace-nowrap">
                  PRESMISTIQUE
                </FlipText>
              </h1>
              <div className="mt-2 text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400 tracking-[0.3em] uppercase">
                <FlipText className="block whitespace-nowrap">
                  AI Resume Builder
                </FlipText>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="mb-6 flex flex-wrap justify-center gap-4"
          >
            <AttentionSeeker effect="pulse" duration={3000} iterations={Infinity}>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold shadow-sm">
                <CheckCircleIcon className="w-6 h-6" />
                <span>100% Free Downloads</span>
              </div>
            </AttentionSeeker>
            <AttentionSeeker effect="pulse" duration={2000} iterations={Infinity}>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm">
                <DocumentTextIcon className="w-6 h-6" />
                <span>100% Free Templates</span>
              </div>
            </AttentionSeeker>
            <AttentionSeeker duration={3000}>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold shadow-sm">
                <GiftIcon className="w-6 h-6" />
                <span>5 Free AI Tokens on Signup!</span>
              </div>
            </AttentionSeeker>
          </motion.div>


          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-10 max-w-3xl mx-auto font-medium"
          >
            Stop getting lost in the shuffle. Our platform uses intelligent, ATS-first technology to strip away the clutter and rebuild your resume into a modern document engineered to get you noticed, interviewed, and hired.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(getDashboardRoute())}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-3 group"
              >
                Enter Dashboard
                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(PUBLIC_ROUTES.REGISTER)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-3 group"
                >
                  Start Building Now
                  <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(PUBLIC_ROUTES.LOGIN)}
                  className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <UserIcon className="w-6 h-6" />
                  Login Account
                </motion.button>
              </>
            )}
          </div>





        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl animate-blob" />
      </section>

      {/* Process Section */}
      <section className="py-24 bg-transparent relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Three simple steps to your dream job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                icon: CloudArrowUpIcon,
                title: "Add Content",
                desc: "You can enter your details yourself, or let our AI do the work by reading your resume."
              },
              {
                step: "02",
                icon: DocumentTextIcon,
                title: "Choose Template",
                desc: "Select from our 22+ ATS-friendly, professional templates."
              },
              {
                step: "03",
                icon: ArrowDownTrayIcon,
                title: "Download Free",
                desc: "Export as high-quality PDF instantly. No payment needed."
              }
            ].map((step, i) => (
              <Roll
                key={i}
                delay={i * 100}
                className="relative group p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute -top-6 -left-6 text-6xl font-black text-blue-600/10 group-hover:text-blue-600/20 transition-colors">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-6 transition-transform">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </motion.div>
              </Roll>
            ))}
          </div>
        </div>
      </section>


      {/* Template Showcase Section */}
      <TemplateShowcase />

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.1
                }}
                className="text-center group"
              >
                <div className="relative p-8 rounded-[2rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <div className="text-4xl sm:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600">
                    {stat.number}
                  </div>
                  <div className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {stat.label}
                  </div>
                  {/* Decorative line */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-1/2 transition-all duration-500 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Why We Are Truly Different
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              We believe building a career shouldn't cost you a fortune.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Competitors */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800/30 p-10 rounded-[2.5rem] border border-gray-200 dark:border-gray-700/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-red-500 font-black">X</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400">Other Builders</h3>
              </div>
              <ul className="space-y-6">
                {[
                  "Expensive Monthly Subscriptions ($15-$40/mo)",
                  "Sneaky Auto-Renewals",
                  "Pay-to-Download Traps",
                  "Limited Access to Shared Data",
                  "Customer Support is non-existent"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-gray-500 dark:text-gray-400 font-medium">
                    <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-red-400 dark:bg-red-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Us */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600 to-purple-700 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative transform hover:scale-[1.02] transition-all duration-500 group overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
              <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm font-black tracking-wider uppercase">
                Best Choice
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-black text-white">Presmistique</h3>
              </div>

              <ul className="space-y-6">
                {[
                  { text: "100% Free Forever (Currently)", bold: "FREE NOW" },
                  { text: "No Subscriptions, No Contracts", bold: "NO TRAPS" },
                  { text: "Lifetime Personal Dashboard", bold: "ALWAYS YOURS" },
                  { text: "5 Free Premium AI Tokens on Signup", bold: "BONUS" },
                  { text: "Earn More Tokens by Helping Us", bold: "REWARDS" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-white/90">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">
                      <span className="font-black text-white">{item.bold}:</span> {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bug Bounty Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-purple-400/5 dark:from-orange-500/10 dark:to-purple-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 p-8 md:p-16 rounded-[3rem] shadow-xl border border-orange-100 dark:border-orange-900/30 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-black text-sm mb-6 uppercase tracking-widest">
                <StarIcon className="w-4 h-4" />
                Community Program
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                Help Us Build The Best Tool & <span className="text-orange-500">Earn Free Tokens</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                Found a bug? Have a great idea for a new feature or template? Report it to us and get rewarded with <span className="text-orange-500 font-bold decoration-orange-500 underline decoration-2 underline-offset-4 text-2xl px-2">Free AI Tokens</span> for every valid submission.
              </p>
              {isAuthenticated ? <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(PUBLIC_ROUTES.CONTACT_US)}
                  className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/30"
                >
                  <BugAntIcon className="w-6 h-6" />
                  Report a Bug
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(PUBLIC_ROUTES.CONTACT_US)}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-gray-900 hover:dark:bg-gray-900 hover:dark:text-white transition-all flex items-center gap-2"
                >
                  <SparklesIcon className="w-6 h-6" />
                  Suggest Enhancement
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900/30 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-2"
                >
                  <CodeBracketIcon className="w-6 h-6" />
                  GitHub Community
                </motion.a>
              </div>
                : <div className="flex flex-wrap sm:flex-row gap-4 justify-center md:justify-start">
                  <AttentionSeeker duration={3000}>
                    <button
                      onClick={() => navigate(PUBLIC_ROUTES.SIGNUP)}
                      className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Sign up now
                    </button>
                  </AttentionSeeker>
                  <button
                    onClick={() => navigate(PUBLIC_ROUTES.CONTACT_US)}
                    className="bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-400 font-semibold py-3 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Learn More
                  </button>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={githubRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-8 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 inline-flex items-center gap-2 justify-center"
                  >
                    <CodeBracketIcon className="w-5 h-5" />
                    GitHub Community
                  </motion.a>
                </div>
              }
            </div>
            <div className="flex-1 flex justify-center">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-orange-400 to-pink-500 rounded-[3rem] flex items-center justify-center shadow-2xl relative z-10 overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                  <GiftIcon className="w-32 h-32 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
                </div>
                {/* Background glow */}
                <div className="absolute inset-0 bg-orange-500 blur-[80px] opacity-30 -z-10" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4"
            >
              Power Features for Serious Roles
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
            >
              Advanced technology to give you an edge over other candidates.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <Roll
                key={index}
                delay={index * 100}
              >
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-8 backdrop-blur-md bg-white dark:bg-gray-800/40 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 h-full flex flex-col items-center group"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </motion.div>
              </Roll>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      {
        homeData.testimonials.length > 0 && (
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
                        {testimonial.profileImage ? (
                          <img
                            src={testimonial.profileImage}
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
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
        )
      }

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-600/5" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-20 rounded-[4rem] bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-[0_50px_100px_rgba(0,0,0,0.3)]"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              Start Your Journey <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">For Free</span>
            </h2>
            <div className="py-4 inline-block">
              <WaveText className="text-gray-300 dark:text-gray-600 mb-12">
                Join hundreds of professionals building their future today. No credit cards, no subscriptions.
              </WaveText>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(isAuthenticated ? getDashboardRoute() : PUBLIC_ROUTES.REGISTER)}
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-12 py-5 rounded-2xl font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto mt-8"
            >
              {isAuthenticated ? 'Enter Dashboard' : 'Get Started Free'}
              <ArrowRightIcon className="w-6 h-6" />
            </motion.button>

            <p className="mt-8 text-gray-400 dark:text-gray-500 font-medium flex items-center justify-center gap-2">
              <HeartIcon className="w-5 h-5 text-red-500 animate-pulse" />
              Loved by job seekers worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md bg-white/70 dark:bg-transparent border-t border-white/20 dark:border-none py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Slide direction="left">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Presmistique - AI Resume Builder</h3>
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
            <p>&copy; {currentYear} Presmistique - AI Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

