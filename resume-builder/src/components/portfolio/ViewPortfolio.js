import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  LinkIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { portfolioAPI } from '../../services/api';
import PortfolioCustomization from './PortfolioCustomization';
import AuthLoader from '../annimations/AuthLoader';
import CreativeDeveloperTemplate from './templates/Creative-developer';
import { samplePortfolioData } from './portfolioSchema';

const ViewPortfolio = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      
      let response;
        response = await portfolioAPI.getPortfolio();

      if (response.success) {
        setPortfolioData(response.data);
      } else {
        toast.error(response.error || 'Portfolio not found');
        navigate('/portfolio/edit');
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        navigate('/portfolio/edit');
      } else {
        toast.error(error.message || 'Failed to fetch portfolio');
      }
    } finally {
      setLoading(false);
    }
  };
    fetchPortfolio();
  }, [navigate]);


  const handleToggleLive = async () => {
    try {
      setIsPublishing(true);

      const newLiveStatus = !portfolioData.isLive;
      const response = await portfolioAPI.publishPortfolio(
        portfolioData.id,
        newLiveStatus
      );

      if (response.success) {
        setPortfolioData(response.data);
        toast.success(
          newLiveStatus ? 'Portfolio published successfully!' : 'Portfolio unpublished'
        );
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update portfolio status');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (portfolioData?.liveLink) {
      const fullLink = `${window.location.origin}${portfolioData.liveLink}`;
      navigator.clipboard.writeText(fullLink);
      setCopiedLink(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSaveCustomization = async (customization) => {
    try {
      setLoading(true);
      const response = await portfolioAPI.updatePortfolio(portfolioData.id, {
        customization
      });

      if (response.success) {
        setPortfolioData(response.data);
        setShowCustomization(false);
        toast.success('Customization saved successfully!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save customization');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AuthLoader />;
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Portfolio Found
          </h1>
          <button
            onClick={() => navigate('/portfolio/edit')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Create Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50 dark:bg-gray-900">
      {/* Header with Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {portfolioData.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Template: <span className="font-medium">{portfolioData.template.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                Design Template
              </button>

              <button
                onClick={() => navigate('/portfolio/edit')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Content
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Portfolio Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Portfolio Preview Frame */}
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                {/* <div className="text-center text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Portfolio preview will render here</p>
                  <p className="text-xs mt-1">Template: {portfolioData.template}</p>
                </div> */}
                <CreativeDeveloperTemplate data={samplePortfolioData} />
              </div>

              {/* Portfolio Info */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {portfolioData.personalInfo.fullName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {portfolioData.personalInfo.email}
                </p>

                {portfolioData.summary && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Professional Summary
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {portfolioData.summary}
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {portfolioData.workExperience.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Experiences
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {portfolioData.projects.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Projects
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {portfolioData.skills.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Skills
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-6">
            {/* Live Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Publication Status
              </h3>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {portfolioData.isLive ? 'Published' : 'Draft'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      portfolioData.isLive
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {portfolioData.isLive ? 'Live' : 'Draft'}
                  </span>
                </div>

                <button
                  onClick={handleToggleLive}
                  disabled={isPublishing}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    portfolioData.isLive
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                  } disabled:opacity-50`}
                >
                  {portfolioData.isLive ? (
                    <>
                      <EyeSlashIcon className="w-5 h-5" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-5 h-5" />
                      Publish Now
                    </>
                  )}
                </button>
              </div>

              {portfolioData.isLive && portfolioData.liveLink && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Your Live Portfolio URL
                  </p>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
                    <LinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    <code className="flex-1 text-gray-900 dark:text-gray-100 truncate">
                      {window.location.origin}{portfolioData.liveLink}
                    </code>
                    <button
                      onClick={handleCopyLink}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 flex-shrink-0"
                    >
                      {copiedLink ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        <DocumentTextIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Analytics
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {portfolioData.analytics?.views || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Downloads</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {portfolioData.analytics?.downloads || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Shares</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {portfolioData.analytics?.shares || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>

              <button
                onClick={() => navigate('/resume-list')}
                className="w-full py-2 px-4 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Back to Resume List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <PortfolioCustomization
          portfolioData={portfolioData}
          onSave={handleSaveCustomization}
          onClose={() => setShowCustomization(false)}
        />
      )}
    </div>
  );
};

export default ViewPortfolio;