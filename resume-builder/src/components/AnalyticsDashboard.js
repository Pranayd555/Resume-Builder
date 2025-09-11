import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  EyeIcon, 
  DocumentArrowDownIcon, 
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';


function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleBack = () => {
    navigate('/resume-list');
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAnalyticsSummary();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
            <p className="mt-1 text-sm text-gray-500">Start creating resumes to see your analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  const { resumes, subscription, templates } = analytics;

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">Track your resume performance and usage</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Resumes */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{resumes.total}</p>
                <p className="text-xs text-gray-500">
                  {subscription.resumesCreated} / {subscription.resumeLimit} used
                </p>
              </div>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{resumes.totalViews}</p>
                <p className="text-xs text-gray-500">
                  {resumes.averageViews} avg per resume
                </p>
              </div>
            </div>
          </div>

          {/* Total Downloads */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentArrowDownIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{resumes.totalDownloads}</p>
                <p className="text-xs text-gray-500">
                  {resumes.averageDownloads} avg per resume
                </p>
              </div>
            </div>
          </div>

          {/* AI Actions */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">AI Actions</p>
                <p className="text-2xl font-bold text-gray-900">{subscription.aiActionsUsed}</p>
                <p className="text-xs text-gray-500">
                  {subscription.aiActionsLimit === -1 ? '∞' : subscription.aiActionsLimit} limit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Subscription Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Plan</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{subscription.plan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Resume Creation</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.resumesCreated} / {subscription.resumeLimit}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((subscription.resumesCreated / subscription.resumeLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>

                <p className="text-sm font-medium text-gray-500">AI Actions This Month</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.aiActionsUsed} / {subscription.aiActionsLimit === -1 ? '∞' : subscription.aiActionsLimit}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((subscription.aiActionsUsed / subscription.aiActionsLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Used */}
        {templates.totalUsed > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Templates Used</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{template.category}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Used {template.usage.totalUses} times
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
