import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ChartConfiguration } from 'chart.js';

interface EarningsChartProps {
  dateRange: string;
  chartData: any;
}

const EarningsChart: React.FC<EarningsChartProps> = ({
  dateRange,
  chartData,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const generateChartData = () => {
    let labels: string[] = [];
    let data: number[] = [];

    if (chartData && chartData.earnings && chartData.earnings.length > 0) {
      // Use real data if available
      if (dateRange === 'week') {
        // Group by days of the week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayTotals = Array(7).fill(0);

        chartData.earnings.forEach((earning: any) => {
          const date = new Date(earning.createdAt);
          const dayIndex = date.getDay();
          dayTotals[dayIndex] += earning.hostPayout;
        });

        labels = days;
        data = dayTotals;
      } else if (dateRange === 'month') {
        // Group by weeks
        const weeklyData: Record<string, number> = {};
        const now = new Date();

        // Initialize 4 weeks
        for (let i = 0; i < 4; i++) {
          const weekLabel = `Week ${4 - i}`;
          weeklyData[weekLabel] = 0;
        }

        chartData.earnings.forEach((earning: any) => {
          const date = new Date(earning.createdAt);
          const daysSinceToday = Math.floor(
            (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)
          );
          const weekNum = Math.min(4, Math.floor(daysSinceToday / 7) + 1);

          if (weekNum <= 4) {
            const weekLabel = `Week ${weekNum}`;
            weeklyData[weekLabel] =
              (weeklyData[weekLabel] || 0) + earning.hostPayout;
          }
        });

        labels = Object.keys(weeklyData).reverse();
        data = labels.map((label) => weeklyData[label]);
      } else if (dateRange === 'year') {
        // Group by months
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const monthlyTotals = Array(12).fill(0);

        chartData.earnings.forEach((earning: any) => {
          const date = new Date(earning.createdAt);
          const monthIndex = date.getMonth();
          monthlyTotals[monthIndex] += earning.hostPayout;
        });

        labels = months;
        data = monthlyTotals;
      }
    } else {
      // Fallback to mock data if no real data is available
      if (dateRange === 'week') {
        labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        data = [500, 1200, 900, 1500, 800, 2300, 1700];
      } else if (dateRange === 'month') {
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        data = [3500, 4200, 6800, 5300];
      } else if (dateRange === 'year') {
        labels = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        data = [
          2100, 2400, 3200, 3800, 4200, 4800, 5500, 5900, 4500, 3900, 3400,
          2800,
        ];
      }
    }

    return { labels, data };
  };

  const createChartConfig = (
    isDarkMode: boolean,
    labels: string[],
    data: number[]
  ): ChartConfiguration => {
    const textColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(17, 24, 39, 1)';
    const gridColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(75, 85, 99, 0.2)';

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Earnings',
            data,
            backgroundColor: isDarkMode
              ? 'rgba(59, 130, 246, 0.6)'
              : 'rgba(37, 99, 235, 0.7)',
            borderColor: isDarkMode
              ? 'rgba(59, 130, 246, 1)'
              : 'rgba(29, 78, 216, 1)',
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: isDarkMode
              ? 'rgba(17, 24, 39, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            titleColor: isDarkMode ? '#fff' : '#111827',
            bodyColor: isDarkMode ? '#fff' : '#111827',
            padding: 12,
            cornerRadius: 4,
            callbacks: {
              label: function (context) {
                return '₱' + (context.raw as number).toLocaleString();
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            border: {
              color: isDarkMode
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(75, 85, 99, 0.5)',
              width: 1,
            },
            grid: {
              color: gridColor,
              lineWidth: 1,
            },
            ticks: {
              color: textColor,
              font: {
                weight: 600,
                size: 12,
                family: 'system-ui',
              },
              padding: 8,
              callback: function (value) {
                return '₱' + value.toLocaleString();
              },
            },
          },
          x: {
            border: {
              color: isDarkMode
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(75, 85, 99, 0.5)',
              width: 1,
            },
            grid: {
              display: false,
            },
            ticks: {
              color: textColor,
              font: {
                weight: 600,
                size: 12,
                family: 'system-ui',
              },
              padding: 8,
            },
          },
        },
      },
    };
  };

  useEffect(() => {
    const updateChart = () => {
      if (!chartRef.current) return;

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Clear previous chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const isDarkMode = document.documentElement.classList.contains('dark');
      const { labels, data } = generateChartData();
      const config = createChartConfig(isDarkMode, labels, data);

      chartInstance.current = new Chart(ctx, config);
    };

    // Initial chart creation
    updateChart();

    // Theme change handler
    const handleThemeChange = () => updateChart();

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [dateRange, chartData]);

  return <canvas ref={chartRef} />;
};

export default EarningsChart;
