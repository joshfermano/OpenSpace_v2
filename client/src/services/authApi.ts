import { API_URL, fetchWithAuth } from './core';

export const authApi = {
  register: async (userData: FormData | any) => {
    try {
      console.log('Sending registration request with data:', userData);

      let headers = {};
      let requestBody;

      // Check if userData is FormData
      if (userData instanceof FormData) {
        // Don't set Content-Type header - the browser will set it with the boundary
        requestBody = userData;
      } else {
        // If it's JSON data
        headers = {
          'Content-Type': 'application/json',
        };
        requestBody = JSON.stringify(userData);
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: requestBody,
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

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await fetchWithAuth('/api/auth/logout', {
        method: 'GET',
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
      console.log('Fetching current user data...');
      const response = await fetchWithAuth('/api/auth/me');

      console.log('Current user response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from /api/auth/me:', errorText);

        return {
          success: false,
          message:
            response.status === 401
              ? 'User session expired or invalid'
              : `Server error: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('Current user data retrieved successfully');
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Network error while fetching user data',
      };
    }
  },

  // Email verification
  initiateEmailVerification: async (email: string) => {
    try {
      const response = await fetchWithAuth(
        '/api/auth/email-verification/initiate',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initiating email verification:', error);
      return {
        success: false,
        message: 'Network error while initiating email verification',
      };
    }
  },

  resendEmailVerification: async () => {
    try {
      console.log('Resending email verification OTP...');

      // Get user info from context, not localStorage
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const email = user?.email;

      if (!email) {
        return {
          success: false,
          message: 'No user email found. Please log in again.',
        };
      }

      console.log(`Attempting to resend verification to: ${email}`);

      // Use the /send endpoint which is properly configured as public
      const response = await fetch(
        `${API_URL}/api/auth/email-verification/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          credentials: 'include',
          body: JSON.stringify({ email }),
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

  updatePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await fetchWithAuth('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      return data;
    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Network error while updating password',
      };
    }
  },

  verifyEmailWithOTP: async (otp: string) => {
    try {
      console.log('Verifying email with OTP:', otp);
      const token = localStorage.getItem('token');
      const email = JSON.parse(localStorage.getItem('user') || '{}')?.email;

      const response = await fetch(
        `${API_URL}/api/auth/email-verification/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          credentials: 'include',
          body: JSON.stringify({ otp, email }),
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

  // Phone verification
  initiatePhoneVerification: async (phoneNumber: string) => {
    try {
      const response = await fetchWithAuth(
        '/api/auth/phone-verification/initiate',
        {
          method: 'POST',
          body: JSON.stringify({ phoneNumber }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initiating phone verification:', error);
      return {
        success: false,
        message: 'Network error while initiating phone verification',
      };
    }
  },

  verifyPhoneWithOTP: async (otp: string) => {
    try {
      const response = await fetchWithAuth(
        '/api/auth/phone-verification/verify',
        {
          method: 'POST',
          body: JSON.stringify({ otp }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying phone:', error);
      return {
        success: false,
        message: 'Network error while verifying phone',
      };
    }
  },

  // ID verification
  uploadIdVerification: async (verificationData: {
    idType: string;
    idNumber: string;
    idImage: string;
    businessDocument?: {
      certificateType: string;
      certificateNumber: string;
      certificateImage: string;
    };
  }) => {
    try {
      const response = await fetchWithAuth('/api/auth/id-verification/upload', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading ID verification:', error);
      return {
        success: false,
        message: 'Network error while uploading ID verification',
      };
    }
  },

  // Password reset
  requestPasswordReset: async (email: string) => {
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

  validateResetToken: async (token: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/validate-reset-token/${token}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating reset token:', error);
      return {
        success: false,
        message: 'Network error while validating reset token',
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

  // Host functionality
  becomeHost: async () => {
    try {
      const response = await fetchWithAuth('/api/auth/become-host', {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error becoming host:', error);
      return {
        success: false,
        message: 'Network error while processing host request',
      };
    }
  },

  // For email verification troubleshooting
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

  // Initial admin setup
  checkAdminExists: async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/check-admin-exists`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking admin existence:', error);
      return {
        success: false,
        adminExists: true,
        message: 'Network error while checking admin existence',
      };
    }
  },

  initialAdminSetup: async (userData: Record<string, any>) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/initial-admin-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in initial admin setup:', error);
      return {
        success: false,
        message: 'Network error while setting up admin account',
      };
    }
  },

  createAdmin: async (userData: Record<string, any>) => {
    try {
      const response = await fetchWithAuth('/api/admin/users/create-admin', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return {
        success: false,
        message: 'Network error while creating admin user',
      };
    }
  },
};
