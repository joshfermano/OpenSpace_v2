import { fetchWithAuth } from './core';

export const earningsApi = {
  /**
   * Get host earnings with pagination and optional status filter
   */
  getEarnings: async (page = 1, limit = 10, status?: string) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status ? { status } : {}),
      });

      const response = await fetchWithAuth(
        `/api/earnings?${queryParams.toString()}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching earnings:', error);
      return {
        success: false,
        message: 'Network error while fetching earnings',
      };
    }
  },

  /**
   * Get earnings summary including total, available, pending, and paid out amounts
   */
  getEarningsSummary: async () => {
    try {
      const response = await fetchWithAuth('/api/earnings/summary');
      return await response.json();
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      return {
        success: false,
        message: 'Network error while fetching earnings summary',
        data: {
          total: 0,
          available: 0,
          pending: 0,
          paidOut: 0,
          monthly: [],
        },
      };
    }
  },

  /**
   * Get earnings for a specific date range
   */
  getEarningsByDateRange: async (startDate: string, endDate: string) => {
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetchWithAuth(
        `/api/earnings/date-range?${queryParams.toString()}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching earnings by date range:', error);
      return {
        success: false,
        message: 'Network error while fetching earnings by date range',
      };
    }
  },

  /**
   * Generate earnings statement for tax purposes for a specific year
   */
  generateEarningsStatement: async (year: number) => {
    try {
      const response = await fetchWithAuth(`/api/earnings/statement/${year}`);
      return await response.json();
    } catch (error) {
      console.error('Error generating earnings statement:', error);
      return {
        success: false,
        message: 'Network error while generating earnings statement',
      };
    }
  },

  /**
   * Get earnings for a specific booking
   */
  getBookingEarnings: async (bookingId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/earnings/booking/${bookingId}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching booking earnings:', error);
      return {
        success: false,
        message: 'Network error while fetching booking earnings',
      };
    }
  },

  /**
   * Request payout for available earnings
   * Note: Your TransferToAccount component suggests implementing this functionality
   * but I don't see a direct endpoint for it in your backend. This is a suggested implementation.
   */
  requestPayout: async (
    amount: number,
    paymentMethod: string,
    accountNumber: string
  ) => {
    try {
      const response = await fetchWithAuth('/api/earnings/request-payout', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          paymentMethod,
          accountNumber,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error requesting payout:', error);
      return {
        success: false,
        message: 'Network error while requesting payout',
      };
    }
  },

  /**
   * Admin only: Process host payout
   */
  processHostPayout: async (
    hostId: string,
    earningIds: string[],
    payoutId: string
  ) => {
    try {
      const response = await fetchWithAuth(
        '/api/earnings/admin/process-payout',
        {
          method: 'POST',
          body: JSON.stringify({
            hostId,
            earningIds,
            payoutId,
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error processing host payout:', error);
      return {
        success: false,
        message: 'Network error while processing host payout',
      };
    }
  },

  /**
   * Admin only: Update earnings status (pending to available)
   */
  updateEarningsStatus: async () => {
    try {
      const response = await fetchWithAuth(
        '/api/earnings/admin/update-status',
        {
          method: 'PATCH',
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error updating earnings status:', error);
      return {
        success: false,
        message: 'Network error while updating earnings status',
      };
    }
  },

  /**
   * Get earnings data for the chart based on date range
   * This is a frontend helper method to format data for the EarningsChart component
   */
  getEarningsChartData: async (dateRange: string) => {
    try {
      // Get current date
      const today = new Date();
      let startDate: Date;
      let endDate = new Date(today);

      // Set start date based on selected range
      if (dateRange === 'week') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
      } else {
        // year
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
      }

      // Format dates for API request
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Get earnings data
      const response = await earningsApi.getEarningsByDateRange(
        formattedStartDate,
        formattedEndDate
      );

      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching earnings chart data:', error);
      return null;
    }
  },

  getTransactionHistory: async (page = 1, limit = 10) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetchWithAuth(
        `/api/earnings?${queryParams.toString()}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        const transactions = data.data.map((earning: any) => ({
          id: earning._id,
          date: earning.createdAt,
          amount: earning.hostPayout,
          status: earning.status === 'paid_out' ? 'completed' : earning.status,
          description: earning.booking
            ? `Booking #${earning.booking._id.substring(0, 4)}`
            : earning.status === 'paid_out'
            ? 'Payout'
            : 'Earning',
        }));

        return {
          ...data,
          transactions,
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return {
        success: false,
        message: 'Network error while fetching transaction history',
        transactions: [],
      };
    }
  },
};
