import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Host, Room, getHostById, getRoomsByHostId } from '../../config/rooms';
import HostInfo from '../../components/Host/HostInfo';
import RoomCards from '../../components/Room/RoomCards';
import { IoMdArrowBack } from 'react-icons/io';

const HostProfile = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const [host, setHost] = useState<Host | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with timeout - replace with real API call in production
    const timer = setTimeout(() => {
      if (hostId) {
        const foundHost = getHostById(parseInt(hostId));
        const hostRooms = getRoomsByHostId(parseInt(hostId));

        setHost(foundHost || null);
        setRooms(hostRooms || []);
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [hostId]);

  // Group rooms by category
  const roomsByCategory: Record<string, Room[]> = rooms.reduce((acc, room) => {
    const category = room.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-light dark:bg-darkBlue text-darkBlue dark:text-light transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="min-h-screen bg-light dark:bg-darkBlue text-darkBlue dark:text-light transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
            <p>
              Host not found. The host may have been removed or you entered an
              invalid URL.
            </p>
            <Link
              to="/"
              className="inline-flex items-center mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200">
              <IoMdArrowBack className="mr-1" /> Back to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-darkBlue text-darkBlue dark:text-light transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200">
            <IoMdArrowBack className="mr-1" /> Back to homepage
          </Link>
        </div>

        {/* Host information */}
        <HostInfo host={host} />

        {/* Host listings */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {host.name}'s Listings
          </h2>

          {Object.keys(roomsByCategory).length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              This host doesn't have any active listings at the moment.
            </p>
          ) : (
            Object.entries(roomsByCategory).map(([category, categoryRooms]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  {category}
                </h3>
                <RoomCards rooms={categoryRooms} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HostProfile;
