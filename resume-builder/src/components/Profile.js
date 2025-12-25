import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, uploadAPI, apiHelpers } from '../services/api';
import { toast } from 'react-toastify';
import { useAutoScroll, useScrollToTop } from '../hooks/useAutoScroll';
import EmailVerification from './EmailVerification';
import {
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  PhotoIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  InformationCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser: updateAuthUser, logout, getEmailStatus } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    profilePicture: ''
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // State for scroll functionality
  const [justSaved, setJustSaved] = useState(false);

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (value.trim().length > 50) return 'First name must be less than 50 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        return '';

      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (value.trim().length > 50) return 'Last name must be less than 50 characters';
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
        return '';

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
        const cleanPhone = value.replace(/[\s\-().]/g, '');
        if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid phone number';
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(profile).forEach(key => {
      if (key !== 'profilePicture' && key !== 'profilePictureOriginal' && key !== 'profilePictureAvatar') {
        const error = validateField(key, profile[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-scroll hooks (declared after all state variables)
  const { ref: profilePhotoRef } = useAutoScroll(false, {
    block: 'center',
    delay: 100,
    offset: -50 // Scroll slightly above the profile photo
  });

  const { ref: profileFormRef } = useAutoScroll(false); // Can be triggered manually
  const { scrollToTop } = useScrollToTop(justSaved);

  // Scroll to top when edit mode is activated
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  // Manual scroll for avatar selector (targets the same profile photo section)
  useEffect(() => {
    if (showAvatarSelector && profilePhotoRef.current) {
      const timer = setTimeout(() => {
        profilePhotoRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 200); // Longer delay for modal animation

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAvatarSelector]);

  // Professional avatar options
  const professionalAvatars = [
    {
      id: 'avatar-1',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      name: 'Professional Male 1'
    },
    {
      id: 'avatar-2',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135823.png',
      name: 'Professional Female 1'
    },
    {
      id: 'avatar-3',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
      name: 'Professional Male 2'
    },
    {
      id: 'avatar-4',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png',
      name: 'Professional Female 2'
    },
    {
      id: 'avatar-5',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135724.png',
      name: 'Professional Male 3'
    },
    {
      id: 'avatar-6',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png',
      name: 'Professional Female 3'
    },
    {
      id: 'avatar-7',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135743.png',
      name: 'Professional Male 4'
    },
    {
      id: 'avatar-8',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135838.png',
      name: 'Professional Female 4'
    },
    {
      id: 'avatar-9',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135707.png',
      name: 'Business Executive'
    },
    {
      id: 'avatar-10',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135795.png',
      name: 'Professional Manager'
    },
    {
      id: 'avatar-11',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135729.png',
      name: 'Creative Professional'
    },
    {
      id: 'avatar-12',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135844.png',
      name: 'Modern Professional'
    }
  ];

  // Check email verification status
  const checkEmailVerificationStatus = useCallback(async () => {
    try {
      const response = await getEmailStatus();
      if (response.success) {
        setEmailVerificationStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to check email verification status:', error);
    }
  }, [getEmailStatus]);

  // Load user data on component mount and when user data changes
  useEffect(() => {
    if (user) {
      // Handle the new profile picture structure
      let profilePictureUrl = '';
      let profilePictureOriginalUrl = '';
      let profilePictureAvatarUrl = '';

      if (user.profilePicture) {
        if (user.profilePicture.type === 'avatar' && user.profilePicture.avatarUrl) {
          // User has selected an avatar
          profilePictureUrl = user.profilePicture.avatarUrl;
          profilePictureOriginalUrl = user.profilePicture.avatarUrl;
          profilePictureAvatarUrl = user.profilePicture.avatarUrl;
        } else if (user.profilePicture.type === 'uploaded' && user.profilePicture.uploadedPhoto) {
          // User has uploaded a photo
          profilePictureUrl = apiHelpers.normalizeUrl(user.profilePicture.uploadedPhoto.thumbnailUrl || user.profilePicture.uploadedPhoto.url);
          profilePictureOriginalUrl = apiHelpers.normalizeUrl(user.profilePicture.uploadedPhoto.url);
          profilePictureAvatarUrl = apiHelpers.normalizeUrl(user.profilePicture.uploadedPhoto.avatarUrl);
        }
      }

      // Legacy support for old structure (temporary)
      if (!profilePictureUrl && user.profilePicture) {
        if (typeof user.profilePicture === 'string') {
          profilePictureUrl = apiHelpers.normalizeUrl(user.profilePicture);
          profilePictureOriginalUrl = apiHelpers.normalizeUrl(user.profilePicture);
        } else if (user.profilePicture.url || user.profilePicture.thumbnailUrl) {
          profilePictureUrl = apiHelpers.normalizeUrl(user.profilePicture.thumbnailUrl || user.profilePicture.url);
          profilePictureOriginalUrl = apiHelpers.normalizeUrl(user.profilePicture.url);
          profilePictureAvatarUrl = apiHelpers.normalizeUrl(user.profilePicture.avatarUrl);
        }
      }

      const userProfile = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        profilePicture: profilePictureUrl,
        profilePictureOriginal: profilePictureOriginalUrl,
        profilePictureAvatar: profilePictureAvatarUrl,
      };

      // Only update if the profile data has actually changed to avoid unnecessary re-renders
      setProfile(prevProfile => {
        const hasChanged = JSON.stringify(prevProfile) !== JSON.stringify(userProfile);
        return hasChanged ? userProfile : prevProfile;
      });

      setOriginalProfile(prevOriginal => {
        const hasChanged = JSON.stringify(prevOriginal) !== JSON.stringify(userProfile);
        return hasChanged ? userProfile : prevOriginal;
      });

      // Check email verification status
      checkEmailVerificationStatus();
    }
  }, [user, user?.profilePicture, checkEmailVerificationStatus]);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate field on change if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    const error = validateField(field, profile[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Mark all fields as touched and validate
    const allTouched = {};
    Object.keys(profile).forEach(key => {
      if (key !== 'profilePicture' && key !== 'profilePictureOriginal' && key !== 'profilePictureAvatar') {
        allTouched[key] = true;
      }
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      toast.error('Please fill in all the required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profile);

      if (response.success) {
        updateAuthUser(response.data.user);
        setOriginalProfile(profile);
        setIsEditing(false);

        // Clear errors and touched state
        setErrors({});
        setTouched({});

        // Trigger scroll to top after successful save
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 500); // Reset after animation

        if (response.data.requiresEmailVerification) {
          setNewEmail(profile.email);
          setShowEmailVerification(true);
          toast.info('Profile updated! Please check your new email for verification code.');
        } else {
          toast.success('Profile updated successfully!');
        }
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);

    // Clear validation state
    setErrors({});
    setTouched({});

    // Scroll to top when canceling edit
    setTimeout(() => {
      scrollToTop();
    }, 100);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const validateAndProcessFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return false;
    }

    return true;
  };

  const uploadProfilePicture = async (file) => {
    if (!validateAndProcessFile(file)) return;

    try {
      setUploading(true);
      const response = await uploadAPI.uploadProfilePicture(file);

      if (response.success) {
        // Construct the updated user object manually with the fresh data from the upload response
        const updatedUser = {
          ...user,
          profilePicture: {
            type: 'uploaded',
            uploadedPhoto: {
              url: response.data.url,
              thumbnailUrl: response.data.thumbnailUrl,
              avatarUrl: response.data.avatarUrl || ''
            }
          }
        };

        // Update the AuthContext with the updated user data
        updateAuthUser(updatedUser);

        // Update local profile state with the new profile picture data (normalized)
        const updatedProfile = {
          ...profile,
          profilePicture: apiHelpers.normalizeUrl(response.data.thumbnailUrl || response.data.url),
          profilePictureOriginal: apiHelpers.normalizeUrl(response.data.url),
          profilePictureAvatar: apiHelpers.normalizeUrl(response.data.avatarUrl || '')
        };
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);

        toast.success('Profile picture updated successfully!');
      } else {
        throw new Error(response.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    await uploadProfilePicture(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadProfilePicture(files[0]);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setUploading(true);

      // Clear the profile picture from the backend
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        profilePicture: '',
        profilePictureType: 'uploaded' // Default type when removing
      };

      const profileResponse = await authAPI.updateProfile(profileData);

      if (profileResponse.success) {
        // Update the AuthContext to remove the profile picture
        updateAuthUser(profileResponse.data.user);

        // Clear profile picture from local state
        const updatedProfile = {
          ...profile,
          profilePicture: '',
          profilePictureOriginal: '',
          profilePictureAvatar: ''
        };
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);

        toast.success('Profile picture removed successfully!');
      } else {
        throw new Error(profileResponse.error || 'Failed to remove profile picture');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarSelection = async (avatarUrl) => {
    try {
      setSavingAvatar(true);

      // Save the avatar to the backend with the new structure
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        profilePicture: avatarUrl,
        profilePictureType: 'avatar'
      };

      const response = await authAPI.updateProfile(profileData);

      if (response.success) {
        // Update the AuthContext with the new avatar
        updateAuthUser(response.data.user);

        // Update local profile state with the new avatar data
        const updatedProfile = {
          ...profile,
          profilePicture: apiHelpers.normalizeUrl(avatarUrl),
          profilePictureOriginal: apiHelpers.normalizeUrl(avatarUrl),
          profilePictureAvatar: apiHelpers.normalizeUrl(avatarUrl)
        };
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);

        setShowAvatarSelector(false);
        toast.success('Avatar selected successfully!');
      } else {
        throw new Error(response.error || 'Failed to save avatar');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      setLoading(true);
      const response = await authAPI.changePassword(passwordData);

      if (response.success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      } else {
        throw new Error(response.error || 'Failed to change password');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const response = await authAPI.deleteAccount();

      if (response.success) {
        await logout();
        toast.success('Account deleted successfully');
        navigate('/');
      } else {
        throw new Error(response.error || 'Failed to delete account');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationSuccess = () => {
    setShowEmailVerification(false);
    setNewEmail('');
    toast.success('Email verified successfully!');

    // Update user data in localStorage and AuthContext
    const updatedUser = { ...user, isEmailVerified: true };
    updateAuthUser(updatedUser);
    apiHelpers.setCurrentUserData(updatedUser);

    // Refresh email verification status
    checkEmailVerificationStatus();
  };

  const handleSkipEmailVerification = () => {
    setShowEmailVerification(false);
    setNewEmail('');
    toast.info('Email verification skipped. You can verify it later from your profile.');
  };


  // Handle verify email button click
  const handleVerifyEmail = async () => {
    try {
      // Show the modal immediately since user already has the email
      setNewEmail(user.email);
      setShowEmailVerification(true);

      // Optionally send a new OTP if needed
      const response = await authAPI.resendOtp();
      if (response.success) {
        toast.success('New verification code sent to your email!');
      }
    } catch (error) {
      console.error('Failed to show email verification modal:', error);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
          </div>
        </div>

        {/* Profile Content */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-orange-50/80 rounded-2xl shadow-xl border border-white/20 dark:border-orange-200/30 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Picture */}
            <div ref={profilePhotoRef} className="flex flex-col items-center">
              <div
                className={`relative group cursor-pointer transition-all duration-300 ${dragOver ? 'scale-105 shadow-2xl' : ''
                  } ${(isEditing || !profile.profilePicture) ? 'cursor-pointer' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => (isEditing || !profile.profilePicture) && fileInputRef.current?.click()}
              >
                <div className={`w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-4 transition-all duration-300 ${dragOver ? 'border-blue-400 shadow-blue-400/50' : 'border-white/20'
                  } backdrop-blur-sm`}>
                  {profile.profilePicture ? (
                    <div className="w-full h-full flex items-center justify-center bg-white dark:bg-orange-50/90 rounded-full">
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full transition-all duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold hidden">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UserCircleIcon className="w-20 h-20 text-white mb-2" />
                      {(isEditing || !profile.profilePicture) && (
                        <div className="text-white text-center">
                          <p className="text-xs font-medium">Click to upload</p>
                          <p className="text-xs opacity-75">or drag & drop</p>
                        </div>
                      )}
                    </div>
                  )}
                  {profile.profilePicture && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <EyeIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  {dragOver && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="text-white text-center">
                        <PhotoIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Drop photo here</p>
                      </div>
                    </div>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white text-sm font-medium">Uploading...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col items-center space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  accept="image/*"
                  className="hidden"
                />

                {(isEditing || !profile.profilePicture) && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || savingAvatar}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <CameraIcon className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : profile.profilePicture ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                )}

                {/* Avatar Selection Button */}
                {isEditing && (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setShowAvatarSelector(true)}
                      disabled={uploading || savingAvatar}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      <span>{savingAvatar ? 'Saving...' : 'Choose Avatar'}</span>
                    </button>

                    {/* Personalized Avatar Button */}
                    {(profile.firstName || profile.lastName) && (
                      <button
                        onClick={() => {
                          const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
                          const colors = ['3B82F6', 'EC4899', '10B981', 'F59E0B', '8B5CF6', 'EF4444', '06B6D4', '84CC16'];
                          const randomColor = colors[Math.floor(Math.random() * colors.length)];
                          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=ffffff&size=400&rounded=true&font-size=0.4`;
                          handleAvatarSelection(avatarUrl);
                        }}
                        disabled={uploading || savingAvatar}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <UserCircleIcon className="w-4 h-4" />
                        <span>{savingAvatar ? 'Saving...' : 'Use My Initials'}</span>
                      </button>
                    )}
                  </div>
                )}

                {profile.profilePicture && isEditing && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    disabled={uploading || savingAvatar}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Remove Photo</span>
                  </button>
                )}

                {/* Upload Requirements - Only show when editing */}
                {isEditing && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 font-medium">Upload Requirements</p>
                      <p className="text-xs text-gray-500 mt-1">Maximum size: 5MB • Supported formats: JPG, PNG, JPEG</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div ref={profileFormRef} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        onBlur={() => handleFieldBlur('firstName')}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:text-gray-900 ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        onBlur={() => handleFieldBlur('lastName')}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:text-gray-900 ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleFieldBlur('email')}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-gray-900 font-medium">{profile.email}</p>
                    {emailVerificationStatus && (
                      <div className="flex items-center justify-between">
                        {emailVerificationStatus.isEmailVerified ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckIcon className="w-3 h-3" />
                            <span className="text-xs font-medium">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-orange-600">
                              <ExclamationTriangleIcon className="w-3 h-3" />
                              <span className="text-xs font-medium">Unverified</span>
                            </div>
                            <button
                              onClick={handleVerifyEmail}
                              className="text-orange-600 hover:text-orange-700 text-xs underline transition-colors duration-200"
                            >
                              Verify
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={() => handleFieldBlur('phone')}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 font-medium">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:text-gray-900"
                    placeholder="Enter your location (optional)"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none text-gray-900 dark:text-gray-900"
                    placeholder="Tell us about yourself (optional)"
                  />
                ) : (
                  <p className="text-gray-900 leading-relaxed">{profile.bio || <span className="text-gray-500 italic">No bio provided</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {!isEditing ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[140px]"
                >
                  <PencilIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Edit Profile</span>
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[160px]"
                >
                  <LockClosedIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Change Password</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[150px]"
                >
                  <TrashIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Delete Account</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[120px]"
                >
                  <XMarkIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[120px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  ) : (
                    <CheckIcon className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{loading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-900">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-900 bg-white dark:bg-white"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-900 bg-white dark:bg-white"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-900 bg-white dark:bg-white"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckIcon className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Changing...' : 'Change Password'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Your profile information</li>
                  <li>All your resumes</li>
                  <li>All uploaded files</li>
                </ul>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <TrashIcon className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Deleting...' : 'Delete Account'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Selection Modal */}
        {showAvatarSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Choose Professional Avatar</h3>
                </div>
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 text-sm">
                  Choose from our collection of colorful professional avatars. These high-quality icons are perfect for maintaining a professional appearance across your resume and profile.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {professionalAvatars.map((avatar) => (
                  <div key={avatar.id} className="group relative">
                    <button
                      onClick={() => handleAvatarSelection(avatar.url)}
                      disabled={savingAvatar}
                      className="w-full aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 overflow-hidden group-hover:scale-105 group-hover:shadow-xl p-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback to a simple colored circle with initials if image fails
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div
                          className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg hidden"
                          style={{ display: 'none' }}
                        >
                          {avatar.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white rounded-full p-2 shadow-lg">
                            <CheckIcon className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </div>
                      {savingAvatar && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-purple-600 font-medium">Saving...</span>
                          </div>
                        </div>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2 truncate px-1">{avatar.name}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <InformationCircleIcon className="w-4 h-4" />
                    <span>Professional avatars from Flaticon</span>
                  </div>
                  <button
                    onClick={() => setShowAvatarSelector(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Modal */}
        <EmailVerification
          isOpen={showEmailVerification}
          onClose={handleSkipEmailVerification}
          email={newEmail}
          onVerificationSuccess={handleEmailVerificationSuccess}
          onSkip={handleSkipEmailVerification}
          type={newEmail === user?.email ? "profile-verification" : "email-change"}
          showSkip={true}
        />
      </div>
    </div>
  );
}

export default Profile;