import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiLoader, FiCheck } from 'react-icons/fi';
import { authApi } from '../../services/api';

const ForgotPasswordSent = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Reset token is missing');
        setIsValidating(false);
        return;
      }

      try {
        const response = await authApi.validateResetToken(token);

        if (response.success) {
          setIsValid(true);
          setEmail(response.data?.email || '');
          // Redirect to the password reset form
          navigate(`/reset-password/${token}`);
        } else {
          throw new Error(response.message || 'Invalid or expired token');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to validate reset token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verifying Reset Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we validate your password reset link...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle
              className="text-red-600 dark:text-red-400"
              size={32}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}. The reset link may have expired or is invalid.
          </p>
          <div className="flex flex-col space-y-3">
            <Link
              to="/auth/forgot-password"
              className="px-6 py-2.5 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500 inline-block">
              Request New Reset Link
            </Link>
            <Link
              to="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Reset Link Valid
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          The reset link for <span className="font-medium">{email}</span> is
          valid.
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Redirecting you to the password reset form...
        </p>
        <div className="flex justify-center">
          <FiLoader
            className="animate-spin text-blue-600 dark:text-blue-400"
            size={24}
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordSent;
