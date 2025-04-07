import { Outlet, Link } from 'react-router-dom';
import { IoChevronBackOutline } from 'react-icons/io5';

const AuthLayout = () => {
  return (
    <div className="min-h-screen p-2 font-poppins bg-light dark:bg-darkBlue flex flex-col transition-all duration-300">
      <div className="p-4">
        <Link
          to={'/'}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
          <IoChevronBackOutline className="text-xl" />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Main content area */}
      <main className="flex-grow flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Simple footer */}
      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} OpenSpace. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
