import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  room: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  photos?: string[];
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    photos: {
      type: [String],
      default: [],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

// Compound index for faster lookups
reviewSchema.index({ room: 1, user: 1 });

export default mongoose.model<IReview>('Review', reviewSchema);
