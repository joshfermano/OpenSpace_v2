import { FiAlertCircle } from 'react-icons/fi';
import { Booking } from '../../types/booking';
import BookingCard from './BookingCard';

interface BookingsListProps {
  bookings: Booking[];
  processingAction: {
    id: string;
    action: string;
  } | null;
  onConfirmBooking: (id: string) => void;
  onRejectBooking: (id: string) => void;
  onCompleteBooking: (id: string) => void;
  onMarkPaymentReceived: (id: string) => void;
  onViewReceipt: (booking: Booking) => void;
}

const BookingsList = ({
  bookings,
  processingAction,
  onConfirmBooking,
  onRejectBooking,
  onCompleteBooking,
  onMarkPaymentReceived,
  onViewReceipt,
}: BookingsListProps) => {
  // Filter out invalid bookings (those without room data)
  const validBookings = bookings.filter(
    (booking) => booking && booking.room && typeof booking.room === 'object'
  );

  // If no valid bookings remain after filtering, show empty state
  if (validBookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <FiAlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Valid Bookings Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {bookings.length > 0
              ? "Some bookings couldn't be displayed because they contain missing or invalid data."
              : "You don't have any bookings that match your current filters."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {validBookings.map((booking) => (
        <BookingCard
          key={booking._id}
          booking={booking}
          processingAction={processingAction}
          onConfirmBooking={onConfirmBooking}
          onRejectBooking={onRejectBooking}
          onCompleteBooking={onCompleteBooking}
          onMarkPaymentReceived={onMarkPaymentReceived}
          onViewReceipt={onViewReceipt}
        />
      ))}
    </div>
  );
};

export default BookingsList;
