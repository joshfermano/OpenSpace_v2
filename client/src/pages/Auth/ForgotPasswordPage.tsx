import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { authApi } from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authApi.requestPasswordReset(email);

      if (response.success) {
        setSubmitted(true);
      } else {
        throw new Error(response.message || 'Failed to request password reset');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMail className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If an account exists with{' '}
            <span className="font-medium">{email}</span>, we've sent password
            reset instructions to that address.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            The link in the email will expire in 10 minutes. If you don't see
            the email, please check your spam folder.
          </p>
          <div className="flex flex-col space-y-3">
            <Link
              to="/auth/login"
              className="px-6 py-2.5 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500 inline-block">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your email address and we will send you a link to reset your
            password
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <div className="flex items-start">
              <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" size={18} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-6 py-3 bg-darkBlue dark:bg-light ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600 hover:scale-105'
            } text-light dark:text-darkBlue dark:hover:text-light rounded-lg transition-all duration-500 flex items-center justify-center`}>
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin mr-2" /> Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="flex justify-center">
            <Link
              to="/auth/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              <FiArrowLeft className="mr-2" size={14} /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
