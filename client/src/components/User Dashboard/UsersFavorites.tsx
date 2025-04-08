import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMap, FiChevronRight } from 'react-icons/fi';
import { userApi } from '../../services/userApi';

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
  category: string;
  images?: string[];
}

interface UserFavoritesProps {
  showAll?: boolean;
}

const UserFavorites = ({ showAll = false }: UserFavoritesProps) => {
  const [favoriteRooms, setFavoriteRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await userApi.getSavedRooms();
        if (response.success) {
          setFavoriteRooms(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Only show two favorites on the dashboard, show all on dedicated page
  const displayedFavorites = showAll
    ? favoriteRooms
    : favoriteRooms.slice(0, 2);

  if (loading) {
    return <div className="animate-pulse">Loading your favorites...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Favorite Spaces
        </h2>
        {!showAll && favoriteRooms.length > 2 && (
          <Link
            to="/favorites/all"
            className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:underline">
            View All <FiChevronRight className="ml-1" />
          </Link>
        )}
      </div>

      {favoriteRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedFavorites.map((room) => (
            <div
              key={room._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0]}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}
                </div>
                <button
                  className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full text-red-500 hover:bg-white dark:hover:bg-gray-800"
                  onClick={() => {
                    userApi.unsaveRoom(room._id).then(() => {
                      setFavoriteRooms(
                        favoriteRooms.filter((r) => r._id !== room._id)
                      );
                    });
                  }}>
                  <FiHeart className="fill-current" size={18} />
                </button>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {room.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <FiMap className="mr-1" /> {room.location.city},{' '}
                  {room.location.country}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Price
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ₱{room.price.basePrice.toLocaleString()}
                      {room.category === 'Room Stay' ? ' / night' : ' / hour'}
                    </p>
                  </div>
                  <Link
                    to={`/rooms/${room._id}`}
                    className="px-3 py-1 bg-darkBlue text-light dark:bg-light dark:text-darkBlue rounded-lg hover:opacity-90 transition-colors text-sm font-medium">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <FiHeart className="text-red-500 dark:text-red-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start adding spaces to your favorites while browsing.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-darkBlue dark:bg-light hover:bg-blue-600 text-light dark:text-darkBlue dark:hover:text-light hover:scale-105 rounded-lg transition-all duration-500">
            Explore Spaces
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserFavorites;
