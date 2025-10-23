import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  CreditCardIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { paymentAPI } from '../services/api';

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentHistory();
      
      if (response.success) {
        setTransactions(response.data.transactions || []);
      } else {
        setError(response.message || 'Failed to fetch payment history');
      }
    } catch (err) {
      setError('Failed to fetch payment history');
      console.error('Payment history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'captured':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'created':
      case 'authorized':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'captured':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'created':
      case 'authorized':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Payment History
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchPaymentHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment History
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View your transaction history and payment details
          </p>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You haven't made any payments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.transactionId || index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {transaction.notes || 'AI Tokens Purchase'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Transaction ID: {transaction.transactionId}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatAmount(transaction.amount)}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Order ID:</span>
                      <p className="text-gray-600 dark:text-gray-400">{transaction.orderId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Payment Method:</span>
                      <p className="text-gray-600 dark:text-gray-400 capitalize">
                        {transaction.method || 'Razorpay'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Currency:</span>
                      <p className="text-gray-600 dark:text-gray-400">{transaction.currency}</p>
                    </div>
                  </div>

                  {/* Tokens Added */}
                  {transaction.metadata?.tokensAdded && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          Tokens Added:
                        </span>
                        <span className="text-blue-800 dark:text-blue-200 font-bold">
                          {transaction.metadata.tokensAdded}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {transactions.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactions.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.status === 'captured').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatAmount(transactions.reduce((sum, t) => sum + (t.amount || 0), 0))}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Amount</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
