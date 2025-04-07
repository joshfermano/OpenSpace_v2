import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCreditCard,
  FiCheck,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiInfo,
} from 'react-icons/fi';
import { MdOutlinePayments } from 'react-icons/md';
import { FaWallet } from 'react-icons/fa';
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    'gcash' | 'maya' | 'card' | 'property'
  >('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    saveForFuture: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get booking details from location state or fetch from API
  useEffect(() => {
    if (location.state?.bookingDetails) {
      setBookingDetails(location.state.bookingDetails);
    } else {
      // If no state is passed, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Invalid card number format';
      }

      if (!formData.cardHolder.trim()) {
        newErrors.cardHolder = 'Cardholder name is required';
      }

      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Invalid format (MM/YY)';
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Invalid CVV';
      }
    } else if (paymentMethod === 'gcash' || paymentMethod === 'maya') {
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Mobile number is required';
      } else if (!/^(09|\+639)\d{9}$/.test(formData.accountNumber)) {
        newErrors.accountNumber = 'Invalid mobile number format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // In a real app, you would process payment and get a response
      navigate('/payment/confirmation', {
        state: {
          bookingDetails,
          paymentMethod,
          // Generate a random reference number for the receipt
          referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      });
    }, 2000);
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({
      ...formData,
      cardNumber: formatted,
    });

    if (errors.cardNumber) {
      setErrors({
        ...errors,
        cardNumber: '',
      });
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBlue">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue text-gray-900 dark:text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          to={`/rooms/${bookingDetails.roomId}`}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <FiArrowLeft /> Back to room
        </Link>

        <h1 className="text-2xl font-semibold mb-6">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment form section */}
          <div className="col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MdOutlinePayments className="mr-2 text-blue-500" />
                Payment Method
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                  <FiCreditCard className="text-2xl mb-2" />
                  <span className="text-sm font-medium">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('gcash')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'gcash'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                  <FaWallet className="text-2xl mb-2 text-[#0076ff]" />
                  <span className="text-sm font-medium">GCash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('maya')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'maya'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                  <span className="text-xl font-extrabold mb-1 text-green-600 dark:text-green-400">
                    Maya
                  </span>
                  <span className="text-sm font-medium">PayMaya</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('property')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'property'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                  <FiMapPin className="text-2xl mb-2" />
                  <span className="text-sm font-medium">Pay at Property</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Credit Card Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={`w-full p-3 border ${
                            errors.cardNumber
                              ? 'border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          <FaCcVisa className="text-blue-600" size={24} />
                          <FaCcMastercard className="text-red-500" size={24} />
                          <FaCcAmex className="text-gray-400" size={24} />
                        </div>
                      </div>
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardHolder"
                        value={formData.cardHolder}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`w-full p-3 border ${
                          errors.cardHolder
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                      />
                      {errors.cardHolder && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.cardHolder}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full p-3 border ${
                            errors.expiryDate
                              ? 'border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={4}
                          className={`w-full p-3 border ${
                            errors.cvv
                              ? 'border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="saveForFuture"
                        name="saveForFuture"
                        checked={formData.saveForFuture}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="saveForFuture"
                        className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Save this card for future bookings
                      </label>
                    </div>
                  </div>
                )}

                {/* GCash/Maya Form */}
                {(paymentMethod === 'gcash' || paymentMethod === 'maya') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        placeholder="09123456789"
                        className={`w-full p-3 border ${
                          errors.accountNumber
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors`}
                      />
                      {errors.accountNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.accountNumber}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        After clicking "Complete Booking", you will receive a
                        payment request on your{' '}
                        {paymentMethod === 'gcash' ? 'GCash' : 'Maya'} app.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pay at Property */}
                {paymentMethod === 'property' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <FiInfo className="mr-2 text-blue-500" /> Pay at
                        Property Details
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <FiCheck className="mt-1 mr-2 text-green-500" />
                          No payment is required now
                        </li>
                        <li className="flex items-start">
                          <FiCheck className="mt-1 mr-2 text-green-500" />
                          Your booking will be confirmed immediately
                        </li>
                        <li className="flex items-start">
                          <FiClock className="mt-1 mr-2 text-blue-500" />
                          Full payment will be collected at the property
                        </li>
                        <li className="flex items-start">
                          <FiCheck className="mt-1 mr-2 text-green-500" />
                          Accepted payment methods at property: Cash,
                          Credit/Debit cards, GCash, and Maya
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 py-3 px-4 bg-darkBlue text-white dark:bg-light dark:text-darkBlue hover:opacity-90 font-medium rounded-lg transition-colors flex items-center justify-center">
                  {isProcessing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-light border-t-transparent dark:border-darkBlue dark:border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Complete Booking'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Booking summary section */}
          <div className="col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {bookingDetails.roomName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    <FiMapPin className="mr-1" /> {bookingDetails.location}
                  </p>
                </div>

                <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <FiCalendar className="mr-2 text-blue-500" />
                    <div>
                      <span className="font-medium">Check-in:</span>{' '}
                      {bookingDetails.checkInDate} at{' '}
                      {bookingDetails.checkInTime}
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiCalendar className="mr-2 text-blue-500" />
                    <div>
                      <span className="font-medium">Check-out:</span>{' '}
                      {bookingDetails.checkOutDate} at{' '}
                      {bookingDetails.checkOutTime}
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiClock className="mr-2 text-blue-500" />
                    <div>
                      <span className="font-medium">Duration:</span>{' '}
                      {bookingDetails.numberOfDays}{' '}
                      {bookingDetails.numberOfDays > 1 ? 'days' : 'day'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Room rate
                    </span>
                    <span>₱{bookingDetails.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Service fee
                    </span>
                    <span>₱{bookingDetails.serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>₱{bookingDetails.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
