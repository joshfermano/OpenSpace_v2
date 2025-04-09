import { fetchWithAuth } from './core';

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
};
