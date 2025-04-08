import { FiXCircle } from 'react-icons/fi';
import Receipt from '../Receipt/Receipt';
import { Booking } from '../../types/booking';
import { formatDate, calculateDuration } from '../../utils/bookingHelpers';

interface ReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

const ReceiptModal = ({ booking, onClose }: ReceiptModalProps) => {
  const generateReceiptData = (booking: Booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      referenceNumber: booking._id,
      bookingDetails: {
        roomName: booking.room.title,
        location: `${booking.room.location.city}, ${booking.room.location.country}`,
        checkInDate: formatDate(booking.checkIn),
        checkOutDate: formatDate(booking.checkOut),
        checkInTime: booking.checkInTime || '2:00 PM',
        checkOutTime: booking.checkOutTime || '12:00 PM',
        guest: `${booking.user.firstName} ${booking.user.lastName}`,
        guestCount: booking.guests.adults + booking.guests.children,
        duration: calculateDuration(booking),
        numberOfDays: numberOfDays,
        subtotal: booking.totalPrice * 0.9,
        serviceFee: booking.totalPrice * 0.1,
        total: booking.totalPrice,
      },
      paymentMethod:
        booking.paymentMethod === 'creditCard'
          ? 'Credit Card'
          : 'Pay at Property',
      paymentStatus: booking.paymentStatus,
      date: new Date(booking.createdAt).toLocaleDateString(),
      time: new Date(booking.createdAt).toLocaleTimeString(),
      isHostCopy: true,
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Host Receipt Copy
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FiXCircle size={24} />
          </button>
        </div>
        <div className="p-4">
          <Receipt {...generateReceiptData(booking)} />
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
