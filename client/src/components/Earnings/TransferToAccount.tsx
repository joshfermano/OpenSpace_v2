import React, { useState } from 'react';
import { FiCreditCard, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { BsCashCoin } from 'react-icons/bs';
import { FaMobileAlt } from 'react-icons/fa';

interface TransferToAccountProps {
  availableAmount: number;
  onProcessWithdrawal: (
    amount: number,
    method: 'card' | 'gcash' | 'maya',
    accountDetails: any
  ) => Promise<{ success: boolean; data?: any; message?: string }>;
  isProcessing: boolean;
}

const TransferToAccount: React.FC<TransferToAccountProps> = ({
  availableAmount,
  onProcessWithdrawal,
  isProcessing,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'card'>(
    'gcash'
  );
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [withdrawalData, setWithdrawalData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate amount
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (withdrawAmount > availableAmount) {
      newErrors.amount = 'Amount exceeds available balance';
    }

    // Validate based on payment method
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Invalid card number format';
      }

      if (!cardDetails.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
        newErrors.expiryDate = 'Invalid format (MM/YY)';
      }

      if (!cardDetails.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        newErrors.cvv = 'Invalid CVV';
      }

      if (!cardDetails.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    } else {
      // For GCash and Maya
      if (!mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required';
      } else if (!/^09\d{9}$/.test(mobileNumber)) {
        newErrors.mobileNumber = 'Invalid format (e.g. 09XXXXXXXXX)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create account details based on payment method
    let accountDetails;
    if (paymentMethod === 'card') {
      accountDetails = {
        cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
        expiryDate: cardDetails.expiryDate,
        cvv: cardDetails.cvv,
        cardholderName: cardDetails.cardholderName,
      };
    } else {
      accountDetails = {
        mobileNumber,
      };
    }

    try {
      const result = await onProcessWithdrawal(
        parseFloat(amount),
        paymentMethod,
        accountDetails
      );

      if (result.success) {
        setWithdrawalData(result.data);
        setIsSuccessful(true);

        // Reset form after success (delayed to show success message first)
        setTimeout(() => {
          setIsSuccessful(false);
          setAmount('');
          setMobileNumber('');
          setCardDetails({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardholderName: '',
          });
        }, 5000);
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || '';
    return formatted.substring(0, 19); // Limit to 16 digits + spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  if (isSuccessful && withdrawalData) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <FiCheckCircle
            className="text-green-600 dark:text-green-400"
            size={32}
          />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Withdrawal Successful!
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          ₱{parseFloat(amount).toLocaleString()} has been sent to your{' '}
          {paymentMethod === 'card' ? 'Card' : paymentMethod.toUpperCase()}{' '}
          account.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Reference: {withdrawalData.withdrawalId}
        </p>
        <div className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-3">
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Remaining balance: ₱
            {withdrawalData.remainingBalance?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleWithdraw}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Available for withdrawal
        </label>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          ₱{availableAmount.toLocaleString()}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Withdrawal Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400">₱</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`block w-full pl-8 pr-12 py-2 border ${
              errors.amount
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.amount}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('gcash')}
            className={`py-2 px-4 text-center text-sm rounded-md ${
              paymentMethod === 'gcash'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
            }`}>
            GCash
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('maya')}
            className={`py-2 px-4 text-center text-sm rounded-md ${
              paymentMethod === 'maya'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
            }`}>
            Maya
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`py-2 px-4 text-center text-sm rounded-md ${
              paymentMethod === 'card'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
            }`}>
            Card
          </button>
        </div>
      </div>

      {paymentMethod === 'card' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Card Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCreditCard className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) =>
                  setCardDetails({
                    ...cardDetails,
                    cardNumber: formatCardNumber(e.target.value),
                  })
                }
                placeholder="•••• •••• •••• ••••"
                className={`block w-full pl-10 py-2 border ${
                  errors.cardNumber
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
              />
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.cardNumber}
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
                value={cardDetails.expiryDate}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 5) {
                    // Max length: MM/YY
                    setCardDetails({
                      ...cardDetails,
                      expiryDate:
                        value.length === 2 && !value.includes('/')
                          ? value + '/'
                          : formatExpiryDate(value),
                    });
                  }
                }}
                placeholder="MM/YY"
                className={`block w-full py-2 px-3 border ${
                  errors.expiryDate
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
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
                value={cardDetails.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setCardDetails({ ...cardDetails, cvv: value });
                  }
                }}
                placeholder="•••"
                className={`block w-full py-2 px-3 border ${
                  errors.cvv
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.cvv}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardDetails.cardholderName}
              onChange={(e) =>
                setCardDetails({
                  ...cardDetails,
                  cardholderName: e.target.value,
                })
              }
              placeholder="Cardholder Name"
              className={`block w-full py-2 px-3 border ${
                errors.cardholderName
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
            />
            {errors.cardholderName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.cardholderName}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMobileAlt className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  setMobileNumber(value);
                }
              }}
              placeholder="09XXXXXXXXX"
              className={`block w-full pl-10 py-2 border ${
                errors.mobileNumber
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.mobileNumber && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.mobileNumber}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || availableAmount <= 0}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
        {isProcessing ? (
          <>
            <FiLoader className="animate-spin mr-2" /> Processing...
          </>
        ) : (
          'Withdraw Funds'
        )}
      </button>

      {availableAmount <= 0 && (
        <p className="mt-2 text-sm text-center text-yellow-600 dark:text-yellow-400">
          You don't have any funds available to withdraw yet.
        </p>
      )}
    </form>
  );
};

export default TransferToAccount;
