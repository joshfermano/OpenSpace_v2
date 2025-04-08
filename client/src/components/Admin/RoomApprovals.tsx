import React from 'react';
import {
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiHome,
} from 'react-icons/fi';
import { API_URL } from '../../services/core';

interface Room {
  _id: string; // Changed from id to _id to match the server response
  title: string; // Changed from name to title to match the server response
  location: {
    city: string;
    state: string;
    country: string;
  };
  type: string; // Changed from category
  price: {
    basePrice: number;
  };
  capacity: {
    maxGuests: number;
  };
  description: string;
  amenities: string[];
  images: string[];
  host: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
  status: string;
}

interface RoomApprovalsProps {
  rooms: Room[];
  onViewRoom: (room: Room) => void;
  onApproveRoom: (roomId: string) => void;
  onRejectRoom: (roomId: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const RoomApprovals: React.FC<RoomApprovalsProps> = ({
  rooms,
  onViewRoom,
  onApproveRoom,
  onRejectRoom,
  onImageError,
}) => {
  // Format image URL properly
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';

    // If the image path already starts with http:// or https:// or data:, return as is
    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://') ||
      imagePath.startsWith('data:')
    ) {
      return imagePath;
    }

    // If path starts with a slash, ensure we don't double-slash
    const normalizedPath = imagePath.startsWith('/')
      ? imagePath
      : `/${imagePath}`;

    return `${API_URL}${normalizedPath}`;
  };

  const formatLocation = (location: any) => {
    if (!location) return 'Unknown location';
    return `${location.city || ''}, ${location.state || ''}, ${
      location.country || ''
    }`.replace(/^, |, $/, '');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-200 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Space Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Host
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {rooms && rooms.length > 0 ? (
              rooms.map((room) => (
                <tr
                  key={room._id}
                  className="hover:bg-gray-300 dark:hover:bg-gray-900 transition-all duration-300">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {room.images && room.images.length > 0 ? (
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={getImageUrl(room.images[0])}
                            alt={room.title}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const iconDiv = document.createElement('div');
                                iconDiv.className =
                                  'h-16 w-16 flex items-center justify-center text-gray-500';
                                parent.appendChild(iconDiv);
                                iconDiv.innerHTML =
                                  '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
                              }
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 flex items-center justify-center text-gray-500">
                            <FiHome size={24} />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {room.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatLocation(room.location)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {room.type === 'conference'
                            ? 'Conference Room'
                            : room.type === 'event'
                            ? 'Events Place'
                            : room.type === 'stay'
                            ? 'Room Stay'
                            : room.type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {room.host && room.host.profileImage ? (
                          <img
                            className="h-8 w-8 rounded-full object-cover"
                            src={getImageUrl(room.host.profileImage)}
                            alt={`${room.host.firstName} ${room.host.lastName}`}
                            onError={onImageError}
                          />
                        ) : (
                          <div className="h-8 w-8 flex items-center justify-center text-gray-500">
                            <FiUser size={16} />
                          </div>
                        )}
                      </div>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {room.host
                          ? `${room.host.firstName} ${room.host.lastName}`
                          : 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      ₱
                      {room.price?.basePrice
                        ? Number(room.price.basePrice).toLocaleString()
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(room.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onViewRoom(room)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="View Details">
                        <FiEye size={18} />
                      </button>
                      {room.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApproveRoom(room._id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            title="Approve">
                            <FiCheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => onRejectRoom(room._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
                  No pending room approvals
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomApprovals;
