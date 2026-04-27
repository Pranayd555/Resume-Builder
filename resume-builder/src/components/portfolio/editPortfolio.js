import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CheckCircleIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { resumeAPI, portfolioAPI, uploadAPI } from '../../services/api';
import { createPortfolioModel, createPortfolioPersonalInfoModel } from '../../models/dataModels';
import { PORTFOLIO_ROUTES } from '../../constants/routes';
import AuthLoader from '../annimations/AuthLoader';
import { useAuth } from '../../contexts/AuthContext';
import EditPortfolioForm from './EditPortfolioForm';

const EditPortfolio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resumeList, setResumeList] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [currentStep, setCurrentStep] = useState('resume-selection'); // 'resume-selection' or 'edit-portfolio'
  const [portfolioData, setPortfolioData] = useState(createPortfolioModel());
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isTokenExhausted, setIsTokenExhausted] = useState(false);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchPortfolio();
      await fetchResumes();

    };

    initialize();
  }, []);

  useEffect(() => {
    if (user?.tokens !== undefined && !user.isOwnApiKey) {
      setTokenBalance(user.tokens || 0);
      setIsTokenExhausted(user.tokens === 0);
    }
  }, [user.tokens, user.isOwnApiKey])

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResumes();
      if (response.success) {
        setResumeList(response.data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      setLoading(true);

      // Parse resume into portfolio data
      const response = await portfolioAPI.getPortfolio();

      if (response.success) {
        setPortfolioData(response.data);
        setCurrentStep('edit-portfolio');
        toast.success('Resume parsed successfully!');
      }
    } catch (error) {
      console.log(error.userMessage || error.message || 'Failed to parse resume');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSelect = async (resume) => {
    try {
      setLoading(true);

      // Parse resume into portfolio data
      const response = await portfolioAPI.parseResumeToPortfolio(resume);

      if (response.success) {
        setPortfolioData(response.data);
        setCurrentStep('edit-portfolio');
        toast.success('Resume parsed successfully!');
      }
    } catch (error) {
      toast.error(error.userMessage || error.message || 'Failed to parse resume');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleFileUpload = async (file) => {
    try {
      setUploadingFile(true);

      const formData = new FormData();
      formData.append('file', file);

      // Parse resume from file
      const response = await uploadAPI.uploadResume(formData);

      if (response.success) {
        // Initialize portfolio with parsed data
        const parsedData = response.data.parsedData || {};

        // Create portfolio from parsed resume data
        const newPortfolio = createPortfolioModel({
          title: `Portfolio - ${file.name.split('.')[0]}`,
          personalInfo: createPortfolioPersonalInfoModel(parsedData.personalInfo),
          summary: parsedData.summary || '',
          workExperience: parsedData.workExperience || [],
          projects: parsedData.projects || [],
          skills: parsedData.skills || [],
          certifications: parsedData.certifications || [],
          languages: parsedData.languages || [],
        });

        setPortfolioData(newPortfolio);
        setCurrentStep('edit-portfolio');
        toast.success('Resume file parsed successfully!');

        // Update token balance
        if (response.data.tokens !== undefined) {
          setTokenBalance(response.data.tokens);
          setIsTokenExhausted(response.data.tokens === 0);
        }
      }
    } catch (error) {
      toast.error(error.userMessage || error.message || 'Failed to parse resume file');
    } finally {
      setUploadingFile(false);
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if(user.isOwnApiKey || tokenBalance > 0) {
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }
  };



  const handleSavePortfolio = async () => {
    try {
      setLoading(true);

      let existingPortfolio = null;
      try {
        const portfolioResponse = await portfolioAPI.getPortfolio();
        if (portfolioResponse?.success) {
          existingPortfolio = portfolioResponse.data;
        }
      } catch (error) {
        // If no portfolio exists yet, create one. Otherwise bubble up the error.
        if (error?.response?.status !== 404) {
          throw error;
        }
      }

      let response;
      const existingPortfolioId = existingPortfolio?.id || existingPortfolio?._id;
      if (existingPortfolioId) {
        response = await portfolioAPI.updatePortfolio(existingPortfolioId, portfolioData);
      } else {
        response = await portfolioAPI.createPortfolio(portfolioData);
      }

      if (response.success) {
        toast.success('Portfolio saved successfully!');
        const portfolioId = response.data?.id || response.data?._id;
        navigate(PORTFOLIO_ROUTES.SELECTTEMPLATES, { state: { portfolioId } });
      }
    } catch (error) {
      toast.error(error.userMessage || error.message || 'Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async () => {
    try  {
       const response = await portfolioAPI.deletePortfolio(portfolioData._id);
       if(response.success) {
        setCurrentStep('resume-selection');
        toast.success('Portfolio deleted successfully!');
       }
    } catch (error) {
      toast.error(error.userMessage || error.message || 'Failed to delete portfolio');
    }
  }

  if (loading && currentStep === 'resume-selection') {
    return <AuthLoader />;
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStep === 'resume-selection' ? 'Create Your Portfolio' : 'Edit Portfolio'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {currentStep === 'resume-selection'
              ? 'Select an existing resume or upload a new one to get started'
              : 'Edit your portfolio information and customize it'}
          </p>
        </div>

        {/* Resume Selection Step */}
        <div className="space-y-6 mb-8">
          {/* Available Resumes */}
          {resumeList.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Resumes
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {resumeList.map(resume => (
                  <button
                    key={resume._id}
                    onClick={() => handleResumeSelect(resume)}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">{resume.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {resume.personalInfo?.name}
                    </p>
                    <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Use this resume
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upload Resume File
            </h2>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragOver
                  ? user.isOwnApiKey || tokenBalance > 0 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your resume here or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 dark:text-blue-400 font-medium enabled:hover:underline disabled:text-gray-400 dark:disabled:text-gray-600 "
                disabled={uploadingFile || isTokenExhausted}
              >
                browse files
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                PDF, DOC, or DOCX (Max 10MB)
              </p>

              {isTokenExhausted && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                  ⚠️ AI tokens exhausted! Buy more tokens to parse resume files.
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                disabled={uploadingFile || isTokenExhausted}
              />
            </div>

            {/* Upload progress */}
            {uploadingFile && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Parsing resume...</span>
              </div>
            )}



            {/* Token info */}
            {!user.isOwnApiKey && !isTokenExhausted && (<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-2">
              <p
                className={`text-sm text-blue-900 dark:text-blue-30`}
              >
                <span className="font-semibold">
                  Available tokens: {tokenBalance}
                </span>{" "}
                for AI-powered resume parsing
              </p>
            </div>)}

          </div>
        </div>


        {/* Edit Portfolio Step */}
        {currentStep === 'edit-portfolio' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">

            <button className="text-sm text-gray-500 dark:text-gray-400 mb-4" onClick={() => {handleDeletePortfolio()}}>Delete Portfolio</button>
              {/* Portfolio Edit Form */}
              <EditPortfolioForm initialData={portfolioData}
                onSubmit={handleSavePortfolio} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPortfolio;