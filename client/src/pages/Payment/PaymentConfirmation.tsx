import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiDownload,
  FiMail,
} from 'react-icons/fi';
import Receipt from '../../components/Receipt/Receipt';
import logo_black from '../../assets/logo_black.jpg';
import { bookingApi } from '../../services/bookingApi';
import { toast } from 'react-hot-toast';

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState<any>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    if (location.state?.bookingDetails && location.state?.paymentMethod) {
      setConfirmation({
        bookingDetails: location.state.bookingDetails,
        paymentMethod: location.state.paymentMethod,
        referenceNumber: location.state.referenceNumber,
        bookingId: location.state.bookingId,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  const handleSendEmail = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!confirmation?.bookingId) {
      toast.error('Booking information is missing');
      return;
    }

    setSendingEmail(true);

    try {
      const email = showEmailInput && emailAddress ? emailAddress : undefined;

      const response = await bookingApi.sendReceiptEmail(
        confirmation.bookingId,
        email
      );

      if (response.success) {
        toast.success('Receipt has been sent to your email!');
        setShowEmailInput(false);
        setEmailAddress('');
      } else {
        toast.error(response.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      toast.error('An error occurred while sending the receipt');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = () => {
    if (document.querySelector('.download-receipt-btn')) {
      (document.querySelector('.download-receipt-btn') as HTMLElement).click();
    }
  };

  if (!confirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBlue">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const isPendingHostApproval = confirmation.paymentMethod === 'property';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue text-gray-900 dark:text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div
            className={`w-20 h-20 ${
              isPendingHostApproval
                ? 'bg-yellow-100 dark:bg-yellow-900'
                : 'bg-green-100 dark:bg-green-900'
            } rounded-full mx-auto flex items-center justify-center`}>
            {isPendingHostApproval ? (
              <FiClock
                className="text-yellow-600 dark:text-yellow-400"
                size={40}
              />
            ) : (
              <FiCheckCircle
                className="text-green-600 dark:text-green-400"
                size={40}
              />
            )}
          </div>
          <h1 className="text-2xl font-bold mt-4">
            {isPendingHostApproval
              ? 'Booking Request Submitted!'
              : 'Booking Confirmed!'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isPendingHostApproval
              ? 'Your booking request has been sent to the host for approval.'
              : 'Your reservation has been successfully confirmed.'}
          </p>
          <p className="text-blue-600 dark:text-blue-400 mt-1">
            Reference Number:{' '}
            <span className="font-semibold">
              {confirmation.referenceNumber}
            </span>
          </p>
        </div>

        {/* Status info for Property payment */}
        {isPendingHostApproval && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              What happens next?
            </h3>
            <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-300 space-y-2">
              <li>The host will review your booking request</li>
              <li>You'll receive an email when the host accepts or declines</li>
              <li>If accepted, you'll pay at the property upon arrival</li>
              <li>You can view your booking status on your bookings page</li>
            </ul>
          </div>
        )}

        {/* Booking details summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium flex items-center">
              <FiCalendar className="mr-2 text-blue-500" />
              Booking Details
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Check-in
                </p>
                <p className="font-medium">
                  {confirmation.bookingDetails.checkInDate} at{' '}
                  {confirmation.bookingDetails.checkInTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Check-out
                </p>
                <p className="font-medium">
                  {confirmation.bookingDetails.checkOutDate} at{' '}
                  {confirmation.bookingDetails.checkOutTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Guests
                </p>
                <p className="font-medium">
                  {confirmation.bookingDetails.guestCount || 1} person(s)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Payment Method
                </p>
                <p className="font-medium capitalize">
                  {confirmation.paymentMethod === 'property'
                    ? 'Pay at Property'
                    : confirmation.paymentMethod === 'card'
                    ? 'Credit Card'
                    : confirmation.paymentMethod}
                </p>
              </div>
            </div>

            {confirmation.bookingDetails.specialRequests && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Special Requests
                </p>
                <p className="mt-1">
                  {confirmation.bookingDetails.specialRequests}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Use the Receipt component */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Receipt</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                <FiDownload className="mr-1" /> Download
              </button>
              <button
                onClick={() => setShowEmailInput(!showEmailInput)}
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                <FiMail className="mr-1" /> Email Receipt
              </button>
            </div>
          </div>

          {showEmailInput && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20">
              <form onSubmit={handleSendEmail} className="flex items-center">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter email address (optional)"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                  {sendingEmail ? 'Sending...' : 'Send'}
                </button>
              </form>
              <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                Leave empty to send to your account email
              </p>
            </div>
          )}

          <div className="p-4">
            <Receipt
              referenceNumber={confirmation.referenceNumber}
              bookingDetails={confirmation.bookingDetails}
              paymentMethod={confirmation.paymentMethod}
              paymentStatus={
                isPendingHostApproval ? 'pending host approval' : 'confirmed'
              }
              date={confirmation.date}
              time={confirmation.time}
              companyLogo={logo_black}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/dashboard/bookings"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-darkBlue text-white dark:bg-light dark:text-darkBlue rounded-lg hover:opacity-90 transition-colors">
            View Your Bookings
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
