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
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  room: {
    _id: string;
    title: string;
    type: 'stay' | 'conference' | 'event';
    images: string[];
    houseRules?: {
      checkInTime?: string;
      checkOutTime?: string;
    };
    host: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  guests: {
    adults: number;
    children?: number;
    infants?: number;
  };
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentMethod: 'property' | 'card' | 'gcash' | 'maya';
  bookingStatus:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'rejected';
  specialRequests?: string;
  createdAt: string; // Add this field to track when the booking was created
  updatedAt?: string;
}
