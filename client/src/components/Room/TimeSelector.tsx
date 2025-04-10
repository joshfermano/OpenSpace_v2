import { FiClock } from 'react-icons/fi';

interface TimeSelectorProps {
  label: string;
  selectedTime: string;
  timeOptions: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (time: string) => void;
}

const TimeSelector = ({
  label,
  selectedTime,
  timeOptions,
  isOpen,
  onToggle,
  onSelect,
}: TimeSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white flex justify-between items-center"
          onClick={onToggle}>
          <span>{selectedTime}</span>
          <FiClock />
        </button>

        {isOpen && (
          <div
            className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 z-[100]"
            style={{ overflowY: 'auto' }}>
            {timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                className={`w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  time === selectedTime
                    ? 'bg-blue-50 dark:bg-blue-900/30 font-medium'
                    : ''
                }`}
                onClick={() => onSelect(time)}>
                {time}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSelector;
