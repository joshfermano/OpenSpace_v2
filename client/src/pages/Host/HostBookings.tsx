import { Link } from 'react-router-dom';
import { FiCalendar, FiHome } from 'react-icons/fi';

interface EmptyStateProps {
  statusFilter: string;
}

const EmptyState = ({ statusFilter }: EmptyStateProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
      <FiCalendar className="text-blue-500 w-16 h-16 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        No Bookings Found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {statusFilter === 'all'
          ? "You don't have any bookings yet."
          : `You don't have any ${statusFilter} bookings.`}
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-darkBlue dark:bg-light text-light dark:text-darkBlue rounded-lg hover:opacity-90 inline-flex items-center">
        <FiHome className="mr-2" /> View Your Listings
      </Link>
    </div>
  );
};

export default EmptyState;
