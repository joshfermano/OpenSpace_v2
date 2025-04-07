export interface Room {
  id: string;
  name: string;
  location: string;
  category: string;
  price: string;
  description: string;
  capacity: string;
  amenities: string[];
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  hostId: string;
  hostName: string;
  hostImage: string;
  createdAt: string;
}
