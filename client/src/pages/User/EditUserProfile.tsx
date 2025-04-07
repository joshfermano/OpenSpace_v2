import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiUser,
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiCamera,
  FiInfo,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Define types to match the backend
interface HostInfo {
  bio?: string;
  languagesSpoken?: string[];
  responseRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
  hostSince?: Date;
}

// Extend the User interface to include the hostInfo property
interface ExtendedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: 'user' | 'host' | 'admin';
  dateJoined: string;
  verificationLevel: 'none' | 'basic' | 'verified';
  isGovernmentIdVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hostInfo?: HostInfo;
}

const EditUserProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const extendedUser = user as ExtendedUser | null;
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: extendedUser?.firstName || '',
    lastName: extendedUser?.lastName || '',
    email: extendedUser?.email || '',
    phone: extendedUser?.phone || '',
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

  const [verificationDocs, setVerificationDocs] = useState<{
    governmentId?: File;
    proofOfAddress?: File;
    businessPermit?: File;
  }>({});

  const [previewImage, setPreviewImage] = useState<string | null>(
    extendedUser?.profileImage || null
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Update form data when user changes
  useEffect(() => {
    if (extendedUser) {
      setFormData({
        firstName: extendedUser.firstName || '',
        lastName: extendedUser.lastName || '',
        email: extendedUser.email || '',
        phone: extendedUser.phone || '',
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleHostInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setHostInfo({
      ...hostInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'governmentId' | 'proofOfAddress' | 'businessPermit'
  ) => {
    if (e.target.files && e.target.files[0]) {
      setVerificationDocs({
        ...verificationDocs,
        [docType]: e.target.files[0],
      });
    }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData({
          ...formData,
          profileImage: result,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data with host info if host mode is enabled
      const updatedUserData: any = {
        ...formData,
        role: hostModeEnabled ? 'host' : 'user',
      };

      // Add host info if host mode is enabled
      if (hostModeEnabled) {
        updatedUserData.hostInfo = {
          bio: hostInfo.description,
          languagesSpoken: hostInfo.languages
            .split(',')
            .map((lang: string) => lang.trim()),
          responseTime: parseInt(hostInfo.responseTime) || 24,
        };

        // Preserve other host info fields if they exist
        if (extendedUser?.hostInfo) {
          updatedUserData.hostInfo = {
            ...updatedUserData.hostInfo,
            ...extendedUser.hostInfo,
            responseRate: extendedUser.hostInfo.responseRate || 100,
          };
        }
      }

      await updateUserProfile(updatedUserData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
      console.error('Profile update error:', error);
    }
    setLoading(false);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, you would upload these files to your server
      // and update the user's verification status
      setMessage({
        type: 'success',
        text: 'Documents submitted for verification!',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit documents.' });
    }
    setLoading(false);
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
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
            {message.text}
          </div>
        )}

        {/* Profile Information Form */}
        <div className="bg-white dark:text-light dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {previewImage ? (
                    <img
                      src={previewImage}
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
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                        Becoming a host requires identity verification. Please
                        fill out your host information and submit verification
                        documents below.
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
                        onChange={handleHostInfoChange as any}
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
              disabled={loading}
              className="px-6 py-2.5 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Verification Status */}
        <div className="bg-white dark:text-light dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Verification Status</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                extendedUser?.verificationLevel === 'verified'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
              {extendedUser?.verificationLevel === 'verified'
                ? 'Verified'
                : 'Basic'}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <FiAlertCircle
                className="text-amber-500 mt-0.5 mr-2 flex-shrink-0"
                size={18}
              />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Why Verify?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verified users enjoy higher trust, priority bookings, and can
                  become hosts to list their own spaces.
                </p>
              </div>
            </div>
          </div>

          {extendedUser?.verificationLevel !== 'verified' && (
            <div className="space-y-4">
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                {/* Government ID Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Government-issued ID (Required)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'governmentId')}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="government-id-upload"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('government-id-upload')?.click()
                      }
                      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <FiUpload className="mr-2" />
                      {verificationDocs.governmentId
                        ? verificationDocs.governmentId.name
                        : 'Upload ID'}
                    </button>
                    {verificationDocs.governmentId && (
                      <FiCheck className="text-green-500" size={20} />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Accepted formats: JPG, PNG, PDF. Max size: 5MB
                  </p>
                </div>

                {/* Proof of Address Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Proof of Address (Required)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'proofOfAddress')}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="address-proof-upload"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('address-proof-upload')?.click()
                      }
                      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <FiUpload className="mr-2" />
                      {verificationDocs.proofOfAddress
                        ? verificationDocs.proofOfAddress.name
                        : 'Upload Proof'}
                    </button>
                    {verificationDocs.proofOfAddress && (
                      <FiCheck className="text-green-500" size={20} />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Utility bill, bank statement, etc. (must be less than 3
                    months old)
                  </p>
                </div>

                {/* Business Permit (optional, more relevant for hosts) */}
                {hostModeEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Permit (Optional, for commercial spaces)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'businessPermit')}
                        accept="image/*,.pdf"
                        className="hidden"
                        id="business-permit-upload"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById('business-permit-upload')
                            ?.click()
                        }
                        className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <FiUpload className="mr-2" />
                        {verificationDocs.businessPermit
                          ? verificationDocs.businessPermit.name
                          : 'Upload Permit'}
                      </button>
                      {verificationDocs.businessPermit && (
                        <FiCheck className="text-green-500" size={20} />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Required only if you're listing commercial spaces or
                      venues
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !verificationDocs.governmentId ||
                    !verificationDocs.proofOfAddress
                  }
                  className={`w-full md:w-auto px-6 py-2.5 hover:bg-green-600 bg-darkBlue dark:bg-light text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500 ${
                    loading ||
                    !verificationDocs.governmentId ||
                    !verificationDocs.proofOfAddress
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-green-700'
                  }`}>
                  {loading ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </form>
            </div>
          )}

          {/* Verification Progress */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Progress
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <span className="w-5 h-5 inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mr-2 text-xs">
                    1
                  </span>
                  Email Verification
                </span>
                {extendedUser?.isEmailVerified ? (
                  <span className="text-green-500 flex items-center">
                    <FiCheck className="mr-1" /> Verified
                  </span>
                ) : (
                  <Link
                    to="/verification/email-verification" // Update this path to match your route
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Verify Now
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <span className="w-5 h-5 inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mr-2 text-xs">
                    2
                  </span>
                  Phone Verification
                </span>
                {extendedUser?.isPhoneVerified ? (
                  <span className="text-green-500 flex items-center">
                    <FiCheck className="mr-1" /> Verified
                  </span>
                ) : (
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Verify Now
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <span className="w-5 h-5 inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mr-2 text-xs">
                    3
                  </span>
                  ID Verification
                </span>
                {extendedUser?.isGovernmentIdVerified ? (
                  <span className="text-green-500 flex items-center">
                    <FiCheck className="mr-1" /> Verified
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    {verificationDocs.governmentId
                      ? 'Pending Review'
                      : 'Not Submitted'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserProfile;
