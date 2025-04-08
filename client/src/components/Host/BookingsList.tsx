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
  onViewReceipt: (booking: Booking) => void;
}

const BookingsList = ({
  bookings,
  processingAction,
  onConfirmBooking,
  onRejectBooking,
  onCompleteBooking,
  onViewReceipt,
}: BookingsListProps) => {
  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <BookingCard
          key={booking._id}
          booking={booking}
          processingAction={processingAction}
          onConfirmBooking={onConfirmBooking}
          onRejectBooking={onRejectBooking}
          onCompleteBooking={onCompleteBooking}
          onViewReceipt={onViewReceipt}
        />
      ))}
    </div>
  );
};

export default BookingsList;
