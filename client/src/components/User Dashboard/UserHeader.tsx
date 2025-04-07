import { FiUser, FiEdit2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface HostInfo {
  bio?: string;
  languagesSpoken?: string[];
  responseRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
  hostSince?: Date;
}

interface UserHeaderProps {
  userData: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
    role: 'user' | 'host' | 'admin';
    dateJoined: string;
    verificationLevel: string;
    bookings?: any[];
    hostInfo?: HostInfo;
  };
}

const UserHeader = ({ userData }: UserHeaderProps) => {
  const getProfileImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
      return imagePath;
    }

    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header Background */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-gray-200 dark:from-blue-400 dark:to-gray-800"></div>

      <div className="p-4">
        <div className="flex flex-col py-2 md:flex-row md:justify-between items-center px-6">
          {/* Profile */}
          <div className="flex flex-col items-center md:flex-row gap-4 p-4">
            <div className="rounded-full w-[120px] h-[120px] md:w-[180px] md:h-[180px] overflow-hidden">
              {userData.profileImage ? (
                <img
                  src={getProfileImageUrl(userData.profileImage) || undefined}
                  alt={userData.firstName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  <FiUser size={48} />
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="flex flex-col text-center md:text-left md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  {userData.firstName} {userData.lastName}
                  <span
                    className={`ml-3 text-xs font-normal px-2 py-1 rounded-full 
                ${
                  userData.verificationLevel === 'verified'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                    {userData.verificationLevel}
                  </span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {userData.role === 'host' ? 'Host' : 'Member'} · Joined{' '}
                  {new Date(userData.dateJoined).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/profile/edit"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
            <FiEdit2 className="mr-2" /> Edit Profile
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {userData.email}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Phone</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {userData.phoneNumber || 'Not provided'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Status</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {userData.verificationLevel}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Bookings</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {userData.bookings?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
