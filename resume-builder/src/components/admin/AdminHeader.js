import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ArrowUturnLeftIcon,
  ArrowRightOnRectangleIcon,
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
    { name: 'Profile', href: '/admin/profile', icon: UserCircleIcon, current: location.pathname === '/admin/profile' },
    { name: 'Users', href: '/admin/users', icon: UsersIcon, current: location.pathname === '/admin/users' },
    { name: 'Feedback', href: '/admin/feedback', icon: ChatBubbleLeftIcon, current: location.pathname === '/admin/feedback' },
    { name: 'Contacts', href: '/admin/contacts', icon: ChatBubbleLeftRightIcon, current: location.pathname === '/admin/contacts' },
    { name: 'Transactions', href: '/admin/transactions', icon: CreditCardIcon, current: location.pathname === '/admin/transactions' },
    { name: 'Refunds', href: '/admin/refunds', icon: ArrowUturnLeftIcon, current: location.pathname === '/admin/refunds' },
    { name: 'Tokens', href: '/admin/tokens', icon: CurrencyDollarIcon, current: location.pathname === '/admin/tokens' },
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
            
            {/* Desktop navigation - compact mobile-style design */}
            <nav className="hidden sm:ml-4 sm:flex sm:space-x-1 lg:space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'border-transparent text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                  } group flex items-center px-2 py-1.5 border-l-2 text-xs font-medium transition-colors duration-200 rounded-r-md`}
                >
                  <item.icon className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate max-w-20 lg:max-w-none">{item.name}</span>
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

            {/* Mobile menu button - only for extra small screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation menu - only for extra small screens */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'border-transparent text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                  } group flex items-center px-3 py-2 border-l-2 text-sm font-medium transition-colors duration-200 rounded-r-md`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
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
