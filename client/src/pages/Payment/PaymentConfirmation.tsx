import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import Receipt from '../../components/Receipt/Receipt';
import logo_black from '../../assets/logo_black.jpg';

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = React.useState<any>(null);

  useEffect(() => {
    if (location.state?.bookingDetails) {
      setConfirmation({
        bookingDetails: location.state.bookingDetails,
        paymentMethod: location.state.paymentMethod,
        referenceNumber: location.state.referenceNumber,
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
      // If no state is passed, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  if (!confirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBlue">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue text-gray-900 dark:text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mx-auto flex items-center justify-center">
            <FiCheckCircle
              className="text-green-600 dark:text-green-400"
              size={40}
            />
          </div>
          <h1 className="text-2xl font-bold mt-4">Booking Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your reservation has been successfully confirmed.
          </p>
        </div>

        {/* Use the new Receipt component */}
        <Receipt
          referenceNumber={confirmation.referenceNumber}
          bookingDetails={confirmation.bookingDetails}
          paymentMethod={confirmation.paymentMethod}
          date={confirmation.date}
          time={confirmation.time}
          companyLogo={logo_black}
        />

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-darkBlue text-white dark:bg-light dark:text-darkBlue rounded-lg hover:opacity-90 transition-colors">
            Continue to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
