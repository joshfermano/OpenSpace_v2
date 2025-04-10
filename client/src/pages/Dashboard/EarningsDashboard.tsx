import { useState, useEffect } from 'react';
import {
  FiDownload,
  FiCreditCard,
  FiClock,
  FiAlertCircle,
  FiLoader,
  FiDollarSign,
  FiBarChart2,
  FiArrowDown,
  FiArrowUp,
  FiRefreshCw,
} from 'react-icons/fi';
import { FaPesoSign } from 'react-icons/fa6';
import { toast } from 'react-hot-toast';
import EarningsChart from '../../components/Earnings/EarningsChart';
import TransferToAccount from '../../components/Earnings/TransferToAccount';
import { earningsApi } from '../../services/earningsApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EarningsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [earningsSummary, setEarningsSummary] = useState({
    total: 0,
    available: 0,
    pending: 0,
    paidOut: 0,
    lastPayout: 0,
    lastPayoutDate: null as string | null,
    monthly: [] as any[],
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [withdrawalProcessing, setWithdrawalProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchEarningsSummary();
    fetchTransactionHistory();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchChartData();
  }, [dateRange, refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success('Data refreshed');
  };

  const fetchEarningsSummary = async () => {
    setIsLoading(true);
    try {
      const response = await earningsApi.getEarningsSummary();
      if (response.success) {
        setEarningsSummary(response.data);
      } else {
        setError(response.message || 'Failed to fetch earnings summary');
        toast.error('Failed to load earnings summary');
      }
    } catch (err) {
      console.error('Error fetching earnings summary:', err);
      setError('Failed to load earnings data');
      toast.error('Error loading earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const response = await earningsApi.getTransactionHistory(1, 20);
      if (response.success) {
        setTransactions(response.transactions || []);
      } else {
        console.error('Failed to fetch transactions:', response.message);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchChartData = async () => {
    try {
      const data = await earningsApi.getEarningsChartData(dateRange);
      if (data) {
        setChartData(data);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    }
  };

  const handleWithdrawal = async (
    amount: number,
    method: 'card' | 'gcash' | 'maya',
    accountDetails: any
  ) => {
    setWithdrawalProcessing(true);
    try {
      const response = await earningsApi.processWithdrawal(
        amount,
        method,
        accountDetails
      );

      if (response.success) {
        toast.success(`Successfully withdrawn ₱${amount.toLocaleString()}`);

        // Refresh data after successful withdrawal
        fetchEarningsSummary();
        fetchTransactionHistory();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Withdrawal failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      toast.error('Error processing withdrawal');
      return { success: false, message: 'Error processing withdrawal' };
    } finally {
      setWithdrawalProcessing(false);
    }
  };

  const exportTransactionHistory = async () => {
    try {
      toast('Preparing transaction history...', { icon: '🔄' });

      // Create a new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.text('Transaction History', 14, 22);

      // Add date
      doc.setFontSize(11);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        14,
        30
      );

      // Prepare table data
      const tableData = transactions.map((t) => [
        new Date(t.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        t.description,
        `₱${t.amount.toLocaleString()}`,
        t.status.charAt(0).toUpperCase() + t.status.slice(1),
      ]);

      // Add table with transaction history
      autoTable(doc, {
        head: [['Date', 'Description', 'Amount', 'Status']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });

      // Add summary
      const totalEarnings = transactions
        .filter((t) => t.status !== 'paid_out')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawn = transactions
        .filter((t) => t.status === 'paid_out')
        .reduce((sum, t) => sum + t.amount, 0);

      const finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.text('Summary:', 14, finalY);
      doc.text(
        `Total Earnings: ₱${totalEarnings.toLocaleString()}`,
        14,
        finalY + 7
      );
      doc.text(
        `Total Withdrawn: ₱${totalWithdrawn.toLocaleString()}`,
        14,
        finalY + 14
      );

      // Save PDF
      doc.save('earnings-history.pdf');
      toast.success('Transaction history exported successfully');
    } catch (err) {
      console.error('Error exporting transactions:', err);
      toast.error('Failed to export transaction history');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center">
        <div className="text-center">
          <FiLoader
            size={40}
            className="animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading earnings data...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm max-w-md mx-auto">
          <FiAlertCircle
            size={40}
            className="mx-auto text-red-600 dark:text-red-400 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load earnings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Earnings Dashboard
          </h1>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors">
            <FiRefreshCw className="h-4 w-4" /> Refresh Data
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₱{earningsSummary.total.toLocaleString()}
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
                  Available for Withdrawal
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₱{earningsSummary.available.toLocaleString()}
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
              Ready to withdraw now
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Last Payout
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {earningsSummary.lastPayout
                    ? `₱${earningsSummary.lastPayout.toLocaleString()}`
                    : 'No payouts yet'}
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
              {earningsSummary.lastPayoutDate
                ? new Date(earningsSummary.lastPayoutDate).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }
                  )
                : 'No recent payouts'}
            </p>
          </div>
        </div>

        {/* Additional Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Pending Earnings
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₱{earningsSummary.pending.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Will be available after checkout
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FiClock
                  className="text-yellow-600 dark:text-yellow-400"
                  size={20}
                />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Pending vs Available
                </span>
                <span
                  className={`font-medium ${
                    earningsSummary.pending > earningsSummary.available
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                  {earningsSummary.pending > 0
                    ? Math.round(
                        (earningsSummary.pending /
                          (earningsSummary.pending +
                            earningsSummary.available)) *
                          100
                      ) + '%'
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="bg-yellow-500 dark:bg-yellow-600 h-1.5 rounded-full"
                  style={{
                    width:
                      earningsSummary.pending + earningsSummary.available > 0
                        ? `${
                            (earningsSummary.pending /
                              (earningsSummary.pending +
                                earningsSummary.available)) *
                            100
                          }%`
                        : '0%',
                  }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Paid Out
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ₱{earningsSummary.paidOut.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total earnings already withdrawn
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FiCreditCard
                  className="text-green-600 dark:text-green-400"
                  size={20}
                />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Total withdrawals
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {
                    transactions.filter(
                      (t) => t.status === 'paid_out' || t.status === 'completed'
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-gray-400">
                  Withdrawal ratio
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {earningsSummary.total > 0
                    ? Math.round(
                        (earningsSummary.paidOut / earningsSummary.total) * 100
                      ) + '%'
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center h-full">
              <div className="w-full">
                <p className="text-center text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
                  Need help with your earnings?
                </p>
                <button
                  onClick={() => toast.success('Support chat would open here')}
                  className="w-full py-2 px-4 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm mb-2">
                  Contact Support
                </button>
                <button
                  onClick={() => window.open('/dashboard/bookings', '_self')}
                  className="w-full py-2 px-4 border border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm">
                  Manage Bookings
                </button>
              </div>
            </div>
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

            {chartData ? (
              <div className="h-72">
                <EarningsChart dateRange={dateRange} chartData={chartData} />
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <div className="text-center">
                  <FiBarChart2
                    size={40}
                    className="mx-auto text-gray-400 mb-3"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No earnings data available for the selected period
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Transfer To Account */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Withdraw Funds
            </h2>
            <TransferToAccount
              availableAmount={earningsSummary.available}
              onProcessWithdrawal={handleWithdrawal}
              isProcessing={withdrawalProcessing}
            />
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction History
            </h2>
            <button
              onClick={exportTransactionHistory}
              className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300">
              <FiDownload className="mr-1" size={16} />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            {transactions.length > 0 ? (
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
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(transaction.date).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span
                          className={`flex items-center ${
                            transaction.status === 'paid_out'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                          {transaction.status === 'paid_out' && (
                            <FiArrowUp className="mr-1" />
                          )}
                          {transaction.status !== 'paid_out' && (
                            <FiArrowDown className="mr-1" />
                          )}
                          ₱{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' ||
                            transaction.status === 'available'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : transaction.status === 'paid_out'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                          {transaction.status === 'completed'
                            ? 'Completed'
                            : transaction.status === 'available'
                            ? 'Available'
                            : transaction.status === 'paid_out'
                            ? 'Paid Out'
                            : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center">
                <FiDollarSign
                  size={40}
                  className="mx-auto text-gray-400 mb-3"
                />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No transactions found.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Transactions will appear here as you receive bookings and
                  withdraw funds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsDashboard;
