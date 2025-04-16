import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { roomApi } from '../../services/roomApi';
import ReviewArea from '../../components/Room/ReviewArea';

interface RoomDetails {
  _id: string;
  title: string;
  type: string;
}

const ViewAllRoomReviews: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        if (!roomId) {
          throw new Error('Room ID is missing');
        }

        const response = await roomApi.getRoomById(roomId);

        if (response.success) {
          setRoom({
            _id: response.data._id,
            title: response.data.title,
            type: response.data.type,
          });
        } else {
          throw new Error(response.message || 'Failed to fetch room details');
        }
      } catch (err: any) {
        console.error('Error fetching room details:', err);
        setError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light dark:bg-darkBlue p-6 flex justify-center items-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-300">
          Loading reviews...
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-light dark:bg-darkBlue p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
            {error || 'Room not found'}
          </div>
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
              <FiArrowLeft className="mr-2" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-darkBlue p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          to={`/rooms/${roomId}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <FiArrowLeft className="mr-2" /> Back to Room
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          All Reviews for {room.title}
        </h1>

        {/* Use the ReviewArea component but show all reviews */}
        <ReviewArea roomId={roomId || ''} limitReviews={false} />
      </div>
    </div>
  );
};

export default ViewAllRoomReviews;
