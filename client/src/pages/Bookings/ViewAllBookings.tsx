import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiLoader,
  FiCalendar,
  FiFilter,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiCheck,
} from 'react-icons/fi';
import { GoSortAsc } from 'react-icons/go';
import { bookingApi } from '../../services/bookingApi';
import UserBookings from '../../components/User Dashboard/UserBookings';

interface Booking {
  id: string;
  roomId: string;
  roomTitle: string;
  roomImage: string | null;
  startDate: string;
  endDate: string;
  checkInTime: string;
  checkOutTime: string;
  totalPrice: number;
  paymentStatus: string;
  status: string;
  createdAt?: string;
}

type StatusFilter =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected';

type SortOption = 'newest' | 'oldest';

const ViewAllBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingApi.getUserBookings();
        if (response.success) {
          // Map the API response to match our Booking interface
          const formattedBookings = response.data.map((booking: any) => ({
            id: booking._id,
            roomId: booking.room?._id || 'Unavailable',
            roomTitle: booking.room?.title || 'Room',
            roomImage: booking.room?.images?.[0] || null,
            startDate: booking.checkIn,
            endDate: booking.checkOut,
            checkInTime: booking.checkInTime || '2:00 PM',
            checkOutTime: booking.checkOutTime || '12:00 PM',
            totalPrice: booking.totalPrice,
            paymentStatus: booking.paymentStatus,
            status: booking.bookingStatus,
            createdAt: booking.createdAt || new Date().toISOString(),
          }));
          setBookings(formattedBookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Apply filter and sorting when activeFilter or sortBy changes
  useEffect(() => {
    let filtered = [...bookings];

    // First apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === activeFilter);
    }

    // Then sort the filtered results
    filtered = sortBookings(filtered, sortBy);

    setFilteredBookings(filtered);
  }, [activeFilter, sortBy, bookings]);

  const sortBookings = (
    bookingsToSort: Booking[],
    sortOption: SortOption
  ): Booking[] => {
    return [...bookingsToSort].sort((a, b) => {
      // Primary sort by check-in date
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();

      if (sortOption === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  };

  const handleFilterChange = (filter: StatusFilter) => {
    setActiveFilter(filter);
    if (window.innerWidth < 768) {
      setIsFilterOpen(false); // Close filter dropdown on mobile after selection
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setIsSortOpen(false);
  };

  const getStatusCount = (status: StatusFilter): number => {
    if (status === 'all') return bookings.length;
    return bookings.filter((booking) => booking.status === status).length;
  };

  const renderSortLabel = () => {
    if (sortBy === 'newest') {
      return (
        <>
          <FiArrowDown className="mr-1" />
          <span>Newest First</span>
        </>
      );
    } else {
      return (
        <>
          <FiArrowUp className="mr-1" />
          <span>Oldest First</span>
        </>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader
            size={40}
            className="text-darkBlue dark:text-light animate-spin mb-4"
          />
          <p className="text-gray-600 dark:text-gray-300">
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-4 md:mb-0 hover:underline">
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
              Your Bookings
            </h1>
          </div>

          {/* Mobile Control Buttons */}
          <div className="md:hidden mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <FiFilter className="mr-2" />
              {activeFilter !== 'all' ? `${activeFilter}` : 'Filter'}
            </button>

            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <GoSortAsc className="mr-2" />
              {sortBy === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>

        {/* Mobile Filter Dropdown */}
        {isFilterOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50">
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Filter Bookings
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiX className="text-gray-500 dark:text-gray-400" size={24} />
                </button>
              </div>

              <div className="space-y-2">
                {(
                  [
                    'all',
                    'pending',
                    'confirmed',
                    'completed',
                    'cancelled',
                    'rejected',
                  ] as StatusFilter[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange(status)}
                    className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                      activeFilter === status
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    <span className="capitalize">{status}</span>
                    <span className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 text-xs rounded-full py-1 px-2">
                      {getStatusCount(status)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sort Options Dropdown */}
        {isSortOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50">
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sort By Date
                </h3>
                <button
                  onClick={() => setIsSortOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiX className="text-gray-500 dark:text-gray-400" size={24} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                  <div className="flex items-center">
                    <FiArrowDown className="mr-2" />
                    <span>Newest First</span>
                  </div>
                  {sortBy === 'newest' && <FiCheck className="text-blue-500" />}
                </button>

                <button
                  onClick={() => handleSortChange('oldest')}
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${
                    sortBy === 'oldest'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                  <div className="flex items-center">
                    <FiArrowUp className="mr-2" />
                    <span>Oldest First</span>
                  </div>
                  {sortBy === 'oldest' && <FiCheck className="text-blue-500" />}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          {/* Desktop Filter Tabs */}
          <div className="hidden md:flex border-b border-gray-200 dark:border-gray-700">
            {(
              [
                'all',
                'pending',
                'confirmed',
                'completed',
                'cancelled',
                'rejected',
              ] as StatusFilter[]
            ).map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
                  activeFilter === status
                    ? 'border-darkBlue dark:border-light text-darkBlue dark:text-light'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                <span className="capitalize">{status}</span>
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded-full py-1 px-2">
                  {getStatusCount(status)}
                </span>
              </button>
            ))}
          </div>

          {/* Desktop Sort Dropdown */}
          <div className="hidden md:block relative">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                Sort by:
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                  <FiClock className="mr-2" />
                  {renderSortLabel()}
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleSortChange('newest')}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortBy === 'newest'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}>
                      <div className="flex items-center">
                        <FiArrowDown className="mr-2" />
                        <span>Newest First</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSortChange('oldest')}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortBy === 'oldest'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}>
                      <div className="flex items-center">
                        <FiArrowUp className="mr-2" />
                        <span>Oldest First</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Results */}
        {filteredBookings.length > 0 ? (
          <UserBookings bookings={filteredBookings} showAll={true} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900 flex items-center justify-center">
              <FiCalendar
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {activeFilter !== 'all' && activeFilter} bookings found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {activeFilter === 'all'
                ? "You don't have any bookings yet."
                : `You don't have any ${activeFilter} bookings.`}
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                Show all bookings
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllBookings;
