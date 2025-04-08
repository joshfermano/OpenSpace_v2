import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiCreditCard,
} from 'react-icons/fi';
import { Booking } from '../types/booking';

// Format date for display
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Calculate booking duration in days/hours based on room type
export const calculateDuration = (booking: Booking) => {
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());

  if (booking.room.type === 'Conference Room') {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
  } else {
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} ${diffDays === 1 ? 'night' : 'nights'}`;
  }
};

// Get status display with appropriate styles
export const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'confirmed':
      return {
        icon: <FiCheckCircle className="mr-2" />,
        text: 'Confirmed',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-400',
      };
    case 'pending':
      return {
        icon: <FiAlertCircle className="mr-2" />,
        text: 'Pending',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-800 dark:text-yellow-400',
      };
    case 'cancelled':
      return {
        icon: <FiXCircle className="mr-2" />,
        text: 'Cancelled',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-400',
      };
    case 'rejected':
      return {
        icon: <FiXCircle className="mr-2" />,
        text: 'Rejected',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-800 dark:text-red-400',
      };
    case 'completed':
      return {
        icon: <FiCheckCircle className="mr-2" />,
        text: 'Completed',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-800 dark:text-blue-400',
      };
    default:
      return {
        icon: <FiAlertCircle className="mr-2" />,
        text: status,
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        textColor: 'text-gray-800 dark:text-gray-400',
      };
  }
};

// Get payment status display
export const getPaymentStatusDisplay = (status: string, method: string) => {
  switch (status) {
    case 'paid':
      return {
        text: 'Paid',
        icon: <FiCheckCircle className="mr-1" />,
        color: 'text-green-600 dark:text-green-400',
      };
    case 'pending':
      return {
        text: method === 'property' ? 'Pay at Property' : 'Payment Pending',
        icon:
          method === 'property' ? (
            <FiCreditCard className="mr-1" />
          ) : (
            <FiAlertCircle className="mr-1" />
          ),
        color: 'text-yellow-600 dark:text-yellow-400',
      };
    case 'refunded':
      return {
        text: 'Refunded',
        icon: <FiRefreshCw className="mr-1" />,
        color: 'text-blue-600 dark:text-blue-400',
      };
    default:
      return {
        text: status,
        icon: <FiAlertCircle className="mr-1" />,
        color: 'text-gray-600 dark:text-gray-400',
      };
  }
};
