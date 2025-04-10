import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock } from 'react-icons/fi';
import Calendar from 'react-calendar';
import TimeSelector from './TimeSelector';
import { Link } from 'react-router-dom';

interface BookingPanelProps {
  room: any;
  roomId: string;
  isAuthenticated: boolean;
  unavailableDates: Date[];
}

const BookingPanel = ({
  room,
  roomId,
  isAuthenticated,
  unavailableDates,
}: BookingPanelProps) => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [showTimeSelector, setShowTimeSelector] = useState<
    'checkin' | 'checkout' | null
  >(null);
  const [bookingDetails, setBookingDetails] = useState({
    numberOfDays: 0,
    subtotal: 0,
    serviceFee: 0,
    total: 0,
  });

  // Time options for checkin/checkout
  const timeOptions = [
    '7:00 AM',
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
    '9:00 PM',
    '10:00 PM',
  ];

  // Set initial times based on room type when component mounts
  useEffect(() => {
    if (room) {
      if (room.type === 'stay') {
        // For Room Stay, use the host's specified check in/out times
        setCheckInTime(room.houseRules?.checkInTime || '2:00 PM');
        setCheckOutTime(room.houseRules?.checkOutTime || '12:00 PM');
      } else if (room.type === 'conference') {
        // For Conference Room, set default but allow user selection
        setCheckInTime('8:00 AM');
        setCheckOutTime('5:00 PM');
      } else if (room.type === 'event') {
        // For Events Place, set default but allow user selection
        setCheckInTime('10:00 AM');
        setCheckOutTime('10:00 PM');
      }
    }
  }, [room]);

  // Calculate booking details when date range changes
  useEffect(() => {
    if (dateRange[0] && dateRange[1] && room) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      const differenceInTime = endDate.getTime() - startDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      let subtotal = room.price?.basePrice || 0;

      // Calculate based on room type
      if (room.type === 'stay') {
        subtotal = subtotal * differenceInDays;
      } else if (room.type === 'conference') {
        // For conference rooms, price is per day
        subtotal = subtotal * differenceInDays;
      } else if (room.type === 'event') {
        // For events, price is per event (fixed)
        subtotal = subtotal;
      }

      const serviceFee = subtotal * 0.1; // 10% service fee
      const total = subtotal + serviceFee;

      setBookingDetails({
        numberOfDays: differenceInDays,
        subtotal,
        serviceFee,
        total,
      });
    }
  }, [dateRange, room]);

  // Check if the room type allows time selection
  const allowsTimeSelection = () => {
    if (!room) return false;
    return room.type === 'conference' || room.type === 'event';
  };

  // Disable past dates, today, and unavailable dates
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    // Disable dates in month and year view
    if (view !== 'month') return false;

    // Disable past dates and today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Disable unavailable dates
    return unavailableDates.some(
      (unavailableDate) =>
        date.getDate() === unavailableDate.getDate() &&
        date.getMonth() === unavailableDate.getMonth() &&
        date.getFullYear() === unavailableDate.getFullYear()
    );
  };

  // Custom class for calendar tiles
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';

    // For unavailable dates
    if (tileDisabled({ date, view })) {
      return 'unavailable-date';
    }

    return '';
  };

  const handleDateChange = (value: any) => {
    setDateRange(value);
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      // Redirect to login page with a return URL to come back to this room
      navigate(`/auth/login?redirect=/rooms/${roomId}`);
      return;
    }

    if (dateRange[0] && dateRange[1]) {
      // Format dates for display in payment page
      const formattedCheckInDate = formatDate(dateRange[0]);
      const formattedCheckOutDate = formatDate(dateRange[1]);

      // Always pass the selected or default times for the booking
      const finalCheckInTime =
        checkInTime ||
        (room.type === 'stay'
          ? room.houseRules?.checkInTime || '2:00 PM'
          : room.type === 'conference'
          ? '8:00 AM'
          : '10:00 AM');

      const finalCheckOutTime =
        checkOutTime ||
        (room.type === 'stay'
          ? room.houseRules?.checkOutTime || '12:00 PM'
          : room.type === 'conference'
          ? '5:00 PM'
          : '10:00 PM');

      navigate('/payment', {
        state: {
          bookingDetails: {
            roomId,
            roomName: room.title,
            roomType: room.type, // Add room type to use in payment page
            location: `${room.location.city}, ${room.location.country}`,
            checkInDate: formattedCheckInDate,
            checkOutDate: formattedCheckOutDate,
            checkInTime: finalCheckInTime,
            checkOutTime: finalCheckOutTime,
            numberOfDays: bookingDetails.numberOfDays,
            subtotal: bookingDetails.subtotal,
            serviceFee: bookingDetails.serviceFee,
            total: bookingDetails.total,
            roomImage:
              room.images && room.images.length > 0 ? room.images[0] : null,
            hostId: room.host._id,
            hostName: `${room.host.firstName} ${room.host.lastName}`,
          },
        },
      });
    }
  };
  // Format date to display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle time selection for flexible time options
  const handleTimeSelection = (
    timeType: 'checkin' | 'checkout',
    time: string
  ) => {
    if (timeType === 'checkin') {
      setCheckInTime(time);
    } else {
      setCheckOutTime(time);
    }
    setShowTimeSelector(null);
  };

  return (
    <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      {/* Price display */}
      <div className="flex items-baseline mb-6">
        <span className="text-2xl font-bold">
          ₱{room.price?.basePrice.toLocaleString()}
        </span>
        <span className="text-gray-600 dark:text-gray-400 ml-1">
          {room.type === 'stay'
            ? '/night'
            : room.type === 'conference'
            ? '/day'
            : '/event'}
        </span>
      </div>

      {/* Calendar for date selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <FiCalendar className="mr-2" />
          Select Dates
        </h3>
        <div className="calendar-container dark:text-darkBlue flex justify-center">
          <Calendar
            onChange={handleDateChange}
            value={dateRange}
            selectRange={true}
            tileDisabled={tileDisabled}
            tileClassName={tileClassName}
            className="w-full border-0 rounded-lg overflow-hidden"
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          * Red dates are unavailable
        </div>
      </div>

      {/* Time selection section - Only show for conference rooms and events spaces */}
      {allowsTimeSelection() && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <FiClock className="mr-2" />
            Select Times
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <TimeSelector
              label="Check-in"
              selectedTime={checkInTime}
              timeOptions={timeOptions}
              isOpen={showTimeSelector === 'checkin'}
              onToggle={() =>
                setShowTimeSelector(
                  showTimeSelector === 'checkin' ? null : 'checkin'
                )
              }
              onSelect={(time) => handleTimeSelection('checkin', time)}
            />

            <TimeSelector
              label="Check-out"
              selectedTime={checkOutTime}
              timeOptions={timeOptions}
              isOpen={showTimeSelector === 'checkout'}
              onToggle={() =>
                setShowTimeSelector(
                  showTimeSelector === 'checkout' ? null : 'checkout'
                )
              }
              onSelect={(time) => handleTimeSelection('checkout', time)}
            />
          </div>
        </div>
      )}

      {/* Room Stay info - Show fixed check-in/check-out times */}
      {!allowsTimeSelection() && room.type === 'stay' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <FiClock className="mr-2" />
            Check-in/Check-out Times
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Check-in:
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {room.houseRules?.checkInTime || '2:00 PM'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Check-out:
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {room.houseRules?.checkOutTime || '12:00 PM'}
              </span>
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Host's check-in and check-out times must be followed for Room
              Stays.
            </div>
          </div>
        </div>
      )}

      {/* Booking details */}
      {dateRange[0] && dateRange[1] ? (
        <div className="mb-6 space-y-3">
          <h3 className="text-lg font-medium">Booking Details</h3>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Check-in:</span>
            <span>
              {formatDate(dateRange[0])}{' '}
              {allowsTimeSelection() ? `at ${checkInTime}` : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Check-out:</span>
            <span>
              {formatDate(dateRange[1])}{' '}
              {allowsTimeSelection() ? `at ${checkOutTime}` : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
            <span>
              {bookingDetails.numberOfDays}{' '}
              {bookingDetails.numberOfDays > 1 ? 'days' : 'day'}
            </span>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 my-3 pt-3">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                {room.type === 'event' ? 'Venue fee' : 'Subtotal'}
              </span>
              <span>₱{bookingDetails.subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Service fee (10%)
              </span>
              <span>₱{bookingDetails.serviceFee.toLocaleString()}</span>
            </div>

            <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <span>Total</span>
              <span>₱{bookingDetails.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Select dates to see booking details
        </div>
      )}

      {/* Book button */}
      <button
        onClick={handleBookingClick}
        className={`w-full py-3 px-4 rounded-lg font-medium transition ${
          dateRange[0] && dateRange[1]
            ? 'bg-darkBlue text-light dark:bg-light dark:text-darkBlue hover:opacity-90'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        }`}
        disabled={!dateRange[0] || !dateRange[1]}>
        {!isAuthenticated
          ? 'Log in to Book'
          : dateRange[0] && dateRange[1]
          ? 'Book Now'
          : 'Select Dates to Book'}
      </button>

      {/* Reservation note - modified to show login message if not authenticated */}
      {dateRange[0] && dateRange[1] && (
        <p className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          {isAuthenticated
            ? "You won't be charged until confirmation"
            : 'Please log in or create an account to book this space'}
        </p>
      )}

      {/* Show login prompt if not authenticated */}
      {!isAuthenticated && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-center text-blue-600 dark:text-blue-300">
            <Link
              to={`/auth/login?redirect=/rooms/${roomId}`}
              className="font-medium hover:underline">
              Log in
            </Link>{' '}
            or{' '}
            <Link to="/auth/register" className="font-medium hover:underline">
              Sign up
            </Link>{' '}
            to book this space
          </p>
        </div>
      )}

      {/* Background overlay for when time selector is open */}
      {showTimeSelector && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowTimeSelector(null)}
        />
      )}
    </div>
  );
};

export default BookingPanel;
