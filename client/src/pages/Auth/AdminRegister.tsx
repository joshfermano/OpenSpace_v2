import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { FiAlertCircle, FiLock } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

const AdminRegister = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    setupCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  // Password validation
  const [passwordFocus, setPasswordFocus] = useState(false);
  const passwordHasUppercase = /[A-Z]/.test(formData.password);
  const passwordHasNumber = /[0-9]/.test(formData.password);
  const passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const passwordHasLength = formData.password.length >= 8;
  const passwordsMatch =
    formData.password === formData.confirmPassword && formData.password !== '';

  useEffect(() => {
    const checkInitialSetup = async () => {
      try {
        const response = await authApi.checkAdminExists();
        setIsInitialSetup(!response.adminExists);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsInitialSetup(false);
      }
    };

    checkInitialSetup();
  }, []);

  // Check if non-admin is trying to access
  useEffect(() => {
    if (user && user.role !== 'admin' && !isInitialSetup) {
      navigate('/admin/login');
    }
  }, [user, navigate, isInitialSetup]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate form
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (
      !passwordHasLength ||
      !passwordHasUppercase ||
      !passwordHasNumber ||
      !passwordHasSpecial
    ) {
      setError('Password does not meet the security requirements');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const adminData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        setupCode: formData.setupCode,
      };

      const response = isInitialSetup
        ? await authApi.initialAdminSetup(adminData)
        : await authApi.createAdmin(adminData);

      if (response.success) {
        setSuccess('Admin account created successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          setupCode: '',
        });
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (error: any) {
      setError(
        error.message || 'Failed to create admin account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isInitialSetup
            ? 'Setup First Admin Account'
            : 'Create Admin Account'}
        </h1>
        <p className="text-md text-gray-500 dark:text-gray-400">
          {isInitialSetup
            ? 'Create your first administrator account'
            : 'Create a new administrator account'}
        </p>
      </div>

      {isInitialSetup && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="flex items-start">
            <FiLock className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              This is a one-time setup for creating the first admin account.
              After this, all admin accounts must be created by an existing
              admin.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center space-y-6">
        {error && (
          <div
            className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <span className="flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* First and Last name row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="John"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Doe"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="admin@example.com"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone
          </label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="+63 917 000 0000"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Setup Code - Only shown during initial setup */}
        {isInitialSetup && (
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="setupCode"
              className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Setup Code
            </label>
            <input
              type="text"
              name="setupCode"
              id="setupCode"
              value={formData.setupCode}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter the setup code from your .env file"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500">
              This is the ADMIN_SETUP_CODE value from your server's environment
              variables
            </p>
          </div>
        )}

        {/* Password */}
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10"
              placeholder="••••••••"
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </button>
          </div>

          {/* Password requirements - shows when password field is focused */}
          {passwordFocus && (
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

        {/* Confirm Password */}
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full border ${
                formData.confirmPassword && !passwordsMatch
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                formData.confirmPassword && !passwordsMatch
                  ? 'focus:ring-red-500'
                  : 'focus:ring-blue-500'
              } transition-all pr-10`}
              placeholder="••••••••"
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              {showConfirmPassword ? (
                <IoMdEyeOff size={20} />
              ) : (
                <IoMdEye size={20} />
              )}
            </button>
          </div>
          {formData.confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Creating Admin...' : 'Create Admin Account'}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Link
              to="/admin/dashboard"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Back to admin dashboard
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AdminRegister;
