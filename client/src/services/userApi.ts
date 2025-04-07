import { API_URL, fetchWithAuth } from './core';

export const userApi = {
  getUserDashboard: async () => {
    try {
      const response = await fetchWithAuth('/api/users/dashboard');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user dashboard:', error);
      return {
        success: false,
        message: 'Network error while fetching dashboard data',
      };
    }
  },

  getUserProfile: async () => {
    try {
      const response = await fetchWithAuth('/api/users/profile');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        message: 'Network error while fetching profile data',
      };
    }
  },

  updateUserProfile: async (profileData: any) => {
    try {
      const response = await fetchWithAuth('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        message: 'Network error while updating profile',
      };
    }
  },

  uploadProfileImage: async (formData: FormData) => {
    try {
      const response = await fetch(
        `${API_URL}/api/users/profile/upload-image`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error during profile image upload:', errorData);
        return {
          success: false,
          message: errorData.message || 'Error uploading profile image',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return {
        success: false,
        message: 'Network error while uploading image',
      };
    }
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await fetchWithAuth('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        message: 'Network error while changing password',
      };
    }
  },

  // Saved rooms (favorites/wishlist)
  getSavedRooms: async () => {
    try {
      const response = await fetchWithAuth('/api/users/saved-rooms');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching saved rooms:', error);
      return {
        success: false,
        message: 'Network error while fetching saved rooms',
      };
    }
  },

  saveRoom: async (roomId: string) => {
    try {
      const response = await fetchWithAuth('/api/users/save-room', {
        method: 'POST',
        body: JSON.stringify({ roomId }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving room:', error);
      return {
        success: false,
        message: 'Network error while saving room',
      };
    }
  },

  unsaveRoom: async (roomId: string) => {
    try {
      const response = await fetchWithAuth(`/api/users/saved-rooms/${roomId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing saved room:', error);
      return {
        success: false,
        message: 'Network error while removing saved room',
      };
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      const response = await fetchWithAuth('/api/users/notifications');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        message: 'Network error while fetching notifications',
      };
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      const response = await fetchWithAuth(
        `/api/users/notifications/${notificationId}/read`,
        {
          method: 'PUT',
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: 'Network error while updating notification',
      };
    }
  },
};
