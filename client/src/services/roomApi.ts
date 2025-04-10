import { fetchWithAuth } from './core';
import { API_URL } from './core';

export const roomApi = {
  getRooms: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await fetchWithAuth(`/api/rooms?${queryString}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return {
        success: false,
        message: 'Network error while fetching rooms',
      };
    }
  },

  getRoomById: async (roomId: string) => {
    try {
      const response = await fetchWithAuth(`/api/rooms/${roomId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching room ${roomId}:`, error);
      return {
        success: false,
        message: 'Network error while fetching room details',
      };
    }
  },

  getMyRooms: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      console.log('Fetching my rooms from API...');
      const response = await fetchWithAuth(
        `/api/rooms/my/listings?${queryString}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      console.log('My rooms API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching my rooms:', error);
      return {
        success: false,
        message: 'Network error while fetching your rooms',
      };
    }
  },

  createRoom: async (roomData: any) => {
    try {
      const response = await fetchWithAuth('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating room:', error);
      return {
        success: false,
        message: 'Network error while creating room',
      };
    }
  },

  updateRoom: async (roomId: string, roomData: any) => {
    try {
      const response = await fetchWithAuth(`/api/rooms/${roomId}`, {
        method: 'PUT',
        body: JSON.stringify(roomData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating room ${roomId}:`, error);
      return {
        success: false,
        message: 'Network error while updating room',
      };
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      const response = await fetchWithAuth(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting room ${roomId}:`, error);
      return {
        success: false,
        message: 'Network error while deleting room',
      };
    }
  },

  uploadRoomImages: async (roomId: string, imageFiles: File[]) => {
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`${API_URL}/api/rooms/${roomId}/images`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error uploading images for room ${roomId}:`, error);
      return {
        success: false,
        message: 'Network error while uploading images',
      };
    }
  },

  favoriteRoom: async (roomId: string) => {
    try {
      const response = await fetchWithAuth('/api/users/save-room', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error adding room ${roomId} to favorites:`, error);
      return {
        success: false,
        message: 'Network error while adding room to favorites',
      };
    }
  },

  unfavoriteRoom: async (roomId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/users/unsave-rooms/${roomId}`,
        {
          method: 'DELETE',
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error removing room ${roomId} from favorites:`, error);
      return {
        success: false,
        message: 'Network error while removing room from favorites',
      };
    }
  },

  getFavoriteRooms: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(
        params as Record<string, string>
      ).toString();
      const response = await fetchWithAuth(
        `/api/users/saved-rooms?${queryString}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching favorite rooms:', error);
      return {
        success: false,
        message: 'Network error while fetching favorite rooms',
      };
    }
  },

  getRoomReviews: async (roomId: string) => {
    try {
      const response = await fetchWithAuth(`/api/reviews/room/${roomId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching reviews for room ${roomId}:`, error);
      return {
        success: false,
        message: 'Network error while fetching reviews',
      };
    }
  },

  addRoomReview: async (roomId: string, reviewData: any) => {
    try {
      const response = await fetchWithAuth(`/api/reviews/room/${roomId}`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error adding review to room ${roomId}:`, error);
      return {
        success: false,
        message: 'Network error while adding review',
      };
    }
  },

  deleteRoomReview: async (reviewId: string) => {
    try {
      const response = await fetchWithAuth(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      return {
        success: false,
        message: 'Network error while deleting review',
      };
    }
  },

  editRoomReview: async (reviewId: string, reviewData: any) => {
    try {
      const response = await fetchWithAuth(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(reviewData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating review ${reviewId}:`, error);
      return {
        success: false,
        message: 'Network error while updating review',
      };
    }
  },
};
