import { FC } from 'react';
import { Host } from '../../config/rooms';
import Openspace from '../../assets/logo_white.jpg';
import { FiMail, FiPhone, FiCalendar, FiCheck, FiGlobe } from 'react-icons/fi';

interface HostInfoProps {
  host: Host;
}

const HostInfo: FC<HostInfoProps> = ({ host }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Host Avatar */}
        <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-700 shadow-lg">
          <img
            src={Openspace}
            alt={`${host.name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback image if the OpenSpace logo doesn't load
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/200x200?text=Host';
            }}
          />
        </div>

        {/* Host Information */}
        <div className="flex-grow">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {host.name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <FiCalendar size={16} />
            <span>Host since {host.dateJoined}</span>
          </div>

          <div className="mt-4 text-gray-700 dark:text-gray-300">
            <p>{host.description}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Response Rate */}
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">
                {host.responseRate}% Response Rate
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {host.responseTime}
              </span>
            </div>

            {/* Languages */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiGlobe size={16} />
              <span>Speaks: {host.languages.join(', ')}</span>
            </div>

            {/* Verifications */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex flex-wrap gap-2 mt-2">
                {host.verifications.map((verification, index) => (
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
              href={`mailto:${host.contactInfo.email}`}
              className="inline-flex items-center gap-2 text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg">
              <FiMail size={16} />
              Contact Host
            </a>

            {host.contactInfo.phone && (
              <div className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <FiPhone size={16} />
                {host.contactInfo.phone}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostInfo;
