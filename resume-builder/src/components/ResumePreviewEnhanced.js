import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';
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
  const [hasTemplate, setHasTemplate] = useState(false);
  
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
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Download failed';
      toast.error(errorMessage);
    } finally {
      setDownloading(false);
      setDownloadFormat('');
    }
  }, [resumeId, resume?.title, pdfData]);

  // Download DOCX
  // const handleDownloadDOCX = useCallback(async () => {
  //   try {
  //     setDownloading(true);
  //     setDownloadFormat('docx');
      
  //     const response = await resumeAPI.downloadDOCX(resumeId);
  //     const blob = new Blob([response.data], { 
  //       type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  //     });
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `${resume?.title || 'resume'}.docx`;
  //     document.body.appendChild(link);
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);
      
  //     toast.success('DOCX downloaded successfully!');
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.error || error.message || 'Download failed';
  //     toast.error(errorMessage);
  //   } finally {
  //     setDownloading(false);
  //     setDownloadFormat('');
  //   }
  // }, [resumeId, resume?.title]);

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
        }
        
        // Load PDF preview
        await loadPDFPreview();
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
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {resume?.title}
            </h1>
            <p className="text-xs sm:text-sm lg:text-lg text-gray-600">
              {resume?.template?.category ? `Category: ${resume.template.category.charAt(0).toUpperCase() + resume.template.category.slice(1)} • ` : ''}
              {resume?.template?.name ? `Template: ${resume.template.name}` : 'Full template preview with all your data'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setShowStylingControls(!showStylingControls)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base whitespace-nowrap"
            >
              <PrinterIcon className="h-4 w-4" />
              {showStylingControls ? 'Hide Settings' : 'Design Settings'}
            </button>
            
            <button
              onClick={handleEdit}
              className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base whitespace-nowrap"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit Details
            </button>
            
            {hasTemplate && (
              <button
                onClick={handleSelectNewTemplate}
                className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base whitespace-nowrap"
              >
                <ArrowsRightLeftIcon className="h-4 w-4" />
                Change Template
              </button>
            )}
          </div>
        </div>

        {/* PDF Preview Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 sm:mb-6 lg:mb-8">
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

        {/* Download Options */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Download Options</h3>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className={`px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base ${
                downloading && downloadFormat === 'pdf' ? 'animate-pulse' : ''
              }`}
            >
              {downloading && downloadFormat === 'pdf' ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Downloading PDF...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="h-6 w-6" />
                  Download PDF
                </>
              )}
            </button>
            
            {/* <button
              onClick={handleDownloadDOCX}
              disabled={downloading}
              className={`px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base ${
                downloading && downloadFormat === 'docx' ? 'animate-pulse' : ''
              }`}
            >
              {downloading && downloadFormat === 'docx' ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Downloading DOCX...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download DOCX
                </>
              )}
            </button> */}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-4 sm:gap-6">
          {/* Styling Controls Sidebar */}
          {showStylingControls && (
            <div className="xl:col-span-2">
              <div className="sticky top-4 sm:top-6">
                <TemplateStylingControls
                  resumeId={resumeId}
                  currentStyling={resume?.styling}
                  onStylingUpdate={handleStylingUpdate}
                />
              </div>
            </div>
          )}

          {/* Resume Preview */}
          <div className={`${showStylingControls ? 'xl:col-span-4' : 'xl:col-span-6'}`}>
            <div className="backdrop-blur-md bg-white/90 rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-3 sm:p-6 lg:p-8">
              <div className="max-w-5xl mx-auto">
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
                     <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg transform transition-all duration-500 ease-out">
                                             <PDFViewer 
                         pdfUrl={pdfData.url}
                         showLoader={false}
                         onError={(error) => {
                           console.error('PDF Viewer error:', error);
                           toast.error('Failed to load PDF preview');
                         }}
                       />
                    </div>
                    
                    {/* Mobile PDF Controls - Only visible on mobile */}
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 justify-center sm:hidden">
                      <button
                        onClick={() => window.open(pdfData.url, '_blank')}
                        className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in Browser
                      </button>
                      
                      <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm disabled:opacity-50"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
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

        {/* Back Button */}
        <div className="mt-4 sm:mt-6 lg:mt-8 text-center">
          <button
            onClick={handleBackToList}
            className="px-4 py-2 sm:px-6 sm:py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Resume List
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumePreviewEnhanced; 

