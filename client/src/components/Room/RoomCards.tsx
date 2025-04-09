import { FC } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiUsers } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import placeholder from '../../assets/logo_black.jpg';
import { API_URL } from '../../services/core';

interface Host {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

interface Price {
  basePrice: number;
  currency: string;
}

interface Capacity {
  maxGuests: number;
}

interface Location {
  address: string;
  city: string;
  country: string;
}

interface Room {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: Price;
  location: Location;
  capacity: Capacity;
  amenities: string[];
  images: string[];
  host: Host;
}

const RoomCard: FC<{ room: Room }> = ({ room }) => {
  // Helper function to get the full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return placeholder;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  // Get the first image or use placeholder
  const mainImage =
    room.images && room.images.length > 0
      ? getImageUrl(room.images[0])
      : placeholder;

  // Format location display
  const locationDisplay = room.location
    ? `${room.location.city}, ${room.location.country}`
    : 'Location not specified';

  // Format host name
  const hostName = room.host
    ? `${room.host.firstName} ${room.host.lastName}`
    : 'Unknown Host';

  // Format price based on room type
  const priceLabel =
    room.type === 'event'
      ? '/event'
      : room.type === 'conference'
      ? '/day'
      : '/night';

  // Format room type display
  const displayRoomType =
    room.type === 'stay'
      ? 'Room Stay'
      : room.type === 'conference'
      ? 'Conference Room'
      : room.type === 'event'
      ? 'Events Place'
      : room.type;

  return (
    <Link
      to={`/rooms/${room._id}`}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      {/* Image container */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={mainImage}
          alt={room.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholder;
          }}
        />

        {/* Category badge */}
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
          {displayRoomType}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Location */}
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
          <FiMapPin className="mr-1" size={14} />
          <span>{locationDisplay}</span>
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {room.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {room.description}
        </p>

        {/* Host info */}
        {room.host && (
          <Link
            to={`/hosts/${room.host._id}`}
            className="flex items-center mt-auto mb-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border border-gray-200">
              {room.host.profileImage ? (
                <img
                  src={getImageUrl(room.host.profileImage)}
                  alt={hostName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholder;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold bg-gray-200">
                  {room.host.firstName.charAt(0)}
                  {room.host.lastName.charAt(0)}
                </div>
              )}
            </div>
            <span>Hosted by {hostName}</span>
          </Link>
        )}

        {/* Features row */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
          <div className="flex items-center">
            <FiUsers className="mr-1" size={14} />
            <span>
              {room.capacity.maxGuests}{' '}
              {room.capacity.maxGuests > 1 ? 'guests' : 'guest'}
            </span>
          </div>

          <div className="flex items-center">
            <BsStars className="mr-1" size={14} />
            <span>{room.amenities.length} amenities</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="font-semibold text-gray-900 dark:text-white">
            ₱{room.price.basePrice.toLocaleString()}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {priceLabel}
            </span>
          </div>

          <button className="text-sm bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded-lg transition-colors duration-300">
            View
          </button>
        </div>
      </div>
    </Link>
  );
};

// Main component that renders a grid of room cards
const RoomCards: FC<{ rooms: Room[] }> = ({ rooms }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
};

export default RoomCards;
