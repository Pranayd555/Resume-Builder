import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon, current: location.pathname === '/admin/dashboard' },
    { name: 'Users', href: '/admin/users', icon: UsersIcon, current: location.pathname === '/admin/users' },
    { name: 'Resumes', href: '/admin/resumes', icon: DocumentTextIcon, current: location.pathname === '/admin/resumes' },
    { name: 'Templates', href: '/admin/templates', icon: NewspaperIcon, current: location.pathname === '/admin/templates' },
    { name: 'Contacts', href: '/admin/contacts', icon: ChatBubbleLeftRightIcon, current: location.pathname === '/admin/contacts' },
    { name: 'Feedback', href: '/admin/feedback', icon: ChatBubbleLeftIcon, current: location.pathname === '/admin/feedback' },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, current: location.pathname === '/admin/analytics' },
    { name: 'Email Test', href: '/admin/email-test', icon: EnvelopeIcon, current: location.pathname === '/admin/email-test' },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon, current: location.pathname === '/admin/settings' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/admin/dashboard" className="flex items-center">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Admin Panel
                </span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side - User menu and controls */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <UserCircleIcon className="h-6 w-6" />
                <span className="hidden sm:block text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  
                  <Link
                    to="/admin/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <UserCircleIcon className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                  
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <HomeIcon className="h-4 w-4 mr-2" />
                    User Dashboard
                  </Link>
                  
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                  } group flex items-center px-3 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
