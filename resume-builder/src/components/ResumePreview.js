import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resumeAPI } from '../services/api';
import TemplateStylingControls from './TemplateStylingControls';

function ResumePreview() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [renderedCss, setRenderedCss] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('');
  const [showStylingControls, setShowStylingControls] = useState(false);
  const [hasTemplate, setHasTemplate] = useState(false);

  useEffect(() => {
    const fetchResumePreview = async () => {
      try {
        setLoading(true);
        
        // Fetch the rendered preview from the API
        const previewResponse = await resumeAPI.getPreview(resumeId);
        
        if (previewResponse.success) {
          setResume(previewResponse.data.resumeData);
          setRenderedHtml(previewResponse.data.html);
          setRenderedCss(previewResponse.data.css);
          
          // Set hasTemplate based on whether the resume has a template
          setHasTemplate(!!previewResponse.data.resumeData?.template);
          
          // Show success message if template was automatically assigned
          if (previewResponse.data.templateAssigned) {
            toast.success('Classic Traditional template has been applied to your resume');
          }
        } else {
          throw new Error(previewResponse.error || 'Failed to fetch resume preview');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Download failed';
        toast.error(errorMessage);
        navigate('/resume-list');
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
      // Update the local resume state
      setResume(updatedResume);
      
      // Fetch the updated preview with new styling
      const previewResponse = await resumeAPI.getPreview(resumeId);
      
      if (previewResponse.success) {
        setRenderedHtml(previewResponse.data.html);
        setRenderedCss(previewResponse.data.css);
      }
    } catch (error) {
      console.error('Error updating preview after styling change:', error);
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
              Full template preview with all your data
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

                {/* Rendered Template */}
                {renderedHtml ? (
                  <div className="template-preview-container">
                    <style dangerouslySetInnerHTML={{ __html: renderedCss }} />
                    <style dangerouslySetInnerHTML={{ __html: `
                      .template-preview-container {
                        width: 100%;
                        max-width: 100%;
                        overflow-x: auto;
                        text-align: left;
                      }
                      .template-content {
                        width: 100%;
                        max-width: 100%;
                        margin: 0 auto;
                      }
                      @media (min-width: 1280px) {
                        .template-content {
                          max-width: 800px;
                        }
                      }
                      @media (min-width: 1536px) {
                        .template-content {
                          max-width: 900px;
                        }
                      }
                      
                      /* Ensure proper box-sizing for template content */
                      .template-content * {
                        box-sizing: border-box;
                      }
                      
                      /* Ensure resume containers have consistent styling */
                      .template-content .resume,
                      .template-content .resume-isolated-container .resume {
                        margin: 0 auto !important;
                        padding: 1in !important;
                        max-width: 8.5in !important;
                        background: white !important;
                      }
                      
                      /* Ensure all resume content is properly aligned */
                      .template-content .resume-isolated-container {
                        width: 100%;
                        max-width: 8.5in;
                        margin: 0 auto;
                      }
                      
                      /* Ensure education section alignment is consistent - override template styles */
                      .template-content .resume .edu-header,
                      .template-content .resume-isolated-container .resume .edu-header,
                      .template-content .classic-traditional .edu-header {
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: baseline !important;
                        margin-bottom: 2px !important;
                      }
                      
                      .template-content .resume .edu-header strong,
                      .template-content .resume-isolated-container .resume .edu-header strong,
                      .template-content .classic-traditional .edu-header strong {
                        font-size: 12px !important;
                      }
                      
                      .template-content .resume .edu-header .dates,
                      .template-content .resume-isolated-container .resume .edu-header .dates,
                      .template-content .classic-traditional .edu-header .dates {
                        font-size: 10px !important;
                        font-style: italic !important;
                      }
                      
                      /* Ensure job experience section alignment is consistent - override template styles */
                      .template-content .resume .job-header,
                      .template-content .resume-isolated-container .resume .job-header,
                      .template-content .classic-traditional .job-header {
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: baseline !important;
                        margin-bottom: 2px !important;
                      }
                      
                      .template-content .resume .job-header strong,
                      .template-content .resume-isolated-container .resume .job-header strong,
                      .template-content .classic-traditional .job-header strong {
                        font-size: 12px !important;
                      }
                      
                      .template-content .resume .job-header .dates,
                      .template-content .resume-isolated-container .resume .job-header .dates,
                      .template-content .classic-traditional .job-header .dates {
                        font-size: 10px !important;
                        font-style: italic !important;
                      }
                      
                      /* Ensure contact information alignment is consistent - override template styles */
                      .template-content .resume .contact-info,
                      .template-content .resume-isolated-container .resume .contact-info,
                      .template-content .classic-traditional .contact-info,
                      .template-content .resume .header .contact-info,
                      .template-content .resume-isolated-container .resume .header .contact-info,
                      .template-content .classic-traditional .header .contact-info {
                        text-align: center !important;
                        font-size: 10px !important;
                        line-height: 1.3 !important;
                      }
                      
                      /* Ensure name alignment is consistent - override template styles */
                      .template-content .resume .name,
                      .template-content .resume-isolated-container .resume .name,
                      .template-content .classic-traditional .name {
                        text-align: center !important;
                        font-size: 20px !important;
                        font-weight: bold !important;
                        margin-bottom: 8px !important;
                        text-transform: uppercase !important;
                        letter-spacing: 1px !important;
                      }
                      
                      /* Force all text alignment to be consistent - highest priority */
                      .template-content .resume *,
                      .template-content .resume-isolated-container .resume *,
                      .template-content .classic-traditional * {
                        text-align: inherit !important;
                      }
                      
                      /* Override any conflicting text-align properties */
                      .template-content .resume h1,
                      .template-content .resume h2,
                      .template-content .resume h3,
                      .template-content .resume-isolated-container .resume h1,
                      .template-content .resume-isolated-container .resume h2,
                      .template-content .resume-isolated-container .resume h3,
                      .template-content .classic-traditional h1,
                      .template-content .classic-traditional h2,
                      .template-content .classic-traditional h3 {
                        text-align: left !important;
                      }
                      
                      /* Ensure specific elements maintain their intended alignment */
                      .template-content .resume .header,
                      .template-content .resume-isolated-container .resume .header,
                      .template-content .classic-traditional .header {
                        text-align: center !important;
                      }
                      
                      /* Force all header content to be centered */
                      .template-content .resume .header *,
                      .template-content .resume-isolated-container .resume .header *,
                      .template-content .classic-traditional .header * {
                        text-align: center !important;
                      }
                      
                      /* Ensure section headings are left-aligned */
                      .template-content .resume section h2,
                      .template-content .resume-isolated-container .resume section h2,
                      .template-content .classic-traditional section h2 {
                        text-align: left !important;
                      }
                    `}} />
                    <div 
                      key={`template-${resumeId}-${JSON.stringify(resume?.styling?.template)}`}
                      className="template-content"
                      dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    />
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