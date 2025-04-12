import React, { useState } from 'react';
import { FiAlertTriangle, FiX, FiLoader, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  bookingDetails: {
    roomName: string;
    checkInDate: string;
    checkOutDate: string;
    refundAmount: number;
    refundPercentage: number;
    totalAmount: number;
  };
}

const CANCELLATION_REASONS = [
  'Change of plans',
  'Found a better option',
  'Need to reschedule',
  'Emergency situation',
  'Work conflict',
  'Weather concerns',
  'Transportation issues',
  'Financial constraints',
];

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingDetails,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const finalReason =
      selectedReason === 'Other' ? customReason : selectedReason;

    if (!finalReason) {
      // Highlight the reason selection as required
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(finalReason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // const getReason = () => {
  //   return selectedReason === 'Other' ? customReason : selectedReason;
  // };

  const isFormValid =
    selectedReason &&
    (selectedReason !== 'Other' || customReason.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}>
      <div
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-red-600 dark:text-red-400 font-medium">
            <FiAlertTriangle className="mr-2" size={20} />
            <h3 className="text-lg">Cancel Booking</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FiX size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Booking Details Card */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                {bookingDetails.roomName}
              </p>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                <FiCalendar className="mr-2" size={14} />
                <span>
                  {format(new Date(bookingDetails.checkInDate), 'MMM d')} -{' '}
                  {format(new Date(bookingDetails.checkOutDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Information */}
          {bookingDetails.refundAmount > 0 ? (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
              <p className="text-green-700 dark:text-green-400">
                You'll receive a {bookingDetails.refundPercentage}% refund of ₱
                {bookingDetails.refundAmount.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
              <p className="text-yellow-700 dark:text-yellow-400">
                This cancellation is not eligible for a refund.
              </p>
            </div>
          )}

          {/* Cancellation Reason Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Please select a reason for cancellation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CANCELLATION_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`p-2 text-sm rounded-md transition-colors ${
                    selectedReason === reason
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}>
                  {reason}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedReason('Other')}
                className={`p-2 text-sm rounded-md transition-colors ${
                  selectedReason === 'Other'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}>
                Other
              </button>
            </div>
          </div>

          {/* Custom Reason Text Field */}
          {selectedReason === 'Other' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Please specify your reason
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter your cancellation reason..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}

          {/* Warning */}
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            <p>
              This action cannot be undone. Once cancelled, you cannot
              reactivate this booking.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Keep Booking
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !isFormValid}
            className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center ${
              isFormValid
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                : 'bg-red-300 dark:bg-red-900 cursor-not-allowed'
            }`}>
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
