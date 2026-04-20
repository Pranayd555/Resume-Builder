import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { apiHelpers } from "../services/api";
import Swal from "sweetalert2";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAuthenticated} = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showMenu, setShowMenu] = useState(false);
  const [profilePictureVersion, setProfilePictureVersion] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenData, setTokenData] = useState({
    balance: 0,
    purchasedTokens: 0,
    bonusTokens: 0,
  });
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Helper function to get profile picture URL from user data
  const getProfilePictureUrl = (userData) => {
    if (!userData || !userData.profilePicture) return null;

    let url = null;

    // Handle the new profile picture structure
    if (
      userData.profilePicture.type === "avatar" &&
      userData.profilePicture.avatarUrl
    ) {
      url = userData.profilePicture.avatarUrl;
    } else if (
      userData.profilePicture.type === "uploaded" &&
      userData.profilePicture.uploadedPhoto
    ) {
      url =
        userData.profilePicture.uploadedPhoto.thumbnailUrl ||
        userData.profilePicture.uploadedPhoto.avatarUrl;
      url = apiHelpers.normalizeUrl(url);
    }

    // Legacy support for old structure
    if (!url) {
      if (typeof userData.profilePicture === "string") {
        url = userData.profilePicture;
      } else if (
        userData.profilePicture.url ||
        userData.profilePicture.thumbnailUrl
      ) {
        url =
          userData.profilePicture.thumbnailUrl || userData.profilePicture.url;
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
    setProfilePictureVersion((prev) => prev + 1);
  }, [user?.profilePicture]);

  // Consolidated token data management
  useEffect(() => {
    // Helper function to update token data
    const updateTokenData = () => {
      const balance = apiHelpers.getTokenBalance();
      const tokenData = apiHelpers.getTokenData();
      const defaultTokenData = {
        balance: 0,
        purchasedTokens: 0,
        bonusTokens: 0,
      };

      setTokenData(tokenData || defaultTokenData);
      setTokenBalance(balance || 0);
    };

    // Initial load and when user changes (e.g., after login)
    updateTokenData();

    // Event handlers for various scenarios
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTokenData();
      }
    };

    const handleFocus = () => {
      updateTokenData();
    };

    // Listen for token balance updates from API responses
    const handleTokenBalanceUpdate = (event) => {
      setTokenBalance(event.detail.balance);
    };

    // Listen for token data updates from API responses
    const handleTokenDataUpdate = (event) => {
      console.log("🔄 Header: Token data updated:", event.detail);
      setTokenData(event.detail);
      setTokenBalance(event.detail.balance || 0);
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("tokenBalanceUpdated", handleTokenBalanceUpdate);
    window.addEventListener("tokenDataUpdated", handleTokenDataUpdate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "tokenBalanceUpdated",
        handleTokenBalanceUpdate
      );
      window.removeEventListener("tokenDataUpdated", handleTokenDataUpdate);
    };
  }, [isAuthenticated, user]); // Dependencies: re-run when user changes

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showMenu) {
        setShowMenu(false);
      }
    };

    // Add event listeners if mobile menu is open
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showMenu]);

  // Don't show header on login/register pages or if not authenticated
  if (
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    !isAuthenticated
  ) {
    return null;
  }

  const handleLogout = async () => {
    try {
      Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Logout",
        cancelButtonText: "Stay",
        customClass: {
          confirmButton:
            "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 cursor-not-allowed opacity-75",
          cancelButton:
            "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 cursor-not-allowed",
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          await logout();
          navigate("/");
        }
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, redirect to home page
      navigate("/");
    }
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleBuyTokens = () => {
    navigate("/payment");
  };

  const handleAnalytics = () => {
    navigate("/analytics");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center min-w-0 flex-1">
            <img
              src={
                isDarkMode
                  ? "/resume-builder-logo-512-dark.png"
                  : "/resume-builder-logo-512-light.png"
              }
              alt="Presmistique - AI Resume Builder logo featuring a stylized document icon with blue and purple gradient, representing a professional and modern resume creation tool. The logo is next to the text Presmistique - AI Resume Builder in bold gradient letters. The environment is a clean website header with a welcoming and professional tone."
              className="h-8 mr-2"
            />
            <h1
              className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 truncate"
              onClick={() => navigate("/")}
            >
              Presmistique - AI Resume Builder
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {/* User Info */}
            {user && (
              <div
                className="flex items-center space-x-2 lg:space-x-3 cursor-pointer hover:bg-white/30 dark:hover:bg-gray-800/30 rounded-lg px-2 py-1 transition-all duration-200"
                onClick={handleDashboard}
                title="Go to Dashboard"
              >
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {getProfilePictureUrl(user) ? (
                    <>
                      <img
                        key={`${getProfilePictureUrl(
                          user
                        )}-${profilePictureVersion}`} // Force re-render when URL changes
                        src={getProfilePictureUrl(user)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <span
                        className="text-white text-xs lg:text-sm font-medium"
                        style={{ display: "none" }}
                      >
                        {user.firstName
                          ? user.firstName.charAt(0).toUpperCase()
                          : user.email.charAt(0).toUpperCase()}
                      </span>
                    </>
                  ) : (
                    <span className="text-white text-xs lg:text-sm font-medium">
                      {user.firstName
                        ? user.firstName.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium max-w-32 truncate">
                  {user.firstName
                    ? `${user.firstName} ${user.lastName || ""}`.trim()
                    : user.email}
                </span>
              </div>
            )}

            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Token Balance */}
            {!user.isOwnApiKey && (<div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/30 rounded-lg px-3 py-1.5">
              <CurrencyDollarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div className="flex flex-col">
                <span className="text-green-700 dark:text-green-300 text-xs font-semibold">
                  {tokenData.balance || tokenBalance}
                </span>
                {tokenData.bonusTokens > 0 && (
                  <span className="text-green-600 dark:text-green-400 text-xs">
                    {tokenData.purchasedTokens || 0} + {tokenData.bonusTokens}{" "}
                    bonus
                  </span>
                )}
              </div>
            </div>)}

            {!user.isOwnApiKey && <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm"
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <SunIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              ) : (
                <MoonIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              )}
            </button>

            <button
              onClick={handleProfile}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm"
            >
              Profile
            </button>
            {!user.isOwnApiKey &&<button
              onClick={handleBuyTokens}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm"
            >
              Buy Tokens
            </button>}
            <button
              onClick={handleAnalytics}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm"
            >
              Analytics
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm flex items-center space-x-1 lg:space-x-2"
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
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:text-gray-900 dark:focus:text-gray-100 p-1 sm:p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMenu && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/20 dark:border-gray-700/20 bg-white/95 dark:bg-transparent rounded-b-lg shadow-lg backdrop-blur-sm">
              {/* User Info - Mobile */}
              {user && (
                <div
                  className="flex items-center space-x-3 px-2 py-2 border-b border-gray-200/50 dark:border-gray-700/50 mb-2 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-lg transition-all duration-200"
                  onClick={handleDashboard}
                  title="Go to Dashboard"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {getProfilePictureUrl(user) ? (
                      <>
                        <img
                          key={`${getProfilePictureUrl(
                            user
                          )}-${profilePictureVersion}`} // Force re-render when URL changes
                          src={getProfilePictureUrl(user)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <span
                          className="text-white text-sm font-medium"
                          style={{ display: "none" }}
                        >
                          {user.firstName
                            ? user.firstName.charAt(0).toUpperCase()
                            : user.email.charAt(0).toUpperCase()}
                        </span>
                      </>
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user.firstName
                          ? user.firstName.charAt(0).toUpperCase()
                          : user.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-900 dark:text-gray-100 text-sm font-medium truncate">
                      {user.firstName
                        ? `${user.firstName} ${user.lastName || ""}`.trim()
                        : user.email}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs truncate">
                      {user.firstName ? user.email : "User"}
                    </div>
                  </div>
                </div>
              )}

              {/* Token Balance - Mobile */}
              {!user.isOwnApiKey && <div className="flex items-center space-x-3 px-2 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/30 rounded-lg mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <div className="text-green-700 dark:text-green-300 text-sm font-semibold">
                    {tokenData.balance || tokenBalance} Tokens
                  </div>
                  <div className="text-green-600 dark:text-green-400 text-xs">
                    {tokenData.bonusTokens > 0
                      ? `${tokenData.purchasedTokens || 0} regular + ${tokenData.bonusTokens
                      } bonus`
                      : "Available Balance"}
                  </div>
                </div>
              </div>}

              {/* Dark Mode Toggle - Mobile */}
              <button
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 w-full text-left flex items-center space-x-2"
                title={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <SunIcon className="w-4 h-4" />
                ) : (
                  <MoonIcon className="w-4 h-4" />
                )}
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <button
                onClick={handleProfile}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 w-full text-left"
              >
                Profile
              </button>
              {!user.isOwnApiKey &&<button
                onClick={handleBuyTokens}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 w-full text-left"
              >
                Buy Tokens
              </button>}
              <button
                onClick={handleAnalytics}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 w-full text-left"
              >
                Analytics
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 block px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50/80 dark:hover:bg-red-900/30 w-full text-left flex items-center space-x-2"
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
