import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiMapPin,
  FiUsers,
  FiClock,
  FiCalendar,
  FiShield,
  FiInfo,
} from 'react-icons/fi';
import Openspace from '../../assets/logo_white.jpg';
import ReviewArea from '../../components/Room/ReviewArea';
import { useAuth } from '../../contexts/AuthContext';
import { IoMdArrowBack } from 'react-icons/io';
import { BiCheckShield } from 'react-icons/bi';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { RiTimeLine } from 'react-icons/ri';
import { MdOutlineRule } from 'react-icons/md';
import logo_black from '../../assets/logo_black.jpg';
import { rooms, getHostById } from '../../config/rooms';
import Calendar from 'react-calendar';
import '../../css/calendar.css'; //

// Sample unavailable dates
const unavailableDates = [
  new Date(2025, 3, 15),
  new Date(2025, 3, 16),
  new Date(2025, 3, 17),
  new Date(2025, 3, 25),
  new Date(2025, 3, 26),
];

const ViewRoom = () => {
  const { roomId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [host, setHost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [checkInTime, setCheckInTime] = useState('2:00 PM');
  const [checkOutTime, setCheckOutTime] = useState('12:00 PM');
  const [showTimeSelector, setShowTimeSelector] = useState<
    'checkin' | 'checkout' | null
  >(null);
  const [bookingDetails, setBookingDetails] = useState({
    numberOfDays: 0,
    subtotal: 0,
    serviceFee: 0,
    total: 0,
  });
  const [activeTab, setActiveTab] = useState<'details' | 'policies'>('details');

  // Time options
  const timeOptions = [
    '7:00 AM',
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
    '9:00 PM',
    '10:00 PM',
    '11:00 PM',
  ];

  // Fetch room data
  useEffect(() => {
    // Simulate API call - replace with actual API in production
    setTimeout(() => {
      const foundRoom = rooms.find((r) => r.id === Number(roomId));
      setRoom(foundRoom || null);

      // Get host info if room is found
      if (foundRoom && foundRoom.hostId) {
        const roomHost = getHostById(foundRoom.hostId);
        setHost(roomHost || null);
      }

      // Set default check-in/out times based on room type
      if (foundRoom) {
        if (foundRoom.category === 'Room Stay') {
          const roomPolicies = foundRoom.policies as any;
          setCheckInTime(roomPolicies.checkIn);
          setCheckOutTime(roomPolicies.checkOut);
        } else if (foundRoom.category === 'Events Place') {
          const eventPolicies = foundRoom.policies as any;
          setCheckInTime(eventPolicies.setup.startTime);
        }
      }

      setLoading(false);
    }, 500);
  }, [roomId]);

  // Calculate booking details when date range changes
  useEffect(() => {
    if (dateRange[0] && dateRange[1] && room) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      const differenceInTime = endDate.getTime() - startDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      let subtotal = room.price;

      // Calculate based on room category
      if (room.category === 'Room Stay') {
        subtotal = room.price * differenceInDays;
      } else if (room.category === 'Conference Room') {
        const policies = room.policies as any;
        const minimumHours = policies.minimumHours || 2;
        subtotal =
          room.price * Math.max(differenceInDays * minimumHours, minimumHours);
      } else if (room.category === 'Events Place') {
        subtotal = room.price;
      }

      const serviceFee = subtotal * 0.1; // 10% service fee
      const total = subtotal + serviceFee;

      setBookingDetails({
        numberOfDays: differenceInDays,
        subtotal,
        serviceFee,
        total,
      });
    }
  }, [dateRange, room]);

  // Disable past dates, today, and unavailable dates
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    // Disable dates in month and year view
    if (view !== 'month') return false;

    // Disable past dates and today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Disable unavailable dates
    return unavailableDates.some(
      (unavailableDate) =>
        date.getDate() === unavailableDate.getDate() &&
        date.getMonth() === unavailableDate.getMonth() &&
        date.getFullYear() === unavailableDate.getFullYear()
    );
  };

  // You can optionally add a tileClassName function to further customize styling based on date
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';

    // For unavailable dates (this provides an additional class if needed)
    if (tileDisabled({ date, view })) {
      return 'unavailable-date';
    }

    return '';
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      // Redirect to login page with a return URL to come back to this room
      navigate(`/auth/login?redirect=/rooms/${roomId}`);
      return;
    }

    if (dateRange[0] && dateRange[1]) {
      // Format dates for display in payment page
      const formattedCheckInDate = formatDate(dateRange[0]);
      const formattedCheckOutDate = formatDate(dateRange[1]);

      // Redirect to payment page with booking details
      navigate('/payment', {
        state: {
          bookingDetails: {
            roomId,
            roomName: room.name,
            location: room.location,
            checkInDate: formattedCheckInDate,
            checkOutDate: formattedCheckOutDate,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            numberOfDays: bookingDetails.numberOfDays,
            subtotal: bookingDetails.subtotal,
            serviceFee: bookingDetails.serviceFee,
            total: bookingDetails.total,
          },
        },
      });

      // Alert for confirmation (you may want to remove this in production)
      alert(
        `Booking confirmed!\n\nCheck-in: ${formattedCheckInDate} at ${checkInTime}\nCheck-out: ${formattedCheckOutDate} at ${checkOutTime}\nTotal: ₱${bookingDetails.total.toLocaleString()}`
      );
    }
  };

  const handleDateChange = (value: any) => {
    setDateRange(value);
  };

  // const handleTimeSelect = (time: string) => {
  //   if (showTimeSelector === 'checkin') {
  //     setCheckInTime(time);
  //   } else if (showTimeSelector === 'checkout') {
  //     setCheckOutTime(time);
  //   }
  //   setShowTimeSelector(null);
  // };

  // Handle image navigation
  const nextImage = () => {
    if (!room) return;
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    if (!room) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + room.images.length) % room.images.length
    );
  };

  // Format date to display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render policies based on room category
  const renderPolicies = () => {
    if (!room) return null;

    if (room.category === 'Room Stay') {
      const policies = room.policies as any;
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <RiTimeLine className="mr-2 text-blue-500" />
              Check-in/Check-out
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <span className="font-medium">Check-in:</span>
                <span>{policies.checkIn}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Check-out:</span>
                <span>{policies.checkOut}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Minimum stay:</span>
                <span>{policies.minStay}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Maximum stay:</span>
                <span>{policies.maxStay}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <HiOutlineDocumentText className="mr-2 text-blue-500" />
              Cancellation Policy
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {policies.cancellation}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <MdOutlineRule className="mr-2 text-blue-500" />
              House Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              {policies.houseRules.map((rule: string, index: number) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <BiCheckShield className="mr-2 text-blue-500" />
              Security
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {policies.security}
            </p>
          </div>
        </div>
      );
    } else if (room.category === 'Conference Room') {
      const policies = room.policies as any;
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <RiTimeLine className="mr-2 text-blue-500" />
              Booking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <span className="font-medium">Minimum hours:</span>
                <span>{policies.minimumHours} hours</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Available hours:</span>
                <span>{policies.availableHours}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Overtime rate:</span>
                <span>{policies.overtime}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Equipment:</span>
                <span>{policies.equipment}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <HiOutlineDocumentText className="mr-2 text-blue-500" />
              Cancellation Policy
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {policies.cancellation}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <MdOutlineRule className="mr-2 text-blue-500" />
              Room Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              {policies.rules.map((rule: string, index: number) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <BiCheckShield className="mr-2 text-blue-500" />
              Security
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {policies.security}
            </p>
          </div>
        </div>
      );
    } else if (room.category === 'Events Place') {
      const policies = room.policies as any;
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <RiTimeLine className="mr-2 text-blue-500" />
              Setup and Timing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <span className="font-medium">Minimum hours:</span>
                <span>{policies.minimumHours} hours</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Setup time:</span>
                <span>{policies.setup.startTime}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Setup hours included:</span>
                <span>{policies.setup.setupHours} hours</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Includes setup time:</span>
                <span>{policies.setup.includesSetup ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <HiOutlineDocumentText className="mr-2 text-blue-500" />
              Cancellation Policy
            </h3>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p>
                <span className="font-medium">Full refund:</span>{' '}
                {policies.cancellation.fullRefund}
              </p>
              <p>
                <span className="font-medium">Partial refund:</span>{' '}
                {policies.cancellation.partialRefund}
              </p>
              <p>
                <span className="font-medium">No refund:</span>{' '}
                {policies.cancellation.noRefund}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <MdOutlineRule className="mr-2 text-blue-500" />
              Venue Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              {policies.rules.map((rule: string, index: number) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <BiCheckShield className="mr-2 text-blue-500" />
                Security
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {policies.security}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <FiShield className="mr-2 text-blue-500" />
                Insurance
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {policies.insurance}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <FiInfo className="mr-2 text-blue-500" />
                Noise Restrictions
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {policies.noise}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <FiMapPin className="mr-2 text-blue-500" />
                Parking
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {policies.parking}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkBlue">
        <div className="animate-pulse text-darkBlue dark:text-light">
          Loading...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light dark:bg-darkBlue p-4">
        <div className="text-darkBlue dark:text-light text-2xl mb-4">
          Room not found
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-darkBlue text-light dark:bg-light dark:text-darkBlue rounded-lg hover:opacity-90 transition">
          <IoMdArrowBack /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-darkBlue text-darkBlue dark:text-light p-4 md:p-6 font-poppins">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-darkBlue dark:text-light hover:underline mb-6">
          <IoMdArrowBack /> Back to listings
        </Link>

        {/* Room title */}
        <h1 className="text-3xl font-bold mb-2">{room.name}</h1>

        {/* Location and category */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FiMapPin className="mr-1" />
            <span>{room.location}</span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs font-medium">
              {room.category}
            </span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Room details */}
          <div className="col-span-2">
            {/* Image gallery */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6 bg-gray-200 dark:bg-gray-700">
              {/* Using placeholder image for now */}
              <img
                src={logo_black}
                alt={`${room.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Image navigation */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 dark:bg-black/50 flex items-center justify-center hover:bg-white dark:hover:bg-black/70 transition">
                &#10094;
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 dark:bg-black/50 flex items-center justify-center hover:bg-white dark:hover:bg-black/70 transition">
                &#10095;
              </button>

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {room.images.length}
              </div>
            </div>

            {/* Tabs for Details and Policies */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('policies')}
                  className={`py-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'policies'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  Policies
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' ? (
              <>
                {/* Room description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">
                    About this space
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                {/* Room features */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <FiUsers className="text-blue-500 text-xl" />
                      <div>
                        <div className="font-medium">Capacity</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {room.capacity}{' '}
                          {room.capacity > 1 ? 'persons' : 'person'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <FiClock className="text-blue-500 text-xl" />
                      <div>
                        <div className="font-medium">Booking Unit</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {room.category === 'Room Stay'
                            ? 'Per Night'
                            : room.category === 'Conference Room'
                            ? 'Per Day'
                            : 'Per Event'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Policies & Rules</h2>
                {renderPolicies()}
              </div>
            )}

            {/* Host section */}
            {host && (
              <div className="mt-8 border-t pt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Hosted by {host.name}
                </h3>
                <div className="flex items-start gap-4">
                  <Link to={`/hosts/${host.id}`} className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={Openspace}
                        alt={host.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/100x100?text=Host';
                        }}
                      />
                    </div>
                  </Link>
                  <div>
                    <Link
                      to={`/hosts/${host.id}`}
                      className="text-blue-500 hover:text-blue-700 font-medium">
                      View host profile
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Host since {host.dateJoined}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
                        {host.responseRate}% Response Rate
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {host.responseTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews section */}
            {room && <ReviewArea roomId={roomId || ''} userHasBooking={true} />}
          </div>

          {/* Right column - Booking details */}
          <div className="col-span-1">
            <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              {/* Price display */}
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold">
                  ₱{room.price.toLocaleString()}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  {room.category === 'Room Stay'
                    ? '/night'
                    : room.category === 'Conference Room'
                    ? '/day'
                    : '/event'}
                </span>
              </div>

              {/* Calendar for date selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FiCalendar className="mr-2" />
                  Select Dates
                </h3>
                <div className="calendar-container dark:text-darkBlue flex justify-center">
                  <Calendar
                    onChange={handleDateChange}
                    value={dateRange}
                    selectRange={true}
                    tileDisabled={tileDisabled}
                    tileClassName={tileClassName}
                    className="w-full border-0 rounded-lg overflow-hidden"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  * Red dates are unavailable
                </div>
              </div>

              {/* Time selection section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <FiClock className="mr-2" />
                  Select Times
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Check-in time selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Check-in
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white flex justify-between items-center"
                        onClick={() =>
                          setShowTimeSelector(
                            showTimeSelector === 'checkin' ? null : 'checkin'
                          )
                        }>
                        <span>{checkInTime}</span>
                        <FiClock />
                      </button>

                      {showTimeSelector === 'checkin' && (
                        <div
                          className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-[100]"
                          style={{ overflowY: 'auto' }}>
                          {timeOptions.map((time) => (
                            <button
                              key={time}
                              type="button"
                              className={`w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                time === checkInTime
                                  ? 'bg-blue-50 dark:bg-blue-900/30 font-medium'
                                  : ''
                              }`}
                              onClick={() => {
                                setCheckInTime(time);
                                setShowTimeSelector(null);
                              }}>
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Check-out time selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Check-out
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white flex justify-between items-center"
                        onClick={() =>
                          setShowTimeSelector(
                            showTimeSelector === 'checkout' ? null : 'checkout'
                          )
                        }>
                        <span>{checkOutTime}</span>
                        <FiClock />
                      </button>

                      {showTimeSelector === 'checkout' && (
                        <div
                          className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto z-[100]"
                          style={{ overflowY: 'auto' }}>
                          {timeOptions.map((time) => (
                            <button
                              key={time}
                              type="button"
                              className={`w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                time === checkOutTime
                                  ? 'bg-blue-50 dark:bg-blue-900/30 font-medium'
                                  : ''
                              }`}
                              onClick={() => {
                                setCheckOutTime(time);
                                setShowTimeSelector(null);
                              }}>
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking details */}
              {dateRange[0] && dateRange[1] ? (
                <div className="mb-6 space-y-3">
                  <h3 className="text-lg font-medium">Booking Details</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Check-in:
                    </span>
                    <span>
                      {formatDate(dateRange[0])} at {checkInTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Check-out:
                    </span>
                    <span>
                      {formatDate(dateRange[1])} at {checkOutTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Duration:
                    </span>
                    <span>
                      {bookingDetails.numberOfDays}{' '}
                      {bookingDetails.numberOfDays > 1 ? 'days' : 'day'}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-3 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        {room.category === 'Room Stay' ? (
                          <>
                            ₱{room.price.toLocaleString()} ×{' '}
                            {bookingDetails.numberOfDays}{' '}
                            {bookingDetails.numberOfDays > 1
                              ? 'nights'
                              : 'night'}
                          </>
                        ) : room.category === 'Conference Room' ? (
                          <>
                            ₱{room.price.toLocaleString()} ×{' '}
                            {bookingDetails.numberOfDays}{' '}
                            {bookingDetails.numberOfDays > 1 ? 'days' : 'day'}
                          </>
                        ) : (
                          <>Base rate</>
                        )}
                      </span>
                      <span>₱{bookingDetails.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Service fee
                      </span>
                      <span>₱{bookingDetails.serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <span>Total</span>
                      <span>₱{bookingDetails.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Select dates to see booking details
                </div>
              )}

              {/* Book button */}
              <button
                onClick={handleBookingClick}
                className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                  dateRange[0] && dateRange[1]
                    ? 'bg-darkBlue text-light dark:bg-light dark:text-darkBlue hover:opacity-90'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                disabled={!dateRange[0] || !dateRange[1]}>
                {!isAuthenticated
                  ? 'Log in to Book'
                  : dateRange[0] && dateRange[1]
                  ? 'Book Now'
                  : 'Select Dates to Book'}
              </button>

              {/* Reservation note - modified to show login message if not authenticated */}
              {dateRange[0] && dateRange[1] && (
                <p className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {isAuthenticated
                    ? "You won't be charged until confirmation"
                    : 'Please log in or create an account to book this space'}
                </p>
              )}

              {/* Show login prompt if not authenticated */}
              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-center text-blue-600 dark:text-blue-300">
                    <Link
                      to={`/auth/login?redirect=/rooms/${roomId}`}
                      className="font-medium hover:underline">
                      Log in
                    </Link>{' '}
                    or{' '}
                    <Link
                      to="/auth/register"
                      className="font-medium hover:underline">
                      Sign up
                    </Link>{' '}
                    to book this space
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click anywhere to close time selectors */}
      {showTimeSelector && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowTimeSelector(null)}
        />
      )}
    </div>
  );
};

export default ViewRoom;
