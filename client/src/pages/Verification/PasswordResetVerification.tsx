import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiLock, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { authApi } from '../../services/api';

const PasswordResetVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form state when token changes
  useEffect(() => {
    setPassword('');
    setConfirmPassword('');
    setSuccess(false);
    setError(null);
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Validate passwords
    if (!validatePassword()) {
      return;
    }

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword(token, password);

      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Password Reset Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your password has been reset successfully. You can now log in with
            your new password.
          </p>
          <Link
            to="/login"
            className="px-6 py-2.5 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <div className="flex items-start">
              <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" size={18} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 bg-darkBlue dark:bg-light ${
              loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600 hover:scale-105'
            } text-light dark:text-darkBlue dark:hover:text-light rounded-lg transition-all duration-500 flex items-center justify-center`}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <FiArrowLeft className="mr-2" size={14} /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetVerification;
