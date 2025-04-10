import { FiFilter, FiCheck } from 'react-icons/fi';

interface BookingsFilterProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const BookingsFilter = ({
  statusFilter,
  setStatusFilter,
}: BookingsFilterProps) => {
  const statuses = [
    { id: 'all', label: 'All Bookings' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'rejected', label: 'Rejected' },
  ];

  // Get color scheme for filter buttons based on status
  const getButtonStyles = (status: string) => {
    const isActive = statusFilter === status;

    if (isActive) {
      return 'bg-darkBlue dark:bg-light text-white dark:text-darkBlue font-medium';
    }

    // Status-specific hover colors for inactive buttons
    switch (status) {
      case 'pending':
        return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/10';
      case 'confirmed':
        return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/10';
      case 'completed':
        return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10';
      case 'cancelled':
      case 'rejected':
        return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10';
      default:
        return 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center">
          <FiFilter
            className="text-blue-500 dark:text-blue-400 mr-2"
            size={18}
          />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Filter by status:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${getButtonStyles(
                status.id
              )}`}>
              {statusFilter === status.id && (
                <FiCheck className="inline-block mr-1" size={14} />
              )}
              {status.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingsFilter;
