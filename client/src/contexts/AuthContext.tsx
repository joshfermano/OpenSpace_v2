import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  role: 'user' | 'host' | 'admin';
  verificationLevel: 'none' | 'basic' | 'verified';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (formData: FormData) => Promise<User | null>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  isVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Function to check if the user is verified
  const isVerified = () => {
    if (!user) return false;
    return (
      user.verificationLevel === 'verified' ||
      user.verificationLevel === 'basic'
    );
  };

  // Enhanced checkAuth function
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getCurrentUser();

      console.log('Auth check response:', response);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        // Clear any existing auth data
        document.cookie =
          'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthExpired = () => {
      setUser(null);
      setError('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getCurrentUser();

      if (!response.success) {
        throw new Error(response.message || 'Failed to refresh user data');
      }

      setUser(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to refresh user data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      setIsLoading(true);
      clearError();

      const response = await authApi.login(email, password);

      if (response.success) {
        setUser(response.data);
        return response.data;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: FormData): Promise<User | null> => {
    try {
      setIsLoading(true);
      clearError();

      const userData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phoneNumber: (formData.get('phoneNumber') as string) || undefined,
      };

      console.log('Sending registration data:', userData);

      const response = await authApi.register(userData);

      if (response.success) {
        setUser(response.data);
        return response.data;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
    refreshUser,
    clearError,
    isVerified, // Added to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
