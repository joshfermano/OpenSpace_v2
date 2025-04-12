import { FiXCircle } from 'react-icons/fi';
import Receipt from '../Receipt/Receipt';
import { Booking } from '../../types/booking';
import { formatDate, calculateDuration } from '../../utils/bookingHelpers';

interface ReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

// Helper function to convert 24h format to 12h format
const convertTo12Hour = (time24: string): string => {
  if (!time24) return '';

  // If already in 12-hour format (contains AM/PM), return as is
  if (time24.includes('AM') || time24.includes('PM')) {
    return time24;
  }

  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);

  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour < 12) {
    return `${hour}:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour - 12}:${minutes} PM`;
  }
};

const ReceiptModal = ({ booking, onClose }: ReceiptModalProps) => {
  const generateReceiptData = (booking: Booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Format times in 12-hour format
    const formattedCheckInTime = booking.checkInTime
      ? convertTo12Hour(booking.checkInTime)
      : booking.room.type === 'stay'
      ? '2:00 PM'
      : booking.room.type === 'conference'
      ? '8:00 AM'
      : '10:00 AM';

    const formattedCheckOutTime = booking.checkOutTime
      ? convertTo12Hour(booking.checkOutTime)
      : booking.room.type === 'stay'
      ? '12:00 PM'
      : booking.room.type === 'conference'
      ? '5:00 PM'
      : '10:00 PM';

    // Fix for location property - treat it as any to bypass TypeScript error
    // or use optional chaining to safely access potentially undefined properties
    const roomLocation = (booking.room as any).location;
    const locationString = roomLocation
      ? `${roomLocation.city || ''}, ${roomLocation.country || ''}`
      : 'Location not available';

    return {
      referenceNumber: booking._id,
      bookingDetails: {
        roomName: booking.room.title,
        location: locationString,
        checkInDate: formatDate(booking.checkIn),
        checkOutDate: formatDate(booking.checkOut),
        checkInTime: formattedCheckInTime,
        checkOutTime: formattedCheckOutTime,
        guest: `${booking.user.firstName} ${booking.user.lastName}`,
        guestCount: booking.guests.adults + (booking.guests.children || 0),
        duration: calculateDuration(booking),
        numberOfDays: numberOfDays,
        subtotal: booking.totalPrice * 0.9,
        serviceFee: booking.totalPrice * 0.1,
        total: booking.totalPrice,
      },
      paymentMethod:
        booking.paymentMethod === 'card' ? 'Credit Card' : 'Pay at Property',
      paymentStatus: booking.paymentStatus,
      date: new Date(booking.createdAt).toLocaleDateString(),
      time: new Date(booking.createdAt).toLocaleTimeString(),
      isHostCopy: true,
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Booking Receipt
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FiXCircle size={24} />
          </button>
        </div>

        <div className="p-4">
          <Receipt {...generateReceiptData(booking)} />

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
