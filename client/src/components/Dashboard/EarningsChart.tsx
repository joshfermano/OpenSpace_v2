import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ChartConfiguration } from 'chart.js';

interface EarningsChartProps {
  dateRange: string;
}

const EarningsChart: React.FC<EarningsChartProps> = ({ dateRange }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const generateChartData = () => {
    let labels: string[] = [];
    let data: number[] = [];

    if (dateRange === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = [1200, 900, 1500, 800, 2300, 1700, 1100];
    } else if (dateRange === 'month') {
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      data = [5500, 4200, 6800, 7300, 3600];
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
        2100, 2400, 3200, 3800, 4200, 4800, 5500, 5900, 4500, 3900, 3400, 2800,
      ];
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
      : 'rgba(17, 24, 39, 1)'; // gray-900 for better visibility in light mode

    const gridColor = isDarkMode
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(75, 85, 99, 0.2)'; // gray-600 with opacity

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Earnings',
            data,
            backgroundColor: isDarkMode
              ? 'rgba(59, 130, 246, 0.6)' // blue-500 with opacity
              : 'rgba(37, 99, 235, 0.7)', // blue-600 with opacity
            borderColor: isDarkMode
              ? 'rgba(59, 130, 246, 1)' // blue-500
              : 'rgba(29, 78, 216, 1)', // blue-700
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
  }, [dateRange]);

  return <canvas ref={chartRef} />;
};

export default EarningsChart;
