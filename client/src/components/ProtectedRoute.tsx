import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'host' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkBlue"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with returnUrl
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If a specific role is required, check if the user has it
  if (requiredRole && user?.role !== requiredRole) {
    // For admin routes, redirect to dashboard
    if (requiredRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }

    // For host routes, redirect to become-host if user is not a host
    if (requiredRole === 'host' && user?.role === 'user') {
      return <Navigate to="/become-host" replace />;
    }

    // Default: redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
