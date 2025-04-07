export interface RoomStayPolicies {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  houseRules: string[];
  security: string;
  minStay: string;
  maxStay: string;
}

export interface ConferenceRoomPolicies {
  minimumHours: number;
  cancellation: string;
  overtime: string;
  rules: string[];
  security: string;
  availableHours: string;
  equipment: string;
}

export interface EventsPlacePolicies {
  minimumHours: number;
  setup: {
    startTime: string;
    includesSetup: boolean;
    setupHours: number;
  };
  cancellation: {
    fullRefund: string;
    partialRefund: string;
    noRefund: string;
  };
  rules: string[];
  security: string;
  insurance: string;
  noise: string;
  parking: string;
}

export interface Host {
  id: number;
  name: string;
  avatar: string;
  dateJoined: string;
  description: string;
  responseRate: number;
  responseTime: string;
  verifications: string[];
  languages: string[];
  contactInfo: {
    email: string;
    phone?: string;
  };
}

export interface Room {
  id: number;
  name: string;
  location: string;
  category: 'Room Stay' | 'Conference Room' | 'Events Place';
  price: number;
  description: string;
  amenities: string[];
  capacity: number;
  images: string[];
  policies: RoomStayPolicies | ConferenceRoomPolicies | EventsPlacePolicies;
  hostId: number; // Reference to host
}

export const hosts: Host[] = [
  {
    id: 1,
    name: 'Maria Santos',
    avatar: 'host1',
    dateJoined: 'January 2019',
    description:
      'Passionate about providing authentic Filipino experiences in beautiful Palawan. I love sharing the natural wonders of our islands with visitors.',
    responseRate: 98,
    responseTime: 'Within an hour',
    verifications: ['ID', 'Email', 'Phone'],
    languages: ['English', 'Filipino', 'Spanish'],
    contactInfo: {
      email: 'maria@example.com',
      phone: '+63 912 345 6789',
    },
  },
  {
    id: 2,
    name: 'Miguel Cruz',
    avatar: 'host2',
    dateJoined: 'March 2020',
    description:
      'Professional property manager with multiple premium listings in Metro Manila. Providing executive-level accommodations for both business and leisure travelers.',
    responseRate: 95,
    responseTime: 'Within 2 hours',
    verifications: ['ID', 'Email', 'Government ID'],
    languages: ['English', 'Filipino', 'Chinese'],
    contactInfo: {
      email: 'miguel@example.com',
    },
  },
  {
    id: 3,
    name: 'Elena Reyes',
    avatar: 'host3',
    dateJoined: 'October 2018',
    description:
      'Mountain retreat specialist in Baguio City. My properties offer the perfect blend of comfort and local character for an authentic highland experience.',
    responseRate: 99,
    responseTime: 'Within an hour',
    verifications: ['ID', 'Email', 'Phone', 'Government ID'],
    languages: ['English', 'Filipino', 'Ilocano'],
    contactInfo: {
      email: 'elena@example.com',
      phone: '+63 917 876 5432',
    },
  },
  {
    id: 4,
    name: 'Antonio Villanueva',
    avatar: 'host4',
    dateJoined: 'May 2017',
    description:
      'Luxury property expert specializing in beach resorts and vacation homes in Boracay and Cebu. Creating memorable vacation experiences is my passion.',
    responseRate: 92,
    responseTime: 'Within 3 hours',
    verifications: ['ID', 'Email', 'Business License'],
    languages: ['English', 'Filipino', 'German'],
    contactInfo: {
      email: 'antonio@example.com',
      phone: '+63 918 765 4321',
    },
  },
  {
    id: 5,
    name: 'Isabella Lim',
    avatar: 'host5',
    dateJoined: 'February 2021',
    description:
      'Heritage home enthusiast preserving the cultural history of Vigan through authentic Spanish colonial accommodations with modern comforts.',
    responseRate: 97,
    responseTime: 'Within 2 hours',
    verifications: ['ID', 'Email', 'Phone'],
    languages: ['English', 'Filipino', 'Spanish', 'Ilocano'],
    contactInfo: {
      email: 'isabella@example.com',
    },
  },
  {
    id: 6,
    name: 'Lorenzo Torres',
    avatar: 'host6',
    dateJoined: 'June 2019',
    description:
      'Business center and conference room specialist in BGC. My spaces are designed for productive meetings and professional events.',
    responseRate: 100,
    responseTime: 'Within 30 minutes',
    verifications: ['ID', 'Email', 'Business License', 'Government ID'],
    languages: ['English', 'Filipino'],
    contactInfo: {
      email: 'lorenzo@example.com',
      phone: '+63 919 876 5432',
    },
  },
  {
    id: 7,
    name: 'Carmen Reyes',
    avatar: 'host7',
    dateJoined: 'August 2020',
    description:
      'Tech innovation space provider in Cebu IT Park. My venues are equipped with cutting-edge technology for modern collaboration needs.',
    responseRate: 96,
    responseTime: 'Within an hour',
    verifications: ['ID', 'Email', 'Tech Certification'],
    languages: ['English', 'Filipino', 'Cebuano'],
    contactInfo: {
      email: 'carmen@example.com',
    },
  },
  {
    id: 8,
    name: 'Event Spaces Inc.',
    avatar: 'host8',
    dateJoined: 'December 2016',
    description:
      'Professional event venue company with multiple locations throughout Metro Manila. We specialize in corporate training events and large-scale seminars.',
    responseRate: 93,
    responseTime: 'Within 2 hours',
    verifications: ['Business License', 'Corporate Registration', 'Insurance'],
    languages: ['English', 'Filipino', 'Korean'],
    contactInfo: {
      email: 'bookings@eventspacesinc.example.com',
      phone: '+63 2 8765 4321',
    },
  },
];

