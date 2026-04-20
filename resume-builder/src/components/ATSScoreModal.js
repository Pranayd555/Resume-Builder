import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChartBarIcon, XMarkIcon, DocumentTextIcon, DocumentArrowDownIcon, XCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CustomCKEditorComponent from './customCkeditor.js';
import AILoader from './annimations/AILoader';
import { apiHelpers } from '../services/api';
import aiService from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

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
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isTokenExhausted, setIsTokenExhausted] = useState(false);
  const { user } = useAuth();

  // Get initial token balance
  useEffect(() => {
    if(!user.isOwnApiKey) {
      const balance = apiHelpers.getTokenBalance();
      setTokenBalance(balance);
      setIsTokenExhausted( balance <= 0);
    }
  }, [user.isOwnApiKey]);

  // Listen for token balance updates
  useEffect(() => {
    const handleTokenBalanceUpdate = (event) => {
      const { balance } = event.detail;
      setTokenBalance(balance);
      setIsTokenExhausted(balance <= 0);
    };

    window.addEventListener('tokenBalanceUpdated', handleTokenBalanceUpdate);
    return () => window.removeEventListener('tokenBalanceUpdated', handleTokenBalanceUpdate);
  }, []);

  // Update token balance from user data if available
  useEffect(() => {
    if (user?.tokens !== undefined && !user.isOwnApiKey) {
      setTokenBalance(user.tokens);
      setIsTokenExhausted(user.tokens <= 0);
    }
  }, [user]);


  // Helper function to strip HTML tags from CKEditor content
  const stripHtmlTags = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
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
    console.error('ATS Score Error:', error);
    // Use the standard error formatting from apiHelpers
    const errorMessage = apiHelpers.formatError(error);
    toast.error(errorMessage);
    setAtsGenerating(false);
    // Modal stays open for retry
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Check if tokens are exhausted
    if (!user.isOwnApiKey && (isTokenExhausted || tokenBalance <= 0)) {
      toast.error('AI tokens exhausted! Please purchase more tokens to continue using AI features.');
      return;
    }

    try {
      setAtsGenerating(true);

      // Prepare data for API call
      const jobDescription = atsInputType === 'text' ? stripHtmlTags(atsJobDescription) : null;
      const jobDescriptionFile = atsInputType === 'file' ? atsFile : null;

      // Call the ATS score API
      await aiService.generateATSScore(
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
                    className={`flex-1 p-2.5 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${atsInputType === 'text'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                  >
                    <div className="text-center">
                      <DocumentTextIcon className={`h-6 w-6 mx-auto mb-1.5 ${atsInputType === 'text'
                        ? 'text-green-600'
                        : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      <span className={`font-medium text-sm ${atsInputType === 'text'
                        ? 'text-green-700'
                        : 'text-gray-900 dark:text-gray-700'
                        }`}>Text Input</span>
                      <p className={`text-xs mt-0.5 ${atsInputType === 'text'
                        ? 'text-green-600'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}>Paste job description text</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setAtsInputType('file')}
                    disabled={atsGenerating}
                    className={`flex-1 p-2.5 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${atsInputType === 'file'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                  >
                    <div className="text-center">
                      <DocumentArrowDownIcon className={`h-6 w-6 mx-auto mb-1.5 ${atsInputType === 'file'
                        ? 'text-green-600'
                        : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      <span className={`font-medium text-sm ${atsInputType === 'file'
                        ? 'text-green-700'
                        : 'text-gray-900 dark:text-gray-700'
                        }`}>File Upload</span>
                      <p className={`text-xs mt-0.5 ${atsInputType === 'file'
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
                    <CustomCKEditorComponent
                      value={atsJobDescription}
                      onChange={setAtsJobDescription}
                      placeholder="Paste the job description here..."
                      className="ats-editor"
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
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors relative ${atsGenerating ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'
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

                          // Check extension as fallback
                          const fileName = file.name.toLowerCase();
                          const allowedExtensions = ['.pdf', '.doc', '.docx'];
                          const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

                          if (allowedTypes.includes(file.type) || hasAllowedExtension) {
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


              {/* Generate Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={atsGenerating || isTokenExhausted || (atsInputType === 'text' && !stripHtmlTags(atsJobDescription).trim()) || (atsInputType === 'file' && !atsFile)}
                  className={`w-full py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${isTokenExhausted
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    } ${atsGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isTokenExhausted ? 'AI tokens exhausted - Buy more tokens to continue' : ''}
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>{isTokenExhausted ? 'Tokens Exhausted' : 'Generate ATS Score'}</span>
                </button>

                {/* Token exhaustion message */}
                {isTokenExhausted && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-red-500">
                      ⚠️ AI tokens exhausted!
                      <Link to="/payment" className="text-blue-500 hover:text-blue-700 underline ml-1">
                        Buy more tokens
                      </Link> to continue using AI features.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSScoreModal;
