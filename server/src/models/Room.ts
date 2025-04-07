import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  title: string;
  description: string;
  type: 'stay' | 'conference' | 'event';
  host: mongoose.Types.ObjectId;
  price: {
    basePrice: number;
    cleaningFee?: number;
    serviceFee?: number;
    tax?: number;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  amenities: string[];
  images: string[];
  capacity: {
    maxGuests: number;
    bedrooms?: number;
    beds?: number;
    bathrooms?: number;
  };
  availability: {
    startDate: Date;
    endDate: Date;
    isAlwaysAvailable: boolean;
    unavailableDates: Date[];
  };
  houseRules: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    instantBooking: boolean;
    additionalRules?: string[];
  };
  ratings: {
    average: number;
    count: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  rejectionReason?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['stay', 'conference', 'event'],
      required: [true, 'Room type is required'],
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },
    price: {
      basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Price cannot be negative'],
      },
      cleaningFee: {
        type: Number,
        default: 0,
        min: [0, 'Cleaning fee cannot be negative'],
      },
      serviceFee: {
        type: Number,
        default: 0,
        min: [0, 'Service fee cannot be negative'],
      },
      tax: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative'],
      },
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    amenities: [{ type: String }],
    images: [
      { type: String, required: [true, 'At least one image is required'] },
    ],
    capacity: {
      maxGuests: {
        type: Number,
        required: [true, 'Maximum number of guests is required'],
        min: [1, 'Must accommodate at least 1 guest'],
      },
      bedrooms: { type: Number },
      beds: { type: Number },
      bathrooms: { type: Number },
    },
    availability: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'End date is required'],
      },
      isAlwaysAvailable: {
        type: Boolean,
        default: false,
      },
      unavailableDates: [{ type: Date }],
    },
    houseRules: {
      checkInTime: {
        type: String,
        required: [true, 'Check-in time is required'],
      },
      checkOutTime: {
        type: String,
        required: [true, 'Check-out time is required'],
      },
      cancellationPolicy: {
        type: String,
        required: [true, 'Cancellation policy is required'],
        default: 'No cancellation within 1 day of booking date',
      },
      instantBooking: {
        type: Boolean,
        default: false,
      },
      additionalRules: [{ type: String }],
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'inactive'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search optimization
roomSchema.index({
  'location.city': 1,
  'location.state': 1,
  'location.country': 1,
});
roomSchema.index({ type: 1 });
roomSchema.index({ 'price.basePrice': 1 });
roomSchema.index({ 'capacity.maxGuests': 1 });
roomSchema.index({ 'ratings.average': -1 });

export default mongoose.model<IRoom>('Room', roomSchema);
