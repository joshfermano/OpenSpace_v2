import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiMap, FiEdit2, FiChevronRight } from 'react-icons/fi';
import { FaPesoSign } from 'react-icons/fa6';
import { roomApi } from '../../services/roomApi';
import { API_URL } from '../../services/core';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

interface Room {
  _id: string;
  title: string;
  location: {
    city: string;
    country: string;
  };
  price: {
    basePrice: number;
  };
  type: string;
  status: string;
  isPublished: boolean;
  images?: string[];
}

interface HostInfo {
  bio?: string;
  languagesSpoken?: string[];
  responseRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
  hostSince?: Date;
}

interface User {
  _id: string;
  role: 'user' | 'host' | 'admin';
  hostInfo?: HostInfo;
}

interface UserListingsProps {
  userData: User;
  showAll?: boolean;
}

const UserListings = ({ userData, showAll = false }: UserListingsProps) => {
  const [listings, setListings] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (userData.role === 'host') {
        try {
          const response = await roomApi.getMyRooms();
          if (response.success) {
            setListings(response.data || []);
          }
        } catch (error) {
          console.error('Error fetching listings:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchListings();
  }, [userData.role]);

  // Format image URL to ensure it includes the API base URL if it's a relative path
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

  // Only show two listings on the dashboard, show all on dedicated page
  const displayedListings = showAll ? listings : listings.slice(0, 2);

  if (loading) {
    return <div className="animate-pulse">Loading your listings...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Listings
        </h2>
        <div className="flex space-x-2">
          {userData.role === 'host' && (
            <Link
              to="/rooms/create"
              className="inline-flex items-center px-2 py-1 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500 text-sm">
              <span className="text-lg mr-1">+</span> New Listing
            </Link>
          )}
          {!showAll && userData.role === 'host' && listings.length > 2 && (
            <Link
              to="/listings/all"
              className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:underline">
              View All <FiChevronRight className="ml-1" />
            </Link>
          )}
        </div>
      </div>

      {userData.role !== 'host' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 dark:bg-purple-900 flex items-center justify-center">
            <FiHome
              className="text-purple-600 dark:text-purple-400"
              size={24}
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Become a host
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Share your space and start earning.
          </p>
          <Link
            to="/become-host"
            className="inline-flex items-center px-4 py-2 bg-darkBlue dark:bg-light hover:bg-purple-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
            Learn More
          </Link>
        </div>
      ) : userData.hostInfo ? (
        listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedListings.map((room) => (
              <div
                key={room._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={getImageUrl(room.images[0])}
                      alt={room.title}
                      className="h-full w-full object-cover"
                      onError={(e) => handleImageError(e)}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <FiHome className="text-gray-400" size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white dark:bg-gray-800 text-sm font-medium px-2 py-1 rounded-lg">
                    {room.isPublished && room.status === 'approved'
                      ? 'Active'
                      : room.status}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {room.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <FiMap className="mr-1" /> {room.location.city},{' '}
                    {room.location.country}
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Price
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₱{room.price.basePrice.toLocaleString()}{' '}
                        {room.type === 'conference' ? '/ hour' : '/ night'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/rooms/edit/${room._id}`}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <FiEdit2 size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 dark:bg-purple-900 flex items-center justify-center">
              <FiHome
                className="text-purple-600 dark:text-purple-400"
                size={24}
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No listings yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start creating your first listing to share your space.
            </p>
            <Link
              to="/rooms/create"
              className="inline-flex items-center px-4 py-2 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
              Create Listing
            </Link>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 dark:bg-purple-900 flex items-center justify-center">
            <FiHome
              className="text-purple-600 dark:text-purple-400"
              size={24}
            />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Complete your host profile
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You need to complete your host profile before creating listings.
          </p>
          <Link
            to="/profile/edit"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Complete Profile
          </Link>
        </div>
      )}

      {userData.role === 'host' &&
        userData.hostInfo &&
        !showAll &&
        listings.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Link
              to="/dashboard/earnings"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <FaPesoSign className="mr-2" /> View Earnings
            </Link>
          </div>
        )}
    </div>
  );
};

export default UserListings;
