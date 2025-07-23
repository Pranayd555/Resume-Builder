import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, userAPI, uploadAPI, apiHelpers } from '../services/api';
import { toast } from 'react-toastify';
import Tooltip from './Tooltip';
import { useAutoScroll, useScrollToTop } from '../hooks/useAutoScroll';

function Profile() {
  const navigate = useNavigate();
  const { user, updateUser: updateAuthUser, logout } = useAuth();
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
  const [dragOver, setDragOver] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for scroll functionality
  const [justSaved, setJustSaved] = useState(false);
  
  // Auto-scroll hooks (declared after all state variables)
  const { ref: profilePhotoRef } = useAutoScroll(isEditing, { 
    block: 'center', 
    delay: 100,
    offset: -50 // Scroll slightly above the profile photo
  });
  
  const { ref: profileFormRef } = useAutoScroll(false); // Can be triggered manually
  const { scrollToTop } = useScrollToTop(justSaved);
  
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

  // Load user data on component mount
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
          profilePictureUrl = user.profilePicture.uploadedPhoto.thumbnailUrl || user.profilePicture.uploadedPhoto.url;
          profilePictureOriginalUrl = user.profilePicture.uploadedPhoto.url;
          profilePictureAvatarUrl = user.profilePicture.uploadedPhoto.avatarUrl;
        }
      }
      
      // Legacy support for old structure (temporary)
      if (!profilePictureUrl && user.profilePicture) {
        if (typeof user.profilePicture === 'string') {
          profilePictureUrl = user.profilePicture;
          profilePictureOriginalUrl = user.profilePicture;
        } else if (user.profilePicture.url || user.profilePicture.thumbnailUrl) {
          profilePictureUrl = user.profilePicture.thumbnailUrl || user.profilePicture.url;
          profilePictureOriginalUrl = user.profilePicture.url;
          profilePictureAvatarUrl = user.profilePicture.avatarUrl;
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
        profilePictureAvatar: profilePictureAvatarUrl
      };
      setProfile(userProfile);
      setOriginalProfile(userProfile);
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profile);
      
      if (response.success) {
        updateAuthUser(response.data.user);
        setOriginalProfile(profile);
        setIsEditing(false);
        
        // Trigger scroll to top after successful save
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 500); // Reset after animation
        
        toast.success('Profile updated successfully!');
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
    
    // Scroll to top when canceling edit
    setTimeout(() => {
      scrollToTop();
    }, 100);
  };

  const handleBack = () => {
    navigate('/resume-list');
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
        const updatedProfile = {
          ...profile,
          profilePicture: response.data.thumbnailUrl || response.data.url,
          profilePictureOriginal: response.data.url,
          profilePictureAvatar: response.data.avatarUrl || ''
        };
        setProfile(updatedProfile);
        
        // The upload API already updates the user profile in the database,
        // so we just need to fetch the updated user data
        const userResponse = await authAPI.getCurrentUser();
        
        if (userResponse.success) {
          // Update the AuthContext with the updated user data
          updateAuthUser(userResponse.data.user);
          toast.success('Profile picture updated successfully!');
        } else {
          throw new Error(userResponse.error || 'Failed to fetch updated profile');
        }
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
      
      // Clear profile picture from local state first
      const updatedProfile = { 
        ...profile, 
        profilePicture: '', 
        profilePictureOriginal: '', 
        profilePictureAvatar: ''
      };
      setProfile(updatedProfile);
      
      // Clear the profile picture from the backend
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        profilePicture: '',
        profilePictureType: null
      };
      
      const profileResponse = await authAPI.updateProfile(profileData);
      
      if (profileResponse.success) {
        // Update the AuthContext to remove the profile picture
        updateAuthUser(profileResponse.data.user);
        toast.success('Profile picture removed successfully!');
      } else {
        // Revert local state if backend save fails
        setProfile(profile);
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
      setUploading(true);
      
      const updatedProfile = {
        ...profile,
        profilePicture: avatarUrl,
        profilePictureOriginal: avatarUrl,
        profilePictureAvatar: avatarUrl
      };
      setProfile(updatedProfile);
      
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
        // Update the AuthContext with the new avatar (using updateUser to avoid double API call)
        updateAuthUser(response.data.user);
        
        setShowAvatarSelector(false);
        toast.success('Avatar selected successfully!');
      } else {
        throw new Error(response.error || 'Failed to save avatar');
      }
    } catch (error) {
      const errorMessage = apiHelpers.formatError(error);
      toast.error(errorMessage);
      
      // Revert the local state on error
      setProfile(profile);
    } finally {
      setUploading(false);
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
      const response = await userAPI.deleteAccount();
      
      if (response.success) {
        await logout();
        toast.success('Account deleted successfully');
        navigate('/login');
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

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>

        {/* Profile Content */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Picture */}
            <div ref={profilePhotoRef} className="flex flex-col items-center">
              <div 
                className={`relative group cursor-pointer transition-all duration-300 ${
                  dragOver ? 'scale-105 shadow-2xl' : ''
                } ${(isEditing || !profile.profilePicture) ? 'cursor-pointer' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => (isEditing || !profile.profilePicture) && fileInputRef.current?.click()}
              >
                <div className={`w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden border-4 transition-all duration-300 ${
                  dragOver ? 'border-blue-400 shadow-blue-400/50' : 'border-white/20'
                } backdrop-blur-sm`}>
                  {profile.profilePicture ? (
                    <div className="w-full h-full flex items-center justify-center bg-white rounded-full">
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
                      <svg className="w-20 h-20 text-white mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
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
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {dragOver && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
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
                    disabled={uploading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{uploading ? 'Uploading...' : profile.profilePicture ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                )}
                
                {/* Avatar Selection Button */}
                {isEditing && (
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => setShowAvatarSelector(true)}
                      disabled={uploading}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{uploading ? 'Saving...' : 'Choose Avatar'}</span>
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
                        disabled={uploading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span>{uploading ? 'Saving...' : 'Use My Initials'}</span>
                      </button>
                    )}
                  </div>
                )}
                
                {profile.profilePicture && isEditing && (
                  <button 
                    onClick={handleRemoveProfilePicture}
                    disabled={uploading}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove Photo</span>
                  </button>
                )}
                
                {/* Upload Instructions with Tooltip - Only show when editing */}
                {isEditing && (
                  <Tooltip 
                    content={
                      <div className="max-w-xs sm:max-w-sm">
                        <div className="mb-3 pb-3 border-b border-blue-200">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-blue-800">Upload Guidelines</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                              <p className="font-medium text-gray-800">Size & Quality</p>
                              <p className="text-sm text-gray-600">Best: 400×400px+, Max: 5MB</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <div>
                              <p className="font-medium text-gray-800">Formats</p>
                              <p className="text-sm text-gray-600">JPG, PNG, GIF</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                              <p className="font-medium text-gray-800">Upload Method</p>
                              <p className="text-sm text-gray-600">Drag & drop or click to browse</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    position="top"
                    delay={300}
                  >
                    <div className="text-center text-sm text-gray-500">
                      <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors cursor-help">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-blue-700">Upload Requirements</span>
                      </div>
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div ref={profileFormRef} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                  />
                ) : (
                  <p className="text-gray-900 leading-relaxed">{profile.bio}</p>
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
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="whitespace-nowrap">Edit Profile</span>
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[160px]"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="whitespace-nowrap">Change Password</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[150px]"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
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
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
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
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
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
                  <li>Your subscription data</li>
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Choose Professional Avatar</h3>
                </div>
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                      disabled={uploading}
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
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {uploading && (
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
      </div>
    </div>
  );
}

export default Profile; 