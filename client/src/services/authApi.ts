import { API_URL, fetchWithAuth } from './core';

export const authApi = {
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

  sendEmailVerificationOTP: async () => {
    try {
      console.log('Requesting email verification OTP...');
      const response = await fetchWithAuth(
        '/api/auth/email-verification/send',
        {
          method: 'POST',
        }
      );

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
        '/api/auth/email-verification/resend',
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
        '/api/auth/email-verification/verify',
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
};
