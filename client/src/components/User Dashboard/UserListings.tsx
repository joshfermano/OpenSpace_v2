import { Link } from 'react-router-dom';
import { FiHome, FiMap, FiEdit2 } from 'react-icons/fi';
import { FaPesoSign } from 'react-icons/fa6';

interface HostInfo {
  bio?: string;
  languagesSpoken?: string[];
  responseRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
  hostSince?: Date;
}

interface User {
  _id: string;
  role: 'user' | 'host' | 'admin';
  hostInfo?: HostInfo;
}

interface UserListingsProps {
  userData: User;
}

const UserListings = ({ userData }: UserListingsProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Listings
        </h2>
        {userData.role === 'host' && (
          <div className="flex space-x-2">
            <Link
              to="/rooms/create"
              className="inline-flex items-center px-2 py-1 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
              <span className="text-lg mr-1">+</span> New Listing
            </Link>
            <Link
              to="/dashboard/earnings"
              className="inline-flex items-center px-2 py-1 bg bg-darkBlue text-light dark:bg-light dark:text-darkBlue hover:text-light hover:bg-green-500 rounded-lg hover:scale-105 transition-all duration-500">
              <FaPesoSign className="mr-1" /> View Earnings
            </Link>
          </div>
        )}
      </div>

      {userData.role !== 'host' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 dark:bg-purple-900 flex items-center justify-center">
            <FiHome
              className="text-purple-600 dark:text-purple-400"
              size={24}
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Become a host
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Share your space and start earning.
          </p>
          <Link
            to="/become-host"
            className="inline-flex items-center px-4 py-2 bg-darkBlue dark:bg-light hover:bg-purple-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
            Learn More
          </Link>
        </div>
      ) : userData.hostInfo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mock listings since we don't have actual host listings data */}
          {/* You would replace this with actual listings data from the host */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
              <div className="absolute top-3 left-3 bg-white dark:bg-gray-800 text-sm font-medium px-2 py-1 rounded-lg">
                Active
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Beachfront Conference Room
              </h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <FiMap className="mr-1" /> Boracay, Aklan
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Price
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ₱2,500 / hour
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to="/rooms/edit/1"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <FiEdit2 size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
              <div className="absolute top-3 left-3 bg-white dark:bg-gray-800 text-sm font-medium px-2 py-1 rounded-lg">
                Active
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                City View Meeting Room
              </h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <FiMap className="mr-1" /> Makati, Metro Manila
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Price
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ₱1,800 / hour
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to="/rooms/edit/2"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <FiEdit2 size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 dark:bg-purple-900 flex items-center justify-center">
            <FiHome
              className="text-purple-600 dark:text-purple-400"
              size={24}
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Complete your host profile
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You need to complete your host profile before creating listings.
          </p>
          <Link
            to="/profile/edit"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Complete Profile
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserListings;
