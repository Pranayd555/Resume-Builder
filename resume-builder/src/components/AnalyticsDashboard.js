import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import AuthLoader from './annimations/AuthLoader';
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
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';


function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTemplatesAccordionOpen, setIsTemplatesAccordionOpen] = useState(false);
  const [isPaymentHistoryAccordionOpen, setIsPaymentHistoryAccordionOpen] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // isRefundable is now provided by the backend API

  // Handle refund request
  const handleRefund = (transaction) => {
    setSelectedTransaction(transaction);
    setRefundReason('');
    setShowRefundModal(true);
  };

  // Submit refund request
  const submitRefundRequest = async () => {
    if (!selectedTransaction || !refundReason.trim()) {
      toast.error('Please provide a reason for the refund request');
      return;
    }

    if (refundReason.trim().length < 10) {
      toast.error('Refund reason must be at least 10 characters long');
      return;
    }

    try {
      setSubmittingRefund(true);

      const result = await analyticsAPI.requestRefund(
        selectedTransaction.transactionId,
        refundReason.trim()
      );

      if (result.success) {
        toast.success(result.message);
        setShowRefundModal(false);
        setSelectedTransaction(null);
        setRefundReason('');

        // Refresh analytics data to update transaction status
        fetchAnalytics();
      } else {
        toast.error(result.message || 'Failed to submit refund request');
      }
    } catch (error) {
      console.error('Refund request error:', error);
      toast.error('Failed to submit refund request. Please try again.');
    } finally {
      setSubmittingRefund(false);
    }
  };

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

  // Safely destructure with defaults to prevent rendering objects directly
  const resumes = analytics?.resumes || { total: 0, totalViews: 0, totalDownloads: 0, averageViews: 0, averageDownloads: 0 };
  const templates = analytics?.templates || { totalUsed: 0, templates: [] };
  const tokens = analytics?.tokens || { balance: 0, purchasedTokens: 0, bonusTokens: 0, remainingFreeTokens: 0, recentTransactions: [] };

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
                  {resumes.averageViews} avg views per resume
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

          {/* Token Balance */}
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm p-6 rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Token Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tokens?.balance || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {tokens?.purchasedTokens || 0} regular + {tokens?.bonusTokens || 0} bonus
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Engagement Rate */}
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm p-6 rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {resumes.totalViews > 0 ? Math.round((resumes.totalDownloads / resumes.totalViews) * 100) : 0}%
              </div>
              <p className="text-sm font-medium text-gray-500">Download Rate</p>
              <p className="text-xs text-gray-400 mt-1">
                Downloads per view
              </p>
            </div>
          </div>

          {/* Template Usage */}
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm p-6 rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {templates.totalUsed}
              </div>
              <p className="text-sm font-medium text-gray-500">Templates Used</p>
              <p className="text-xs text-gray-400 mt-1">
                {templates.templates.length} unique templates
              </p>
            </div>
          </div>

          {/* Token Usage */}
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm p-6 rounded-lg shadow border border-gray-200 dark:border-orange-200/30">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {tokens?.purchasedTokens || 0}
              </div>
              <p className="text-sm font-medium text-gray-500">Tokens Purchased</p>
              <p className="text-xs text-gray-400 mt-1">
                Total purchased tokens
              </p>
            </div>
          </div>
        </div>


        {/* Templates Used Accordion */}
        {templates.totalUsed > 0 && (
          <div className="bg-white/80 dark:bg-orange-50/95 backdrop-blur-sm rounded-lg shadow border border-gray-200 dark:border-orange-200/30 mb-8">
            <button
              onClick={() => setIsTemplatesAccordionOpen(!isTemplatesAccordionOpen)}
              className="w-full px-6 py-4 border-b border-gray-200 dark:border-orange-700/30 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-orange-100/50 transition-colors"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-500 dark:text-gray-700 mr-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-700">Template Usage</h3>
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {templates.totalUsed} total uses
                </span>
              </div>
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
                <div className="max-h-80 overflow-y-auto payment-scrollbar" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.templates.map((template) => (
                      <div key={template.id} className="border border-gray-200 dark:border-orange-700/30 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-700">{template.name}</h4>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            {template.usage.totalUses} uses
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 capitalize dark:text-gray-700 mb-2">{template.category}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-700">
                          <span>Unique users: {template.usage.uniqueUsers.length}</span>
                          <span>Avg rating: {template.usage.rating.average || 'N/A'}</span>
                        </div>
                        {template.usage.rating.count > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Rating:</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-3 h-3 ${i < Math.round(template.usage.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 ml-1">({template.usage.rating.count})</span>
                            </div>
                          </div>
                        )}
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
                {tokens?.recentTransactions && Array.isArray(tokens.recentTransactions) && tokens.recentTransactions.length > 0 ? (
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
                              {transaction.metadata?.tokensAdded && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  +{transaction.metadata.regularTokensAdded || transaction.metadata.tokensAdded} tokens added
                                  {transaction.metadata?.bonusTokensAdded > 0 && (
                                    <span className="text-green-600 dark:text-green-400 ml-1">
                                      (+{transaction.metadata.bonusTokensAdded} bonus)
                                    </span>
                                  )}
                                </p>
                              )}
                              {transaction.metadata?.planDetails && (
                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                  {transaction.metadata.planDetails.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-gray-600">
                              ₹{(transaction.amount / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-700">
                              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 
                               transaction.capturedAt ? new Date(transaction.capturedAt).toLocaleDateString() : 
                               'N/A'}
                            </p>
                            {transaction.metadata?.newTokenBalance && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Balance: {transaction.metadata.newTokenBalance} tokens
                              </p>
                            )}
                            {transaction.metadata?.billingCycle && (
                              <p className="text-xs text-orange-600 dark:text-orange-400">
                                {transaction.metadata.billingCycle} billing
                              </p>
                            )}
                            {transaction.isRefundable && (
                              <button
                                onClick={() => handleRefund(transaction)}
                                disabled={transaction.status === 'refund_requested'}
                                className={`mt-2 inline-flex items-center px-2 py-1 border text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                                  transaction.status === 'refund_requested'
                                    ? 'border-yellow-300 text-yellow-700 bg-yellow-50 cursor-not-allowed'
                                    : 'border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-500'
                                }`}
                              >
                                <ArrowUturnLeftIcon className="w-3 h-3 mr-1" />
                                {transaction.status === 'refund_requested' ? 'Refund Requested' : 'Request Refund'}
                              </button>
                            )}
                          </div>
                        </div>
                        {transaction.metadata && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-orange-700/20">
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-600">
                              <div>
                                <span className="font-medium">Transaction ID:</span>
                                <p className="font-mono">{transaction.transactionId}</p>
                              </div>
                              <div>
                                <span className="font-medium">Order ID:</span>
                                <p className="font-mono">{transaction.orderId}</p>
                              </div>
                              {transaction.email && (
                                <div>
                                  <span className="font-medium">Email:</span>
                                  <p>{transaction.email}</p>
                                </div>
                              )}
                              {transaction.contact && (
                                <div>
                                  <span className="font-medium">Contact:</span>
                                  <p>{transaction.contact}</p>
                                </div>
                              )}
                              {transaction.metadata.plan && (
                                <div>
                                  <span className="font-medium">Plan:</span>
                                  <p className="capitalize">{transaction.metadata.plan.replace('_', ' ')}</p>
                                </div>
                              )}
                              {transaction.metadata.transactionType && (
                                <div>
                                  <span className="font-medium">Type:</span>
                                  <p className="capitalize">{transaction.metadata.transactionType.replace('_', ' ')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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

      {/* Refund Request Modal */}
      {showRefundModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Request Refund
                </h3>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedTransaction(null);
                    setRefundReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={submittingRefund}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Transaction Details */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div><strong>Transaction ID:</strong> {selectedTransaction.transactionId}</div>
                    <div><strong>Amount:</strong> ₹{(selectedTransaction.amount / 100).toFixed(2)}</div>
                    <div><strong>Date:</strong> {selectedTransaction.createdAt ? new Date(selectedTransaction.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>

                {/* Refund Reason */}
                <div>
                  <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Refund <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="refundReason"
                    rows={4}
                    placeholder="Please explain why you're requesting a refund (minimum 10 characters)..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    disabled={submittingRefund}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {refundReason.length}/10 minimum characters
                  </p>
                </div>

                {/* Important Note */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p><strong>Important:</strong> Refunds can only be requested within 7 days of the transaction. Processing may take 3-5 business days.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowRefundModal(false);
                      setSelectedTransaction(null);
                      setRefundReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    disabled={submittingRefund}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRefundRequest}
                    disabled={submittingRefund || refundReason.trim().length < 10}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {submittingRefund ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                        Submit Refund Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
