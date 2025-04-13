import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  profileImage?: string;
  verificationLevel: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  phoneNumber?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<any>;
  checkAuth: () => Promise<void>;
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

  const isVerified = () => {
    if (!user) return false;
    return (
      user.verificationLevel === 'verified' ||
      user.verificationLevel === 'basic' ||
      user.role === 'admin'
    );
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await authApi.getCurrentUser();

      if (response.success && response.data) {
        setUser(response.data);
        console.log('Successfully authenticated as:', response.data.role);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getCurrentUser();

      if (!response.success) {
        throw new Error(response.message || 'Failed to refresh user data');
      }

      setUser(response.data);
      return response;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      clearError();
      setIsLoading(true);
      const response = await authApi.login(email, password);

      if (response.success) {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        setUser(response.data);
        return response.data;
      } else {
        setError(response.message || 'Login failed');
        return null;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      clearError();
      setIsLoading(true);
      const response = await authApi.register(userData);

      if (response.success) {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        setUser(response.data);
      } else {
        setError(response.message || 'Registration failed');
      }

      return response;
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration');
      throw error;
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
    checkAuth,
    refreshUser,
    clearError,
    isVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
