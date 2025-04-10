interface RoomDetailsProps {
  room: any;
}

const RoomDetails = ({ room }: RoomDetailsProps) => {
  return (
    <>
      {/* Room description */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">About this space</h2>
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
  );
};

export default RoomDetails;
