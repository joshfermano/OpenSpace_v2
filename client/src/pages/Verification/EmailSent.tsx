import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiArrowLeft,
  FiRefreshCw,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

const EmailSent = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendMessage, setResendMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        navigate('/auth/login', { replace: true });
      }
    };

    checkAuth();
  }, [user, navigate]);

  // Function to handle OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (isResending) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      console.log('Attempting to resend verification email');

      // Use the email from the user context instead of localStorage
      if (!user || !user.email) {
        throw new Error('User email not found. Please log in again.');
      }

      // Use authApi instead of direct fetch
      const response = await authApi.resendEmailVerification();
      console.log('Resend OTP response:', response);

      if (response.success) {
        setResendMessage({
          type: 'success',
          text: 'Verification code resent! Please check your inbox.',
        });
      } else {
        throw new Error(
          response.message || 'Failed to resend verification code'
        );
      }
    } catch (error) {
      console.error('Error during resend:', error);
      setResendMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'An error occurred while resending the verification code. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setResendMessage({
        type: 'error',
        text: 'Please enter a valid 6-digit verification code',
      });
      return;
    }

    setIsVerifying(true);
    setResendMessage(null);

    try {
      console.log('Sending OTP verification request with code:', otp);
      const response = await authApi.verifyEmailWithOTP(otp);
      console.log('OTP verification response:', response);

      if (response.success) {
        setResendMessage({
          type: 'success',
          text: 'Email verified successfully! Refreshing your user data...',
        });

        // Wait a moment before refreshing user data
        setTimeout(async () => {
          try {
            // Refresh user data to update email verification status
            await refreshUser();
            setResendMessage({
              type: 'success',
              text: 'Email verified successfully! Redirecting to dashboard...',
            });

            // Wait another moment before redirecting
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } catch (refreshError) {
            console.error('Error refreshing user data:', refreshError);
            setResendMessage({
              type: 'error',
              text: 'Email verified but failed to refresh user data. Please try logging in again.',
            });
          }
        }, 1000);
      } else {
        setResendMessage({
          type: 'error',
          text:
            response.message || 'Invalid verification code. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setResendMessage({
        type: 'error',
        text: 'An error occurred while verifying the code. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMail className="text-green-600 dark:text-green-400" size={32} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Email Sent!
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent a verification email to{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {user?.email}
          </span>
          . Please check your inbox and enter the 6-digit code below to verify
          your email address.
        </p>

        {resendMessage && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              resendMessage.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {resendMessage.text}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="mb-6">
          <div className="mb-4">
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-1">
              Enter Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit code"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-center text-lg letter-spacing-wide"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className={`w-full mb-4 px-6 py-2.5 flex items-center justify-center bg-blue-600 text-white rounded-lg 
              ${
                isVerifying || otp.length !== 6
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              } 
              transition-all duration-300`}>
            {isVerifying ? (
              <>
                <FiRefreshCw className="animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <FiCheckCircle className="mr-2" />
                Verify Email
              </>
            )}
          </button>
        </form>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Didn't receive the email?
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Verify that you entered the correct email address</li>
            <li>Wait a few minutes and check again</li>
            <li>Click the resend button below to request a new code</li>
          </ul>
        </div>

        <button
          onClick={handleResendVerificationEmail}
          disabled={isResending}
          className="w-full mb-4 px-6 py-2.5 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300">
          {isResending ? (
            <>
              <FiRefreshCw className="animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <FiRefreshCw className="mr-2" />
              Resend Verification Code
            </>
          )}
        </button>

        <div className="flex flex-col space-y-3">
          <Link
            to="/dashboard"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300">
            Go Back to Verification
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center justify-center px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailSent;
