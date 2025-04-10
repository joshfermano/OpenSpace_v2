import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { IoMdArrowBack } from 'react-icons/io';
import { useAuth } from '../../contexts/AuthContext';
import { roomApi } from '../../services/roomApi';
import ReviewArea from '../../components/Room/ReviewArea';
import ImageGallery from '../../components/Room/ImageGallery';
import RoomDetails from '../../components/Room/RoomDetails';
import RoomPolicies from '../../components/Room/RoomPolicies';
import BookingPanel from '../../components/Room/BookingPanel';
import placeholder from '../../assets/logo_black.jpg';
import { API_URL } from '../../services/core';
import { handleImageError } from '../../utils/imageUtils';
import '../../css/calendar.css';

const ViewRoom = () => {
  const { roomId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'policies'>('details');
  const [isFavorite, setIsFavorite] = useState(false);
  const [toggleFavoriteLoading, setToggleFavoriteLoading] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

  // Helper function to get the full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return placeholder;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  // Fetch room data and check if it's in user's favorites
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;

      setLoading(true);
      try {
        // Fetch room details
        const response = await roomApi.getRoomById(roomId);

        if (response.success) {
          setRoom(response.data);

          // Set unavailable dates
          if (
            response.data.availability &&
            response.data.availability.unavailableDates
          ) {
            const convertedDates =
              response.data.availability.unavailableDates.map(
                (dateString: string) => new Date(dateString)
              );
            setUnavailableDates(convertedDates);
          }

          // Check if this room is in user's favorites
          if (isAuthenticated) {
            try {
              const favoritesResponse = await roomApi.getFavoriteRooms();
              if (favoritesResponse.success) {
                const isSaved = favoritesResponse.data.some(
                  (savedRoom: any) => savedRoom._id === roomId
                );
                setIsFavorite(isSaved);
              }
            } catch (error) {
              console.error('Error checking favorite status:', error);
            }
          }
        } else {
          console.error('Error fetching room:', response.message);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, isAuthenticated]);

  // Handle toggling favorite status
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL to this page
      navigate(`/auth/login?redirect=/rooms/${roomId}`);
      return;
    }

    if (!roomId) return;

    setToggleFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await roomApi.unfavoriteRoom(roomId);
        if (response.success) {
          setIsFavorite(false);
        } else {
          console.error('Failed to remove from favorites:', response.message);
        }
      } else {
        // Add to favorites
        const response = await roomApi.favoriteRoom(roomId);
        if (response.success) {
          setIsFavorite(true);
        } else {
          console.error('Failed to add to favorites:', response.message);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    } finally {
      setToggleFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light dark:bg-darkBlue p-4">
        <div className="text-darkBlue dark:text-light text-2xl mb-4">
          Room not found
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-darkBlue text-light dark:bg-light dark:text-darkBlue rounded-lg hover:opacity-90 transition">
          <IoMdArrowBack /> Back to Home
        </Link>
      </div>
    );
  }

  const displayRoomType =
    room.type === 'stay'
      ? 'Room Stay'
      : room.type === 'conference'
      ? 'Conference Room'
      : room.type === 'event'
      ? 'Events Place'
      : room.type;

  return (
    <div className="min-h-screen bg-light dark:bg-darkBlue text-darkBlue dark:text-light p-4 md:p-6 font-poppins">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-darkBlue dark:text-light hover:underline mb-6">
          <IoMdArrowBack /> Back to listings
        </Link>

        {/* Title and favorite button */}
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold">{room.title}</h1>
          <button
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteLoading}
            aria-label={
              isFavorite ? 'Remove from favorites' : 'Add to favorites'
            }
            className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFavorite
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800'
            }`}>
            {toggleFavoriteLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : isFavorite ? (
              <FaHeart className="text-xl" />
            ) : (
              <FiHeart className="text-xl" />
            )}
          </button>
        </div>

        {/* Rest of the component remains the same */}
        {/* Location and category */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FiMapPin className="mr-1" />
            <span>
              {room.location
                ? `${room.location.city}, ${room.location.country}`
                : 'Location not specified'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs font-medium">
              {displayRoomType}
            </span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Room details */}
          <div className="col-span-2">
            {/* Image gallery */}
            <ImageGallery
              images={room.images}
              title={room.title}
              getImageUrl={getImageUrl}
              handleImageError={handleImageError}
            />

            {/* Tabs for Details and Policies */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('policies')}
                  className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'policies'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  Policies
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' ? (
              <RoomDetails room={room} />
            ) : (
              <RoomPolicies room={room} />
            )}

            {/* Host section */}
            {room.host && (
              <div className="mt-8 border-t pt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Hosted by {`${room.host.firstName} ${room.host.lastName}`}
                </h3>
                <div className="flex items-start gap-4">
                  <Link
                    to={`/hosts/${room.host._id}`}
                    className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {room.host.profileImage ? (
                        <img
                          src={getImageUrl(room.host.profileImage)}
                          alt={`${room.host.firstName} ${room.host.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                          {room.host.firstName.charAt(0)}
                          {room.host.lastName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {room.host.hostInfo?.description ||
                        'No host description available'}
                    </p>
                    <Link
                      to={`/hosts/${room.host._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline">
                      View host profile
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews section */}
            {room && <ReviewArea roomId={roomId || ''} userHasBooking={true} />}
          </div>

          {/* Right column - Booking details */}
          <div className="col-span-1">
            <BookingPanel
              room={room}
              roomId={roomId || ''}
              isAuthenticated={isAuthenticated}
              unavailableDates={unavailableDates}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoom;
