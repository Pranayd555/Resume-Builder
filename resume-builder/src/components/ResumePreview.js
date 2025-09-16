import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';
import TemplateStylingControls from './TemplateStylingControls';

function ResumePreview() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('');
  const [showStylingControls, setShowStylingControls] = useState(false);
  const [hasTemplate, setHasTemplate] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [previewMeta, setPreviewMeta] = useState(null);
  const [refreshingPreview, setRefreshingPreview] = useState(false);

  useEffect(() => {
    const fetchResumePreview = async () => {
      try {
        setLoading(true);
        // Fetch resume meta and image pages in parallel
        const [resumeResp, imagesResp] = await Promise.all([
          resumeAPI.getResumeById(resumeId),
          resumeAPI.getPreviewPdfImages(resumeId)
        ]);

        if (resumeResp?.success !== false && resumeResp?.data) {
          // Some endpoints return {success, data}, others return {data} directly
          const r = resumeResp.data.resume || resumeResp.data;
          setResume(r);
          setHasTemplate(!!r?.template);
        }

        setPdfPages(imagesResp.success ? (imagesResp.data.pages || []) : []);
        setPreviewMeta(imagesResp.success ? (imagesResp.data.meta || null) : null);
        toast.success('Resume preview loaded successfully');
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Download failed';
        toast.error(errorMessage);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResumePreview();
    }
  }, [resumeId, navigate]);

  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      setDownloadFormat(format);
      
      let response;
      if (format === 'pdf') {
        response = await resumeAPI.downloadPDF(resumeId);
      } else if (format === 'docx') {
        response = await resumeAPI.downloadDOCX(resumeId);
      }
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume?.title || 'resume'}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Resume downloaded as ${format.toUpperCase()}!`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Download failed';
      toast.error(errorMessage);
    } finally {
      setDownloading(false);
      setDownloadFormat('');
    }
  };

  const handleEdit = () => {
    navigate('/resume-form', { state: { resumeId, editMode: true } });
  };

  const handleBackToList = () => {
    navigate('/resume-list');
  };

  const handleStylingUpdate = async (updatedResume) => {
    try {
      setRefreshingPreview(true);
      // Update the local resume state
      setResume(updatedResume);
      // Refresh image pages only
      const imagesResp = await resumeAPI.getPreviewPdfImages(resumeId);
      setPdfPages(imagesResp.success ? (imagesResp.data.pages || []) : []);
      setPreviewMeta(imagesResp.success ? (imagesResp.data.meta || null) : null);
    } catch (error) {
      console.error('Error updating preview after styling change:', error);
    } finally {
      setRefreshingPreview(false);
    }
  };

  const handleSelectNewTemplate = () => {
    navigate(`/template-selection/${resumeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto py-6 px-3 sm:py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Resume Preview...</h3>
            <p className="text-gray-600">Please wait while we prepare your resume.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-6 px-3 sm:py-8 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {resume.title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">
              {previewMeta?.template?.category ? `Category: ${previewMeta.template.category} • ` : ''}
              {previewMeta?.template?.name ? `Template: ${previewMeta.template.name}` : 'Full template preview with all your data'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 lg:flex-nowrap lg:gap-4">
            <button
              onClick={() => setShowStylingControls(!showStylingControls)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {showStylingControls ? 'Hide Template' : 'Edit Template'}
            </button>
            
            <button
              onClick={handleEdit}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            
            {hasTemplate && (
              <button
                onClick={handleSelectNewTemplate}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Change Template
              </button>
            )}
          </div>
        </div>

        {/* Template Preview Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-green-800 font-semibold">Full Template Preview</h3>
          </div>
          <p className="text-green-700 text-sm">
            This is the complete template preview showing all your work experience, education, skills, and achievements with proper formatting.
          </p>
        </div>

        {/* Download Options */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Options</h3>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading}
              className={`px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-semibold text-sm sm:text-base ${
                downloading && downloadFormat === 'pdf' ? 'animate-pulse' : ''
              }`}
            >
              {downloading && downloadFormat === 'pdf' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            
            <button
              onClick={() => handleDownload('docx')}
              disabled={downloading}
              className={`px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-semibold text-sm sm:text-base ${
                downloading && downloadFormat === 'docx' ? 'animate-pulse' : ''
              }`}
            >
              {downloading && downloadFormat === 'docx' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download DOCX
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Styling Controls Sidebar */}
          {showStylingControls && (
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <TemplateStylingControls
                  resumeId={resumeId}
                  currentStyling={resume?.styling}
                  onStylingUpdate={handleStylingUpdate}
                />
              </div>
            </div>
          )}

          {/* Resume Preview */}
          <div className={`${showStylingControls ? 'xl:col-span-4' : 'xl:col-span-5'}`}>
            <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
              <div className="max-w-5xl mx-auto">
                {/* Template Information */}
                {/* This block is removed as per the edit hint */}
                {/* {hasTemplate && resume.template ? (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M15 7l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{resume.template.name}</h3>
                        <p className="text-sm text-gray-600">
                          {resume.template.category?.charAt(0).toUpperCase() + resume.template.category?.slice(1)} • 
                          {resume.template.availability?.tier?.charAt(0).toUpperCase() + resume.template.availability?.tier?.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null} */}

                {/* Rendered Template - images only with overlay loader during refresh */}
                {pdfPages.length > 0 ? (
                  <div className="relative">
                    {refreshingPreview && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-lg">
                        <div className="flex items-center gap-3 text-gray-700">
                          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-medium">Updating preview…</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                    {pdfPages.map((p) => (
                      <div key={`pdf-page-${p.index}`} className="mx-auto w-full max-w-[800px]">
                        <img
                          src={p.dataUri}
                          alt={`Page ${p.index + 1}`}
                          className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                        />
                      </div>
                    ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Template...</h3>
                    <p className="text-gray-600 mb-4">Please wait while we prepare your resume preview.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={handleBackToList}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Resume List
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumePreview; 