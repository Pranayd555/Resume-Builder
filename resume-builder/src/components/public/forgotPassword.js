import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const ForgotPassword = ({ isOpen, closeModal }) => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];

    strength = checks.filter(Boolean).length;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || 'bg-gray-300',
      percentage: (strength / 5) * 100,
    };
  };

  const passwordStrengthInfo = passwordStrength(newPassword);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'otp') setOtp(value);
    else if (name === 'newPassword') setNewPassword(value);
    else if (name === 'confirmPassword') setConfirmPassword(value);

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateSendResetLinkForm = () => {
    let errors = {};
    let isValid = true;

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const validateResetPasswordForm = () => {
    let errors = {};
    let isValid = true;

    if (!otp.trim()) {
      errors.otp = 'OTP is required';
      isValid = false;
    }

    if (!newPassword) {
      errors.newPassword = 'New Password is required';
      isValid = false;
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
      isValid = false;
    } else if (!/[a-z]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one lowercase letter';
      isValid = false;
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter';
      isValid = false;
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one number';
      isValid = false;
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      errors.newPassword = 'Password must contain at least one special character';
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm New Password is required';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validateSendResetLinkForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.forgotEmailVerification(email);
      setMessage(response.message + '. Please check your email for the OTP.');
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validateResetPasswordForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email, otp, newPassword);
      toast.success('Password reset successfully. Please login with your new password.');
      closeModal();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      toast.error(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={closeModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                Forgot Password
              </Dialog.Title>
              <div className="mt-2">
                {!otpSent ? (
                  <form noValidate onSubmit={handleSendResetLink}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-gray-100 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); handleInputChange(e); }}
                      />
                      {validationErrors.email && <p className="text-red-500 text-sm mt-1 dark:text-red-400">{validationErrors.email}</p>}
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 dark:text-red-400">{error}</p>}
                    {message && <p className="text-green-500 text-sm mb-4 dark:text-green-400">{message}</p>}
                    <div className="flex justify-center gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-400 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Send OTP'
                        )}
                      </button>

                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </Dialog.Close>
                    </div>
                  </form>
                ) : (
                  <form noValidate onSubmit={handleResetPassword}>
                    <div className="mb-4">
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">OTP</label>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-gray-100 ${validationErrors.otp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
                        value={otp}
                        onChange={handleInputChange}
                        required
                        maxLength="6"
                        pattern="[0-9]{1,6}"
                        title="Please enter a 6-digit OTP"
                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6); }}
                      />
                      {validationErrors.otp && <p className="text-red-500 text-sm mt-1 dark:text-red-400">{validationErrors.otp}</p>}
                    </div>
                    <div className="mb-4">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-gray-100 pr-10 ${validationErrors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
                          value={newPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                        >
                          {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${passwordStrengthInfo.color}`}
                                style={{ width: `${passwordStrengthInfo.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{passwordStrengthInfo.label}</span>
                          </div>
                        </div>
                      )}
                      {validationErrors.newPassword && <p className="text-red-500 text-sm mt-1 dark:text-red-400">{validationErrors.newPassword}</p>}
                    </div>
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-gray-100 pr-10 ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600'}`}
                          value={confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                        >
                          {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && <p className="text-red-500 text-sm mt-1 dark:text-red-400">{validationErrors.confirmPassword}</p>}
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4 dark:text-red-400">{error}</p>}
                    {message && <p className="text-green-500 text-sm mb-4 dark:text-green-400">{message}</p>}

                    <div className="flex justify-center gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-gradient-to-tr from-green-400 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Reset Password'
                        )}
                      </button>

                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </Dialog.Close>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ForgotPassword;