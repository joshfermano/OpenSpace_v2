import { useState, useEffect } from 'react';
import { FiDollarSign, FiUsers, FiPieChart, FiLoader } from 'react-icons/fi';
import { adminEarningsApi } from '../../services/adminEarningsApi';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PlatformRevenueDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [revenueData, setRevenueData] = useState<any>({
    summary: { totalFees: 0, totalBookings: 0, avgFee: 0 },
    byPaymentMethod: [],
    monthlyTrend: [],
  });
  const [error, setError] = useState<string | null>(null);

  // If not authenticated or not admin, redirect to home
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    async function fetchRevenueData() {
      setIsLoading(true);
      try {
        const response = await adminEarningsApi.getPlatformRevenueSummary(
          period
        );

        if (response.success) {
          setRevenueData(response.data);
        } else {
          setError(response.message || 'Failed to load revenue data');
        }
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRevenueData();
  }, [period]);

  // Format monetary value
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get month name from month number (1-12)
  const getMonthName = (monthNumber: number) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[monthNumber - 1];
  };

  // Prepare monthly trend data for chart display
  const chartData =
    revenueData.monthlyTrend?.map((item: any) => ({
      name: getMonthName(item.month),
      revenue: item.revenue,
    })) || [];

  // Prepare payment method data for chart display
  const paymentMethodChartData =
    revenueData.byPaymentMethod?.map((item: any) => ({
      name:
        item._id === 'property'
          ? 'Pay at Property'
          : item._id === 'card'
          ? 'Credit Card'
          : item._id === 'gcash'
          ? 'GCash'
          : item._id === 'maya'
          ? 'Maya'
          : item._id,
      value: item.totalFees,
    })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue flex items-center justify-center">
        <div className="text-center">
          <FiLoader
            size={40}
            className="animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-4"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading revenue data...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400 text-xl font-semibold mb-2">
            Error Loading Data
          </div>
          <p className="text-red-500 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-light">
                Platform Revenue
              </h1>
              <p className="text-gray-600 dark:text-light/80 mt-1">
                Overview of all platform earnings and financial metrics
              </p>
            </div>

            {/* Period Filter */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setPeriod('today')}
                className={`px-4 py-2 text-sm font-medium ${
                  period === 'today'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:text-darkBlue dark:hover:bg-gray-750'
                } rounded-l-lg`}>
                Today
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 text-sm font-medium ${
                  period === 'week'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:text-darkBlue dark:hover:bg-gray-750'
                } border-x border-gray-200 dark:border-gray-700`}>
                Week
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 text-sm font-medium ${
                  period === 'month'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:text-darkBlue dark:hover:bg-gray-750'
                } border-r border-gray-200 dark:border-gray-700`}>
                Month
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-4 py-2 text-sm font-medium ${
                  period === 'year'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:text-darkBlue dark:hover:bg-gray-750'
                } border-r border-gray-200 dark:border-gray-700`}>
                Year
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 text-sm font-medium ${
                  period === 'all'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:text-darkBlue dark:hover:bg-gray-750'
                } rounded-r-lg`}>
                All Time
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(revenueData.summary.totalFees)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiDollarSign
                    className="text-green-600 dark:text-green-400"
                    size={20}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {period === 'today'
                  ? "Today's earnings"
                  : period === 'week'
                  ? "This week's earnings"
                  : period === 'month'
                  ? "This month's earnings"
                  : period === 'year'
                  ? "This year's earnings"
                  : 'Lifetime earnings'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {revenueData.summary.totalBookings}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiUsers
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {period === 'today'
                  ? 'Bookings made today'
                  : period === 'week'
                  ? 'Bookings this week'
                  : period === 'month'
                  ? 'Bookings this month'
                  : period === 'year'
                  ? 'Bookings this year'
                  : 'Total bookings'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Average Platform Fee
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatCurrency(revenueData.summary.avgFee)}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiPieChart
                    className="text-purple-600 dark:text-purple-400"
                    size={20}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Average fee per booking
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Monthly Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Monthly Revenue Trend
              </h2>
              <div className="h-72">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tickFormatter={(value) => `₱${value / 1000}k`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${formatCurrency(Number(value))}`,
                          'Revenue',
                        ]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      No monthly trend data available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Revenue by Payment Method
              </h2>
              <div className="h-72">
                {paymentMethodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={paymentMethodChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.1}
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => `₱${value / 1000}k`}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${formatCurrency(Number(value))}`,
                          'Revenue',
                        ]}
                        labelFormatter={(label) => `Payment Method: ${label}`}
                      />
                      <Bar dataKey="value" fill="#10B981" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      No payment method data available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Payment Method Breakdown
            </h2>
            {revenueData.byPaymentMethod &&
            revenueData.byPaymentMethod.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {revenueData.byPaymentMethod.map(
                  (method: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-200 dark:bg-gray-600 dark:bg-gray-750 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {method._id === 'property'
                            ? 'Pay at Property'
                            : method._id === 'card'
                            ? 'Credit Card'
                            : method._id === 'gcash'
                            ? 'GCash'
                            : method._id === 'maya'
                            ? 'Maya'
                            : method._id}
                        </h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(method.totalFees)}
                      </p>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Bookings
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {method.count}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Avg per booking
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(method.totalFees / method.count)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  No payment method data available for the selected period
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformRevenueDashboard;
