import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDownload,
  FiMessageSquare,
  FiPhone,
  FiInfo,
  FiWifi,
  FiMonitor,
  FiCoffee,
  FiSlack,
} from 'react-icons/fi';
import { GiSnowflake1, GiRoundTable } from 'react-icons/gi';
import { MdOutlineMeetingRoom, MdOutlineChair } from 'react-icons/md';
import { FaCar, FaRestroom, FaAccessibleIcon } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Receipt from '../../components/Receipt/Receipt';
import logo_black from '../../assets/logo_black.jpg';

const ViewBooking = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      // In a real app, you would fetch this data from your API
      try {
        // Mock data for demonstration
        if (user && user.bookings) {
          const foundBooking = user.bookings.find(
            (b: any) => b.id === bookingId
          );

          if (foundBooking) {
            // Get room details
            const mockRoom = {
              id: foundBooking.roomId,
              name: 'Executive Conference Room',
              description:
                'A spacious, modern conference room equipped with the latest technology for productive meetings.',
              location: 'BGC, Taguig City',
              images: [
                'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
              ],
              amenities: [
                'High-speed WiFi',
                'Projector and screen',
                'Whiteboard',
                'Air conditioning',
                'Coffee and tea service',
                'Restrooms',
                'Parking',
                'Wheelchair accessible',
                'Conference phone',
                'Tables and chairs for 12',
              ],
              hostName: 'Maria Santos',
              hostContact: '+63 919 123 4567',
              hostEmail: 'maria@example.com',
              cancellationPolicy:
                'Free cancellation up to 24 hours before check-in. After that, a 50% refund is available up to 12 hours before check-in.',
            };

            // Merge booking and room data
            setBooking({
              ...foundBooking,
              room: mockRoom,
              referenceNumber: `OS-${Math.floor(
                100000 + Math.random() * 900000
              )}`,
            });
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user, navigate]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status display with appropriate icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <FiCheckCircle className="mr-2" size={20} />,
          text: 'Confirmed',
          color:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        };
      case 'pending':
        return {
          icon: <FiAlertCircle className="mr-2" size={20} />,
          text: 'Pending',
          color:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
      case 'cancelled':
        return {
          icon: <FiXCircle className="mr-2" size={20} />,
          text: 'Cancelled',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
      case 'completed':
        return {
          icon: <FiCheckCircle className="mr-2" size={20} />,
          text: 'Completed',
          color:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        };
      default:
        return {
          icon: <FiInfo className="mr-2" size={20} />,
          text: status,
          color:
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
    }
  };

  // Function to get the appropriate icon for an amenity
  const getAmenityIcon = (amenity: string) => {
    amenity = amenity.toLowerCase();

    if (amenity.includes('wifi')) return <FiWifi />;
    if (
      amenity.includes('projector') ||
      amenity.includes('screen') ||
      amenity.includes('tv')
    )
      return <FiMonitor />;
    if (amenity.includes('coffee') || amenity.includes('tea'))
      return <FiCoffee />;
    if (amenity.includes('whiteboard')) return <FiSlack />;
    if (amenity.includes('air') || amenity.includes('ac'))
      return <GiSnowflake1 />;
    if (amenity.includes('restroom')) return <FaRestroom />;
    if (amenity.includes('parking')) return <FaCar />;
    if (amenity.includes('wheelchair') || amenity.includes('accessible'))
      return <FaAccessibleIcon />;
    if (amenity.includes('phone') || amenity.includes('conference'))
      return <FiPhone />;
    if (amenity.includes('table')) return <GiRoundTable />;
    if (amenity.includes('chair')) return <MdOutlineChair />;
    if (amenity.includes('room')) return <MdOutlineMeetingRoom />;

    return <FiCheckCircle />;
  };

  // Handle cancellation
  const handleCancelBooking = () => {
    // In a real app, you would send a cancellation request to your API
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      alert('Booking cancelled successfully');
      navigate('/dashboard');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center">
        <div className="animate-pulse text-blue-600 dark:text-blue-400">
          Loading...
        </div>
      </div>
    );
  }

  // Error state
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <FiInfo className="text-red-500 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find this booking in your account.
          </p>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-darkBlue text-white dark:bg-light dark:text-darkBlue font-medium rounded-lg hover:opacity-90 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusDisplay(booking.status);

  // Prepare receipt data
  const receiptData = {
    referenceNumber: booking.referenceNumber,
    bookingDetails: {
      roomName: booking.room.name,
      location: booking.room.location,
      checkInDate: formatDate(booking.startDate),
      checkOutDate: formatDate(booking.endDate),
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      numberOfDays: Math.ceil(
        (new Date(booking.endDate).getTime() -
          new Date(booking.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      subtotal: booking.totalPrice * 0.85, // Mock calculation - service fee is 15%
      serviceFee: booking.totalPrice * 0.15,
      total: booking.totalPrice,
    },
    paymentMethod: booking.paymentMethod || 'card',
    date: new Date(booking.bookingDate || Date.now()).toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    ),
    time: new Date(booking.bookingDate || Date.now()).toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    ),
    companyLogo: logo_black,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:underline">
          <FiChevronLeft className="mr-2" /> Back to Dashboard
        </Link>

        {/* Page Title with Status */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Booking Details
          </h1>
          <div
            className={`flex items-center px-4 py-2 rounded-full ${status.color}`}>
            {status.icon}
            <span className="font-medium">{status.text}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2">
            {/* Room Images */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="relative h-64 md:h-72 bg-gray-200 dark:bg-gray-700">
                {booking.room.images && booking.room.images.length > 0 ? (
                  <img
                    src={booking.room.images[0]}
                    alt={booking.room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {booking.room.name}
                </h2>
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                  <FiMapPin className="mr-2" />
                  {booking.room.location}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {booking.room.description}
                </p>

                {/* Booking Dates & Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiCalendar className="text-blue-500 mr-2" />
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Check-in
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {formatDate(booking.startDate)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">
                      {booking.checkInTime}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FiCalendar className="text-blue-500 mr-2" />
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Check-out
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {formatDate(booking.endDate)}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">
                      {booking.checkOutTime}
                    </p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {booking.room.amenities.map(
                      (amenity: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center text-gray-700 dark:text-gray-300">
                          <span className="mr-2 text-blue-500">
                            {getAmenityIcon(amenity)}
                          </span>
                          {amenity}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <FiInfo className="mr-2 text-blue-500" />
                    Cancellation Policy
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {booking.room.cancellationPolicy ||
                      'Please contact the host for cancellation policy details.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Booking Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Reference number
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {booking.referenceNumber}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Booking date
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(
                      booking.bookingDate || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Space type
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    Meeting Space
                  </span>
                </div>

                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Payment status
                    </span>
                    <span className="capitalize text-gray-900 dark:text-white">
                      {booking.paymentStatus || 'Paid'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Payment method
                    </span>
                    <span className="capitalize text-gray-900 dark:text-white">
                      {booking.paymentMethod || 'Credit Card'}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ₱{(booking.totalPrice * 0.85).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Service fee
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ₱{(booking.totalPrice * 0.15).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-medium pt-2 border-t  dark:text-light border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>₱{booking.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowReceipt(true)}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-darkBlue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-light dark:text-darkBlue dark:hover:bg-gray-200 transition-colors">
                  <FiDownload className="mr-2" />
                  View & Download Receipt
                </button>

                {/* Only show cancel button if booking is not already cancelled or completed */}
                {booking.status !== 'cancelled' &&
                  booking.status !== 'completed' && (
                    <button
                      onClick={handleCancelBooking}
                      className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-300 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors">
                      <FiXCircle className="mr-2" />
                      Cancel Booking
                    </button>
                  )}

                {/* Contact Host */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Host Information
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {booking.room.hostName}
                  </p>

                  <div className="flex space-x-2">
                    <a
                      href={`mailto:${booking.room.hostEmail}`}
                      className="flex items-center justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                      <FiMessageSquare className="mr-2" />
                      Message
                    </a>
                    <a
                      href={`tel:${booking.room.hostContact}`}
                      className="flex items-center justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                      <FiPhone className="mr-2" />
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Booking Receipt
              </h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <FiXCircle size={24} />
              </button>
            </div>
            <div className="p-4">
              <Receipt {...receiptData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBooking;
