import { API_URL, fetchWithAuth } from './core';

export const reviewApi = {
  getRoomReviews: async (roomId: string) => {
    try {
      const response = await fetchWithAuth(`/api/reviews/room/${roomId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching room reviews:', error);
      return {
        success: false,
        message: 'Failed to fetch reviews for this room',
      };
    }
  },

  // Check if user can review a room
  checkReviewEligibility: async (roomId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/reviews/eligibility/${roomId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return {
        success: false,
        canReview: false,
        message: 'Failed to check review eligibility',
      };
    }
  },

  createReview: async (reviewData: FormData) => {
    try {
      // Get the roomId value without removing it from FormData
      const roomId = reviewData.get('roomId');

      // Log the FormData contents for debugging
      console.log(
        'Files in FormData:',
        Array.from(reviewData.getAll('photos')).map((file) =>
          file instanceof File ? `${file.name} (${file.size} bytes)` : file
        )
      );

      // Use the correct endpoint pattern that matches the server route
      const response = await fetch(`${API_URL}/api/reviews/room/${roomId}`, {
        method: 'POST',
        credentials: 'include',
        body: reviewData, // Send complete FormData with files
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        message: 'Failed to submit your review',
      };
    }
  },

  // Update an existing review
  updateReview: async (reviewId: string, reviewData: FormData) => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        credentials: 'include',
        body: reviewData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        message: 'Failed to update your review',
      };
    }
  },

  // Delete a review
  deleteReview: async (reviewId: string) => {
    try {
      const response = await fetchWithAuth(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        message: 'Failed to delete your review',
      };
    }
  },

  // Get user's own reviews
  getUserReviews: async () => {
    try {
      const response = await fetchWithAuth('/api/reviews/user');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return {
        success: false,
        message: 'Failed to fetch your reviews',
      };
    }
  },

  // Get reviews for a host's properties
  getHostReviews: async () => {
    try {
      const response = await fetchWithAuth('/api/reviews/host');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching host reviews:', error);
      return {
        success: false,
        message: 'Failed to fetch reviews for your properties',
      };
    }
  },
};
