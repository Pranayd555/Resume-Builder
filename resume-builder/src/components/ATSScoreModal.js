import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChartBarIcon, XMarkIcon, DocumentTextIcon, DocumentArrowDownIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CKEditor from './CKEditor';
import AILoader from './AILoader';
import { subscriptionAPI, apiHelpers } from '../services/api';
import aiService from '../services/aiService';
import { useTokenBalance } from '../hooks/useTokenBalance';

const ATSScoreModal = ({ 
  isOpen, 
  onClose, 
  resumeId, 
  onSuccess 
}) => {
  const [atsJobDescription, setAtsJobDescription] = useState('');
  const [atsFile, setAtsFile] = useState(null);
  const [atsInputType, setAtsInputType] = useState('text'); // 'text' or 'file'
  const [atsGenerating, setAtsGenerating] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const navigate = useNavigate();
  const { tokenBalance, hasEnoughTokens } = useTokenBalance();

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await subscriptionAPI.getCurrentSubscription();
        if (response.success) {
          setSubscription(response.data.subscription);
        }
      } catch (error) {
        // Default to free plan if fetch fails
        setSubscription({ plan: 'free', status: 'active' });
      }
    };

    if (isOpen) {
      fetchSubscription();
    }
  }, [isOpen]);

  // Helper function to strip HTML tags from CKEditor content
  const stripHtmlTags = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Check if user can use ATS score generation based on plan and tokens
  const canUseATSGeneration = () => {
    if (!subscription) return false;
    
    // Premium users can use ATS generation unlimited
    if (subscription.plan === 'pro') {
      return true;
    }
    
    // Free users need tokens
    if (subscription.plan === 'free') {
      return hasEnoughTokens(1); // 1 token required for ATS generation
    }
    
    return false;
  };

  // Get ATS generation restriction message
  const getATSGenerationRestrictionMessage = () => {
    if (!subscription) return null;
    
    if (subscription.plan === 'free') {
      if (!hasEnoughTokens(1)) {
        return {
          type: 'error',
          message: 'You need tokens to generate ATS scores. You have 0 tokens remaining.',
          action: 'Buy Tokens'
        };
      }
      return {
        type: 'info',
        message: `You have ${tokenBalance} tokens remaining. ATS score generation costs 1 token.`,
        action: null
      };
    }
    
    return null; // Premium users have no restrictions
  };

  // Handle modal close
  const handleClose = () => {
    if (!atsGenerating) {
      onClose();
    }
  };

  // Handle successful API response
  const handleSuccess = () => {
    // Reset form
    setAtsJobDescription('');
    setAtsFile(null);
    setAtsInputType('text');
    setAtsGenerating(false);
    
    // Close modal
    onClose();
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  // Handle API error
  const handleError = (error) => {
    toast.error(error.userMessage || 'Failed to generate ATS score');
    setAtsGenerating(false);
    // Modal stays open for retry
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Check if user can use ATS generation
    if (!canUseATSGeneration()) {
      const restrictionMessage = getATSGenerationRestrictionMessage();
      if (restrictionMessage) {
        toast.error(restrictionMessage.message);
        if (restrictionMessage.action === 'Buy Tokens') {
          navigate('/subscription');
        }
      }
      return;
    }

    try {
      setAtsGenerating(true);
      
      // Prepare data for API call
      const jobDescription = atsInputType === 'text' ? stripHtmlTags(atsJobDescription) : null;
      const jobDescriptionFile = atsInputType === 'file' ? atsFile : null;
      
      // Call the ATS score API
      const response = await aiService.generateATSScore(
        resumeId,
        atsInputType,
        jobDescription,
        jobDescriptionFile
      );
      
      
      // Update token balance after successful operation
      const currentBalance = apiHelpers.getTokenBalance();
      const newBalance = Math.max(0, currentBalance - 1);
      apiHelpers.updateTokenBalance(newBalance);
      
      toast.success('ATS Score generated successfully! Check console for details.');
      handleSuccess();
      
    } catch (error) {
      handleError(error);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                ATS Score Analysis
                <SparklesIcon className="w-4 h-4 text-purple-500" />
              </h2>
              <p className="text-xs text-gray-600">Get your resume's ATS compatibility score</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={atsGenerating}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {atsGenerating ? (
            // Show ATS Loader when generating
            <div className="flex items-center justify-center h-[400px] max-h-[400px]">
              <AILoader 
                title="Analyzing your resume..."
                subtitle="Our advanced AI is meticulously scanning your resume to provide a comprehensive ATS score."
                showProgress={true}
              />
            </div>
          ) : (
            // Show form when not generating
            <div className="space-y-4">
              {/* Input Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-2">
                  How would you like to provide the job description?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAtsInputType('text')}
                    disabled={atsGenerating}
                    className={`flex-1 p-2.5 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      atsInputType === 'text'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <DocumentTextIcon className={`h-6 w-6 mx-auto mb-1.5 ${
                        atsInputType === 'text' 
                          ? 'text-green-600' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                      <span className={`font-medium text-sm ${
                        atsInputType === 'text' 
                          ? 'text-green-700' 
                          : 'text-gray-900 dark:text-gray-700'
                      }`}>Text Input</span>
                      <p className={`text-xs mt-0.5 ${
                        atsInputType === 'text' 
                          ? 'text-green-600' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>Paste job description text</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setAtsInputType('file')}
                    disabled={atsGenerating}
                    className={`flex-1 p-2.5 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      atsInputType === 'file'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <DocumentArrowDownIcon className={`h-6 w-6 mx-auto mb-1.5 ${
                        atsInputType === 'file' 
                          ? 'text-green-600' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                      <span className={`font-medium text-sm ${
                        atsInputType === 'file' 
                          ? 'text-green-700' 
                          : 'text-gray-900 dark:text-gray-700'
                      }`}>File Upload</span>
                      <p className={`text-xs mt-0.5 ${
                        atsInputType === 'file' 
                          ? 'text-green-600' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>Upload PDF or DOC file</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Text Input */}
              {atsInputType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-2">
                    Job Description
                  </label>
                  <div className={`border border-gray-300 rounded-lg overflow-hidden ${atsGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CKEditor
                      value={atsJobDescription}
                      onChange={setAtsJobDescription}
                      placeholder="Paste the job description here..."
                      className="min-h-[180px]"
                      disabled={atsGenerating}
                      showAIButton={false}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    You can paste formatted text or type directly. The editor will handle large job descriptions efficiently.
                  </p>
                </div>
              )}

              {/* File Input */}
              {atsInputType === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-2">
                    Upload Job Description File
                  </label>
                  <div 
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors relative ${
                      atsGenerating ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'
                    } ${atsFile ? 'border-green-400 bg-green-50' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!atsGenerating) {
                        e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!atsGenerating) {
                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!atsGenerating) {
                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                        
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          const file = files[0];
                          const allowedTypes = [
                            'application/pdf',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'application/msword'
                          ];
                          
                          if (allowedTypes.includes(file.type)) {
                            setAtsFile(file);
                          } else {
                            toast.error('Please upload a PDF, DOC, or DOCX file only.');
                          }
                        }
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setAtsFile(e.target.files[0])}
                      className="hidden"
                      id="ats-file-input"
                      disabled={atsGenerating}
                    />
                    <label
                      htmlFor="ats-file-input"
                      className={`flex flex-col items-center ${atsGenerating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <DocumentArrowDownIcon className={`h-10 w-10 mb-2 ${atsFile ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-600">
                          {atsFile ? atsFile.name : 'Click to upload or drag and drop'}
                        </span>
                        {atsFile && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setAtsFile(null);
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove file"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                        PDF, DOC, or DOCX files only
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Token restriction message for free users */}
              {subscription && subscription.plan === 'free' && (
                <div className={`p-3 rounded-lg border mb-4 ${
                  hasEnoughTokens(1) 
                    ? 'bg-blue-50 border-blue-200 text-blue-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">
                        {hasEnoughTokens(1) 
                          ? `You have ${tokenBalance} tokens. ATS score generation costs 1 token.`
                          : 'You need tokens to generate ATS scores.'
                        }
                      </span>
                    </div>
                    {!hasEnoughTokens(1) && (
                      <button
                        onClick={() => navigate('/subscription')}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Buy Tokens
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={atsGenerating || !canUseATSGeneration() || (atsInputType === 'text' && !stripHtmlTags(atsJobDescription).trim()) || (atsInputType === 'file' && !atsFile)}
                  className={`w-full py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                    canUseATSGeneration() 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } ${atsGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>
                    {canUseATSGeneration() 
                      ? 'Generate ATS Score' 
                      : 'ATS Generation Disabled - No Tokens'
                    }
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSScoreModal;
