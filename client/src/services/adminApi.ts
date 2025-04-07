import { API_URL, fetchWithAuth } from './core';

export const adminApi = {
  createAdmin: async (userData: Record<string, any>) => {
    try {
      const response = await fetchWithAuth('/api/auth/admin/create', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin');
      }

      return data;
    } catch (error) {
      console.error('Admin creation error:', error);
      throw error;
    }
  },

  checkAdminExists: async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/check-admin-exists`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking if admin exists:', error);
      return {
        success: false,
        adminExists: true,
        message: 'Network error while checking admin status',
      };
    }
  },

  initialAdminSetup: async (userData: Record<string, any>) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/initial-admin-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create initial admin');
      }

      return data;
    } catch (error) {
      console.error('Initial admin setup error:', error);
      throw error;
    }
  },

  getDashboardSummary: async () => {
    try {
      console.log('Fetching admin dashboard summary...');

      const response = await fetchWithAuth(
        '/api/users/admin/dashboard-summary'
      );

      if (!response.ok) {
        console.error(
          'Server error fetching dashboard summary:',
          response.status,
          response.statusText
        );
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Dashboard summary data received:', data);

      return data;
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch dashboard summary',
        data: {
          totalUsers: 0,
          verifiedUsers: 0,
          unverifiedUsers: 0,
          bannedUsers: 0,
          pendingVerifications: 0,
          totalSpaces: 0,
          hostCount: 0,
        },
      };
    }
  },

  // User management
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await fetchWithAuth(
        `/api/users/admin/users?${queryParams.toString()}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  updateUser: async (userId: string, userData: any) => {
    try {
      const response = await fetchWithAuth(`/api/users/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await fetchWithAuth(`/api/auth/admin/user/${userId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  getPendingVerifications: async () => {
    try {
      const response = await fetchWithAuth('/api/auth/admin/id-verifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      return {
        success: false,
        message: 'Failed to fetch verification requests',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  verifyUserIdentity: async (userId: string, isApproved: boolean) => {
    try {
      const response = await fetchWithAuth(
        `/api/auth/admin/verify-id/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ isApproved }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error processing verification request:', error);
      return {
        success: false,
        message: 'Failed to process verification request',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  // Room approvals
  getPendingRoomApprovals: async () => {
    try {
      const response = await fetchWithAuth(
        '/api/rooms/admin/pending-approvals'
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching room approvals:', error);
      return {
        success: false,
        message: 'Failed to fetch room approvals',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  approveRoom: async (
    roomId: string,
    approved: boolean,
    rejectionReason?: string
  ) => {
    try {
      const response = await fetchWithAuth(
        `/api/rooms/admin/approve/${roomId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ approved, rejectionReason }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error approving/rejecting room:', error);
      return {
        success: false,
        message: 'Failed to process room approval',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  getPendingIdVerifications: async () => {
    try {
      const response = await fetchWithAuth('/api/auth/admin/id-verifications');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching pending ID verifications:', error);
      return {
        success: false,
        message: 'Network error while fetching verification requests',
      };
    }
  },

  verifyUserIdDocument: async (
    userId: string,
    verificationData: {
      isApproved: boolean;
      rejectionReason?: string;
    }
  ) => {
    try {
      // Fix the endpoint path to match the server route
      const response = await fetchWithAuth(
        `/api/auth/admin/id-verification/${userId}`, // This should match your backend route
        {
          method: 'PATCH',
          body: JSON.stringify(verificationData),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying user ID document:', error);
      return {
        success: false,
        message: 'Network error while processing verification',
      };
    }
  },

  banUser: async (userId: string, reason?: string) => {
    try {
      // Fix the endpoint and request structure
      const response = await fetchWithAuth(`/api/auth/admin/ban/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error banning user:', error);
      return {
        success: false,
        message: 'Network error while banning user',
      };
    }
  },

  unbanUser: async (userId: string) => {
    try {
      // Fix the endpoint
      const response = await fetchWithAuth(`/api/auth/admin/unban/${userId}`, {
        method: 'PATCH',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error unbanning user:', error);
      return {
        success: false,
        message: 'Network error while unbanning user',
      };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await fetchWithAuth('/api/users/admin/users');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return {
        success: false,
        message: 'Network error while fetching users',
      };
    }
  },

  getUserById: async (userId: string) => {
    try {
      const response = await fetchWithAuth(`/api/users/admin/users/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return {
        success: false,
        message: 'Network error while fetching user details',
      };
    }
  },

  updateUserById: async (userId: string, userData: Record<string, any>) => {
    try {
      const response = await fetchWithAuth(`/api/users/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Network error while updating user',
      };
    }
  },
};
