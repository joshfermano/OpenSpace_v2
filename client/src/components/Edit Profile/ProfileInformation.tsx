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
}

const ProfileInformation = ({
  user: extendedUser,
  refreshUser,
  setGlobalMessage,
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
        const uploadResponse = await uploadProfileImage();
        if (uploadResponse) {
          profileImageUrl = uploadResponse;
        }
      }

      // Create profile update data matching backend expectations
      const updatedUserData: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        profileImage: string;
        role: string;
        hostInfo?: any;
      } = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phone.trim(),
        profileImage: profileImageUrl,
        role: hostModeEnabled ? 'host' : 'user',
      };

      // Add host info if appropriate
      if (hostModeEnabled) {
        const languagesArray = hostInfo.languages
          .split(',')
          .map((lang) => lang.trim())
          .filter((lang) => lang.length > 0);

        const hostInfoData = {
          bio: hostInfo.description.trim(),
          languagesSpoken: languagesArray,
          responseTime: hostInfo.responseTime,
        };

        if (extendedUser?.hostInfo) {
          updatedUserData.hostInfo = {
            ...hostInfoData,
            responseRate: extendedUser.hostInfo.responseRate || 100,
            acceptanceRate: extendedUser.hostInfo.acceptanceRate,
            hostSince: extendedUser.hostInfo.hostSince,
          };
        } else {
          updatedUserData.hostInfo = hostInfoData;
        }
      }

      console.log('Submitting profile update with data:', updatedUserData);

      const result = await userApi.updateUserProfile(updatedUserData);
      console.log('Profile update result:', result);

      if (result && result.success) {
        setGlobalMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
        // Refresh user data in context
        await refreshUser();
        // Scroll to top to see the success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result?.message || 'Failed to update profile');
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
            />
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

        {/* Host Mode Toggle */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white">
                Host Mode
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable host features to list your own spaces
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hostModeEnabled}
                onChange={() => setHostModeEnabled(!hostModeEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Conditional Host Information Form */}
          {hostModeEnabled && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm mb-4">
                <div className="flex items-start">
                  <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-blue-800 dark:text-blue-300">
                    Becoming a host requires identity verification. Please fill
                    out your host information and submit verification documents
                    below.
                  </p>
                </div>
              </div>

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
                    <option value="Within a few hours">
                      Within a few hours
                    </option>
                    <option value="Within a day">Within a day</option>
                    <option value="Within 2 days">Within 2 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}
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
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileInformation;
