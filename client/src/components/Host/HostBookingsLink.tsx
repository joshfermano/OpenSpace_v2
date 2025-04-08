import { Link } from 'react-router-dom';
import { FiCalendar, FiChevronRight } from 'react-icons/fi';

const HostBookingsLink = () => {
  return (
    <div className="bg-white mt-10 dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Host Bookings
        </h2>
        <Link
          to="/host/bookings"
          className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:underline">
          View All <FiChevronRight className="ml-1" />
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start md:items-center mb-4 md:mb-0">
          <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full mr-4 flex-shrink-0">
            <FiCalendar
              className="text-blue-600 dark:text-blue-300"
              size={24}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Manage Guest Bookings
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              View, confirm, and manage bookings for your spaces
            </p>
          </div>
        </div>
        <Link
          to="/host/bookings"
          className="w-full md:w-auto text-center md:text-left px-4 py-2 bg-darkBlue dark:bg-light text-white dark:text-darkBlue rounded-lg hover:opacity-90 transition-colors flex items-center justify-center">
          Go to Bookings
        </Link>
      </div>
    </div>
  );
};

export default HostBookingsLink;
