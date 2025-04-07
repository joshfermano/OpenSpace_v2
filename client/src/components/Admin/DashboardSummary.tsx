import React from 'react';
import { FiUsers, FiCheckCircle, FiXCircle, FiUserCheck } from 'react-icons/fi';
import { BiTimeFive } from 'react-icons/bi';

interface DashboardSummaryProps {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  pendingVerifications: number;
  totalSpaces: number;
  hostCount: number;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  totalUsers,
  verifiedUsers,
  bannedUsers,
  pendingVerifications,
  totalSpaces,
  hostCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Users Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Users
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {totalUsers}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <FiUsers className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-green-500 font-medium flex items-center">
            <FiCheckCircle className="mr-1" />
            {verifiedUsers} verified
          </span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-red-500 font-medium flex items-center">
            <FiXCircle className="mr-1" />
            {bannedUsers} banned
          </span>
        </div>
      </div>

      {/* Verifications Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pending Verifications
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {pendingVerifications}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <BiTimeFive
              className="text-yellow-600 dark:text-yellow-400"
              size={24}
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-yellow-600 dark:text-yellow-400 flex items-center">
          <FiUserCheck className="mr-1" />
          Requires your attention
        </div>
      </div>

      {/* Spaces Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Spaces
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {totalSpaces}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
            <FiCheckCircle
              className="text-green-600 dark:text-green-400"
              size={24}
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          From {hostCount} hosts
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
