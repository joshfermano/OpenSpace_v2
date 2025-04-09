import { useState } from 'react';
import {
  FiLock,
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { authApi } from '../../services/api';

interface PasswordResetProps {
  setGlobalMessage: (
    message: {
      type: 'success' | 'error';
      text: string;
    } | null
  ) => void;
}

const PasswordReset = ({ setGlobalMessage }: PasswordResetProps) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordFocus, setPasswordFocus] = useState(false);

  // Password validation rules
  const passwordHasLength = formData.newPassword.length >= 8;
  const passwordHasUppercase = /[A-Z]/.test(formData.newPassword);
  const passwordHasNumber = /[0-9]/.test(formData.newPassword);
  const passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(
    formData.newPassword
  );
  const passwordsMatch =
    formData.newPassword === formData.confirmPassword &&
    formData.newPassword !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('Current password is required');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }

    if (!passwordHasUppercase) {
      setError('New password must contain at least one uppercase letter');
      return false;
    }

    if (!passwordHasNumber) {
      setError('New password must contain at least one number');
      return false;
    }

    if (!passwordHasSpecial) {
      setError('New password must contain at least one special character');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authApi.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setGlobalMessage({
          type: 'success',
          text: 'Password updated successfully',
        });
      } else {
        throw new Error(response.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      setError(error.message || 'Failed to update password. Please try again.');
      setGlobalMessage({
        type: 'error',
        text: error.message || 'Failed to update password. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    }
  };

  return (
    <div className="bg-white dark:text-light dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-6">Password Management</h2>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <div className="flex items-start">
            <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <div className="flex items-start">
            <FiCheck className="mt-0.5 mr-2 flex-shrink-0" size={18} />
            <span>Password updated successfully!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" size={16} />
            </div>
            <input
              type={showPassword.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your current password"
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              tabIndex={-1}>
              {showPassword.current ? (
                <FiEyeOff size={18} />
              ) : (
                <FiEye size={18} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" size={16} />
            </div>
            <input
              type={showPassword.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              className="w-full pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your new password"
              disabled={isSubmitting}
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              tabIndex={-1}>
              {showPassword.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {/* Password requirements - shows when password field is focused */}
          {(passwordFocus || formData.newPassword) && (
            <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-xs space-y-1">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password must contain:
              </p>
              <div
                className={`flex items-center ${
                  passwordHasLength
                    ? 'text-green-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                <span className="mr-1">✓</span> At least 8 characters
              </div>
              <div
                className={`flex items-center ${
                  passwordHasUppercase
                    ? 'text-green-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                <span className="mr-1">✓</span> At least 1 uppercase letter
              </div>
              <div
                className={`flex items-center ${
                  passwordHasNumber
                    ? 'text-green-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                <span className="mr-1">✓</span> At least 1 number
              </div>
              <div
                className={`flex items-center ${
                  passwordHasSpecial
                    ? 'text-green-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                <span className="mr-1">✓</span> At least 1 special character
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" size={16} />
            </div>
            <input
              type={showPassword.confirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-10 border ${
                formData.confirmPassword && !passwordsMatch
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="Confirm your new password"
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              tabIndex={-1}>
              {showPassword.confirm ? (
                <FiEyeOff size={18} />
              ) : (
                <FiEye size={18} />
              )}
            </button>
          </div>
          {formData.confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2.5 flex items-center justify-center ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105'
          } rounded-lg transition-all duration-500`}>
          {isSubmitting ? (
            <>
              <FiLoader className="animate-spin mr-2" />
              Updating Password...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </div>
  );
};

export default PasswordReset;
