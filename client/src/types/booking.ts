export interface Room {
  _id: string;
  title: string;
  images: string[];
  location: {
    city: string;
    country: string;
  };
  type: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface Booking {
  _id: string;
  room: Room;
  user: User;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentMethod: 'property' | 'creditCard';
  bookingStatus:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'rejected';
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  specialRequests?: string;
  createdAt: string;
}
