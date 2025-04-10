import { FC } from 'react';
import {
  FiMail,
  FiPhone,
  FiCalendar,
  FiCheck,
  FiGlobe,
  FiCreditCard,
  FiShield,
} from 'react-icons/fi';
import { API_URL } from '../../services/core';

interface HostInfo {
  bio?: string;
  languagesSpoken?: string[];
  responseRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
  hostSince?: Date;
}

interface Host {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  role: 'host' | 'user' | 'admin';
  dateJoined: string;
  createdAt?: string;
  hostInfo?: HostInfo;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  identificationDocument?: {
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  verificationLevel?: string;
}

interface HostInfoProps {
  host: Host;
}

const HostInfo: FC<HostInfoProps> = ({ host }) => {
  // Format date to prevent invalid date issues
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getProfileImageUrl = (imagePath?: string): string | undefined => {
    if (!imagePath) return undefined;

    if (imagePath.startsWith('data:') || imagePath.startsWith('http')) {
      return imagePath;
    }

    return `${API_URL}${imagePath}`;
  };

  // Get host verification badges
  const getVerifications = () => {
    const verifications = [];

    if (host.isEmailVerified) {
      verifications.push('Email Verified');
    }

    if (host.isPhoneVerified) {
      verifications.push('Phone Verified');
    }

    if (host.identificationDocument?.verificationStatus === 'verified') {
      verifications.push('ID Verified');
    }

    if (host.verificationLevel === 'verified') {
      verifications.push('Verified Host');
    }

    return verifications;
  };

  // Format response time
  const formatResponseTime = (hours?: number): string => {
    if (!hours) return 'N/A';

    if (hours === 1) return 'within an hour';
    if (hours === 24) return 'within a day';
    return `within ${hours} hours`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Host Avatar */}
        <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-700 shadow-lg">
          {host.profileImage ? (
            <img
              src={getProfileImageUrl(host.profileImage)}
              alt={`${host.firstName} ${host.lastName}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/200x200?text=Host';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
              <span className="text-2xl font-bold">
                {host.firstName?.charAt(0)}
                {host.lastName?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Host Information */}
        <div className="flex-grow">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {host.firstName} {host.lastName}
          </h1>

          <div className="flex flex-col gap-2 mt-2">
            {/* Host Since */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiCalendar size={16} />
              <span>
                Host since{' '}
                {formatDate(
                  host.hostInfo?.hostSince?.toString() ||
                    host.dateJoined ||
                    host.createdAt
                )}
              </span>
            </div>

            {/* Verification indicators directly under the date */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {host.isEmailVerified && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <FiMail className="mr-1 text-green-500" size={14} />
                  <span>Email verified</span>
                </div>
              )}

              {host.isPhoneVerified && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 ml-3">
                  <FiPhone className="mr-1 text-green-500" size={14} />
                  <span>Phone verified</span>
                </div>
              )}

              {host.identificationDocument?.verificationStatus ===
                'verified' && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 ml-3">
                  <FiCreditCard className="mr-1 text-green-500" size={14} />
                  <span>ID verified</span>
                </div>
              )}

              {host.verificationLevel === 'verified' && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 ml-3">
                  <FiShield className="mr-1 text-green-500" size={14} />
                  <span>Verified host</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio section */}
          {host.hostInfo?.bio && (
            <div className="mt-4 text-gray-700 dark:text-gray-300">
              <p>{host.hostInfo.bio}</p>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Response Rate */}
            {host.hostInfo?.responseRate && (
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">
                  {host.hostInfo.responseRate}% Response Rate
                </span>
              </div>
            )}

            {/* Response Time */}
            {host.hostInfo?.responseTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Typically responds{' '}
                  {formatResponseTime(host.hostInfo.responseTime)}
                </span>
              </div>
            )}

            {/* Languages */}
            {host.hostInfo?.languagesSpoken &&
              host.hostInfo.languagesSpoken.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 col-span-1 md:col-span-2">
                  <FiGlobe size={16} />
                  <span>
                    Speaks: {host.hostInfo.languagesSpoken.join(', ')}
                  </span>
                </div>
              )}

            {/* Full verification badges - now kept as a separate section */}
            <div className="col-span-1 md:col-span-2 mt-2">
              <div className="flex flex-wrap gap-2">
                {getVerifications().map((verification, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                    <FiCheck size={12} />
                    {verification}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <a
              href={`mailto:${host.email}`}
              className="inline-flex items-center gap-2 text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg">
              <FiMail size={16} />
              Contact Host
            </a>

            {host.phoneNumber && (
              <a
                href={`tel:${host.phoneNumber}`}
                className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <FiPhone size={16} />
                {host.phoneNumber}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostInfo;
