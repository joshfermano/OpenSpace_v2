import { API_URL, fetchWithAuth } from './core';

export const emailApi = {
  sendEmailVerificationOTP: async () => {
    try {
      console.log('Requesting email verification OTP...');
      const response = await fetchWithAuth('/api/email-verification/send-otp', {
        method: 'POST',
        credentials: 'include',
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

  // Resend verification email
  resendEmailVerification: async (email: string) => {
    try {
      console.log('Resending email verification OTP...');

      const response = await fetch(
        `${API_URL}/api/email-verification/resend-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

  // Verify email with OTP
  verifyEmailWithOTP: async (otp: string, email?: string) => {
    try {
      console.log('Verifying email with OTP:', otp);

      const response = await fetch(
        `${API_URL}/api/email-verification/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

  // Test email delivery (for troubleshooting)
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
