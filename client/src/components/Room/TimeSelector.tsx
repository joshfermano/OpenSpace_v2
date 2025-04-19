import { FiClock } from 'react-icons/fi';

interface TimeSelectorProps {
  label: string;
  selectedTime: string;
  timeOptions: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (time: string) => void;
}

const convertTo12HourFormat = (time: string): string => {
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);

  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour < 12) {
    return `${hour}:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour - 12}:${minutes} PM`;
  }
};

const TimeSelector = ({
  label,
  selectedTime,
  timeOptions,
  isOpen,
  onToggle,
  onSelect,
}: TimeSelectorProps) => {
  // Convert selectedTime to 12-hour format if it's in 24-hour format
  const displayTime = convertTo12HourFormat(selectedTime);

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
          <span>{displayTime}</span>
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
                  convertTo12HourFormat(time) === displayTime
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
