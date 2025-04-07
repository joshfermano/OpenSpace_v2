import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

const AdminRegister = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages when user types
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't allow multiple submissions
    if (isSubmitting) return;

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove confirmPassword as it's not needed for API
      const { confirmPassword, ...registerData } = formData;

      // Add role=admin to the data
      const userData = {
        ...registerData,
        role: 'admin',
        phoneNumber: registerData.phone, // Ensure correct property name
      };

      console.log('Creating admin with data:', userData);

      // Call custom admin registration endpoint
      const response = await authApi.createAdmin(userData);

      setSuccess(
        `Admin account for ${response.user.email} created successfully!`
      );

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setError(
        error.message || 'Failed to create admin account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [passwordFocus, setPasswordFocus] = useState(false);
  const passwordHasUppercase = /[A-Z]/.test(formData.password);
  const passwordHasNumber = /[0-9]/.test(formData.password);
  const passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const passwordHasLength = formData.password.length >= 8;
  const passwordsMatch =
    formData.password === formData.confirmPassword && formData.password !== '';

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-xl shadow-lg md:w-[450px]">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Admin Account
        </h1>
        <p className="text-md text-gray-500 dark:text-gray-400">
          Register a new administrator for OpenSpace
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center space-y-6">
        {error && (
          <div
            className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <span className="block sm:inline">{error}</span>
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
              placeholder="Admin"
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
              placeholder="User"
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
            placeholder="admin@openspace.com"
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="+63 917 000 0000"
            disabled={isSubmitting}
            required
          />
        </div>

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

        {/* Admin Security Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg text-xs text-yellow-700 dark:text-yellow-300">
          <p className="font-medium mb-1">Security Notice:</p>
          <p>
            Admin accounts have full system access. Ensure this account is only
            given to trusted personnel. All admin actions are logged for
            security purposes.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-3 rounded-lg bg-darkBlue text-light dark:bg-light dark:text-darkBlue hover:bg-blue-600 hover:text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Creating Admin Account...' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  );
};

export default AdminRegister;
