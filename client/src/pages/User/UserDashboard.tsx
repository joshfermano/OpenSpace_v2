import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiHome, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/userApi'; // Fixed API import path
import { bookingApi } from '../../services/bookingApi';
import UserHeader from '../../components/User Dashboard/UserHeader';
import UserBookings from '../../components/User Dashboard/UserBookings';
import UserListings from '../../components/User Dashboard/UserListings';
import UserFavorites from '../../components/User Dashboard/UsersFavorites';
import HostBookingsLink from '../../components/Host/HostBookingsLink'; // Added missing import

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
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (!user) {
          navigate('/auth/login');
          return;
        }

        // Fetch user dashboard data
        const dashboardResponse = await userApi.getUserDashboard();

        if (dashboardResponse.success && dashboardResponse.data) {
          const combinedUserData: ExtendedUser = {
            ...user,
            ...dashboardResponse.data.user,
            phoneNumber:
              dashboardResponse.data.user.phoneNumber || user.phoneNumber || '',
            dateJoined:
              dashboardResponse.data.user.createdAt || new Date().toISOString(),
          };

          setUserData(combinedUserData);
        } else {
          setUserData({
            ...(user as ExtendedUser),
            phoneNumber: user.phoneNumber || '',
            dateJoined: user.createdAt || new Date().toISOString(),
          });
        }

        // Fetch user bookings
        const bookingsResponse = await bookingApi.getUserBookings();
        if (bookingsResponse.success && bookingsResponse.data) {
          // Map the API response to match our Booking interface
          const formattedBookings = bookingsResponse.data.map(
            (booking: any) => ({
              id: booking._id,
              roomId: booking.room._id,
              startDate: booking.checkIn,
              endDate: booking.checkOut,
              checkInTime: booking.checkInTime || '2:00 PM',
              checkOutTime: booking.checkOutTime || '12:00 PM',
              totalPrice: booking.totalPrice,
              paymentStatus: booking.paymentStatus,
              status: booking.bookingStatus,
            })
          );
          setBookings(formattedBookings);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (user) {
          setUserData({
            ...(user as ExtendedUser),
            phoneNumber: user.phoneNumber || '',
            dateJoined: user.createdAt || new Date().toISOString(),
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate, refreshUser]);

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
        {userData && <UserHeader userData={userData} />}

        {/* Tabs */}
        <div className="flex mt-8 mb-8 border-b border-gray-200 dark:border-gray-700">
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
        {activeTab === 'bookings' && <UserBookings bookings={bookings} />}

        {activeTab === 'listings' && <UserListings userData={userData} />}

        {activeTab === 'favorites' && <UserFavorites />}

        {user?.role === 'host' && <HostBookingsLink />}
      </div>
    </div>
  );
};

export default UserDashboard;
