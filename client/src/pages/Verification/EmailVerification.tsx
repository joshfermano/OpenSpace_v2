import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiRefreshCw,
} from 'react-icons/fi';
import { authApi } from '../../services/api';

const EmailVerification = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Function to handle OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user) {
      setMessage({
        type: 'error',
        text: 'Please log in to verify your email.',
      });
      return;
    }

    setLoading(true);
    setMessage({
      type: 'success',
      text: 'Attempting to send verification code...',
    });

    try {
      // Call API to send verification OTP (initial send)
      const response = await authApi.sendEmailVerificationOTP();

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Verification code sent! Please check your inbox and enter the code below.',
        });
        setOtpSent(true);
        // Reset retry count on successful send
        setRetryCount(0);

        // Redirect to email sent page for better UX
        navigate('/verification/email-sent');
      } else {
        const errorMessage = response.details
          ? `${response.message}: ${response.details}`
          : response.message ||
            'Failed to send verification code. Please try again.';

        setMessage({
          type: 'error',
          text: errorMessage,
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text:
          error.message ||
          'Failed to send verification email. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!user) return;

    setLoading(true);
    setMessage({
      type: 'success',
      text: 'Attempting to resend verification code...',
    });

    try {
      // Increment retry count
      setRetryCount((prev) => prev + 1);

      // Use the resend endpoint for subsequent sends
      const response = await authApi.resendEmailVerification();

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Verification code resent! Please check your inbox.',
        });
      } else {
        const errorMessage = response.details
          ? `${response.message}: ${response.details}`
          : response.message || 'Failed to resend verification code.';

        setMessage({
          type: 'error',
          text: errorMessage,
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text:
          error.message ||
          'An error occurred while resending the verification code.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !otp || otp.length !== 6) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid 6-digit verification code',
      });
      return;
    }

    setVerifying(true);
    try {
      // Call your API to verify the OTP
      const response = await authApi.verifyEmailWithOTP(otp);

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Email verified successfully!',
        });

        // Refresh user data to get updated verification status
        await refreshUser();

        // Redirect after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to verify email');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Invalid verification code. Please try again.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const getTroubleshootingTips = useCallback(() => {
    // Show more detailed troubleshooting tips if multiple retries
    if (retryCount >= 2) {
      return (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mt-4 text-sm">
          <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">
            Troubleshooting Tips:
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-300">
            <li>Check your spam/junk folder for the verification email</li>
            <li>Make sure your email address is correct</li>
            <li>Add our domain to your safe senders list</li>
            <li>
              If you're still having trouble, try using a different email
              address or contact support
            </li>
          </ul>
        </div>
      );
    }
    return null;
  }, [retryCount]);

  if (user?.isEmailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <FiCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Email Already Verified
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your email has already been verified. Thank you!
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-2.5 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md w-full">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {message.text}
          </div>
        )}

        <div className="text-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMail className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We need to verify your email address to complete your account setup
          </p>
        </div>

        {!otpSent ? (
          <>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <FiAlertCircle
                  className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
                  size={18}
                />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We'll send a verification code to{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </span>
                    . Enter the code below to verify your address.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSendVerificationEmail}
              disabled={loading}
              className="w-full px-6 py-3 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500 flex items-center justify-center">
              {loading ? (
                <>
                  <FiRefreshCw className="mr-2 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <FiMail className="mr-2" /> Send Verification Code
                </>
              )}
            </button>
          </>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit code"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
                required
              />
              {otp && otp.length < 6 && (
                <p className="text-xs text-amber-500 mt-1">
                  Please enter all 6 digits of the verification code
                </p>
              )}
            </div>

            {getTroubleshootingTips()}

            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className={`w-full px-6 py-3 bg-darkBlue dark:bg-light ${
                verifying || otp.length !== 6
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-600 hover:scale-105'
              } text-light dark:text-darkBlue dark:hover:text-light rounded-lg transition-all duration-500 flex items-center justify-center`}>
              {verifying ? (
                <>
                  <FiRefreshCw className="mr-2 animate-spin" /> Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>

            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={handleResendVerificationEmail}
                disabled={loading}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                {loading ? (
                  <>
                    <FiRefreshCw className="mr-1 animate-spin" size={14} />{' '}
                    Sending...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="mr-1" size={14} /> Resend Code
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center">
                <FiArrowLeft className="mr-1" size={14} /> Back
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 text-center">
          <Link
            to="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            I'll do this later
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
