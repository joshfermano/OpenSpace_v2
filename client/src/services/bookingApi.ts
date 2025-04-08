import { fetchWithAuth } from './core';

export const bookingApi = {
  createBooking: async (bookingData: any) => {
    try {
      const response = await fetchWithAuth('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        message: 'Network error while creating booking',
      };
    }
  },

  getUserBookings: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await fetchWithAuth(
        `/api/bookings/my/bookings?${queryString}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return {
        success: false,
        message: 'Network error while fetching bookings',
      };
    }
  },

  getBookingById: async (bookingId: string) => {
    try {
      const response = await fetchWithAuth(`/api/bookings/${bookingId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching booking ${bookingId}:`, error);
      return {
        success: false,
        message: 'Network error while fetching booking details',
      };
    }
  },

  processCardPayment: async (bookingId: string, cardDetails: any) => {
    try {
      const response = await fetchWithAuth('/api/bookings/payment', {
        method: 'POST',
        body: JSON.stringify({ bookingId, cardDetails }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        message: 'Network error while processing payment',
      };
    }
  },

  cancelBooking: async (bookingId: string, reason?: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/bookings/${bookingId}/cancel`,
        {
          method: 'PATCH',
          body: JSON.stringify({ reason }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
      return {
        success: false,
        message: 'Network error while cancelling booking',
      };
    }
  },

  canReviewRoom: async (roomId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/bookings/room/${roomId}/can-review`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error checking if can review room ${roomId}:`, error);
      return {
        success: false,
        message: 'Network error while checking review eligibility',
      };
    }
  },

  // Host booking management
  getHostBookings: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await fetchWithAuth(
        `/api/bookings/host/bookings?${queryString}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching host bookings:', error);
      return {
        success: false,
        message: 'Network error while fetching host bookings',
      };
    }
  },

  confirmBooking: async (bookingId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/bookings/${bookingId}/confirm`,
        {
          method: 'PATCH',
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error confirming booking ${bookingId}:`, error);
      return {
        success: false,
        message: 'Network error while confirming booking',
      };
    }
  },

  completeBooking: async (bookingId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/bookings/${bookingId}/complete`,
        {
          method: 'PATCH',
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error completing booking ${bookingId}:`, error);
      return {
        success: false,
        message: 'Network error while completing booking',
      };
    }
  },
};
