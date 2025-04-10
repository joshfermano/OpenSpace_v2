import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Bookings
import ViewBooking from './pages/Bookings/viewBooking';
import ViewAllBookings from './pages/Bookings/ViewAllBookings';

// Password Reset
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ForgotPasswordSent from './pages/Auth/ForgotPasswordSent';

// Rooms
import ViewAllListings from './pages/Room/ViewAllListings';
import ViewAllFavorites from './pages/Room/ViewAllFavorites';

// Dashboard Pages
import EarningsDashboard from './pages/Dashboard/EarningsDashboard';

// UI Pages
import Homepage from './pages/Ui/Homepage';
import About from './pages/Ui/About';
import NotFound from './pages/Ui/NotFound';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLogin from './pages/Auth/AdminLogin';
import AdminRegister from './pages/Auth/AdminRegister';

// User Pages
import UserDashboard from './pages/User/UserDashboard';
import HostBookings from './pages/Host/HostBookings';
import EditUserProfile from './pages/User/EditUserProfile';
import AdminDashboard from './pages/User/AdminDashboard';
import BecomeHost from './pages/Host/BecomeHost';

// Room Pages
import ViewRoom from './pages/Room/ViewRoom';
import CreateRoom from './pages/Room/CreateRoom';
import EditRoom from './pages/Room/EditRoom';

// Payment Pages
import PaymentPage from './pages/Payment/PaymentPage';
import PaymentConfirmation from './pages/Payment/PaymentConfirmation';

// Host Pages
import HostProfile from './pages/Host/HostProfile';

// Verification Pages
import EmailVerification from './pages/Verification/EmailVerification';
import EmailSent from './pages/Verification/EmailSent';
import PasswordResetVerification from './pages/Verification/PasswordResetVerification';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Main Layout Routes */}
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Homepage />} />
        <Route path="about" element={<About />} />
        <Route path="rooms/:roomId" element={<ViewRoom />} />
        <Route path="hosts/:hostId" element={<HostProfile />} />
        <Route path="become-host" element={<BecomeHost />} />

        {/* Verification Routes */}
        <Route path="verification">
          <Route
            path="email-verification"
            element={
              <ProtectedRoute>
                <EmailVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="email-sent"
            element={
              <ProtectedRoute>
                <EmailSent />
              </ProtectedRoute>
            }
          />
          <Route
            path="password-reset"
            element={
              <ProtectedRoute>
                <PasswordResetVerification />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Routes - User */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/earnings"
          element={
            <ProtectedRoute requiredRole="host">
              <EarningsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/edit"
          element={
            <ProtectedRoute>
              <EditUserProfile />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Bookings */}
        <Route
          path="/bookings/view/:bookingId"
          element={
            <ProtectedRoute>
              <ViewBooking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/host/bookings"
          element={
            <ProtectedRoute requiredRole="host">
              <HostBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/all"
          element={
            <ProtectedRoute>
              <ViewAllBookings />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Listings & Favorites */}
        <Route
          path="/listings/all"
          element={
            <ProtectedRoute requiredRole="host">
              <ViewAllListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites/all"
          element={
            <ProtectedRoute>
              <ViewAllFavorites />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Payments */}
        <Route
          path="payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/confirmation"
          element={
            <ProtectedRoute>
              <PaymentConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Host */}
        <Route path="rooms">
          <Route
            path="create"
            element={
              <ProtectedRoute requiredRole="host">
                <CreateRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit/:roomId"
            element={
              <ProtectedRoute requiredRole="host">
                <EditRoom />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Routes - Admin */}
        <Route path="admin">
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth Layout Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="admin-login" element={<AdminLogin />} />
        <Route path="admin-register" element={<AdminRegister />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/reset-password/:token" element={<ForgotPasswordSent />} />
    </>
  )
);

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
