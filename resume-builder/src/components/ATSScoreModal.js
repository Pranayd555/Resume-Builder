import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ChartBarIcon, XMarkIcon, DocumentTextIcon, DocumentArrowDownIcon, XCircleIcon } from '@heroicons/react/24/outline';
import CKEditor from './CKEditor';
import ATSLoader from './ATSLoader';
import { aiAPI } from '../services/api';

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
    console.error('ATS Score generation error:', error);
    toast.error(error.userMessage || 'Failed to generate ATS score');
    setAtsGenerating(false);
    // Modal stays open for retry
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setAtsGenerating(true);
      
      // Prepare data for API call
      const jobDescription = atsInputType === 'text' ? stripHtmlTags(atsJobDescription) : null;
      const jobDescriptionFile = atsInputType === 'file' ? atsFile : null;
      
      console.log('=== ATS SCORE REQUEST ===');
      console.log('Resume ID:', resumeId);
      console.log('Input Type:', atsInputType);
      console.log('Job Description Length:', jobDescription?.length || 0);
      console.log('File Name:', jobDescriptionFile?.name || 'N/A');
      console.log('========================');
      
      // Call the ATS score API
      const response = await aiAPI.generateATSScore(
        resumeId,
        atsInputType,
        jobDescription,
        jobDescriptionFile
      );
      
      console.log('=== ATS SCORE RESPONSE ===');
      console.log('Success:', response.success);
      console.log('Resume Title:', response.data?.resumeTitle);
      console.log('Template Name:', response.data?.templateName);
      console.log('Job Description Length:', response.data?.jobDescriptionLength);
      console.log('Input Type:', response.data?.inputType);
      console.log('--- ATS Analysis ---');
      console.log(response.data?.atsAnalysis);
      console.log('=== END ATS RESPONSE ===');
      
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
              <h2 className="text-lg font-semibold text-gray-900">ATS Score Analysis</h2>
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
            <div className="flex items-center justify-center min-h-[400px]">
              <ATSLoader 
                title="Analyzing your resume..."
                subtitle="Our advanced algorithm is meticulously scanning your resume to provide a comprehensive ATS score."
                showProgress={true}
              />
            </div>
          ) : (
            // Show form when not generating
            <div className="space-y-4">
              {/* Input Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you like to provide the job description?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAtsInputType('text')}
                    disabled={atsGenerating}
                    className={`flex-1 p-2.5 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      atsInputType === 'text'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <DocumentTextIcon className="h-6 w-6 mx-auto mb-1.5" />
                      <span className="font-medium text-sm">Text Input</span>
                      <p className="text-xs text-gray-600 mt-0.5">Paste job description text</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setAtsInputType('file')}
                    disabled={atsGenerating}
                    className={`flex-1 p-2.5 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      atsInputType === 'file'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <DocumentArrowDownIcon className="h-6 w-6 mx-auto mb-1.5" />
                      <span className="font-medium text-sm">File Upload</span>
                      <p className="text-xs text-gray-600 mt-0.5">Upload PDF or DOC file</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Text Input */}
              {atsInputType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <div className={`border border-gray-300 rounded-lg overflow-hidden ${atsGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CKEditor
                      value={atsJobDescription}
                      onChange={setAtsJobDescription}
                      placeholder="Paste the job description here..."
                      className="min-h-[180px]"
                      disabled={atsGenerating}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can paste formatted text or type directly. The editor will handle large job descriptions efficiently.
                  </p>
                </div>
              )}

              {/* File Input */}
              {atsInputType === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <DocumentArrowDownIcon className={`h-10 w-10 mb-2 ${atsFile ? 'text-green-500' : 'text-gray-400'}`} />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
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
                      <span className="text-xs text-gray-500 mt-1">
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
                  disabled={atsGenerating || (atsInputType === 'text' && !stripHtmlTags(atsJobDescription).trim()) || (atsInputType === 'file' && !atsFile)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-4 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Generate ATS Score</span>
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
