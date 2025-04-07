import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-light dark:bg-darkBlue text-darkBlue dark:text-light transition-all duration-300">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold mb-2">404</h1>
        <div className="h-1 w-16 bg-darkBlue dark:bg-light mx-auto my-6"></div>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-darkBlue dark:border-light rounded-lg hover:bg-darkBlue hover:text-light dark:hover:bg-light dark:hover:text-darkBlue transition-all duration-300">
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-darkBlue text-light dark:bg-light dark:text-darkBlue rounded-lg hover:opacity-90 transition-all duration-300">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
