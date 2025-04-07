import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
    setError(null);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const loggedInUser = await login(formData.email, formData.password);

      if (loggedInUser) {
        if (loggedInUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          setError('Access denied. Only administrators can log in here.');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (error: any) {
      setError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-xl shadow-lg md:w-[450px]">
      <div className="flex flex-col items-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Login
        </h1>
        <p className="text-md text-gray-500 dark:text-gray-400">
          Sign in to access the admin portal
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

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Admin Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleEmailChange}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="admin@openspace.com"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={formData.password}
              onChange={handlePasswordChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10"
              placeholder="••••••••"
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={handleShowPassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="w-full p-3 rounded-lg bg-gray-800 text-white dark:bg-gray-700 dark:text-white hover:bg-gray-700 font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting || isLoading ? 'Signing in...' : 'Admin Sign In'}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Not an admin?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Back to regular login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
