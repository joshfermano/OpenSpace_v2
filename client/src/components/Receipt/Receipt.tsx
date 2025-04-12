import React from 'react';
import { FiCheck } from 'react-icons/fi';

export interface ReceiptProps {
  referenceNumber: string;
  bookingDetails: {
    roomName: string;
    location: string;
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    numberOfDays: number;
    numberOfGuests?: number;
    subtotal: number;
    serviceFee: number;
    cleaningFee?: number;
    tax?: number;
    total: number;
  };
  paymentMethod: string;
  paymentStatus?: string;
  date: string;
  time: string;
  companyLogo?: string;
  isHostCopy?: boolean;
}

const Receipt: React.FC<ReceiptProps> = ({
  referenceNumber,
  bookingDetails,
  paymentMethod,
  paymentStatus = 'paid',
  date,
  time,
  companyLogo,
  isHostCopy,
}) => {
  return (
    <div className="bg-white text-gray-900 p-8 max-w-2xl mx-auto font-sans">
      {/* Receipt Header */}
      <div className="mb-6 flex flex-col items-center">
        {companyLogo ? (
          <img src={companyLogo} alt="OpenSpace Logo" className="h-12 mb-2" />
        ) : (
          <h2 className="text-xl font-bold mb-1">OpenSpace</h2>
        )}
        <h1 className="text-2xl font-bold mb-1">Booking Receipt</h1>
        <p className="text-sm text-gray-600">
          Reference Number: {referenceNumber}
        </p>
        {isHostCopy && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 mt-2 rounded-full text-xs font-medium">
            Host Copy
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="mb-6 border-b border-gray-300 pb-4">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Date:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Time:</span>
          <span>{time}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Payment Method:</span>
          <span className="capitalize">
            {paymentMethod === 'property' ? 'Pay at Property' : paymentMethod}
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Payment Status:</span>
          <span className="capitalize">
            {paymentStatus === 'paid' ? (
              <span className="text-green-600 flex items-center">
                <FiCheck className="mr-1" /> {paymentStatus}
              </span>
            ) : (
              paymentStatus
            )}
          </span>
        </div>
      </div>

      {/* Booking Details */}
      <div className="mb-6 border-b border-gray-300 pb-4">
        <h3 className="font-bold mb-3 text-lg">Booking Details</h3>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Space:</span>
          <span className="font-medium">{bookingDetails.roomName}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Location:</span>
          <span>{bookingDetails.location}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Check-in:</span>
          <span>
            {bookingDetails.checkInDate} at {bookingDetails.checkInTime}
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Check-out:</span>
          <span>
            {bookingDetails.checkOutDate} at {bookingDetails.checkOutTime}
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Duration:</span>
          <span>{bookingDetails.numberOfDays} day(s)</span>
        </div>
        {bookingDetails.numberOfGuests && (
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Guests:</span>
            <span>{bookingDetails.numberOfGuests} person(s)</span>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 text-lg">Price Details</h3>

        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Base Price:</span>
          <span>
            ₱
            {bookingDetails.subtotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Service Fee:</span>
          <span>
            ₱
            {bookingDetails.serviceFee.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {bookingDetails.cleaningFee && bookingDetails.cleaningFee > 0 && (
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Cleaning Fee:</span>
            <span>
              ₱
              {bookingDetails.cleaningFee.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {bookingDetails.tax && bookingDetails.tax > 0 && (
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Tax:</span>
            <span>
              ₱
              {bookingDetails.tax.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        <div className="flex justify-between mt-3 font-bold text-lg border-t border-gray-300 pt-2">
          <span>Total:</span>
          <span>
            ₱
            {bookingDetails.total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 mt-8">
        <p>Thank you for choosing OpenSpace!</p>
        <p>For any inquiries, please contact support@openspace.com</p>
        <p className="mt-2">
          This is an electronic receipt. No signature required.
        </p>
      </div>
    </div>
  );
};

export default Receipt;
