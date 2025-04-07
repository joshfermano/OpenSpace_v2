import { Room } from './roomApproval';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  status: 'active' | 'verified' | 'banned';
  verificationStatus: 'approved' | 'pending' | 'rejected' | 'not_submitted';
  joinDate: string;
  rooms: number;
  idType: string | null;
  imageUrl: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  idType: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl: string;
  imageUrl: string;
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'host',
    status: 'verified',
    verificationStatus: 'approved',
    joinDate: '2024-01-15',
    rooms: 3,
    idType: "Driver's License",
    imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  // Add more mock users as needed
];

export const MOCK_VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: '101',
    userId: '2',
    userName: 'Alice Smith',
    userEmail: 'alice@example.com',
    idType: 'National ID',
    submissionDate: '2024-03-15',
    status: 'pending',
    documentUrl: 'https://example.com/documents/101',
    imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  // Add more mock verification requests as needed
];

export const MOCK_ROOMS: Room[] = [
  {
    id: '201',
    name: 'Modern Conference Room',
    location: 'Manila, Philippines',
    category: 'Conference Room',
    price: '5000',
    description:
      'A spacious modern conference room with state-of-the-art facilities',
    capacity: '20',
    amenities: ['Wi-Fi', 'Projector', 'Whiteboard', 'Coffee Machine'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c',
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7',
    ],
    status: 'pending',
    hostId: '1',
    hostName: 'John Doe',
    hostImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: '2024-03-20',
  },
  // Add more mock rooms as needed
];
