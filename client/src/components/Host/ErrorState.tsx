import { Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:underline">
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <FiAlertCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Bookings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-darkBlue dark:bg-light text-light dark:text-darkBlue rounded-lg hover:opacity-90 flex items-center justify-center mx-auto">
            <FiRefreshCw className="mr-2" /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
