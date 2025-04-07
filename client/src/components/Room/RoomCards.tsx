import { FC } from 'react';
import { Link } from 'react-router-dom';
import logo_black from '../../assets/logo_black.jpg';
import { FiMapPin, FiUsers } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';
import { getHostById } from '../../config/rooms';
import Openspace from '../../assets/logo_white.jpg';

interface Room {
  id: number;
  name: string;
  location: string;
  category: string;
  price: number;
  description: string;
  amenities: string[];
  capacity: number;
  images: string[];
  hostId: number;
}

const RoomCard: FC<{ room: Room }> = ({ room }) => {
  const host = getHostById(room.hostId);

  return (
    <Link
      to={`/rooms/${room.id}`}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      {/* Image container */}
      <div className="relative overflow-hidden aspect-[4/3]">
        {/* Placeholder image */}
        <img
          src={logo_black}
          alt={room.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category badge */}
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
          {room.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Location */}
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
          <FiMapPin className="mr-1" size={14} />
          <span>{room.location}</span>
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-1">
          {room.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {room.description}
        </p>

        {/* Host info - added as a clickable element */}
        {host && (
          <Link
            to={`/hosts/${host.id}`}
            className="flex items-center mt-auto mb-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border border-gray-200">
              <img
                src={Openspace}
                alt={host.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/40x40?text=H';
                }}
              />
            </div>
            <span>Hosted by {host.name}</span>
          </Link>
        )}

        {/* Features row */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
          <div className="flex items-center">
            <FiUsers className="mr-1" size={14} />
            <span>
              {room.capacity} {room.capacity > 1 ? 'guests' : 'guest'}
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
            ₱{room.price.toLocaleString()}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {room.category === 'Events Place'
                ? '/event'
                : room.category === 'Conference Room'
                ? '/day'
                : '/night'}
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
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};

export default RoomCards;
