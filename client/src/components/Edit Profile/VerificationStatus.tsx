import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { FiUpload, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';

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
  verificationLevel: 'none' | 'basic' | 'verified';
  isGovernmentIdVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  hostInfo?: HostInfo;
}

interface VerificationStatusProps {
  user: ExtendedUser | null;
  refreshUser: () => Promise<void>;
  setGlobalMessage: (
    message: {
      type: 'success' | 'error';
      text: string;
    } | null
  ) => void;
  isHostModeEnabled: boolean;
}

const VerificationStatus = ({
  user: extendedUser,
  refreshUser,
  setGlobalMessage,
  isHostModeEnabled,
}: VerificationStatusProps) => {
  const [verificationDocs, setVerificationDocs] = useState<{
    governmentId?: File;
    proofOfAddress?: File;
    businessPermit?: File;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'governmentId' | 'proofOfAddress' | 'businessPermit'
  ) => {
    if (e.target.files && e.target.files[0]) {
      setVerificationDocs((prev) => ({
        ...prev,
        [docType]: e.target.files?.[0],
      }));
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setGlobalMessage(null);

    try {
      if (!verificationDocs.governmentId) {
        throw new Error('Government ID is required for verification');
      }

      // Convert government ID file to base64
      const createBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };

      let idImage = '';
      if (verificationDocs.governmentId) {
        idImage = await createBase64(verificationDocs.governmentId);
      }

      const idType = 'Government ID';
      const idNumber = 'ID-' + Date.now().toString().substring(5);

      // Send verification data to backend
      const response = await authApi.uploadIdVerification({
        idType,
        idNumber,
        idImage,
      });

      console.log('ID verification upload response:', response);

      if (response.success) {
        setGlobalMessage({
          type: 'success',
          text: 'Documents submitted for verification! Our team will review them shortly.',
        });
        await refreshUser();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.message || 'Failed to submit documents');
      }
    } catch (error: any) {
      console.error('Document submission error:', error);
      setGlobalMessage({
        type: 'error',
        text: error.message || 'Failed to submit documents. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                Utility bill, bank statement, etc. (must be less than 3 months
                old)
              </p>
            </div>

            {/* Business Permit (optional, more relevant for hosts) */}
            {isHostModeEnabled && (
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
                      document.getElementById('business-permit-upload')?.click()
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
                  Required only if you're listing commercial spaces or venues
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !verificationDocs.governmentId}
              className={`w-full md:w-auto px-6 py-2.5 flex items-center justify-center ${
                isSubmitting || !verificationDocs.governmentId
                  ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                  : 'bg-darkBlue dark:bg-light hover:bg-green-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105'
              } rounded-lg transition-all duration-500`}>
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit for Verification'
              )}
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
                to="/verification/email-verification"
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
              <Link
                to="/verification/phone-verification"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Verify Now
              </Link>
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
  );
};

export default VerificationStatus;
