import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, apiHelpers } from '../services/api';
import { toast } from 'react-toastify';
import AuthLoader from './AuthLoader';
import { 
  EyeIcon, 
  DocumentArrowDownIcon, 
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';


function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTemplatesAccordionOpen, setIsTemplatesAccordionOpen] = useState(false);
  const [isPaymentHistoryAccordionOpen, setIsPaymentHistoryAccordionOpen] = useState(false);

  // Custom scrollbar styles
  const scrollbarStyles = `
    .payment-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .payment-scrollbar::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 4px;
    }
    .payment-scrollbar::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 4px;
    }
    .payment-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
    .dark .payment-scrollbar::-webkit-scrollbar-track {
      background: #fed7aa;
    }
    .dark .payment-scrollbar::-webkit-scrollbar-thumb {
      background: #fb923c;
    }
    .dark .payment-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #f97316;
    }
  `;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // First try to get token data from localStorage
      const storedTokenData = apiHelpers.getTokenData();
      const storedTokenBalance = apiHelpers.getTokenBalance();
      
      const response = await analyticsAPI.getAnalyticsSummary();
      if (response.success) {
        // Merge with localStorage data for better performance
        const analyticsData = {
          ...response.data,
          tokens: {
            balance: response.data?.tokens?.balance || storedTokenBalance || 0,
            recentTransactions: response.data?.tokens?.recentTransactions || storedTokenData?.recentTransactions || []
          }
        };
        
        // Store updated token data in localStorage
        if (response.data?.tokens) {
          apiHelpers.setTokenData(response.data.tokens);
          apiHelpers.setTokenBalance(response.data.tokens.balance);
        }
        
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      
      // Fallback to localStorage data if API fails
      const storedTokenData = apiHelpers.getTokenData();
      const storedTokenBalance = apiHelpers.getTokenBalance();
      
      if (storedTokenData || storedTokenBalance !== null) {
        setAnalytics(prev => ({
          ...prev,
          tokens: {
            balance: storedTokenBalance || 0,
            recentTransactions: storedTokenData?.recentTransactions || []
          }
        }));
      } else {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthLoader 
        title="Loading Analytics..."
        subtitle="Please wait while we fetch your analytics data."
      />
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No analytics data</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start creating resumes to see your analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  const { resumes, subscription, templates, tokens } = analytics;

  return (
    <div className="min-h-screen pt-16">
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Track your resume performance and usage</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Resumes */}
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm p-6 rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
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
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm p-6 rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
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
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm p-6 rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
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
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm p-6 rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
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
        <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm rounded-lg shadow border border-gray-200 dark:border-orange-200/30 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Subscription Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm font-medium text-gray-500">Token Balance</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {tokens?.balance || subscription.tokenBalance || 0} tokens
                </p>
                <p className="text-xs text-gray-500">
                  Available for AI actions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Used Accordion */}
        {templates.totalUsed > 0 && (
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
            <button
              onClick={() => setIsTemplatesAccordionOpen(!isTemplatesAccordionOpen)}
              className="w-full px-6 py-4 border-b border-gray-200 dark:border-orange-700/30 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-orange-100/50 transition-colors"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-700">Templates Used</h3>
              {isTemplatesAccordionOpen ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-700" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-700" />
              )}
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isTemplatesAccordionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-6">
                <div className="max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.templates.map((template) => (
                      <div key={template.id} className="border border-gray-200 dark:border-orange-700/30 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900 dark:text-gray-700">{template.name}</h4>
                        <p className="text-sm text-gray-500 capitalize dark:text-gray-700">{template.category}</p>
                        <p className="text-xs text-gray-400 mt-1 dark:text-gray-700">
                          Used {template.usage.totalUses} times
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History Accordion */}
        <div className="mt-8 bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
          <button
            onClick={() => setIsPaymentHistoryAccordionOpen(!isPaymentHistoryAccordionOpen)}
            className="w-full px-6 py-4 border-b border-gray-200 dark:border-orange-700/30 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-orange-100/50 transition-colors"
          >
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 text-gray-500 dark:text-gray-700 mr-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-700">Payment History</h3>
            </div>
            {isPaymentHistoryAccordionOpen ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-700" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-700" />
            )}
          </button>
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isPaymentHistoryAccordionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-6">
              <div 
                className="max-h-80 overflow-y-auto payment-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
              >
                {tokens?.recentTransactions && tokens.recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {tokens.recentTransactions.map((transaction, index) => (
                      <div key={transaction.transactionId || index} className="border border-gray-200 dark:border-orange-700/30 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {transaction.status === 'captured' ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                            ) : transaction.status === 'failed' ? (
                              <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-yellow-500 mr-3"></div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-700">
                                {transaction.notes || 'Token Purchase'}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-700">
                                {transaction.method ? `${transaction.method.toUpperCase()} Payment` : 'Razorpay Payment'} - {transaction.status}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              ₹{(transaction.amount / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-700">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No payment history</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your payment transactions will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
