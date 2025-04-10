import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  room: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  host: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: {
    adults: number;
    children?: number;
    infants?: number;
  };
  totalPrice: number;
  priceBreakdown: {
    basePrice: number;
    cleaningFee?: number;
    serviceFee?: number;
    tax?: number;
    discount?: number;
  };
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentMethod: 'property' | 'card' | 'gcash' | 'maya';
  paymentId?: string;
  paymentDetails?: {
    paymentDate: Date;
    amount: number;
    recordedBy?: mongoose.Types.ObjectId;
  };
  refunds?: Array<{
    amount: number;
    date: Date;
    reason: string;
    refundId?: string;
    processedBy?: mongoose.Types.ObjectId;
  }>;
  bookingStatus:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'rejected';
  cancellationDetails?: {
    cancelledAt: Date;
    cancelledBy: 'user' | 'host' | 'admin';
    reason: string;
    refundAmount?: number;
  };
  isCancellable: boolean;
  cancellationDeadline: Date;
  specialRequests?: string;
  reviewId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      adults: {
        type: Number,
        required: [true, 'Number of adults is required'],
        min: [1, 'At least one adult is required'],
      },
      children: {
        type: Number,
        default: 0,
      },
      infants: {
        type: Number,
        default: 0,
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    priceBreakdown: {
      basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
      },
      cleaningFee: {
        type: Number,
        default: 0,
      },
      serviceFee: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['property', 'card', 'gcash', 'maya'],
      default: 'property',
    },
    paymentId: {
      type: String,
    },
    paymentDetails: {
      paymentDate: Date,
      amount: Number,
      recordedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    refunds: [
      {
        amount: Number,
        date: Date,
        reason: String,
        refundId: String,
        processedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    cancellationDetails: {
      cancelledAt: {
        type: Date,
      },
      cancelledBy: {
        type: String,
        enum: ['user', 'host', 'admin'],
      },
      reason: {
        type: String,
      },
      refundAmount: {
        type: Number,
      },
    },
    isCancellable: {
      type: Boolean,
      default: true,
    },
    cancellationDeadline: {
      type: Date,
    },
    specialRequests: {
      type: String,
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre('save', function (next) {
  if (this.isNew) {
    // Check if the booking is within 24 hours
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const timeDifference = this.checkIn.getTime() - Date.now();

    if (timeDifference <= oneDay) {
      this.isCancellable = false;
    } else {
      // Set cancellation deadline to 24 hours before check-in
      this.cancellationDeadline = new Date(this.checkIn.getTime() - oneDay);
    }
  }
  next();
});

// Add indexes for common queries
bookingSchema.index({ user: 1, bookingStatus: 1 });
bookingSchema.index({ host: 1, bookingStatus: 1 });
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ bookingStatus: 1, checkIn: 1 });

export default mongoose.model<IBooking>('Booking', bookingSchema);
