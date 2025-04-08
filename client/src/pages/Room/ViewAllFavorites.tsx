import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import UserFavorites from '../../components/User Dashboard/UsersFavorites';

const ViewAllFavorites = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBlue p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:underline">
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          All Your Favorite Spaces
        </h1>

        <UserFavorites showAll={true} />
      </div>
    </div>
  );
};

export default ViewAllFavorites;
