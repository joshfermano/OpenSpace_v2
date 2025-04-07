import React, { useState } from 'react';
import { FiCreditCard, FiCheckCircle } from 'react-icons/fi';

interface TransferToAccountProps {
  availableAmount: number;
}

const TransferToAccount: React.FC<TransferToAccountProps> = ({
  availableAmount,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'card'>(
    'gcash'
  );
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate amount
    const withdrawAmount = parseFloat(amount);
    if (
      !withdrawAmount ||
      withdrawAmount <= 0 ||
      withdrawAmount > availableAmount
    ) {
      alert('Please enter a valid amount');
      return;
    }

    // Validate account number
    if (!accountNumber.trim()) {
      alert('Please enter your account number');
      return;
    }

    // Process withdrawal (in a real app, this would be an API call)
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccessful(true);

      // Reset form after success
      setTimeout(() => {
        setIsSuccessful(false);
        setAmount('');
        setAccountNumber('');
      }, 3000);
    }, 1500);
  };

  if (isSuccessful) {
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
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          ₱{parseFloat(amount).toLocaleString()} has been sent to your{' '}
          {paymentMethod.toUpperCase()} account.
        </p>
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
            className="block w-full pl-8 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {paymentMethod === 'card' ? 'Card Number' : 'Account Number'}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCreditCard className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder={
              paymentMethod === 'card'
                ? '•••• •••• •••• ••••'
                : 'Enter account number'
            }
            className="block w-full pl-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
        {isProcessing ? 'Processing...' : 'Withdraw Funds'}
      </button>
    </form>
  );
};

export default TransferToAccount;
