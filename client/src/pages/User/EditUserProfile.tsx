import { useState } from 'react';
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
  verificationLevel: 'none' | 'basic' | 'verified';
  isGovernmentIdVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
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

  // Update host mode status when user info changes
  const updateHostMode = (isHost: boolean) => {
    setHostModeEnabled(isHost);
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
          refreshUser={refreshUser}
          setGlobalMessage={setMessage}
        />

        {/* Verification Status */}
        <VerificationStatus
          user={extendedUser}
          refreshUser={refreshUser}
          setGlobalMessage={setMessage}
          isHostModeEnabled={hostModeEnabled}
        />
      </div>
    </div>
  );
};

export default EditUserProfile;
