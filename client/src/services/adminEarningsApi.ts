import { fetchWithAuth } from './core';

export const adminEarningsApi = {
  /**
   * Get dashboard summary with earnings and counts
   */
  getDashboardSummary: async () => {
    try {
      const response = await fetchWithAuth(
        '/api/admin/earnings/dashboard-summary'
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return {
        success: false,
        message: 'Network error while fetching dashboard summary',
      };
    }
  },

  /**
   * Get platform revenue summary with optional period filter
   * @param period - 'today', 'week', 'month', 'year', or 'all'
   */
  getPlatformRevenueSummary: async (period = 'all') => {
    try {
      const response = await fetchWithAuth(
        `/api/admin/earnings/revenue-summary?period=${period}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
      return {
        success: false,
        message: 'Network error while fetching revenue summary',
      };
    }
  },

  /**
   * Get top performing hosts
   * @param limit - Number of hosts to return
   * @param period - 'month', 'year', or 'all'
   */
  getTopHosts: async (limit = 10, period = 'all') => {
    try {
      const response = await fetchWithAuth(
        `/api/admin/earnings/top-hosts?limit=${limit}&period=${period}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching top hosts:', error);
      return {
        success: false,
        message: 'Network error while fetching top hosts',
      };
    }
  },

  /**
   * Get transaction history with pagination and optional filters
   */
  getTransactionHistory: async (
    options: {
      page?: number;
      limit?: number;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) => {
    try {
      const {
        page = 1,
        limit = 20,
        paymentMethod,
        startDate,
        endDate,
      } = options;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (paymentMethod) queryParams.append('paymentMethod', paymentMethod);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetchWithAuth(
        `/api/admin/earnings/transactions?${queryParams.toString()}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return {
        success: false,
        message: 'Network error while fetching transaction history',
      };
    }
  },

  /**
   * Get host payout details
   * @param hostId - ID of the host
   */
  getHostPayoutDetails: async (hostId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/admin/earnings/host-payout/${hostId}`
      );
      return await response.json();
    } catch (error) {
      console.error(`Error fetching payout details for host ${hostId}:`, error);
      return {
        success: false,
        message: 'Network error while fetching host payout details',
      };
    }
  },

  /**
   * Process host payout
   * @param hostId - ID of the host
   * @param earningIds - Array of earning IDs to process
   * @param method - Payment method (bank, gcash, maya, etc)
   * @param reference - Optional reference number
   */
  processHostPayout: async (
    hostId: string,
    earningIds: string[],
    method: string,
    reference?: string
  ) => {
    try {
      const response = await fetchWithAuth(
        '/api/admin/earnings/process-payout',
        {
          method: 'POST',
          body: JSON.stringify({
            hostId,
            earningIds,
            method,
            reference,
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
};
