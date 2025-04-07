import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiCalendar,
  FiHome,
  FiEdit2,
  FiMap,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiHeart,
} from 'react-icons/fi';
import { FaPesoSign } from 'react-icons/fa6';
import { useAuth } from '../../contexts/AuthContext';
import { rooms } from '../../config/rooms';
import { userApi } from '../../services/api';

interface Booking {
  id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  checkInTime: string;
  checkOutTime: string;
  totalPrice: number;
  paymentStatus: string;
  status: string;
}

interface HostInfo {
  bio?: string;
  languagesSpoken?: string[];
  responseRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
  hostSince?: Date;
}

interface ExtendedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  role: 'user' | 'host' | 'admin';
  dateJoined: string;
  verificationLevel: 'none' | 'basic' | 'verified';
  isGovernmentIdVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hostInfo?: HostInfo;
  bookings?: Booking[];
  favorites?: string[];
  createdAt?: string; // Added for dateJoined fallback
}

const UserDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'bookings' | 'listings' | 'favorites'
  >('bookings');
  const [loading, setLoading] = useState(true);

  // Get favorite rooms based on user's favorites array
  const favoriteRooms = userData?.favorites
    ? rooms.filter((room) => userData.favorites?.includes(room.id.toString()))
    : [];

  // Fetch user dashboard data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // First check if we have the user from auth context
        if (!user) {
          navigate('/auth/login');
          return;
        }

        // Fetch more detailed user data from the dashboard endpoint
        const response = await userApi.getUserDashboard();

        if (response.success && response.data) {
          // Combine data from auth context and dashboard response
          const combinedUserData: ExtendedUser = {
            ...user,
            ...response.data.user,
            // Use existing user data as fallback
            phoneNumber:
              response.data.user.phoneNumber || user.phoneNumber || '',
            dateJoined:
              response.data.user.createdAt || new Date().toISOString(),
            // Add any other properties from dashboard response
            bookings: response.data.bookings || [],
            favorites: response.data.favorites || [],
          };

          setUserData(combinedUserData);
        } else {
          setUserData({
            ...(user as ExtendedUser),
            phoneNumber: user.phoneNumber || '',
            dateJoined: user.createdAt || new Date().toISOString(),
            bookings: [],
            favorites: [],
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Still use basic user data on error
        if (user) {
          setUserData({
            ...(user as ExtendedUser),
            phoneNumber: user.phoneNumber || '',
            dateJoined: user.createdAt || new Date().toISOString(),
            bookings: [],
            favorites: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate, refreshUser]);

  // Format status with appropriate icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center text-green-600 dark:text-green-400">
            <FiCheckCircle className="mr-1" /> Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center text-yellow-600 dark:text-yellow-400">
            <FiAlertCircle className="mr-1" /> Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center text-red-600 dark:text-red-400">
            <FiXCircle className="mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center text-blue-600 dark:text-blue-400">
            <FiCheckCircle className="mr-1" /> {status}
          </span>
        );
    }
  };

  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    // If same month and year
    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      const endDay = `${end.getDate()}`;
      const endYear = `${end.getFullYear()}`;
      return `${startFormatted} - ${endDay}, ${endYear}`;
    }

    // If different month or year
    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300">
          Please{' '}
          <Link
            to="/auth/login"
            className="text-blue-600 dark:text-blue-400 underline">
            log in
          </Link>{' '}
          to view your dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* User Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={`${userData.firstName} ${userData.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    <FiUser size={48} />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                <div
                  className={`w-4 h-4 rounded-full ${
                    userData.role === 'host' ? 'bg-purple-500' : 'bg-green-500'
                  }`}></div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {userData.firstName} {userData.lastName}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {userData.role === 'host' ? 'Host' : 'Member'} · Joined{' '}
                    {new Date(userData.dateJoined).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Link
                  to="/profile/edit"
                  className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
                  <FiEdit2 className="mr-2" /> Edit Profile
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {userData.email}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Phone
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {userData.phoneNumber || 'Not provided'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Status
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {userData.verificationLevel}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Bookings
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {userData.bookings?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('bookings')}>
            <span className="flex items-center">
              <FiCalendar className="mr-2" /> My Bookings
            </span>
          </button>

          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'listings'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('listings')}>
            <span className="flex items-center">
              <FiHome className="mr-2" /> My Listings
            </span>
          </button>

          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'favorites'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('favorites')}>
            <span className="flex items-center">
              <FiHeart className="mr-2" /> Favorites
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Bookings
            </h2>

            {userData.bookings && userData.bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.bookings.map((booking: Booking) => (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Room #{booking.roomId}
                        </h3>
                        {getStatusDisplay(booking.status)}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-start">
                          <FiCalendar className="mt-0.5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Date
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDateRange(
                                booking.startDate,
                                booking.endDate
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <FiClock className="mt-0.5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Time
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {booking.checkInTime} - {booking.checkOutTime}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <FaPesoSign className="mt-0.5 mr-2 text-gray-400" />
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">
                              Payment
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              ₱{booking.totalPrice.toLocaleString()} ·{' '}
                              <span className="text-gray-500 dark:text-gray-400 capitalize">
                                {booking.paymentStatus}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <Link
                          to={`/bookings/view/${booking.id}`}
                          className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900 flex items-center justify-center">
                  <FiCalendar
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven't booked any spaces yet.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
                  Explore Spaces
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
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
                  You need to complete your host profile before creating
                  listings.
                </p>
                <Link
                  to="/profile/edit"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Complete Profile
                </Link>
              </div>
            )}
          </div>
        )}

        {/* New Favorites Tab Content */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Favorite Spaces
            </h2>

            {favoriteRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="relative">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {room.images && room.images.length > 0 ? (
                          <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image available
                          </div>
                        )}
                      </div>
                      <button className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full text-red-500 hover:bg-white dark:hover:bg-gray-800">
                        <FiHeart className="fill-current" size={18} />
                      </button>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {room.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <FiMap className="mr-1" /> {room.location}
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Price
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ₱{room.price.toLocaleString()}
                            {room.category === 'Room Stay'
                              ? ' / night'
                              : ' / hour'}
                          </p>
                        </div>
                        <Link
                          to={`/rooms/${room.id}`}
                          className="px-3 py-1 bg-darkBlue text-light dark:bg-light dark:text-darkBlue rounded-lg hover:opacity-90 transition-colors text-sm font-medium">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                  <FiHeart
                    className="text-red-500 dark:text-red-400"
                    size={24}
                  />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No favorites yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start adding spaces to your favorites while browsing.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
                  Explore Spaces
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
