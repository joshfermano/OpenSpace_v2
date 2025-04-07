import { useState } from 'react';
import { FiDownload, FiCreditCard, FiClock } from 'react-icons/fi';
import { FaPesoSign } from 'react-icons/fa6';
import EarningsChart from '../../components/Earnings/EarningsChart';
import TransferToAccount from '../../components/Earnings/TransferToAccount';

const EarningsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');

  // Mock earnings data - in a real app, this would come from your API
  const earningsSummary = {
    totalEarnings: 32450,
    pendingPayouts: 7500,
    lastPayout: 4800,
    lastPayoutDate: '2025-03-15',
    bookingsCompleted: 24,
    occupancyRate: 68,
  };

  // Mock transaction history
  const transactions = [
    {
      id: 1,
      date: '2025-03-20',
      amount: 3200,
      status: 'completed',
      description: 'Booking #1245',
    },
    {
      id: 2,
      date: '2025-03-15',
      amount: 4800,
      status: 'completed',
      description: 'Payout to GCash',
    },
    {
      id: 3,
      date: '2025-03-10',
      amount: 2750,
      status: 'completed',
      description: 'Booking #1239',
    },
    {
      id: 4,
      date: '2025-03-05',
      amount: 1500,
      status: 'pending',
      description: 'Booking #1238',
    },
    {
      id: 5,
      date: '2025-02-28',
      amount: 3000,
      status: 'completed',
      description: 'Booking #1234',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Earnings Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₱{earningsSummary.totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FaPesoSign
                  className="text-green-600 dark:text-green-400"
                  size={20}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Lifetime earnings from all bookings
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Pending Payouts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₱{earningsSummary.pendingPayouts.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiClock
                  className="text-blue-600 dark:text-blue-400"
                  size={20}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Available for withdrawal
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Last Payout
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₱{earningsSummary.lastPayout.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FiCreditCard
                  className="text-purple-600 dark:text-purple-400"
                  size={20}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {new Date(earningsSummary.lastPayoutDate).toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </p>
          </div>
        </div>

        {/* Chart & Transfer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Earnings Overview
              </h2>
              <div className="flex space-x-2 text-sm">
                <button
                  onClick={() => setDateRange('week')}
                  className={`px-3 py-1 rounded-lg ${
                    dateRange === 'week'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                  Week
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className={`px-3 py-1 rounded-lg ${
                    dateRange === 'month'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                  Month
                </button>
                <button
                  onClick={() => setDateRange('year')}
                  className={`px-3 py-1 rounded-lg ${
                    dateRange === 'year'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                  Year
                </button>
              </div>
            </div>

            <div className="h-72">
              <EarningsChart dateRange={dateRange} />
            </div>
          </div>

          {/* Transfer To Account */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Withdraw Funds
            </h2>
            <TransferToAccount
              availableAmount={earningsSummary.pendingPayouts}
            />
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction History
            </h2>
            <button className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300">
              <FiDownload className="mr-1" size={16} />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₱{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                        {transaction.status === 'completed'
                          ? 'Completed'
                          : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsDashboard;
