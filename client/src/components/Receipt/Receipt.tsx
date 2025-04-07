import React, { useRef } from 'react';
import {
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
  FiDownload,
  FiMail,
} from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../../css/receipt.css';

interface ReceiptProps {
  referenceNumber: string;
  bookingDetails: {
    roomName: string;
    location: string;
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    numberOfDays: number;
    subtotal: number;
    serviceFee: number;
    total: number;
  };
  paymentMethod: string;
  date: string;
  time: string;
  companyLogo?: string;
}

const Receipt: React.FC<ReceiptProps> = ({
  referenceNumber,
  bookingDetails,
  paymentMethod,
  date,
  time,
  companyLogo,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'card':
        return 'Credit Card';
      case 'gcash':
        return 'GCash';
      case 'maya':
        return 'Maya (PayMaya)';
      case 'property':
        return 'Pay at Property';
      default:
        return 'Unknown';
    }
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      // Add the receipt-container class for PDF export styling
      receiptRef.current.classList.add('receipt-container', 'printing');

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow images from other domains
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Remove the printing classes
      receiptRef.current.classList.remove('receipt-container', 'printing');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`OpenSpace_Receipt_${referenceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const sendByEmail = () => {
    // In a real app, this would call an API endpoint to send the receipt by email
    alert('Receipt would be sent by email in a production environment.');
  };

  return (
    <div className="w-full">
      {/* The actual receipt that will be captured for PDF */}
      <div
        ref={receiptRef}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-sm overflow-hidden">
        {/* Header section */}
        <div className="p-6 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">Booking Receipt</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Reference: {referenceNumber}
            </p>
          </div>
          {companyLogo && (
            <img
              src={companyLogo}
              alt="OpenSpace Logo"
              className="h-12 w-auto"
            />
          )}
        </div>

        {/* Receipt content */}
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg">{bookingDetails.roomName}</h3>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                {bookingDetails.location}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <FiCalendar className="mr-2 text-blue-500" /> Stay Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Check-in:
                    </span>
                    <span className="ml-2 font-medium">
                      {bookingDetails.checkInDate} at{' '}
                      {bookingDetails.checkInTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Check-out:
                    </span>
                    <span className="ml-2 font-medium">
                      {bookingDetails.checkOutDate} at{' '}
                      {bookingDetails.checkOutTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Duration:
                    </span>
                    <span className="ml-2 font-medium">
                      {bookingDetails.numberOfDays}{' '}
                      {bookingDetails.numberOfDays > 1 ? 'days' : 'day'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <FiCreditCard className="mr-2 text-blue-500" /> Payment
                  Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Payment Method:
                    </span>
                    <span className="ml-2 font-medium">
                      {getPaymentMethodName(paymentMethod)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                      {paymentMethod === 'property'
                        ? 'To be paid at property'
                        : 'Paid'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Date:
                    </span>
                    <span className="ml-2 font-medium">
                      {date} at {time}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Room rate
                  </span>
                  <span>₱{bookingDetails.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
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

            {/* Receipt footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
              <div className="flex items-center justify-center mb-2">
                <FiCheckCircle className="text-green-500 mr-2" />
                <span>Official Receipt from OpenSpace</span>
              </div>
              <p>Thank you for your booking. We look forward to hosting you!</p>
              <p className="mt-1">
                For any queries, contact support at support@openspace.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons below the receipt */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={downloadPDF}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-darkBlue text-white dark:bg-blue-600 rounded-lg hover:opacity-90 transition-colors">
          <FiDownload />
          Download Receipt (PDF)
        </button>
        <button
          onClick={sendByEmail}
          className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <FiMail />
          Email Receipt
        </button>
      </div>
    </div>
  );
};

export default Receipt;
