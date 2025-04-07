export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_URL}${endpoint}`;

  // Create headers with initial values
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  });

  // Try to get token from localStorage if not already in headers
  if (!headers.has('Authorization')) {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Adding auth token from localStorage to request');
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  console.log(`Fetching ${endpoint} with options:`, {
    method: options.method || 'GET',
    hasAuth: headers.has('Authorization'),
    credentials: fetchOptions.credentials,
  });

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:expired'));
    }

    return response;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);

    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Network error',
          message: 'Unable to connect to server. Please try again later.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    throw error;
  }
};

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage as a fallback mechanism
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

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

  register: async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => {
    try {
      console.log('Sending registration request with data:', formData);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Network error during logout',
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await fetchWithAuth('/api/auth/me');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Network error while fetching user data',
      };
    }
  },

  // Email verification methods
  sendEmailVerificationOTP: async () => {
    try {
      console.log('Requesting email verification OTP...');
      const response = await fetchWithAuth('/api/email-verification/send-otp', {
        method: 'POST',
      });

      console.log('OTP request status:', response.status);
      const data = await response.json();
      console.log('OTP response data:', data);

      return data;
    } catch (error) {
      console.error('Error requesting email verification:', error);
      return {
        success: false,
        message: 'Network error while requesting verification email',
      };
    }
  },

  resendEmailVerification: async () => {
    try {
      console.log('Resending email verification OTP...');
      const response = await fetchWithAuth(
        '/api/email-verification/resend-otp',
        {
          method: 'POST',
        }
      );

      console.log('Resend OTP request status:', response.status);
      const data = await response.json();
      console.log('Resend OTP response data:', data);

      return data;
    } catch (error) {
      console.error('Error resending email verification:', error);
      return {
        success: false,
        message: 'Network error while resending verification email',
      };
    }
  },

  verifyEmailWithOTP: async (otp: string) => {
    try {
      console.log('Verifying email with OTP:', otp);
      const response = await fetchWithAuth(
        '/api/email-verification/verify-otp',
        {
          method: 'POST',
          body: JSON.stringify({ otp }),
        }
      );

      console.log('Verify OTP request status:', response.status);
      const data = await response.json();
      console.log('Verify OTP response data:', data);

      return data;
    } catch (error) {
      console.error('Error verifying email:', error);
      return {
        success: false,
        message: 'Network error while verifying email',
      };
    }
  },

  // Test email delivery
  testEmail: async (email: string) => {
    try {
      console.log(`Testing email delivery to: ${email}`);
      const response = await fetchWithAuth(
        '/api/email-verification/test-email',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );

      console.log('Test email response status:', response.status);
      const data = await response.json();
      console.log('Test email response data:', data);

      return data;
    } catch (error) {
      console.error('Error testing email:', error);
      return {
        success: false,
        message: 'Error testing email delivery',
      };
    }
  },

  // Password reset
  sendPasswordResetEmail: async (email: string) => {
    try {
      console.log(`Sending password reset email to: ${email}`);
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        message: 'Network error while sending password reset email',
      };
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      console.log('Resetting password with token');
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'Network error while resetting password',
      };
    }
  },
};

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
      // Note: Don't set Content-Type header, let the browser set it with the boundary
      const response = await fetchWithAuth('/api/users/profile/upload-image', {
        method: 'POST',
        headers: {
          // Remove Content-Type so browser can set it with proper boundary
        } as any,
        body: formData,
      });
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
};

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
};
