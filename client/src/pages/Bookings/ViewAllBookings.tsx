import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { bookingApi } from '../../services/bookingApi';
import UserBookings from '../../components/User Dashboard/UserBookings';

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

const ViewAllBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingApi.getUserBookings();
        if (response.success) {
          // Map the API response to match our Booking interface
          const formattedBookings = response.data.map((booking: any) => ({
            id: booking._id,
            roomId: booking.room._id,
            startDate: booking.checkIn,
            endDate: booking.checkOut,
            checkInTime: booking.checkInTime || '2:00 PM',
            checkOutTime: booking.checkOutTime || '12:00 PM',
            totalPrice: booking.totalPrice,
            paymentStatus: booking.paymentStatus,
            status: booking.bookingStatus,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse text-center">
            Loading your bookings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:underline">
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          All Your Bookings
        </h1>

        <UserBookings bookings={bookings} showAll={true} />
      </div>
    </div>
  );
};

export default ViewAllBookings;
