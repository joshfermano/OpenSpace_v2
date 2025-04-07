import React from 'react';
import { FiEye, FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi';

// Types
interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  idType: string;
  submissionDate: string;
  status: string;
  documentUrl: string;
  imageUrl: string | null;
}

interface StatusConfig {
  label: string;
  color: string;
}

interface VerificationRequestsProps {
  requests: VerificationRequest[];
  statusConfig: Record<string, StatusConfig>;
  onViewDocument: (url: string, userName: string) => void;
  onApproveRequest: (requestId: string, userId: string) => void;
  onRejectRequest: (requestId: string, userId: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const VerificationRequests: React.FC<VerificationRequestsProps> = ({
  requests,
  statusConfig,
  onViewDocument,
  onApproveRequest,
  onRejectRequest,
  onImageError,
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
                ID Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Submitted
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-light dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-gray-300 dark:hover:bg-gray-900 transition-all duration-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {request.imageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              request.imageUrl.startsWith('http')
                                ? request.imageUrl
                                : `${import.meta.env.VITE_API_URL || ''}${
                                    request.imageUrl
                                  }`
                            }
                            alt={request.userName}
                            onError={onImageError}
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center text-gray-500">
                            <FiUser size={20} />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.userName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {request.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {request.idType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(request.submissionDate).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusConfig[request.status]?.color
                      }`}>
                      {statusConfig[request.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() =>
                          onViewDocument(
                            request.documentUrl.startsWith('http')
                              ? request.documentUrl
                              : `${import.meta.env.VITE_API_URL || ''}${
                                  request.documentUrl
                                }`,
                            request.userName
                          )
                        }
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                        title="View Document">
                        <FiEye size={18} />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              onApproveRequest(request.id, request.userId)
                            }
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                            title="Approve">
                            <FiCheckCircle size={18} />
                          </button>
                          <button
                            onClick={() =>
                              onRejectRequest(request.id, request.userId)
                            }
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                            title="Reject">
                            <FiXCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No verification requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerificationRequests;
