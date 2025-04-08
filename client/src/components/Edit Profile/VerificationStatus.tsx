import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { FiUpload, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';

interface IdentificationDocument {
  idType?: string;
  idNumber?: string;
  idImage?: string;
  uploadDate?: Date;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verificationDate?: Date;
  rejectionReason?: string;
  businessDocument?: {
    certificateType: string;
    certificateNumber: string;
    certificateImage: string;
    uploadDate: Date;
  };
}

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
  verificationLevel: 'basic' | 'verified' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  identificationDocument?: IdentificationDocument;
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
  // Remove the unused prop from the interface as well
}

const VerificationStatus = ({
  user: extendedUser,
  refreshUser,
  setGlobalMessage,
}: VerificationStatusProps) => {
  const [verificationDocs, setVerificationDocs] = useState<{
    governmentId?: File;
    businessCertificate?: File;
    idType: string;
    idNumber: string;
    certificateType: string;
    certificateNumber: string;
  }>({
    idType: 'Philippine National ID',
    idNumber: '',
    certificateType: '',
    certificateNumber: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validIdTypes = [
    'Philippine National ID',
    'ePhilID',
    'Passport',
    'LTO Drivers License',
    'SSS Card',
    'GSIS Card',
    'UMID Card',
    'PRC ID',
    'COMELEC Voters ID',
    'Senior Citizen ID',
    'PhilHealth ID',
    'Postal ID',
    'TIN Card',
  ];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'id' | 'business'
  ) => {
    if (e.target.files && e.target.files[0]) {
      setVerificationDocs((prev) => ({
        ...prev,
        [type === 'id' ? 'governmentId' : 'businessCertificate']:
          e.target.files?.[0],
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVerificationDocs((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      if (!verificationDocs.idNumber) {
        throw new Error('ID number is required for verification');
      }

      // Convert files to base64
      const createBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };

      let idImage = '';
      let businessImage = '';

      if (verificationDocs.governmentId) {
        idImage = await createBase64(verificationDocs.governmentId);
      }

      if (verificationDocs.businessCertificate) {
        businessImage = await createBase64(
          verificationDocs.businessCertificate
        );
      }

      const verificationData = {
        idType: verificationDocs.idType,
        idNumber: verificationDocs.idNumber,
        idImage,
        ...(businessImage && {
          businessDocument: {
            certificateType: verificationDocs.certificateType,
            certificateNumber: verificationDocs.certificateNumber,
            certificateImage: businessImage,
          },
        }),
      };

      const response = await authApi.uploadIdVerification(verificationData);

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

  const getVerificationStatusDisplay = () => {
    if (!extendedUser?.identificationDocument) {
      return {
        status: 'Not Submitted',
        className: 'text-gray-400 dark:text-gray-500',
      };
    }

    const status = extendedUser.identificationDocument.verificationStatus;

    switch (status) {
      case 'approved':
        return {
          status: 'Verified',
          className: 'text-green-500',
        };
      case 'pending':
        return {
          status: 'Pending Review',
          className: 'text-amber-500',
        };
      case 'rejected':
        return {
          status: 'Rejected',
          className: 'text-red-500',
        };
      default:
        return {
          status: 'Not Submitted',
          className: 'text-gray-400 dark:text-gray-500',
        };
    }
  };

  const idVerificationStatus = getVerificationStatusDisplay();
  const showIdForm =
    extendedUser?.verificationLevel === 'basic' ||
    (!extendedUser?.identificationDocument &&
      extendedUser?.verificationLevel !== 'verified') ||
    extendedUser?.identificationDocument?.verificationStatus === 'rejected';

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

      {/* Show rejection reason if ID was rejected */}
      {extendedUser?.identificationDocument?.verificationStatus ===
        'rejected' && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <FiAlertCircle
              className="text-red-500 mt-0.5 mr-2 flex-shrink-0"
              size={18}
            />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                ID Verification Rejected
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                {extendedUser.identificationDocument.rejectionReason ||
                  'Your ID verification was rejected. Please submit a valid ID.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {showIdForm && (
        <div className="space-y-4">
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            {/* ID Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Type *
              </label>
              <select
                name="idType"
                value={verificationDocs.idType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required>
                {validIdTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ID Number *
              </label>
              <input
                type="text"
                name="idNumber"
                value={verificationDocs.idNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your ID number"
                required
              />
            </div>

            {/* Government ID Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Government-issued ID Document *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'id')}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="government-id-upload"
                  required
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
                    : 'Upload ID Document'}
                </button>
                {verificationDocs.governmentId && (
                  <FiCheck className="text-green-500" size={20} />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload a clear photo of your ID. Accepted formats: JPG, PNG,
                PDF. Max size: 5MB
              </p>
            </div>

            {/* Business Certificate Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Business Verification (Optional)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificate Type
                  </label>
                  <input
                    type="text"
                    name="certificateType"
                    value={verificationDocs.certificateType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Business Permit, DTI Certificate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    name="certificateNumber"
                    value={verificationDocs.certificateNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter certificate number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Certificate
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'business')}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="business-cert-upload"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('business-cert-upload')?.click()
                      }
                      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <FiUpload className="mr-2" />
                      {verificationDocs.businessCertificate
                        ? verificationDocs.businessCertificate.name
                        : 'Upload Business Certificate'}
                    </button>
                    {verificationDocs.businessCertificate && (
                      <FiCheck className="text-green-500" size={20} />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Upload your business certificate or permit. Accepted
                    formats: JPG, PNG, PDF. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !verificationDocs.governmentId ||
                !verificationDocs.idNumber
              }
              className={`w-full md:w-auto px-6 py-2.5 flex items-center justify-center ${
                isSubmitting ||
                !verificationDocs.governmentId ||
                !verificationDocs.idNumber
                  ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                  : 'bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105'
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
            <span className={idVerificationStatus.className}>
              {idVerificationStatus.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;
