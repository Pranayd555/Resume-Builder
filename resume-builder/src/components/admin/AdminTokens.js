import React, { useState, useCallback } from 'react';
import { adminAPI } from '../../services/adminApi';
import { toast } from 'react-toastify';

const AdminTokens = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Search users by email
  const searchUsersByEmail = useCallback(async (email) => {
    if (!email.trim()) {
      setUsers([]);
      setSearchPerformed(false);
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.usersApi.getUsers({
        page: 1,
        limit: 50, // Increased limit for better email search results
        search: email.trim()
      });

      if (response.success) {
        setUsers(response.data.users);
        setSearchPerformed(true);

        if (response.data.users.length === 0) {
          toast.info('No users found with this email');
        }
      } else {
        toast.error('Failed to search users');
        setUsers([]);
        setSearchPerformed(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Error searching users');
      setUsers([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Give bonus tokens to user
  const giveBonusTokens = async (userId, tokens, reason = 'Admin bonus') => {
    try {
      const response = await adminAPI.tokensApi.giveBonusTokens(userId, {
        tokens: parseInt(tokens),
        reason
      });

      if (response.success) {
        toast.success(`${tokens} bonus tokens given successfully`);
        // Refresh search results to show updated token balance
        if (emailSearch.trim()) {
          searchUsersByEmail(emailSearch);
        }
        setShowTokenModal(false);
        setSelectedUser(null);
      } else {
        toast.error('Failed to give bonus tokens');
      }
    } catch (error) {
      console.error('Error giving bonus tokens:', error);
      toast.error('Error giving bonus tokens');
    }
  };

  const handleEmailSearch = (e) => {
    e.preventDefault();
    searchUsersByEmail(emailSearch);
  };

  // Show loading spinner during search
  if (loading) {
    return (
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Token Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Search users by email and manage their token allocations</p>
          </div>

          {/* Email Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <form onSubmit={handleEmailSearch} className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="emailSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search by Email Address
                </label>
                <input
                  id="emailSearch"
                  type="email"
                  placeholder="Enter user email address..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Loading State */}
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Searching for users...</p>
            </div>
          </div>
        </div>
    );
  }

  // Show initial state when no search has been performed
  if (!searchPerformed) {
    return (
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Token Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Search users by email and manage their token allocations</p>
          </div>

          {/* Email Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <form onSubmit={handleEmailSearch} className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="emailSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search by Email Address
                </label>
                <input
                  id="emailSearch"
                  type="email"
                  placeholder="Enter user email address..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Initial State */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Search for Users</h3>
              <p className="text-gray-600 dark:text-gray-400">Enter an email address above to find and manage user tokens</p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Token Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Search users by email and manage their token allocations</p>
        </div>

        {/* Email Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleEmailSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="emailSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search by Email Address
              </label>
              <input
                id="emailSearch"
                type="email"
                placeholder="Enter user email address..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.966-5.656-2.34" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Users Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No user found with the email "{emailSearch}". Please check the email address and try again.
              </p>
              <button
                onClick={() => setEmailSearch('')}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear search
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Purchased Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Bonus Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=2a73ea&color=fff`}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {user._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.isEmailVerified ? 'Verified' : 'Unverified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {user.tokens || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.purchasedTokens || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.bonusTokens || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowTokenModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Give Bonus Tokens
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Give Bonus Tokens Modal */}
        {showTokenModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Give Bonus Tokens to {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <button
                    onClick={() => {
                      setShowTokenModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>Current Total Tokens: <span className="font-semibold text-gray-900 dark:text-white">{selectedUser.tokens || 0}</span></div>
                      <div>Purchased: <span className="font-semibold">{selectedUser.purchasedTokens || 0}</span></div>
                      <div>Bonus: <span className="font-semibold">{selectedUser.bonusTokens || 0}</span></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bonus Tokens Amount
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      placeholder="Enter bonus token amount"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      id="bonusTokenAmount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Reason for bonus tokens"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      id="bonusTokenReason"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowTokenModal(false);
                        setSelectedUser(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const amount = document.getElementById('bonusTokenAmount').value;
                        const reason = document.getElementById('bonusTokenReason').value || 'A little extra, on us 🎉';

                        if (amount && amount > 0) {
                          giveBonusTokens(selectedUser._id, amount, reason);
                        } else {
                          toast.error('Please enter a valid token amount');
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Give Bonus Tokens
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default AdminTokens;
