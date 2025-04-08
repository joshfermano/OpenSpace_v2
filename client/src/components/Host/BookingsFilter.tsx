import { FiFilter } from 'react-icons/fi';

interface BookingsFilterProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const BookingsFilter = ({
  statusFilter,
  setStatusFilter,
}: BookingsFilterProps) => {
  const statuses = [
    'all',
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'rejected',
  ];

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center">
        <FiFilter className="text-gray-500 mr-2" />
        <span className="text-gray-700 dark:text-gray-300 mr-3">
          Filter by status:
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-darkBlue dark:bg-light text-white dark:text-darkBlue'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BookingsFilter;
