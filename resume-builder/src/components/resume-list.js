import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DotLottieLoader from './DotLottieLoader';
import { 
  Bars3Icon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  CheckIcon,
  DocumentTextIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { resumeAPI, analyticsAPI, apiHelpers } from '../services/api';
import { createResumeModel } from '../models/dataModels';
import { toast } from 'react-toastify';
import ATSScoreModal from './ATSScoreModal';

// ATS Score Display Component
const ATSScoreDisplay = ({ resume, isCardHovered }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [currentScoreIndex, setCurrentScoreIndex] = useState(0);
  
  const hasATSScore = resume.atsAnalysis && resume.atsAnalysis.overall_score !== null && resume.atsAnalysis.overall_score !== undefined;
  const actualScore = hasATSScore ? resume.atsAnalysis.overall_score : null;
  
  // Animation sequence for missing scores - counter from 20 to 80, then ?
  const scoreSequence = Array.from({ length: 61 }, (_, i) => i + 20).concat(['?']);
  
  // Get score color based on score value
  const getScoreColor = (score) => {
    if (score === '?') return 'text-gray-500';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-lime-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-500';
  };
  
  // Get score label
  const getScoreLabel = (score) => {
    if (score === '?') return 'Analyze';
    if (score >= 80) return 'Excellent Match!';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };
  
  // Initialize animated score with actual score if available
  useEffect(() => {
    if (hasATSScore) {
      setAnimatedScore(actualScore);
    }
  }, [hasATSScore, actualScore]);
  
  // Handle hover animation
  useEffect(() => {
    if (isCardHovered) {
      if (hasATSScore) {
        // Animate from 0 to actual score
        setAnimatedScore(0);
        const duration = 1500; // 1.5 seconds
        const steps = 60; // 60 steps for smooth animation
        const stepDuration = duration / steps;
        const increment = actualScore / steps;
        
        let currentStep = 0;
        const interval = setInterval(() => {
          currentStep++;
          setAnimatedScore(Math.min(Math.round(currentStep * increment), actualScore));
          
          if (currentStep >= steps) {
            clearInterval(interval);
            setAnimatedScore(actualScore);
          }
        }, stepDuration);
        
        return () => clearInterval(interval);
      } else {
        // Animate through sequence: 20 -> 21 -> 22 -> ... -> 80 -> ?
        setCurrentScoreIndex(0);
        const interval = setInterval(() => {
          setCurrentScoreIndex(prev => {
            if (prev >= scoreSequence.length - 1) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 50); // Change every 50ms for faster counting
        
        return () => clearInterval(interval);
      }
    } else {
      // Reset on hover out
      if (hasATSScore) {
        setAnimatedScore(actualScore);
      } else {
        setCurrentScoreIndex(0);
      }
    }
  }, [isCardHovered, hasATSScore, actualScore, scoreSequence.length]);
  
  // Calculate circle progress
  const getCircleProgress = () => {
    if (hasATSScore) {
      return isCardHovered ? animatedScore : actualScore;
    } else {
      if (!isCardHovered) return 0; // Show 0 by default when not hovered
      const currentScore = scoreSequence[currentScoreIndex];
      return currentScore === '?' ? 0 : currentScore;
    }
  };
  
  const progress = getCircleProgress();
  const circumference = 2 * Math.PI * 20; // radius = 20
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Get the display score for color determination
  const getDisplayScore = () => {
    if (hasATSScore) {
      return isCardHovered ? animatedScore : actualScore;
    } else {
      return isCardHovered ? scoreSequence[currentScoreIndex] : '?';
    }
  };
  
  const displayScore = getDisplayScore();
  
  return (
    <div className="mb-4 flex items-center gap-3">
      {/* Circular Progress */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
              className={`transition-all duration-300 ${getScoreColor(displayScore)}`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-in-out'
            }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${getScoreColor(displayScore)}`}>
            {hasATSScore ? (isCardHovered ? animatedScore : actualScore) : 
             (isCardHovered ? scoreSequence[currentScoreIndex] : '?')}
          </span>
        </div>
      </div>
      
      {/* Score info */}
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900">ATS Score</h4>
          <p className={`text-xs font-medium ${getScoreColor(displayScore)}`}>
          {hasATSScore ? getScoreLabel(actualScore) : 
           (isCardHovered ? (scoreSequence[currentScoreIndex] === '?' ? 'Analyze' : 'Analyze to see score') : 'Analyze to see score')}
        </p>
      </div>
    </div>
  );
};

function ResumeList() {
  const navigate = useNavigate();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [selectedResumeForAts, setSelectedResumeForAts] = useState(null);
  const [error, setError] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  
  // Track if we're already fetching to prevent duplicate calls
  const isFetchingRef = useRef(false);
  // Ref for status dropdown to handle click outside
  const statusDropdownRef = useRef(null);
  // Ref to track dropdown button positions
  const dropdownButtonRefs = useRef({});
  // Track downloading resumes to show loaders
  const [downloadingResumes, setDownloadingResumes] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get subscription info from localStorage
  const getSubscriptionInfo = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.subscription || { plan: 'free', isActive: false };
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
    return { plan: 'free', isActive: false };
  };

  // Check if user can create new resume based on subscription and current count
  const canCreateNewResume = () => {
    const subscription = getSubscriptionInfo();
    const currentResumeCount = resumes.length;
    
    if (subscription.plan === 'free') {
      return currentResumeCount < 2;
    } else if (subscription.plan === 'pro') {
      return currentResumeCount < 5;
    }
    
    return true; // Default fallback
  };

  // Get subscription limit message
  const getSubscriptionLimitMessage = () => {
    const subscription = getSubscriptionInfo();
    const currentResumeCount = resumes.length;
    
    if (subscription.plan === 'free' && currentResumeCount >= 2) {
      return {
        type: 'warning',
        message: 'Free plan limit reached! Delete old resumes or upgrade to Pro to create more resumes.',
        action: 'Upgrade to Pro'
      };
    } else if (subscription.plan === 'pro' && currentResumeCount >= 5) {
      return {
        type: 'info',
        message: 'Total resume limit reached! Please delete some old resumes to create new ones.',
        action: null
      };
    }
    
    return null;
  };

  // Handle click outside to close status dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside any dropdown or button
      const isInsideDropdown = event.target.closest('[data-dropdown]') || 
                               event.target.closest('button[data-dropdown-button]') ||
                               (statusDropdownRef.current && statusDropdownRef.current.contains(event.target));
      
      if (!isInsideDropdown) {
        if (showStatusDropdown) setShowStatusDropdown(false);
        if (openDropdownId) setOpenDropdownId(null);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showStatusDropdown) setShowStatusDropdown(false);
        if (openDropdownId) setOpenDropdownId(null);
      }
    };

    const handleScroll = () => {
      if (showStatusDropdown) {
        setShowStatusDropdown(false);
      }
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (showStatusDropdown || openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showStatusDropdown, openDropdownId]);

  const statusOptions = [
    { 
      value: '', 
      label: 'All Status', 
      icon: <Bars3Icon className="w-4 h-4" />,
      color: 'text-gray-600'
    },
    { 
      value: 'active', 
      label: 'Active', 
      icon: <CheckCircleIcon className="w-4 h-4" />,
      color: 'text-green-600'
    },
    { 
      value: 'published', 
      label: 'Published', 
      icon: <CheckCircleIcon className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    { 
      value: 'draft', 
      label: 'Draft', 
      icon: <ClockIcon className="w-4 h-4" />,
      color: 'text-yellow-600'
    }
  ];

  const getSelectedOption = () => {
    return statusOptions.find(option => option.value === filters.status) || statusOptions[0];
  };

  const handleStatusSelect = (value) => {
    handleFilterChange('status', value);
    setShowStatusDropdown(false);
  };

  const fetchResumes = useCallback(async () => {
    // Prevent duplicate calls
    if (isFetchingRef.current) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await resumeAPI.getResumes(params);
      
      if (response.success) {
        const resumeModels = response.data.resumes.map(resume => createResumeModel(resume));
        setResumes(resumeModels);
        setPagination(prev => ({
          ...prev,
          total: resumeModels.length,
          pages: response.data.pagination.pages
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch resumes');
      }
    } catch (err) {
      const errorMessage = apiHelpers.formatError(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [pagination.page, pagination.limit, filters]);

  // Load resumes on component mount
  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Update subscription info when resumes change (for reactive UI updates)
  useEffect(() => {
    // This effect ensures the UI updates when resume count changes
    // The subscription info is read from localStorage on each render
  }, [resumes.length]);

  const handleCreateNew = () => {
    if (!canCreateNewResume()) {
      const limitMessage = getSubscriptionLimitMessage();
      if (limitMessage) {
        if (limitMessage.action === 'Upgrade to Pro') {
          toast.warning(limitMessage.message, {
            onClick: () => navigate('/subscription'),
            closeButton: true,
            autoClose: 5000
          });
        } else {
          toast.info(limitMessage.message, {
            closeButton: true,
            autoClose: 4000
          });
        }
      }
      return;
    }

    const userData = apiHelpers.getCurrentUserData();
    if (!userData) {
      toast.error('Please login to create a new resume');
      return;
    } else if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone) {
      toast.error('Please complete your profile before creating a new resume');
      return;
    }
    
    // Clear any existing form data from localStorage to ensure fresh form
    localStorage.removeItem('resume_form_data');
    // Navigate to resume form with fresh start state
    navigate('/resume-form', { 
      state: { freshStart: true },
      replace: true 
    });
  };

  const handleResumeClick = (resumeId, resumeStatus) => {
    if (resumeStatus === 'draft') {
      toast.error('Cannot preview draft resumes. Please publish the resume first.');
      return;
    }
    navigate(`/resume-preview/${resumeId}`);
  };

  const handleMenuClick = (e, resumeId) => {
    e.stopPropagation();
    // Store the button position for dropdown positioning
    dropdownButtonRefs.current[resumeId] = e.currentTarget;
    setOpenDropdownId(openDropdownId === resumeId ? null : resumeId);
  };

  const handleEditResume = (resumeId) => {
    navigate('/resume-form', { state: { resumeId, editMode: true } });
    setOpenDropdownId(null);
  };

  const handleDuplicateResume = async (resumeId) => {
    try {
      const response = await resumeAPI.duplicateResume(resumeId);
      if (response.success) {
        toast.success('Resume duplicated successfully!');
        fetchResumes(); // Refresh the list
      } else {
        throw new Error(response.error || 'Failed to duplicate resume');
      }
    } catch (err) {
      const errorMessage = apiHelpers.formatError(err);
      toast.error(errorMessage);
    }
    setOpenDropdownId(null);
  };

  const handleDeleteResume = async (resumeId) => {
    const resume = resumes.find(r => r.id === resumeId);
    setResumeToDelete(resume);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  };

  const handleOpenAtsModal = (resumeId) => {
    const resume = resumes.find(r => r.id === resumeId);
    setSelectedResumeForAts(resume);
    setAtsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleCloseAtsModal = () => {
    setAtsModalOpen(false);
    setSelectedResumeForAts(null);
  };

  const handleAtsSuccess = () => {
    // Refresh the resumes list to get updated ATS data
    fetchResumes();
    // Navigate to resume preview page
    if (selectedResumeForAts) {
      navigate(`/resume-preview/${selectedResumeForAts.id}`);
    }
  };

  const confirmDeleteResume = async () => {
    if (!resumeToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const response = await resumeAPI.deleteResume(resumeToDelete.id);
      if (response.success) {
        toast.success('Resume deleted successfully!');
        
        // Fetch updated resumes
        try {
          await fetchResumes();
        } catch (fetchError) {
          console.error('Failed to fetch resumes after delete:', fetchError);
          toast.error('Resume deleted but failed to refresh the list. Please refresh the page.');
        }
        
        // Close modal and reset state
        setShowDeleteModal(false);
        setResumeToDelete(null);
      } else {
        throw new Error(response.error || 'Failed to delete resume');
      }
    } catch (err) {
      const errorMessage = apiHelpers.formatError(err);
      toast.error(errorMessage);
      // Keep modal open on delete failure
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFeedback = () => {
    navigate('/feedback');
  };

  const handleUpgradeToPremium = () => {
    navigate('/subscription');
  };

  const handleDownload = async (resumeId) => {
    // Find the resume to check its status
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) {
      toast.error('Resume not found');
      return;
    }

    // Check if resume is in draft status
    if (resume.status === 'draft') {
      toast.error('Cannot download draft resumes. Please publish the resume first.');
      setOpenDropdownId(null);
      return;
    }

    // Add resume to downloading set to show loader
    setDownloadingResumes(prev => new Set(prev).add(resumeId));

    try {
      // Track download analytics

      const response = await resumeAPI.downloadPDF(resumeId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume-${resumeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      try {
        const downloadAnalytics = await analyticsAPI.trackResumeDownload(resumeId, 'pdf');
        resume.analytics.downloads = downloadAnalytics.data.downloads;
        resume.analytics.lastDownloaded = downloadAnalytics.data.lastDownloaded;
        console.log('Download analytics:', downloadAnalytics);
      } catch (analyticsError) {
        console.warn('Failed to track download:', analyticsError);
      }
      
      toast.success('Resume downloaded successfully!');
    } catch (err) {
      const errorMessage = apiHelpers.formatError(err);
      
      // Handle specific subscription-related errors
      if (errorMessage.includes('upgrade to Pro') || errorMessage.includes('subscription plan')) {
        toast.error(
          <div>
            <div className="font-semibold">Upgrade Required</div>
            <div className="text-sm">{errorMessage}</div>
            <button 
              onClick={() => navigate('/subscription')}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Upgrade Now
            </button>
          </div>,
          { duration: 5000 }
        );
      } else if (errorMessage.includes('Export limit reached')) {
        toast.error(
          <div>
            <div className="font-semibold">Export Limit Reached</div>
            <div className="text-sm">{errorMessage}</div>
            <button 
              onClick={() => navigate('/subscription')}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Upgrade for Unlimited Exports
            </button>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      // Remove resume from downloading set
      setDownloadingResumes(prev => {
        const newSet = new Set(prev);
        newSet.delete(resumeId);
        return newSet;
      });
    }
    setOpenDropdownId(null);
  };



  const handleToggleActive = async (resumeId, currentStatus) => {
    try {
      const response = await resumeAPI.toggleActive(resumeId);
      if (response.success) {
        toast.success(response.data.message);
        fetchResumes(); // Refresh the list
      } else {
        throw new Error(response.error || 'Failed to toggle resume status');
      }
    } catch (err) {
      const errorMessage = apiHelpers.formatError(err);
      toast.error(errorMessage);
    }
    setOpenDropdownId(null);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResumes();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayText = (resume) => {
    if (resume.status === 'published') {
      return resume.isActive ? 'Active' : 'Published';
    }
    return resume.status.charAt(0).toUpperCase() + resume.status.slice(1);
  };

  const getTemplateColor = (template) => {
    switch (template) {
      case 'Professional':
        return 'from-blue-400 to-blue-600';
      case 'Modern':
        return 'from-purple-400 to-purple-600';
      case 'Creative':
        return 'from-pink-400 to-pink-600';
      case 'Classic':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  // Loading state - || true Always show for testing
  if (loading) {
    return (
      <DotLottieLoader 
        title="Loading Resumes..."
        subtitle="Please wait while we fetch your resumes."
        size={200}
      />
    );
  }

  // Error state
  if (error && resumes.length === 0) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Resumes</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchResumes}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Resumes
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">Create and manage your professional resumes</p>
            
          </div>
                     {canCreateNewResume() && (
             <div className="flex flex-col items-end gap-2">
               <button
                 onClick={handleCreateNew}
                 className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 sm:gap-3 font-semibold text-sm sm:text-base min-w-[140px] sm:min-w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105"
               >
                 <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                 <span className="whitespace-nowrap">Create New</span>
               </button>
             </div>
           )}
        </div>
        
        {/* Subscription Limit Banner */}
        {!canCreateNewResume() && getSubscriptionInfo().plan === 'free' && (
          <div className="backdrop-blur-md bg-orange-50/80 border border-orange-200 rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-1">
                    Free Plan Limit Reached
                  </h3>
                  <p className="text-orange-700 text-sm sm:text-base">
                    You've reached the maximum of 2 resumes on the free plan. Upgrade to Pro for unlimited resumes and premium features.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base whitespace-nowrap"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
        
        {!canCreateNewResume() && getSubscriptionInfo().plan === 'pro' && (
          <div className="backdrop-blur-md bg-blue-50/80 border border-blue-200 rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-1">
                    Total Resume Limit Reached
                  </h3>
                  <p className="text-blue-700 text-sm sm:text-base">
                    You can create up to 5 resumes. Please delete some old resumes to create new ones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search and Filter */}
        <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 backdrop-blur-md bg-white/80 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm sm:text-base placeholder-gray-400 shadow-lg hover:shadow-xl transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center min-w-[80px] sm:min-w-[120px] font-semibold"
                >
                  <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:hidden" />
                  <span className="hidden sm:flex items-center gap-2">
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Search
                  </span>
                </button>
              </form>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 hidden sm:inline">Filter by:</span>
              </div>
              <div 
                ref={statusDropdownRef}
                className="relative"
              >
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 backdrop-blur-md bg-white/70 border border-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base min-w-[160px] group"
                >
                  <div className="flex items-center gap-2">
                    <span className={`${getSelectedOption().color} flex items-center transition-colors duration-200`}>
                      {getSelectedOption().icon}
                    </span>
                    <span className="font-medium text-gray-700">{getSelectedOption().label}</span>
                  </div>
                  <ChevronDownIcon 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} 
                  />
                </button>

                {showStatusDropdown && createPortal(
                  <div 
                    data-dropdown="status"
                    className="fixed z-[9999] backdrop-blur-md bg-white/90 rounded-xl shadow-xl border border-white/20 ring-1 ring-black/5 overflow-hidden animate-in slide-in-from-top-2 duration-200"
                    style={{
                      top: statusDropdownRef.current ? statusDropdownRef.current.getBoundingClientRect().bottom + 8 : 0,
                      left: statusDropdownRef.current ? statusDropdownRef.current.getBoundingClientRect().left : 0,
                      width: statusDropdownRef.current ? statusDropdownRef.current.offsetWidth : 'auto',
                      minWidth: '160px'
                    }}
                  >
                    <div className="py-2">
                      {statusOptions.map((option, index) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusSelect(option.value)}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all duration-150 hover:bg-white/60 hover:backdrop-blur-sm group ${
                            option.value === filters.status 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 font-semibold' 
                              : 'hover:translate-x-1'
                          }`}
                          style={{
                            animationDelay: `${index * 50}ms`
                          }}
                        >
                          <span className={`${option.color} flex items-center transition-all duration-200 ${
                            option.value === filters.status ? 'scale-110' : 'group-hover:scale-110'
                          }`}>
                            {option.icon}
                          </span>
                          <span className={`${
                            option.value === filters.status 
                              ? 'text-blue-700' 
                              : 'text-gray-700 group-hover:text-gray-900'
                          } transition-colors duration-200`}>
                            {option.label}
                          </span>
                          {option.value === filters.status && (
                            <CheckIcon className="w-4 h-4 text-blue-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Resumes</p>
                <p className="text-3xl font-bold text-gray-900">{resumes.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Resumes</p>
                <p className="text-3xl font-bold text-gray-900">{resumes.filter(r => r.isActive === true).length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Draft Resumes</p>
                <p className="text-3xl font-bold text-gray-900">{resumes.filter(r => r.status === 'draft').length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Resume List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {resumes.length > 0 ? (
            resumes.map((resume, index) => (
              <div 
                key={resume.id}
                className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden cursor-pointer hover:bg-white/80 transition-all duration-200 hover:shadow-2xl hover:scale-105 group"
                onClick={() => handleResumeClick(resume.id, resume.status)}
                onMouseEnter={() => setHoveredCardId(resume.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTemplateColor(resume.template?.name || 'Default')} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <DocumentTextIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(resume.status)}`}>
                        {getStatusDisplayText(resume)}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => handleMenuClick(e, resume.id)}
                          className="p-1.5 bg-gray-100/80 text-gray-600 rounded-lg hover:bg-gray-200/80 transition-colors opacity-0 group-hover:opacity-100"
                          title="More Actions"
                          data-dropdown-button
                        >
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openDropdownId === resume.id && createPortal(
                          <div 
                            className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200"
                            data-dropdown="resume"
                            style={{
                              top: dropdownButtonRefs.current[resume.id] ? dropdownButtonRefs.current[resume.id].getBoundingClientRect().bottom + 8 : 0,
                              right: dropdownButtonRefs.current[resume.id] ? window.innerWidth - dropdownButtonRefs.current[resume.id].getBoundingClientRect().right : 0,
                              width: '192px'
                            }}
                          >
                                                         <div className="py-1">
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleEditResume(resume.id);
                                 }}
                                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                               >
                                 <PencilIcon className="w-4 h-4" />
                                 Edit Resume
                               </button>
                               {resume.status === 'published' && (
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleToggleActive(resume.id, resume.status);
                                   }}
                                   className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                     resume.isActive 
                                       ? 'text-red-600 hover:bg-red-50' 
                                       : 'text-green-600 hover:bg-green-50'
                                   }`}
                                 >
                                   {resume.isActive ? (
                                     <EyeSlashIcon className="w-4 h-4" />
                                   ) : (
                                     <EyeIcon className="w-4 h-4" />
                                   )}
                                   {resume.isActive ? 'Deactivate' : 'Activate'}
                                 </button>
                               )}
                               <button
                                 disabled={resume.status === 'draft' || !canCreateNewResume()}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDuplicateResume(resume.id);
                                 }}
                                 className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                  resume.status === 'draft' || !canCreateNewResume()
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                               >
                                 <DocumentDuplicateIcon className="w-4 h-4" />
                                 Duplicate
                               </button>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDownload(resume.id);
                                 }}
                                 disabled={resume.status === 'draft' || downloadingResumes.has(resume.id)}
                                 className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                   resume.status === 'draft' || downloadingResumes.has(resume.id)
                                     ? 'text-gray-400 cursor-not-allowed'
                                     : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                                 title={resume.status === 'draft' ? 'Publish resume to download' : 'Download PDF'}
                               >
                                 {downloadingResumes.has(resume.id) ? (
                                   <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                   </svg>
                                 ) : (
                                   <ArrowDownTrayIcon className="w-4 h-4" />
                                 )}
                                 {downloadingResumes.has(resume.id) ? 'Downloading...' : 'Download PDF'}
                               </button>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleOpenAtsModal(resume.id);
                                 }}
                                 className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                               >
                                 <ChartBarIcon className="w-4 h-4" />
                                 ATS Analysis
                                 <SparklesIcon className="w-3 h-3 text-purple-500" />
                               </button>
                               {/* <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDownloadDOCX(resume.id);
                                 }}
                                 disabled={resume.status === 'draft' || downloadingResumes.has(resume.id)}
                                 className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                   resume.status === 'draft' || downloadingResumes.has(resume.id)
                                     ? 'text-gray-400 cursor-not-allowed'
                                     : 'text-gray-700 hover:bg-gray-100'
                                 }`}
                                 title={resume.status === 'draft' ? 'Publish resume to download' : 'Download DOCX'}
                               >
                                 {downloadingResumes.has(resume.id) ? (
                                   <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                   </svg>
                                 ) : (
                                   <ArrowDownTrayIcon className="w-4 h-4" />
                                 )}
                                 {downloadingResumes.has(resume.id) ? 'Downloading...' : 'Download DOCX'}
                               </button> */}
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteResume(resume.id);
                                 }}
                                 className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                               >
                                 <TrashIcon className="w-4 h-4" />
                                 Delete
                               </button>
                             </div>
                          </div>,
                          document.body
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Resume Title */}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-3 line-clamp-2">
                    {resume.title}
                  </h3>
                  
                  {/* Template Info */}
                  <div className="flex items-center gap-2 mb-4">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">{resume.template?.name || 'Default'}</span>
                  </div>
                  
                  {/* ATS Score Display */}
                  <ATSScoreDisplay resume={resume} isCardHovered={hoveredCardId === resume.id} />
                </div>
                
                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{resume.analytics?.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{resume.analytics?.downloads || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className={`grid gap-2 ${resume.status === 'published' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditResume(resume.id);
                      }}
                      className="bg-blue-100 text-blue-600 px-3 py-2.5 rounded-lg hover:bg-blue-200 transition-colors font-medium text-xs flex items-center justify-center gap-1"
                    >
                      <PencilIcon className="w-3 h-3" />
                      Edit
                    </button>
                    {resume.status === 'published' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(resume.id, resume.status);
                        }}
                        className={`px-3 py-2.5 rounded-lg transition-colors font-medium text-xs flex items-center justify-center gap-1 ${
                          resume.isActive 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {resume.isActive ? (
                          <EyeSlashIcon className="w-3 h-3" />
                        ) : (
                          <EyeIcon className="w-3 h-3" />
                        )}
                        {resume.isActive ? 'Off' : 'On'}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(resume.id);
                      }}
                      disabled={resume.status === 'draft' || downloadingResumes.has(resume.id)}
                      className={`px-3 py-2.5 rounded-lg transition-colors font-medium text-xs flex items-center justify-center gap-1 ${
                        resume.status === 'draft' || downloadingResumes.has(resume.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                      title={resume.status === 'draft' ? 'Publish resume to download' : 'Download PDF'}
                    >
                      {downloadingResumes.has(resume.id) ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <ArrowDownTrayIcon className="w-3 h-3" />
                      )}
                      {downloadingResumes.has(resume.id) ? '...' : 'PDF'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes found</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first professional resume.</p>
                <button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Create Your First Resume
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg border ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {resumes.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={handleFeedback}
              className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/80 transition-all duration-200 hover:shadow-2xl hover:scale-105 cursor-pointer text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-200">Share Feedback</h3>
                  <p className="text-gray-600 text-sm">Help us improve by sharing your experience</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleUpgradeToPremium}
              className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/80 transition-all duration-200 hover:shadow-2xl hover:scale-105 cursor-pointer text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors duration-200">Upgrade to Premium</h3>
                  <p className="text-gray-600 text-sm">Unlock unlimited templates and advanced features</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && resumeToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto transform transition-all">
              {/* Header */}
              <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">Delete Resume</h3>
                    <p className="text-sm sm:text-base text-gray-500 font-medium">Permanent Action</p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Main Message */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                    <p className="text-gray-800 text-sm sm:text-base leading-relaxed font-medium">
                      Are you sure you want to permanently delete{' '}
                      <span className="font-bold text-gray-900 bg-yellow-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded break-words">
                        "{resumeToDelete.title}"
                      </span>?
                    </p>
                  </div>
                  
                  {/* Warning Section */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-sm">
                        <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-red-800 font-bold text-sm sm:text-base mb-1.5 sm:mb-2"> Irreversible Action</h4>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-red-700 leading-relaxed">
                          <p>This will permanently remove:</p>
                          <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 ml-2">
                            <li>The resume and all its content</li>
                            <li>Analytics and view statistics</li>
                            <li>Download history and shared links</li>
                            <li>All associated metadata</li>
                          </ul>
                          <p className="font-semibold mt-2 sm:mt-3 text-red-800">
                            This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      if (!isDeleting) {
                        setShowDeleteModal(false);
                        setResumeToDelete(null);
                      }
                    }}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-gray-600 hover:text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg sm:rounded-xl hover:bg-gray-50 border border-gray-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteResume}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Delete Permanently</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ATS Score Modal */}
      <ATSScoreModal
        isOpen={atsModalOpen}
        onClose={handleCloseAtsModal}
        resumeId={selectedResumeForAts?.id}
        onSuccess={handleAtsSuccess}
      />
    </div>
  );
}

export default ResumeList;
