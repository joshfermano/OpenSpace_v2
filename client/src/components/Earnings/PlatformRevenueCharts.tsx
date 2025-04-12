import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { adminEarningsApi } from '../../services/adminEarningsApi';
import { FiLoader } from 'react-icons/fi';

interface PlatformRevenueChartsProps {
  period: string;
}

const PlatformRevenueCharts = ({ period }: PlatformRevenueChartsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChartData() {
      setIsLoading(true);
      try {
        const response = await adminEarningsApi.getPlatformRevenueSummary(
          period
        );
        if (response.success) {
          // Format monthly trend data for charting
          const monthlyTrendData =
            response.data.monthlyTrend?.map((item: any) => ({
              name: getMonthName(item.month),
              revenue: item.revenue,
            })) || [];

          setChartData(monthlyTrendData);
        } else {
          setError(response.message || 'Failed to load chart data');
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChartData();
  }, [period]);

  // Format currency
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-72">
        <FiLoader
          size={30}
          className="animate-spin text-blue-600 dark:text-blue-400"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-500 dark:text-red-300 text-center">{error}</p>
      </div>
    );
  }

  return (
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
            <Legend />
            <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No data available for the selected period
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatformRevenueCharts;
