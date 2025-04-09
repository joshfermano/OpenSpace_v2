import { useState, useRef, useEffect } from 'react';
import { FiUser, FiCamera, FiInfo, FiLoader } from 'react-icons/fi';
import { userApi } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  hostInfo?: HostInfo;
  verificationLevel?: string;
}

interface ProfileInformationProps {
  user: ExtendedUser | null;
  refreshUser: () => Promise<void>;
  setGlobalMessage: (
    message: {
      type: 'success' | 'error';
      text: string;
    } | null
  ) => void;
  updateHostMode?: (isHost: boolean) => void;
}

const ProfileInformation = ({
  user: extendedUser,
  refreshUser,
  setGlobalMessage,
  updateHostMode,
}: ProfileInformationProps) => {
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: extendedUser?.firstName || '',
    lastName: extendedUser?.lastName || '',
    email: extendedUser?.email || '',
    phone: extendedUser?.phoneNumber || extendedUser?.phone || '',
    profileImage: extendedUser?.profileImage || '',
  });

  const [hostModeEnabled, setHostModeEnabled] = useState(
    extendedUser?.role === 'host'
  );

  const [hostInfo, setHostInfo] = useState({
    description: extendedUser?.hostInfo?.bio || '',
    languages: extendedUser?.hostInfo?.languagesSpoken?.join(', ') || '',
    responseTime: extendedUser?.hostInfo?.responseTime
      ? `${extendedUser.hostInfo.responseTime}`
      : 'Within a day',
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    extendedUser?.profileImage || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBecomingHost, setIsBecomingHost] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (extendedUser) {
      setFormData({
        firstName: extendedUser.firstName || '',
        lastName: extendedUser.lastName || '',
        email: extendedUser.email || '',
        phone: extendedUser.phoneNumber || extendedUser.phone || '',
        profileImage: extendedUser.profileImage || '',
      });

      setHostModeEnabled(extendedUser.role === 'host');

      setHostInfo({
        description: extendedUser.hostInfo?.bio || '',
        languages: extendedUser.hostInfo?.languagesSpoken?.join(', ') || '',
        responseTime: extendedUser.hostInfo?.responseTime
          ? `${extendedUser.hostInfo.responseTime}`
          : 'Within a day',
      });

      setPreviewImage(extendedUser.profileImage || null);
    }
  }, [extendedUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHostInfoChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setHostInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) return formData.profileImage;

    try {
      const uploadData = new FormData();
      uploadData.append('profileImage', profileImageFile);

      console.log('Uploading profile image...');
      const response = await userApi.uploadProfileImage(uploadData);
      console.log('Profile image upload response:', response);

      if (response.success) {
        return response.data.profileImage;
      } else {
        throw new Error(response.message || 'Failed to upload profile image');
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      throw error;
    }
  };

  const handleBecomeHost = async () => {
    if (isBecomingHost) return;

    if (!extendedUser || extendedUser.verificationLevel !== 'verified') {
      setGlobalMessage({
        type: 'error',
        text: 'You must be fully verified to become a host. Please complete your verification first.',
      });
      return;
    }

    // Check if host information is filled out
    if (!hostInfo.description.trim()) {
      setGlobalMessage({
        type: 'error',
        text: 'Please provide a bio/description to become a host.',
      });
      return;
    }

    setIsBecomingHost(true);
    setGlobalMessage(null);

    try {
      const languagesArray = hostInfo.languages
        .split(',')
        .map((lang) => lang.trim())
        .filter((lang) => lang.length > 0);

      const result = await userApi.becomeHost({
        bio: hostInfo.description.trim(),
        languagesSpoken: languagesArray,
      });

      if (result && result.success) {
        setGlobalMessage({
          type: 'success',
          text: 'Congratulations! You are now a host.',
        });
        // Refresh user data in context
        await refreshUser();
        setHostModeEnabled(true);
        // Notify parent component of host mode change
        if (updateHostMode) {
          updateHostMode(true);
        }
        // Scroll to top to see the success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result?.message || 'Failed to become a host');
      }
    } catch (error: any) {
      console.error('Become host error:', error);
      setGlobalMessage({
        type: 'error',
        text: error.message || 'Failed to become a host. Please try again.',
      });
    } finally {
      setIsBecomingHost(false);
    }
  };

  const convertResponseTimeToNumber = (timeString: string): number => {
    switch (timeString) {
      case 'Within an hour':
        return 1;
      case 'Within a few hours':
        return 4;
      case 'Within a day':
        return 24;
      case 'Within 2 days':
        return 48;
      default:
        return 24; // Default to 24 hours
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setGlobalMessage(null);

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and last name are required');
      }

      // Upload profile image if a new one was selected
      let profileImageUrl = formData.profileImage;
      if (profileImageFile) {
        try {
          const uploadResponse = await uploadProfileImage();
          if (uploadResponse) {
            profileImageUrl = uploadResponse;
          }
        } catch (error) {
          console.error('Profile image upload failed:', error);
        }
      }

      // Create profile update data
      const updatedUserData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phone.trim(),
        profileImage: profileImageUrl || '',
        ...(extendedUser?.role === 'host' && {
          hostInfo: {
            bio: hostInfo.description.trim(),
            languagesSpoken: hostInfo.languages
              .split(',')
              .map((lang) => lang.trim())
              .filter((lang) => lang.length > 0),
            responseTime: convertResponseTimeToNumber(hostInfo.responseTime),
            ...(extendedUser.hostInfo?.responseRate && {
              responseRate: extendedUser.hostInfo.responseRate,
            }),
            ...(extendedUser.hostInfo?.acceptanceRate && {
              acceptanceRate: extendedUser.hostInfo.acceptanceRate,
            }),
            ...(extendedUser.hostInfo?.hostSince && {
              hostSince: extendedUser.hostInfo.hostSince,
            }),
          },
        }),
      };

      // Use the userApi service
      const result = await userApi.updateUserProfile(updatedUserData);

      if (result.success) {
        setGlobalMessage({
          type: 'success',
          text: 'Profile updated successfully',
        });
        await refreshUser();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      setGlobalMessage({
        type: 'error',
        text: error.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerified = extendedUser?.verificationLevel === 'verified';

  return (
    <div className="bg-white dark:text-light dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {previewImage ? (
                <img
                  src={
                    previewImage?.startsWith('data:')
                      ? previewImage // For preview before upload
                      : previewImage?.startsWith('http')
                      ? previewImage // For external URLs
                      : previewImage
                      ? `${API_URL}${previewImage}` // For uploaded images
                      : undefined
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={64} className="text-gray-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => profilePicInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
              <FiCamera size={16} />
            </button>
            <input
              type="file"
              ref={profilePicInputRef}
              onChange={handleProfilePicUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload a profile picture (recommended size: 300x300 pixels)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email cannot be changed
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Host Mode Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white">
                Host Mode
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {extendedUser?.role === 'host'
                  ? 'You are currently a host'
                  : 'Enable host features to list your own spaces'}
              </p>
            </div>
            {extendedUser?.role === 'host' && (
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                Active Host
              </div>
            )}
          </div>

          {/* Host Information Form */}
          <div className="space-y-4">
            {!isVerified && !hostModeEnabled && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm mb-4">
                <div className="flex items-start">
                  <FiInfo className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-amber-800 dark:text-amber-300">
                    You must be fully verified to become a host. Please complete
                    your verification in the account verification section.
                  </p>
                </div>
              </div>
            )}

            {(hostModeEnabled ||
              !extendedUser?.role ||
              extendedUser?.role === 'user') && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm mb-4">
                <div className="flex items-start">
                  <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-blue-800 dark:text-blue-300">
                    {hostModeEnabled
                      ? 'Update your host information below.'
                      : 'Becoming a host requires identity verification. Please fill out your host information below and submit verification documents.'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                About You (Bio)
              </label>
              <textarea
                name="description"
                value={hostInfo.description}
                onChange={handleHostInfoChange}
                rows={4}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell guests about yourself and your spaces..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Languages (comma separated)
                </label>
                <input
                  type="text"
                  name="languages"
                  value={hostInfo.languages}
                  onChange={handleHostInfoChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="English, Filipino, Spanish"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Response Time
                </label>
                <select
                  name="responseTime"
                  value={hostInfo.responseTime}
                  onChange={handleHostInfoChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="Within an hour">Within an hour</option>
                  <option value="Within a few hours">Within a few hours</option>
                  <option value="Within a day">Within a day</option>
                  <option value="Within 2 days">Within 2 days</option>
                </select>
              </div>
            </div>

            {/* Show Become Host button if user is not already a host */}
            {extendedUser?.role !== 'host' && (
              <button
                type="button"
                onClick={handleBecomeHost}
                disabled={
                  isBecomingHost || !isVerified || !hostInfo.description.trim()
                }
                className={`mt-4 px-6 py-3 flex items-center justify-center ${
                  isBecomingHost || !isVerified || !hostInfo.description.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
                } rounded-lg transition-all duration-500`}>
                {isBecomingHost ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Become a Host'
                )}
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2.5 flex items-center justify-center ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105'
          } rounded-lg transition-all duration-500`}>
          {isSubmitting ? (
            <>
              <FiLoader className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Profile Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileInformation;
