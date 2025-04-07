export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string; // Added password field
  profileImage?: string;
  role: 'user' | 'host' | 'admin';
  dateJoined: string;
  verificationStatus: 'pending' | 'verified' | 'unverified' | 'basic';
  governmentIdVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  bookings: Booking[];
  favorites: number[]; // Array of room IDs
  notifications: Notification[];
  paymentMethods: PaymentMethod[];
  hostInfo?: HostInfo;
}

export interface Booking {
  id: string | number;
  roomId: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: 'credit_card' | 'gcash' | 'paymaya';
  createdAt: string;
  checkInTime?: string;
  checkOutTime?: string;
  bookingDate?: string;
  referenceNumber?: string;
}

export interface Notification {
  id: number;
  type: 'booking' | 'system' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

export interface PaymentMethod {
  id: number;
  type: 'credit_card' | 'gcash' | 'paymaya';
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  name?: string;
}

export interface HostInfo {
  description: string;
  responseRate: number;
  responseTime: string;
  languages: string[];
  verifications: string[];
}

// Mock users for development
export const users: User[] = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan@example.com',
    password: 'password123', // Added password
    phone: '+63 917 123 4567',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'user',
    dateJoined: '2024-02-15',
    verificationStatus: 'basic',
    governmentIdVerified: false,
    emailVerified: false,
    phoneVerified: false,
    bookings: [
      {
        id: 'b101',
        roomId: 6, // Executive Boardroom
        startDate: '2025-04-10',
        endDate: '2025-04-12',
        status: 'confirmed',
        totalPrice: 16000,
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        bookingDate: '2025-03-20T10:15:00',
        checkInTime: '9:00 AM',
        checkOutTime: '5:00 PM',
        referenceNumber: 'OS-593728',
        createdAt: '2025-03-20T10:15:00', // Added required field
      },
      {
        id: 'b102',
        roomId: 3, // Mountain View Suite
        startDate: '2025-05-15',
        endDate: '2025-05-18',
        status: 'pending',
        totalPrice: 12600,
        paymentStatus: 'pending',
        paymentMethod: 'gcash',
        bookingDate: '2025-03-25T14:30:00',
        checkInTime: '2:00 PM',
        checkOutTime: '12:00 PM',
        referenceNumber: 'OS-671039',
        createdAt: '2025-03-25T14:30:00', // Added required field
      },
      {
        id: 'b103',
        roomId: 11, // Garden Pavilion
        startDate: '2025-06-20',
        endDate: '2025-06-20',
        status: 'confirmed',
        totalPrice: 45000,
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        bookingDate: '2025-03-10T09:45:00',
        checkInTime: '10:00 AM',
        checkOutTime: '10:00 PM',
        referenceNumber: 'OS-482951',
        createdAt: '2025-03-10T09:45:00', // Added required field
      },
      {
        id: 'b104',
        roomId: 1, // Seaside Retreat
        startDate: '2025-04-25',
        endDate: '2025-04-28',
        status: 'cancelled',
        totalPrice: 10500,
        paymentStatus: 'refunded',
        paymentMethod: 'credit_card',
        bookingDate: '2025-02-15T16:20:00',
        checkInTime: '2:00 PM',
        checkOutTime: '12:00 PM',
        referenceNumber: 'OS-329584',
        createdAt: '2025-02-15T16:20:00', // Added required field
      },
    ],
    favorites: [1, 4, 8, 12],
    notifications: [
      {
        id: 201,
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your booking at Mountain View Suite has been confirmed.',
        isRead: true,
        createdAt: '2025-03-20',
        linkTo: '/bookings/101',
      },
      {
        id: 202,
        type: 'system',
        title: 'Welcome to OpenSpace',
        message: 'Thank you for joining our platform. Explore spaces now!',
        isRead: true,
        createdAt: '2025-02-15',
      },
      {
        id: 203,
        type: 'message',
        title: 'New message from Executive Boardroom host',
        message: 'Looking forward to hosting you next week!',
        isRead: false,
        createdAt: '2025-03-26',
        linkTo: '/messages/15',
      },
    ],
    paymentMethods: [
      {
        id: 301,
        type: 'credit_card',
        lastFour: '4567',
        expiryDate: '12/26',
        isDefault: true,
        name: 'BPI Visa',
      },
      {
        id: 302,
        type: 'gcash',
        isDefault: false,
        name: 'GCash',
      },
    ],
  },
  {
    id: 2,
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria@example.com',
    password: 'password123', // Added password
    phone: '+63 918 765 4321',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    role: 'host',
    dateJoined: '2023-07-10',
    verificationStatus: 'verified',
    governmentIdVerified: true,
    emailVerified: true,
    phoneVerified: true,
    bookings: [],
    favorites: [5, 9, 15],
    notifications: [
      {
        id: 204,
        type: 'booking',
        title: 'New Booking Request',
        message: 'You have a new booking request for Seaside Retreat.',
        isRead: false,
        createdAt: '2025-03-28',
        linkTo: '/host/bookings/109',
      },
    ],
    paymentMethods: [
      {
        id: 303,
        type: 'paymaya',
        isDefault: true,
        name: 'PayMaya',
      },
    ],
    hostInfo: {
      description:
        'Passionate about providing authentic Filipino experiences in beautiful Palawan. I love sharing the natural wonders of our islands with visitors.',
      responseRate: 98,
      responseTime: 'Within an hour',
      languages: ['English', 'Filipino', 'Spanish'],
      verifications: ['ID', 'Email', 'Phone'],
    },
  },
  {
    id: 3,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@openspace.com',
    password: 'admin123456', // Added password
    phone: '+63 999 888 7777',
    role: 'admin',
    dateJoined: '2023-01-01',
    verificationStatus: 'verified',
    governmentIdVerified: true,
    emailVerified: true,
    phoneVerified: true,
    bookings: [],
    favorites: [],
    notifications: [
      {
        id: 205,
        type: 'system',
        title: 'System Update Complete',
        message: 'The system maintenance was completed successfully.',
        isRead: true,
        createdAt: '2025-03-15',
      },
    ],
    paymentMethods: [],
  },
];

// Helper functions
export const getUserById = (id: number): User | undefined => {
  return users.find((user) => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

export const validateCredentials = (
  email: string,
  password: string
): User | null => {
  // In a real app, you would hash and properly verify passwords
  // This is just for demonstration
  const user = getUserByEmail(email);

  // For demo purposes, we'll accept any password that's at least 8 characters
  if (user && password.length >= 8) {
    return user;
  }

  return null;
};