export const rooms = [
  // Room Stays
  {
    id: 1,
    name: 'Seaside Retreat',
    location: 'El Nido, Palawan',
    category: 'Room Stay',
    price: 3500,
    description:
      'Cozy beachfront cottage with stunning views of the limestone cliffs',
    amenities: [
      'Free WiFi',
      'Air Conditioning',
      'Private Bathroom',
      'Beachfront Access',
    ],
    capacity: 2,
    images: ['room1.jpg', 'room1-2.jpg', 'room1-3.jpg'],
    hostId: 1,
    policies: {
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellation: '48 hours before check-in for full refund',
      houseRules: [
        'No smoking inside the room',
        'No parties or events',
        'Pets not allowed',
        'Quiet hours from 10:00 PM to 7:00 AM',
      ],
      security: 'PHP 2,000 security deposit required',
      minStay: '1 night',
      maxStay: '30 nights',
    },
  },
  {
    id: 2,
    name: 'Urban Loft',
    location: 'Makati, Metro Manila',
    category: 'Room Stay',
    price: 2800,
    description:
      'Modern loft in the heart of the business district with city views',
    amenities: ['Free WiFi', 'Air Conditioning', 'Kitchen', 'Gym Access'],
    capacity: 3,
    images: ['room2.jpg', 'room2-2.jpg', 'room2-3.jpg'],
    hostId: 2,
    policies: {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: '24 hours before check-in for full refund',
      houseRules: [
        'No smoking',
        'No parties',
        'Quiet hours from 11:00 PM to 6:00 AM',
        'Keep common areas clean',
      ],
      security: 'PHP 3,000 security deposit required',
      minStay: '1 night',
      maxStay: '14 nights',
    },
  },
  {
    id: 3,
    name: 'Mountain View Suite',
    location: 'Baguio City',
    category: 'Room Stay',
    price: 4200,
    description:
      'Luxurious suite with panoramic mountain views and cool climate',
    amenities: [
      'Fireplace',
      'Balcony',
      'Mini Kitchen',
      'Premium WiFi',
      'Smart TV',
    ],
    capacity: 4,
    images: ['room3.jpg', 'room3-2.jpg', 'room3-3.jpg'],
    hostId: 3,
    policies: {
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellation: '72 hours before check-in for full refund',
      houseRules: [
        'No smoking',
        'Pets allowed with deposit',
        'Quiet hours from 9:00 PM to 8:00 AM',
        'No fireworks',
      ],
      security: 'PHP 5,000 security deposit required',
      minStay: '2 nights',
      maxStay: '21 nights',
    },
  },
  {
    id: 4,
    name: 'Tropical Villa',
    location: 'Boracay, Aklan',
    category: 'Room Stay',
    price: 8500,
    description: 'Luxury beachfront villa with private pool and garden',
    amenities: [
      'Private Pool',
      'Beach Access',
      'Full Kitchen',
      'BBQ Area',
      'Daily Housekeeping',
    ],
    capacity: 6,
    images: ['room4.jpg', 'room4-2.jpg', 'room4-3.jpg'],
    hostId: 4,
    policies: {
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
      cancellation: '7 days before check-in for full refund',
      houseRules: [
        'No parties without approval',
        'No glass by the pool',
        'Quiet hours from 11:00 PM to 7:00 AM',
        'Children must be supervised',
      ],
      security: 'PHP 10,000 security deposit required',
      minStay: '2 nights',
      maxStay: '14 nights',
    },
  },
  {
    id: 5,
    name: 'Heritage House',
    location: 'Vigan, Ilocos Sur',
    category: 'Room Stay',
    price: 5500,
    description: 'Historic Spanish colonial house with modern amenities',
    amenities: [
      'Period Furniture',
      'Courtyard',
      'Modern Bathroom',
      'Heritage Tours',
    ],
    capacity: 4,
    images: ['room5.jpg', 'room5-2.jpg', 'room5-3.jpg'],
    hostId: 5,
    policies: {
      checkIn: '2:00 PM',
      checkOut: '12:00 PM',
      cancellation: '48 hours before check-in for full refund',
      houseRules: [
        'No smoking indoors',
        'No alterations to property',
        'Quiet hours from 10:00 PM to 6:00 AM',
        'Handle antiques with care',
      ],
      security: 'PHP 7,000 security deposit required',
      minStay: '1 night',
      maxStay: '7 nights',
    },
  },

  // Conference Rooms
  {
    id: 6,
    name: 'Executive Boardroom',
    location: 'Bonifacio Global City, Taguig',
    category: 'Conference Room',
    price: 8000,
    description:
      'Professional meeting space with state-of-the-art presentation equipment',
    amenities: [
      'Projector',
      'Video Conferencing',
      'Whiteboards',
      'Coffee Service',
    ],
    capacity: 12,
    images: ['conf1.jpg', 'conf1-2.jpg', 'conf1-3.jpg'],
    hostId: 6,
    policies: {
      minimumHours: 2,
      cancellation: '24 hours before booking for full refund',
      overtime: 'PHP 2,000 per additional hour',
      rules: [
        'No food near equipment',
        'Clean workspace after use',
        'Report technical issues immediately',
        'Booking includes setup time',
      ],
      security: 'PHP 5,000 security deposit for equipment',
      availableHours: '7:00 AM to 10:00 PM',
      equipment: 'Additional charges for premium AV equipment',
    },
  },
  {
    id: 7,
    name: 'Innovation Hub',
    location: 'Cebu IT Park, Cebu City',
    category: 'Conference Room',
    price: 6500,
    description:
      'Modern collaborative space with flexible seating arrangements',
    amenities: [
      'Smart TV',
      'High-Speed Internet',
      'Modular Furniture',
      'Printing Services',
    ],
    capacity: 20,
    images: ['conf2.jpg', 'conf2-2.jpg', 'conf2-3.jpg'],
    hostId: 7,
    policies: {
      minimumHours: 3,
      cancellation: '48 hours before booking for full refund',
      overtime: 'PHP 1,500 per additional hour',
      rules: [
        'Rearrange furniture as needed',
        'No permanent modifications',
        'Keep noise levels reasonable',
        'Clear all materials after use',
      ],
      security: 'PHP 4,000 security deposit',
      availableHours: '6:00 AM to 11:00 PM',
      equipment: 'Basic equipment included',
    },
  },
  {
    id: 8,
    name: 'Training Center',
    location: 'Quezon City, Metro Manila',
    category: 'Conference Room',
    price: 12000,
    description: 'Large training room with breakout areas and workshop spaces',
    amenities: [
      'Multiple Projectors',
      'Sound System',
      'Training Equipment',
      'Catering Area',
    ],
    capacity: 50,
    images: ['conf3.jpg', 'conf3-2.jpg', 'conf3-3.jpg'],
    hostId: 8,
    policies: {
      minimumHours: 4,
      cancellation: '72 hours before booking for full refund',
      overtime: 'PHP 2,500 per additional hour',
      rules: [
        'No moving fixed equipment',
        'Catering must be pre-arranged',
        'Use designated areas only',
        'Follow safety guidelines',
      ],
      security: 'PHP 10,000 security deposit',
      availableHours: '8:00 AM to 8:00 PM',
      equipment: 'Training materials available for rent',
    },
  },
  {
    id: 9,
    name: 'Creative Studio',
    location: 'Poblacion, Makati',
    category: 'Conference Room',
    price: 4500,
    description: 'Artistic space perfect for creative meetings and workshops',
    amenities: [
      'Art Supplies',
      'Photography Equipment',
      'Design Software',
      'Lounge Area',
    ],
    capacity: 15,
    images: ['conf4.jpg', 'conf4-2.jpg', 'conf4-3.jpg'],
    hostId: 2,
    policies: {
      minimumHours: 2,
      cancellation: '24 hours before booking for full refund',
      overtime: 'PHP 1,200 per additional hour',
      rules: [
        'Clean art supplies after use',
        'No harmful materials',
        'Respect artwork on display',
        'No food near equipment',
      ],
      security: 'PHP 3,000 security deposit',
      availableHours: '9:00 AM to 9:00 PM',
      equipment: 'Art supplies included in rate',
    },
  },
  {
    id: 10,
    name: 'Tech Hub',
    location: 'Eastwood City, Quezon City',
    category: 'Conference Room',
    price: 7500,
    description: 'High-tech meeting space with advanced collaboration tools',
    amenities: [
      '5G Internet',
      'Virtual Reality Setup',
      'Smart Boards',
      'Device Lab',
    ],
    capacity: 16,
    images: ['conf5.jpg', 'conf5-2.jpg', 'conf5-3.jpg'],
    hostId: 6,
    policies: {
      minimumHours: 2,
      cancellation: '48 hours before booking for full refund',
      overtime: 'PHP 2,000 per additional hour',
      rules: [
        'Technical orientation required',
        'No unauthorized software',
        'Handle equipment carefully',
        'Report any issues promptly',
      ],
      security: 'PHP 8,000 security deposit',
      availableHours: '7:00 AM to 11:00 PM',
      equipment: 'Tech support available on request',
    },
  },

  // Events Places
  {
    id: 11,
    name: 'Garden Pavilion',
    location: 'Tagaytay, Cavite',
    category: 'Events Place',
    price: 45000,
    description: 'Open-air venue with Taal Volcano views, perfect for weddings',
    amenities: [
      'Outdoor Space',
      'Indoor Option',
      'Catering Kitchen',
      'Parking',
    ],
    capacity: 150,
    images: ['event1.jpg', 'event1-2.jpg', 'event1-3.jpg'],
    hostId: 3,
    policies: {
      minimumHours: 6,
      setup: {
        startTime: '6:00 AM',
        includesSetup: true,
        setupHours: 3,
      },
      cancellation: {
        fullRefund: '30 days before event',
        partialRefund: '50% refund 15-29 days before event',
        noRefund: 'Less than 15 days before event',
      },
      rules: [
        'Outside catering allowed with corkage',
        'Music until 12:00 AM only',
        'No confetti or glitter',
        'Decorations must be approved',
      ],
      security: 'PHP 20,000 security deposit',
      insurance: 'Required for 100+ guests',
      noise: 'Must follow local ordinances',
      parking: 'Free for 50 vehicles',
    },
  },
  {
    id: 12,
    name: 'Skyline Ballroom',
    location: 'Ortigas Center, Pasig',
    category: 'Events Place',
    price: 85000,
    description: 'Luxurious ballroom with panoramic city views',
    amenities: [
      'Full Bar',
      'Professional Kitchen',
      'VIP Rooms',
      'Valet Parking',
    ],
    capacity: 300,
    images: ['event2.jpg', 'event2-2.jpg', 'event2-3.jpg'],
    hostId: 8,
    policies: {
      minimumHours: 8,
      setup: {
        startTime: '8:00 AM',
        includesSetup: true,
        setupHours: 4,
      },
      cancellation: {
        fullRefund: '60 days before event',
        partialRefund: '50% refund 30-59 days before event',
        noRefund: 'Less than 30 days before event',
      },
      rules: [
        'In-house catering only',
        'Professional vendors only',
        'No wall attachments',
        'Security personnel required',
      ],
      security: 'PHP 50,000 security deposit',
      insurance: 'Required for all events',
      noise: 'Sound system must use limiters',
      parking: 'Valet service included',
    },
  },
  {
    id: 13,
    name: 'Heritage Theater',
    location: 'Intramuros, Manila',
    category: 'Events Place',
    price: 35000,
    description: 'Historic theater perfect for performances and ceremonies',
    amenities: [
      'Stage',
      'Dressing Rooms',
      'Sound System',
      'Period Architecture',
    ],
    capacity: 200,
    images: ['event3.jpg', 'event3-2.jpg', 'event3-3.jpg'],
    hostId: 5,
    policies: {
      minimumHours: 4,
      setup: {
        startTime: '9:00 AM',
        includesSetup: true,
        setupHours: 3,
      },
      cancellation: {
        fullRefund: '45 days before event',
        partialRefund: '50% refund 20-44 days before event',
        noRefund: 'Less than 20 days before event',
      },
      rules: [
        'No modifications to structure',
        'Professional technicians only',
        'No food in theater area',
        'Historical guidelines apply',
      ],
      security: 'PHP 30,000 security deposit',
      insurance: 'Required for performances',
      noise: 'Indoor acoustics guidelines',
      parking: 'Limited to 30 vehicles',
    },
  },
  {
    id: 14,
    name: 'Beachfront Resort',
    location: 'Mactan, Cebu',
    category: 'Events Place',
    price: 65000,
    description: 'Tropical beachfront venue for destination events',
    amenities: [
      'Beach Access',
      'Pool Area',
      'Spa Services',
      'Accommodation Options',
    ],
    capacity: 200,
    images: ['event4.jpg', 'event4-2.jpg', 'event4-3.jpg'],
    hostId: 4,
    policies: {
      minimumHours: 6,
      setup: {
        startTime: '7:00 AM',
        includesSetup: true,
        setupHours: 4,
      },
      cancellation: {
        fullRefund: '90 days before event',
        partialRefund: '50% refund 45-89 days before event',
        noRefund: 'Less than 45 days before event',
      },
      rules: [
        'Beach safety guidelines',
        'No glass on beach',
        'Environmental policies apply',
        'Weather contingency required',
      ],
      security: 'PHP 40,000 security deposit',
      insurance: 'Required for beach events',
      noise: 'Local beach regulations apply',
      parking: 'Available for 80 vehicles',
    },
  },
  {
    id: 15,
    name: 'Industrial Warehouse',
    location: 'Port Area, Manila',
    category: 'Events Place',
    price: 28000,
    description: 'Contemporary industrial space for modern events',
    amenities: [
      'High Ceilings',
      'Loading Dock',
      'Industrial Kitchen',
      'Art Walls',
    ],
    capacity: 250,
    images: ['event5.jpg', 'event5-2.jpg', 'event5-3.jpg'],
    hostId: 1,
    policies: {
      minimumHours: 5,
      setup: {
        startTime: '8:00 AM',
        includesSetup: true,
        setupHours: 3,
      },
      cancellation: {
        fullRefund: '30 days before event',
        partialRefund: '50% refund 15-29 days before event',
        noRefund: 'Less than 15 days before event',
      },
      rules: [
        'Industrial safety rules',
        'No open flames',
        'Loading dock schedule required',
        'Clean-up mandatory',
      ],
      security: 'PHP 25,000 security deposit',
      insurance: 'Required for all events',
      noise: 'Industrial zone regulations',
      parking: 'Street parking available',
    },
  },
];

// Helper functions for working with hosts and rooms
export const getHostById = (hostId: number): Host | undefined => {
  return hosts.find((host) => host.id === hostId);
};

export const getRoomsByHostId = (hostId: number): Room[] => {
  return rooms.filter((room) => room.hostId === hostId) as Room[];
};

export const getHostForRoom = (roomId: number): Host | undefined => {
  const room = rooms.find((room) => room.id === roomId);
  if (!room) return undefined;
  return getHostById(room.hostId);
};
