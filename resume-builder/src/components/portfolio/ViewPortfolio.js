import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  LinkIcon,
  DocumentTextIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { portfolioAPI } from '../../services/api';
import PortfolioCustomization from './PortfolioCustomization';
import AuthLoader from '../annimations/AuthLoader';
import CorporateExecutiveTemplate from './templates/Corporate-executive';
import CreativeDeveloperTemplate from './templates/Creative-developer';
import MinimalistProTemplate from './templates/Minimalist-pro';
import ModernInteractiveTemplate from './templates/Modern-interactive';
import { samplePortfolioData } from './portfolioSchema';

const TEMPLATE_PREVIEWS = {
  'creative-developer': CreativeDeveloperTemplate,
  'modern-interactive': ModernInteractiveTemplate,
  'corporate-executive': CorporateExecutiveTemplate,
  'minimalist-pro': MinimalistProTemplate,
};

const ViewPortfolio = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open

  const fetchPortfolio = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);


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

  const SelectedTemplate = TEMPLATE_PREVIEWS[portfolioData?.template] || CreativeDeveloperTemplate;
  const previewData = { ...samplePortfolioData, ...portfolioData };
  const templateLabel = portfolioData?.template
    ? portfolioData.template.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Unknown';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Side Navbar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 overflow-y-auto transition-transform duration-300 ease-in-out scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 space-y-6">
          {/* Close button for mobile and toggle for desktop */}
          <div className="flex justify-between items-center">
            <div className="lg:hidden">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="hidden lg:block">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {sidebarOpen ? (
                  <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Portfolio Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {portfolioData.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Template: <span className="font-medium">{templateLabel}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowCustomization(!showCustomization)}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Design Template
            </button>

            <button
              onClick={() => navigate('/portfolio/edit')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <PencilIcon className="w-5 h-5" />
              Edit Content
            </button>
          </div>

          {/* Live Status Card */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-l-4 border-blue-500">
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
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Your Live Portfolio URL
                </p>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-600 p-2 rounded text-xs">
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
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
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
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>

            <button
              onClick={() => navigate('/resume-list')}
              className="w-full py-2 px-4 text-sm bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition"
            >
              Back to Resume List
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header - shown on small/medium screens */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {portfolioData.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Template: <span className="font-medium">{templateLabel}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
              >
                <SparklesIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/portfolio/edit')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Portfolio Preview */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <SelectedTemplate data={previewData} />
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