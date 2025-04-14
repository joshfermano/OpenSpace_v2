import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [governmentId, setGovernmentId] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setGovernmentId(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't allow multiple submissions
    if (isSubmitting) return;

    // Validate form
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
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
      // Create FormData
      const formDataToSubmit = new FormData();

      // Add text fields
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('password', formData.password);
      formDataToSubmit.append('firstName', formData.firstName);
      formDataToSubmit.append('lastName', formData.lastName);
      formDataToSubmit.append('phoneNumber', formData.phoneNumber);

      // Add government ID if provided
      if (governmentId) {
        formDataToSubmit.append('governmentId', governmentId);
      }

      const response = await register(formDataToSubmit);

      if (response.success) {
        // Redirect to verification page
        navigate('/verification/email-verification');
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
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

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-xl shadow-lg md:w-[450px]">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Account
        </h1>
        <p className="text-md text-gray-500 dark:text-gray-400">
          Join OpenSpace to discover unique spaces
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
              placeholder="Juan"
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
              placeholder="Dela Cruz"
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
            placeholder="juandelacruz@example.com"
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

        {/* Government ID Upload (optional) */}
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="governmentId"
            className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Government ID (Optional - for verification)
          </label>
          <input
            type="file"
            id="governmentId"
            name="governmentId"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload a photo of your valid ID to verify your account and gain
            access to all features.
          </p>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="terms"
              className="font-medium text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <Link
                to="/legal/terms"
                className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/legal/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-3 rounded-lg bg-darkBlue text-light dark:bg-light dark:text-darkBlue hover:bg-blue-600 hover:text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
