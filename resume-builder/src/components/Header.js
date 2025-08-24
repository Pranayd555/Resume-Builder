import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bars3Icon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [profilePictureVersion, setProfilePictureVersion] = useState(0);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Helper function to get profile picture URL from user data
  const getProfilePictureUrl = (userData) => {
    if (!userData || !userData.profilePicture) return null;
    
    let url = null;
    
    // Handle the new profile picture structure
    if (userData.profilePicture.type === 'avatar' && userData.profilePicture.avatarUrl) {
      url = userData.profilePicture.avatarUrl;
    } else if (userData.profilePicture.type === 'uploaded' && userData.profilePicture.uploadedPhoto) {
      url = userData.profilePicture.uploadedPhoto.thumbnailUrl || userData.profilePicture.uploadedPhoto.url;
    }
    
    // Legacy support for old structure
    if (!url) {
      if (typeof userData.profilePicture === 'string') {
        url = userData.profilePicture;
      } else if (userData.profilePicture.url || userData.profilePicture.thumbnailUrl) {
        url = userData.profilePicture.thumbnailUrl || userData.profilePicture.url;
      }
    }
    

    
    return url;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  // Force re-render when user data changes (especially profile picture)
  useEffect(() => {
    // Increment version to force re-render when user data changes
    setProfilePictureVersion(prev => prev + 1);
  }, [user?.profilePicture]);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          mobileMenuButtonRef.current && !mobileMenuButtonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };

    // Add event listeners if mobile menu is open
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showMenu]);

  // Don't show header on login/register pages or if not authenticated
  if (location.pathname === '/login' || location.pathname === '/register' || !isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      navigate('/login');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSubscription = () => {
    navigate('/subscription');
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy');
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center min-w-0 flex-1">
            <h1 
              className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 truncate"
              onClick={() => navigate('/resume-list')}
            >
              Resume Builder
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {getProfilePictureUrl(user) ? (
                    <img 
                      key={`${getProfilePictureUrl(user)}-${profilePictureVersion}`} // Force re-render when URL changes
                      src={getProfilePictureUrl(user)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className="text-white text-xs lg:text-sm font-medium" style={{ display: getProfilePictureUrl(user) ? 'none' : 'flex' }}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 text-xs lg:text-sm font-medium max-w-32 truncate">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                </span>
              </div>
            )}
            
            <div className="h-5 w-px bg-gray-300"></div>
            
            <button
              onClick={handleProfile}
              className="text-gray-600 hover:text-gray-900 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-white/50 hover:shadow-sm"
            >
              Profile
            </button>
            <button
              onClick={handleSubscription}
              className="text-gray-600 hover:text-gray-900 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-white/50 hover:shadow-sm"
            >
              Subscription
            </button>
            <button
              onClick={handleAnalytics}
              className="text-gray-600 hover:text-gray-900 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-white/50 hover:shadow-sm"
            >
              Analytics
            </button>
            <button
              onClick={handlePrivacyPolicy}
              className="text-gray-600 hover:text-gray-900 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-white/50 hover:shadow-sm"
            >
              Privacy Policy
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-red-50 hover:shadow-sm flex items-center space-x-1 lg:space-x-2"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <button
              ref={mobileMenuButtonRef}
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-1 sm:p-2 rounded-lg hover:bg-white/50 transition-all duration-200"
            >
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMenu && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/20 backdrop-blur-md bg-white/50 rounded-b-lg shadow-lg">
              {/* User Info - Mobile */}
              {user && (
                <div className="flex items-center space-x-3 px-2 py-2 border-b border-white/20 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {getProfilePictureUrl(user) ? (
                      <img 
                        key={`${getProfilePictureUrl(user)}-${profilePictureVersion}`} // Force re-render when URL changes
                        src={getProfilePictureUrl(user)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className="text-white text-sm font-medium" style={{ display: getProfilePictureUrl(user) ? 'none' : 'flex' }}>
                      {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-900 text-sm font-medium truncate">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {user.firstName ? user.email : 'User'}
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleProfile}
                className="text-gray-600 hover:text-gray-900 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/50 w-full text-left"
              >
                Profile
              </button>
              <button
                onClick={handleSubscription}
                className="text-gray-600 hover:text-gray-900 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/50 w-full text-left"
              >
                Subscription
              </button>
              <button
                onClick={handleAnalytics}
                className="text-gray-600 hover:text-gray-900 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/50 w-full text-left"
              >
                Analytics
              </button>
              <button
                onClick={handlePrivacyPolicy}
                className="text-gray-600 hover:text-gray-900 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/50 w-full text-left"
              >
                Privacy Policy
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50 w-full text-left flex items-center space-x-2"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header; 