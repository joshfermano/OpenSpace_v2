import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiClock, FiHeart } from 'react-icons/fi';
import { IoMdArrowBack } from 'react-icons/io';
import { MdOutlineRule } from 'react-icons/md';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { RiTimeLine } from 'react-icons/ri';
import Calendar from 'react-calendar';
import { useAuth } from '../../contexts/AuthContext';
import ReviewArea from '../../components/Room/ReviewArea';
import { roomApi } from '../../services/roomApi';
import { userApi } from '../../services/userApi';
import placeholder from '../../assets/logo_black.jpg';
import '../../css/calendar.css';
import { API_URL } from '../../services/core';
import { handleImageError } from '../../utils/imageUtils';

const ViewRoom = () => {
  const { roomId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [toggleFavoriteLoading, setToggleFavoriteLoading] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

  // Time options for checkin/checkout
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
  ];

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return placeholder;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  // Fetch room data and check if it's in user's favorites
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;

      setLoading(true);
      try {
        // Fetch room details
        const response = await roomApi.getRoomById(roomId);

        if (response.success) {
          setRoom(response.data);
          console.log('Room data:', response.data);

          // Set default times based on room type
          if (response.data.type === 'stay') {
            setCheckInTime('2:00 PM');
            setCheckOutTime('12:00 PM');
          } else if (response.data.type === 'conference') {
            setCheckInTime('8:00 AM');
            setCheckOutTime('5:00 PM');
          } else if (response.data.type === 'event') {
            setCheckInTime('10:00 AM');
            setCheckOutTime('10:00 PM');
          }

          // Set unavailable dates
          if (
            response.data.availability &&
            response.data.availability.unavailableDates
          ) {
            const convertedDates =
              response.data.availability.unavailableDates.map(
                (dateString: string) => new Date(dateString)
              );
            setUnavailableDates(convertedDates);
          }

          // Check if this room is in user's favorites
          if (isAuthenticated) {
            const favoritesResponse = await userApi.getSavedRooms();
            if (favoritesResponse.success) {
              const isSaved = favoritesResponse.data.some(
                (savedRoom: any) => savedRoom._id === roomId
              );
              setIsFavorite(isSaved);
            }
          }
        } else {
          console.error('Error fetching room:', response.message);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, isAuthenticated]);

  // Calculate booking details when date range changes
  useEffect(() => {
    if (dateRange[0] && dateRange[1] && room) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      const differenceInTime = endDate.getTime() - startDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

      let subtotal = room.price?.basePrice || 0;

      // Calculate based on room type
      if (room.type === 'stay') {
        subtotal = subtotal * differenceInDays;
      } else if (room.type === 'conference') {
        // For conference rooms, price is per day
        subtotal = subtotal * differenceInDays;
      } else if (room.type === 'event') {
        // For events, price is per event (fixed)
        subtotal = subtotal;
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

  // Handle toggling favorite status
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      navigate(`/auth/login?redirect=/rooms/${roomId}`);
      return;
    }

    if (!roomId) return;

    setToggleFavoriteLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await userApi.unsaveRoom(roomId);
        if (response.success) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const response = await userApi.saveRoom(roomId);
        if (response.success) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    } finally {
      setToggleFavoriteLoading(false);
    }
  };

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

  // Custom class for calendar tiles
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';

    // For unavailable dates
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
            roomName: room.title,
            location: `${room.location.city}, ${room.location.country}`,
            checkInDate: formattedCheckInDate,
            checkOutDate: formattedCheckOutDate,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            numberOfDays: bookingDetails.numberOfDays,
            subtotal: bookingDetails.subtotal,
            serviceFee: bookingDetails.serviceFee,
            total: bookingDetails.total,
            roomType: room.type,
            roomImage:
              room.images && room.images.length > 0
                ? getImageUrl(room.images[0])
                : null,
            hostId: room.host._id,
            hostName: `${room.host.firstName} ${room.host.lastName}`,
          },
        },
      });
    }
  };

  const handleDateChange = (value: any) => {
    setDateRange(value);
  };

  // Handle image navigation
  const nextImage = () => {
    if (!room || !room.images || room.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    if (!room || !room.images || room.images.length === 0) return;
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

  // Render policies based on room type
  const renderPolicies = () => {
    if (!room) return null;

    if (room.type === 'stay') {
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
                <span>{room.houseRules?.checkInTime || '2:00 PM'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Check-out:</span>
                <span>{room.houseRules?.checkOutTime || '12:00 PM'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <HiOutlineDocumentText className="mr-2 text-blue-500" />
              Cancellation Policy
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {room.houseRules?.cancellationPolicy ||
                'Free cancellation up to 48 hours before check-in. Cancellations less than 48 hours in advance will be charged 50% of the booking amount.'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <MdOutlineRule className="mr-2 text-blue-500" />
              House Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              {room.houseRules?.additionalRules &&
              room.houseRules.additionalRules.length > 0
                ? room.houseRules.additionalRules.map(
                    (rule: string, index: number) => <li key={index}>{rule}</li>
                  )
                : ['No smoking', 'No parties or events', 'No pets'].map(
                    (rule, index) => <li key={index}>{rule}</li>
                  )}
            </ul>
          </div>
        </div>
      );
    } else if (room.type === 'conference') {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <RiTimeLine className="mr-2 text-blue-500" />
              Booking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <span className="font-medium">Operating hours:</span>
                <span>
                  {room.houseRules?.checkInTime || '8:00 AM'} -{' '}
                  {room.houseRules?.checkOutTime || '8:00 PM'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <HiOutlineDocumentText className="mr-2 text-blue-500" />
              Cancellation Policy
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {room.houseRules?.cancellationPolicy ||
                'Free cancellation up to 24 hours before booking time. Late cancellations will be charged 50% of the booking fee.'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <MdOutlineRule className="mr-2 text-blue-500" />
              Room Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              {room.houseRules?.additionalRules &&
              room.houseRules.additionalRules.length > 0
                ? room.houseRules.additionalRules.map(
                    (rule: string, index: number) => <li key={index}>{rule}</li>
                  )
                : [
                    'Keep the space clean',
                    'No loud music',
                    'No food in meeting rooms',
                  ].map((rule, index) => <li key={index}>{rule}</li>)}
            </ul>
          </div>
        </div>
      );
    } else if (room.type === 'event') {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <RiTimeLine className="mr-2 text-blue-500" />
              Setup and Timing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <span className="font-medium">Available hours:</span>
                <span>
                  {room.houseRules?.checkInTime || '8:00 AM'} -{' '}
                  {room.houseRules?.checkOutTime || '10:00 PM'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <HiOutlineDocumentText className="mr-2 text-blue-500" />
              Cancellation Policy
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {room.houseRules?.cancellationPolicy ||
                'Full refund if cancelled 14 days before the event. 50% refund if cancelled 7 days before. No refund for later cancellations.'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <MdOutlineRule className="mr-2 text-blue-500" />
              Venue Rules
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              {room.houseRules?.additionalRules &&
              room.houseRules.additionalRules.length > 0
                ? room.houseRules.additionalRules.map(
                    (rule: string, index: number) => <li key={index}>{rule}</li>
                  )
                : [
                    'No confetti',
                    'No smoking indoors',
                    'Music must end by 10 PM',
                  ].map((rule, index) => <li key={index}>{rule}</li>)}
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-darkBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

  const displayRoomType =
    room.type === 'stay'
      ? 'Room Stay'
      : room.type === 'conference'
      ? 'Conference Room'
      : room.type === 'event'
      ? 'Events Place'
      : room.type;

  return (
    <div className="min-h-screen bg-light dark:bg-darkBlue text-darkBlue dark:text-light p-4 md:p-6 font-poppins">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-darkBlue dark:text-light hover:underline mb-6">
          <IoMdArrowBack /> Back to listings
        </Link>

        {/* Title and favorite button */}
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold">{room.title}</h1>
          <button
            onClick={handleToggleFavorite}
            disabled={toggleFavoriteLoading}
            className={`p-2 rounded-full transition-all ${
              isFavorite
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800'
            }`}>
            <FiHeart
              className={`text-xl ${isFavorite ? 'fill-current' : ''}`}
            />
          </button>
        </div>

        {/* Location and category */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FiMapPin className="mr-1" />
            <span>
              {room.location
                ? `${room.location.city}, ${room.location.country}`
                : 'Location not specified'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs font-medium">
              {displayRoomType}
            </span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Room details */}
          <div className="col-span-2">
            {/* Image gallery */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6 bg-gray-200 dark:bg-gray-700">
              {room.images && room.images.length > 0 ? (
                <img
                  src={getImageUrl(room.images[currentImageIndex])}
                  alt={`${room.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e)}
                />
              ) : (
                <img
                  src={placeholder}
                  alt="No image available"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Image navigation - only show if multiple images */}
              {room.images && room.images.length > 1 && (
                <>
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
                </>
              )}
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

                  <div className="text-gray-700 dark:text-gray-300">
                    <p>{room.description}</p>
                  </div>
                </div>

                {/* Room capacity */}
                {room.capacity && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Capacity</h2>
                    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Max guests:</span>{' '}
                        {room.capacity.maxGuests} people
                      </p>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {room.amenities.map((amenity: string, index: number) => (
                        <div
                          key={index}
                          className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Policies & Rules</h2>
                {renderPolicies()}
              </div>
            )}

            {/* Host section */}
            {room.host && (
              <div className="mt-8 border-t pt-8">
                <h3 className="text-xl font-semibold mb-4">
                  Hosted by {`${room.host.firstName} ${room.host.lastName}`}
                </h3>
                <div className="flex items-start gap-4">
                  <Link
                    to={`/hosts/${room.host._id}`}
                    className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {room.host.profileImage ? (
                        <img
                          src={getImageUrl(room.images[currentImageIndex])}
                          alt={`${room.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                          {room.host.firstName.charAt(0)}
                          {room.host.lastName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {room.host.hostInfo?.description ||
                        'No host description available'}
                    </p>
                    <Link
                      to={`/hosts/${room.host._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline">
                      View host profile
                    </Link>
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
                  ₱{room.price?.basePrice.toLocaleString()}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  {room.type === 'stay'
                    ? '/night'
                    : room.type === 'conference'
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
                        {room.type === 'event' ? 'Venue fee' : 'Subtotal'}
                      </span>
                      <span>₱{bookingDetails.subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span>₱{bookingDetails.serviceFee.toLocaleString()}</span>
                      <span>
                        {room.price?.currency === 'PHP' ? '₱' : '$'}
                        {bookingDetails.serviceFee.toLocaleString()}
                      </span>
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
