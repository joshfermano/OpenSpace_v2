import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import UserListings from '../../components/User Dashboard/UserListings';

const ViewAllListings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse text-center">
            Loading your listings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:underline">
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          All Your Listings
        </h1>

        <UserListings userData={user} showAll={true} />
      </div>
    </div>
  );
};

export default ViewAllListings;
