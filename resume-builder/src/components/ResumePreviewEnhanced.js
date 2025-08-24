import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resumeAPI, analyticsAPI } from '../services/api';
import TemplateStylingControls from './TemplateStylingControls';
import PDFViewer from './PDFViewer';
import { ArrowsRightLeftIcon, DocumentArrowDownIcon, DocumentTextIcon, PencilSquareIcon, PrinterIcon } from '@heroicons/react/24/outline';

function ResumePreviewEnhanced() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('');
  const [showStylingControls, setShowStylingControls] = useState(false);
  const [showMobileStylingPopup, setShowMobileStylingPopup] = useState(false);
  const [hasTemplate, setHasTemplate] = useState(false);
  
  // Template styling state
  const [defaultTemplateStyling, setDefaultTemplateStyling] = useState(null);
  
  // PDF preview state
  const [pdfData, setPdfData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Load PDF preview
  const loadPDFPreview = useCallback(async () => {
    try {
      setPdfLoading(true);
      const response = await resumeAPI.downloadPDF(resumeId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfData({ blob, url });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load PDF preview';
      toast.error(errorMessage);
    } finally {
      setPdfLoading(false);
    }
  }, [resumeId]);

  // Download PDF using cached data
  const handleDownloadPDF = useCallback(async () => {
    try {
      setDownloading(true);
      setDownloadFormat('pdf');
      
      // Track download analytics
      try {
        await analyticsAPI.trackResumeDownload(resumeId, 'pdf');
      } catch (analyticsError) {
        console.warn('Failed to track download:', analyticsError);
      }
      
      if (pdfData) {
        // Use cached PDF data
        const link = document.createElement('a');
        link.href = pdfData.url;
        link.download = `${resume?.title || 'resume'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback to API call if no cached data
        const response = await resumeAPI.downloadPDF(resumeId);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resume?.title || 'resume'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Download failed';
      toast.error(errorMessage);
    } finally {
      setDownloading(false);
      setDownloadFormat('');
    }
  }, [resumeId, resume?.title, pdfData]);

  // Edit function
  const handleEdit = useCallback(() => {
    navigate('/resume-form', { state: { resumeId, editMode: true } });
  }, [resumeId, navigate]);

  // Back to list function
  const handleBackToList = useCallback(() => {
    navigate('/resume-list');
  }, [navigate]);

  // Styling update function with debounced PDF reload
  const handleStylingUpdate = useCallback(async (updatedResume) => {
    try {
      setResume(updatedResume);
      
      // Reload PDF preview with updated styling
      await loadPDFPreview();
    } catch (error) {
      console.error('Error updating preview after styling change:', error);
      toast.error('Failed to update preview after styling change');
    }
  }, [loadPDFPreview]);

  // Select new template function
  const handleSelectNewTemplate = useCallback(() => {
    navigate(`/template-selection/${resumeId}`);
  }, [resumeId, navigate]);

  // Handle design settings button click
  const handleDesignSettingsClick = useCallback(() => {
    // Check if we're on mobile/small (screen width < 768px)
    if (window.innerWidth < 768) {
      setShowMobileStylingPopup(true);
    } else {
      setShowStylingControls(!showStylingControls);
    }
  }, [showStylingControls]);

  // Handle window resize to switch between modal and sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // On medium+ screens, close modal and show sidebar if it was open
        if (showMobileStylingPopup) {
          setShowMobileStylingPopup(false);
          setShowStylingControls(true);
        }
      } else {
        // On small screens, close sidebar
        setShowStylingControls(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMobileStylingPopup]);

  // Close mobile styling popup
  const handleCloseMobileStylingPopup = useCallback(() => {
    setShowMobileStylingPopup(false);
    // Reset the settings button state when modal closes
    setShowStylingControls(false);
  }, []);

  // Memoized error handler for PDFViewer to prevent re-renders
  const handlePDFError = useCallback((error) => {
    console.error('PDF Viewer error:', error);
    toast.error('Failed to load PDF preview');
  }, []);

  // Fetch resume data and load PDF preview
  useEffect(() => {
    const fetchResumePreview = async () => {
      try {
        setLoading(true);
        const resumeResp = await resumeAPI.getResumeById(resumeId);

        if (resumeResp?.success !== false && resumeResp?.data) {
          const r = resumeResp.data.resume || resumeResp.data;
          setResume(r);
          setHasTemplate(!!r?.template);
          
          // Store default template styling data if available
          if (resumeResp.data.defaultTemplateStyling) {
            setDefaultTemplateStyling(resumeResp.data.defaultTemplateStyling);
          } else {
            setDefaultTemplateStyling({
              headerLevel: 'h3',
              headerFontSize: 18,
              fontSize:  14,
              lineSpacing: 1.3,
              sectionSpacing: 1
            });
          }
        }
        
        // Load PDF preview
        await loadPDFPreview();
        
        // Track resume view
        try {
          await analyticsAPI.trackResumeView(resumeId);
        } catch (analyticsError) {
          console.warn('Failed to track resume view:', analyticsError);
        }
        
        toast.success('Preview generated successfully!');
        
      } catch (error) {
        console.error('Failed to load resume data:', error);
        toast.error('Failed to load preview');
        setTimeout(() => navigate('/resume-list'), 0);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResumePreview();
    }
  }, [resumeId, navigate, loadPDFPreview]);

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfData?.url) {
        URL.revokeObjectURL(pdfData.url);
      }
    };
  }, [pdfData]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading Resume Preview...</h3>
            <p className="text-sm sm:text-base text-gray-600">Please wait while we prepare your resume.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          {/* Left Section - Back Button and Title */}
          <div className="flex-1 min-w-0">
            {/* Back Button - Icon only on mobile, full text on desktop */}
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium group"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm sm:text-base">Back to Resume List</span>
              </button>
            </div>
            
            {/* Title and Description */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {resume?.title}
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                {resume?.template?.category ? `Category: ${resume.template.category.charAt(0).toUpperCase() + resume.template.category.slice(1)} • ` : ''}
                {resume?.template?.name ? `Template: ${resume.template.name}` : 'Full template preview with all your data'}
              </p>
            </div>
          </div>
         
          {/* Right Section - Action Buttons Only */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleEdit}
              className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
            >
              <PencilSquareIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Details</span>
              <span className="sm:hidden">Edit</span>
            </button>
            
            {hasTemplate && (
              <button
                onClick={handleSelectNewTemplate}
                className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <ArrowsRightLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Change Template</span>
                <span className="sm:hidden">Template</span>
              </button>
            )}
            
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className={`px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap ${
                downloading && downloadFormat === 'pdf' ? 'animate-pulse' : ''
              }`}
            >
              {downloading && downloadFormat === 'pdf' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <DocumentArrowDownIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>

        {/* PDF Preview Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500 rounded-md">
              <DocumentTextIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-green-800 font-medium text-sm">Document Preview: </span>
              <span className="text-green-700 text-sm">
                Preview your resume exactly as it will appear in the final document. All formatting, styling, and content are preserved.
              </span>
            </div>
          </div>
        </div>

                 {/* Main Content */}
         

           {/* Resume Preview */}
                        <div className="md:col-span-6">
              <div className="backdrop-blur-md bg-white/90 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-3 sm:p-6 lg:p-8 relative">
             <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-6">
                       {/* Styling Controls Sidebar - Visible on medium+ screens (768px+) */}
                      {showStylingControls && (
                        <div className="md:col-span-2 hidden md:block">
                          <div className="sticky top-4 sm:top-6">
                            <TemplateStylingControls
                              resumeId={resumeId}
                              currentStyling={resume?.styling}
                              onStylingUpdate={handleStylingUpdate}
                              defaultStyling={defaultTemplateStyling}
                            />
                          </div>
                        </div>
                      )}
               <div className={`${showStylingControls ? 'md:col-span-4' : 'md:col-span-6'} max-w-5xl mx-auto ${pdfLoading ? 'flex items-center justify-center min-h-[60vh]' : ''}`}>
                {/* PDF Preview */}
                {pdfLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    {/* Animated PDF Generation Container */}
                    <div className="relative max-w-md mx-auto mb-8">
                      {/* Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl animate-pulse"></div>
                      
                      {/* Main Container */}
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-xl">
                        {/* Animated PDF Icon */}
                        <div className="relative mb-6">
                          <div className="w-20 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center transform animate-bounce">
                            <svg className="w-10 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          
                          {/* Floating Elements */}
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute top-1/2 -left-3 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-progress"></div>
                          </div>
                        </div>
                        
                        {/* Loading Text */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 animate-pulse">
                            Generating PDF Preview...
                          </h3>
                          <p className="text-sm text-gray-600">
                            Crafting your professional resume with precision
                          </p>
                        </div>
                        
                        {/* Animated Steps */}
                        <div className="mt-6 space-y-2">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-gray-700">Processing resume data</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                            <span className="text-gray-700">Applying template styling</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                            <span className="text-gray-700">Generating PDF document</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-spin"></div>
                      <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="max-w-lg mx-auto">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">High-Quality Preview</p>
                            <p className="text-xs text-blue-700">Your resume is being rendered with professional formatting and styling</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                                 ) : pdfData ? (
                   <div className="mx-auto w-full animate-fade-in">
                     {/* PDF Viewer using PDF.js - Responsive */}
                     <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg transform transition-all duration-500 ease-out relative">
                       <PDFViewer 
                         pdfUrl={pdfData.url}
                         showLoader={false}
                         onError={handlePDFError}
                         settingsButton={
                           <button
                             onClick={handleDesignSettingsClick}
                             className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                           >
                             <PrinterIcon className="h-4 w-4" />
                             <span className="hidden sm:inline">
                               {showStylingControls || showMobileStylingPopup ? 'Hide Settings' : 'Design Settings'}
                             </span>
                           </button>
                         }
                       />
                       
                       {/* Download PDF Button - Positioned on bottom-right of PDF card */}
                       <div className="absolute bottom-4 right-4 z-10">
                         <button
                           onClick={handleDownloadPDF}
                           disabled={downloading}
                           className={`p-3 sm:p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 ${
                             downloading && downloadFormat === 'pdf' ? 'animate-pulse' : ''
                           }`}
                           title="Download PDF"
                         >
                           {downloading && downloadFormat === 'pdf' ? (
                             <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           ) : (
                             <DocumentArrowDownIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                           )}
                         </button>
                       </div>
                     </div>
                   </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No PDF Preview Available</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Unable to load PDF preview. Please try refreshing the page.</p>
                  </div>
                )}
                             </div>
            </div>
          </div>
        </div>
      </div>

                    {/* Mobile Styling Controls Popup */}
        {showMobileStylingPopup && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-fit max-h-[90vh] flex flex-col border border-gray-200">
             {/* Scrollable Content Container */}
             <div className="overflow-y-auto scrollbar-hide flex-1 p-4 sm:p-6">
               <TemplateStylingControls
                 resumeId={resumeId}
                 currentStyling={resume?.styling}
                 onStylingUpdate={handleStylingUpdate}
                 defaultStyling={defaultTemplateStyling}
                 onClose={handleCloseMobileStylingPopup}
               />
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

export default ResumePreviewEnhanced;
