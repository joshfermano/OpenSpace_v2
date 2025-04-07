import React from 'react';
import { FiEye, FiSlash, FiTrash2, FiUser } from 'react-icons/fi';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  role: string;
  status: string;
  rooms: number;
  idType: string | null;
  verificationStatus: string;
  imageUrl: string | null;
}

interface StatusConfig {
  label: string;
  color: string;
}

interface UserManagementProps {
  users: User[];
  statusConfig: Record<string, StatusConfig>;
  verificationConfig: Record<string, StatusConfig>;
  onViewDocument: (url: string, userName: string) => void;
  onBanUser: (userId: string, userName: string) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  statusConfig,
  verificationConfig,
  onViewDocument,
  onBanUser,
  onDeleteUser,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-200 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Verification
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-300 dark:hover:bg-gray-900 transition-all duration-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {user.imageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              user.imageUrl.startsWith('http')
                                ? user.imageUrl
                                : `${import.meta.env.VITE_API_URL || ''}${
                                    user.imageUrl
                                  }`
                            }
                            alt={user.name}
                            onError={(e) => {
                              // Handle image error by replacing with icon
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const iconDiv = document.createElement('div');
                                iconDiv.className =
                                  'h-10 w-10 flex items-center justify-center text-gray-500';
                                parent.appendChild(iconDiv);
                                // Use React icons in a non-React way as fallback
                                iconDiv.innerHTML =
                                  '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                              }
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center text-gray-500">
                            <FiUser size={20} />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white capitalize">
                      {user.role}
                      {user.role === 'host' && user.rooms > 0 && (
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({user.rooms} spaces)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(user.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusConfig[user.status]?.color
                      }`}>
                      {statusConfig[user.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        verificationConfig[user.verificationStatus]?.color
                      }`}>
                      {verificationConfig[user.verificationStatus]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {user.idType &&
                        user.verificationStatus !== 'not_submitted' && (
                          <button
                            onClick={() =>
                              onViewDocument(
                                user.idType
                                  ? `${
                                      import.meta.env.VITE_API_URL || ''
                                    }/users/${user.id}/id-document`
                                  : `https://example.com/id/user-${user.id}`,
                                user.name
                              )
                            }
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                            title="View ID Document">
                            <FiEye size={18} />
                          </button>
                        )}
                      {user.status !== 'banned' && user.role !== 'admin' && (
                        <button
                          onClick={() => onBanUser(user.id, user.name)}
                          className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 transition-colors"
                          title="Ban User">
                          <FiSlash size={18} />
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => onDeleteUser(user.id, user.name)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                          title="Delete User">
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
