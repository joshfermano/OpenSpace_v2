import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileInformation from '../../components/Edit Profile/ProfileInformation';
import VerificationStatus from '../../components/Edit Profile/VerificationStatus';

interface HostInfo {
  bio?: string;
  languagesSpoken?: string[];
  responseRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
  hostSince?: Date;
}

interface ExtendedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  profileImage?: string;
  role: 'user' | 'host' | 'admin';
  dateJoined?: string;
  createdAt?: string;
  verificationLevel: 'basic' | 'verified' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  identificationDocument?: {
    idType?: string;
    idNumber?: string;
    idImage?: string;
    uploadDate?: Date;
    verificationStatus?: 'pending' | 'approved' | 'rejected';
    verificationDate?: Date;
    rejectionReason?: string;
  };
  hostInfo?: HostInfo;
}

const EditUserProfile = () => {
  const { user, refreshUser } = useAuth();
  const extendedUser = user as ExtendedUser | null;

  const [hostModeEnabled, setHostModeEnabled] = useState(
    extendedUser?.role === 'host'
  );

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Update host mode status and other user data when the user info changes
  useEffect(() => {
    if (extendedUser) {
      setHostModeEnabled(extendedUser.role === 'host');
    }
  }, [extendedUser]);

  // Handle refreshing user data and updating UI state
  const handleRefreshUser = async () => {
    try {
      await refreshUser();
      // After refreshing user data, we need to update the hostModeEnabled state
      if (user) {
        setHostModeEnabled((user as ExtendedUser).role === 'host');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setMessage({
        type: 'error',
        text: 'Failed to refresh user data. Please try again.',
      });
    }
  };

  // Set global message with auto-clear after 5 seconds
  const setGlobalMessage = (
    newMessage: {
      type: 'success' | 'error';
      text: string;
    } | null
  ) => {
    setMessage(newMessage);

    // Auto-clear success messages after 5 seconds
    if (newMessage && newMessage.type === 'success') {
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your personal information and verification status
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {message.text}
          </div>
        )}

        {/* Profile Information Form */}
        <ProfileInformation
          user={extendedUser}
          refreshUser={handleRefreshUser}
          setGlobalMessage={setGlobalMessage}
        />

        {/* Verification Status */}
        <VerificationStatus
          user={extendedUser}
          refreshUser={handleRefreshUser}
          setGlobalMessage={setGlobalMessage}
        />
      </div>
    </div>
  );
};

export default EditUserProfile;
