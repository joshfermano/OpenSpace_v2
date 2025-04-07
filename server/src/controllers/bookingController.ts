import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Room from '../models/Room';
import User from '../models/User';
import Earning from '../models/Earnings';

export const getAllBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter based on query parameters
    const filter: Record<string, any> = {};
    if (req.query.status) {
      filter.bookingStatus = req.query.status;
    }

    // Get bookings with populated references
    const bookings = await Booking.find(filter)
      .populate('room', 'title images location type')
      .populate('user', 'firstName lastName email')
      .populate('host', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: bookings.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

export const updateBookingStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;

    // Validate status
    const validStatuses = [
      'pending',
      'confirmed',
      'completed',
      'cancelled',
      'rejected',
    ];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid booking status',
      });
      return;
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Update status
    booking.bookingStatus = status;

    // Handle cancellation details if status is cancelled or rejected
    if (['cancelled', 'rejected'].includes(status)) {
      booking.cancellationDetails = {
        cancelledAt: new Date(),
        cancelledBy: 'admin',
        reason: reason || 'Administrative action',
      };
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message,
    });
  }
};

// Delete booking (admin only)
export const deleteBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Check if booking can be safely deleted
    if (booking.bookingStatus === 'confirmed') {
      res.status(400).json({
        success: false,
        message: 'Cannot delete a confirmed booking',
      });
      return;
    }

    // Delete booking
    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message,
    });
  }
};

// Create a new booking
export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      priceBreakdown,
      paymentMethod,
      paymentDetails,
      specialRequests,
    } = req.body;

    // Validate required fields
    if (!roomId || !checkIn || !checkOut || !guests || !totalPrice) {
      res.status(400).json({
        success: false,
        message: 'Missing required booking information',
      });
      return;
    }

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    // Check if room is published and approved
    if (!room.isPublished || room.status !== 'approved') {
      res.status(400).json({
        success: false,
        message: 'Room is not available for booking',
      });
      return;
    }

    // Convert dates to Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check if dates are valid
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
      return;
    }

    // Check if dates are within room's availability
    if (
      checkInDate < room.availability.startDate ||
      checkOutDate > room.availability.endDate
    ) {
      res.status(400).json({
        success: false,
        message: 'Selected dates are outside of room availability',
      });
      return;
    }

    // Check if there are any unavailable dates in the selected range
    const unavailableDatesInRange = room.availability.unavailableDates.filter(
      (date) => date >= checkInDate && date <= checkOutDate
    );

    if (unavailableDatesInRange.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Selected dates include unavailable dates',
        unavailableDates: unavailableDatesInRange,
      });
      return;
    }

    // Check if there are any existing bookings for the dates
    const existingBookings = await Booking.find({
      room: roomId,
      bookingStatus: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          // Check if booking overlaps with requested dates
          $and: [
            { checkIn: { $lte: checkOutDate } },
            { checkOut: { $gte: checkInDate } },
          ],
        },
      ],
    });

    if (existingBookings.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Room is already booked for the selected dates',
        conflictingBookings: existingBookings.map((booking) => ({
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        })),
      });
      return;
    }

    // Check if user is trying to book their own room
    if (room.host.toString() === userId) {
      res.status(400).json({
        success: false,
        message: 'You cannot book your own room',
      });
      return;
    }

    // Create booking
    const booking = await Booking.create({
      room: roomId,
      user: userId,
      host: room.host,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      priceBreakdown: priceBreakdown || {
        basePrice: totalPrice,
      },
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'property',
      paymentDetails,
      bookingStatus: 'pending',
      specialRequests,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message,
    });
  }
};

// Process card payment
export const processCardPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId, cardDetails } = req.body;
    const userId = req.user.id;

    // Validate booking ID
    if (!bookingId) {
      res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
      return;
    }

    // Check if booking exists and belongs to the user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Verify booking belongs to the user
    if (booking.user.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this booking',
      });
      return;
    }

    // Check if booking is pending payment
    if (booking.paymentStatus !== 'pending') {
      res.status(400).json({
        success: false,
        message: `Payment already ${booking.paymentStatus}`,
      });
      return;
    }

    // Check if cardDetails are provided
    if (!cardDetails) {
      res.status(400).json({
        success: false,
        message: 'Card details are required',
      });
      return;
    }

    // Validate card details
    const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails;
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      res.status(400).json({
        success: false,
        message: 'All card details are required',
      });
      return;
    }

    // Simple card validation (for testing)
    const isValidCard = simpleCardValidation(cardNumber);

    if (!isValidCard) {
      res.status(400).json({
        success: false,
        message: 'Invalid card details',
      });
      return;
    }

    // Update booking with payment details
    booking.paymentStatus = 'paid';
    booking.paymentMethod = 'creditCard';
    booking.bookingStatus = 'confirmed';
    booking.paymentDetails = {
      paymentDate: new Date(),
      amount: booking.totalPrice,
    };

    // Save booking
    await booking.save();

    // Create earning record for the host
    await createEarningRecord(booking);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message,
    });
  }
};

// Simple card validation function (for testing purposes)
const simpleCardValidation = (cardNumber: string): boolean => {
  // Remove spaces and dashes
  const cleanedNumber = cardNumber.replace(/[\\s-]/g, '');

  // Check if it's numeric and 16 digits
  if (!/^\\d{16}$/.test(cleanedNumber)) {
    return false;
  }

  // Simple validation: Accept cards starting with 4 (Visa) or 5 (MasterCard)
  return cleanedNumber.startsWith('4') || cleanedNumber.startsWith('5');
};

// Create earning record
const createEarningRecord = async (booking: any): Promise<void> => {
  // Calculate platform fee (e.g., 10% of total)
  const platformFeePercentage = 0.1;
  const platformFee = booking.totalPrice * platformFeePercentage;
  const hostPayout = booking.totalPrice - platformFee;

  // Set availability date (e.g., after checkout + 1 day for potential disputes)
  const availableDate = new Date(booking.checkOut);
  availableDate.setDate(availableDate.getDate() + 1);

  // Create earning record
  await Earning.create({
    host: booking.host,
    booking: booking._id,
    amount: booking.totalPrice,
    platformFee,
    hostPayout,
    status: 'pending',
    paymentMethod: booking.paymentMethod,
    availableDate,
  });
};

// Confirm booking (for pay at property)
export const confirmBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Check if user is authorized (host of the room)
    const room = await Room.findById(booking.room);
    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    if (room.host.toString() !== userId && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this booking',
      });
      return;
    }

    // Update booking status
    booking.bookingStatus = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error confirming booking',
      error: error.message,
    });
  }
};

// Mark booking as completed
export const completeBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Check if user is authorized (host of the room or admin)
    if (booking.host.toString() !== userId && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to complete this booking',
      });
      return;
    }

    // Check if booking is in confirmed status
    if (booking.bookingStatus !== 'confirmed') {
      res.status(400).json({
        success: false,
        message: `Booking cannot be completed when it's in ${booking.bookingStatus} status`,
      });
      return;
    }

    // Update booking status
    booking.bookingStatus = 'completed';

    // If payment method is 'property', mark as paid when completing
    if (
      booking.paymentMethod === 'property' &&
      booking.paymentStatus === 'pending'
    ) {
      booking.paymentStatus = 'paid';
      booking.paymentDetails = {
        paymentDate: new Date(),
        amount: booking.totalPrice,
        recordedBy: new mongoose.Types.ObjectId(userId),
      };

      // Create earning record for host
      await createEarningRecord(booking);
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error completing booking',
      error: error.message,
    });
  }
};

// Cancel booking
export const cancelBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Check if user is authorized (user who booked, host, or admin)
    const isGuest = booking.user.toString() === userId;
    const isHost = booking.host.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
      return;
    }

    // Check if booking can be cancelled
    if (!booking.isCancellable && !isAdmin) {
      res.status(400).json({
        success: false,
        message: 'This booking cannot be cancelled',
      });
      return;
    }

    // Check if booking is already cancelled or completed
    if (['cancelled', 'completed'].includes(booking.bookingStatus)) {
      res.status(400).json({
        success: false,
        message: `Booking is already ${booking.bookingStatus}`,
      });
      return;
    }

    // Determine the canceller role
    let cancelledBy: 'user' | 'host' | 'admin' = 'user';
    if (isHost) cancelledBy = 'host';
    if (isAdmin) cancelledBy = 'admin';

    // Calculate refund amount based on cancellation policy
    let refundAmount = 0;
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const timeDifference = checkIn.getTime() - now.getTime();
    const daysBeforeCheckIn = timeDifference / (1000 * 60 * 60 * 24);

    // Example cancellation policy
    if (booking.paymentStatus === 'paid') {
      if (cancelledBy === 'host' || cancelledBy === 'admin') {
        // Full refund if cancelled by host or admin
        refundAmount = booking.totalPrice;
      } else if (daysBeforeCheckIn >= 7) {
        // Full refund if cancelled 7+ days before check-in
        refundAmount = booking.totalPrice;
      } else if (daysBeforeCheckIn >= 3) {
        // 50% refund if cancelled 3-7 days before check-in
        refundAmount = booking.totalPrice * 0.5;
      }
      // No refund if cancelled less than 3 days before check-in
    }

    // Update booking
    booking.bookingStatus = 'cancelled';
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      cancelledBy,
      reason: reason || 'No reason provided',
      refundAmount,
    };

    // If there was a payment and refund is due, update payment status
    if (booking.paymentStatus === 'paid' && refundAmount > 0) {
      booking.paymentStatus = 'refunded';
      booking.refunds = [
        {
          amount: refundAmount,
          date: new Date(),
          reason: 'Booking cancellation',
          processedBy: isAdmin
            ? new mongoose.Types.ObjectId(userId)
            : undefined,
        },
      ];
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking._id,
        bookingStatus: booking.bookingStatus,
        cancellationDetails: booking.cancellationDetails,
        refundAmount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message,
    });
  }
};

// Get booking by ID
export const getBookingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Check if booking exists
    const booking = await Booking.findById(bookingId)
      .populate('room', 'title images location type price houseRules')
      .populate('user', 'firstName lastName email phoneNumber profileImage')
      .populate('host', 'firstName lastName email phoneNumber profileImage');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Check if user is authorized (user who booked, host, or admin)
    const isGuest = booking.user._id.toString() === userId;
    const isHost = booking.host._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isGuest && !isHost && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message,
    });
  }
};

// Get user bookings
export const getUserBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = { user: userId };
    if (status) filter.bookingStatus = status;

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('room', 'title images location type')
      .populate('host', 'firstName lastName profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: bookings.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user bookings',
      error: error.message,
    });
  }
};

// Get host bookings
export const getHostBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Check if user is a host
    const user = await User.findById(userId);
    if (!user || user.role !== 'host') {
      res.status(403).json({
        success: false,
        message: 'Only hosts can access their bookings',
      });
      return;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = { host: userId };
    if (status) filter.bookingStatus = status;

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('room', 'title images location type')
      .populate('user', 'firstName lastName profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: bookings.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching host bookings',
      error: error.message,
    });
  }
};

// Check if user can review a room
export const canReviewRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    // Find completed bookings for this room and user
    const bookings = await Booking.find({
      room: roomId,
      user: userId,
      bookingStatus: 'completed',
    });

    // User can review if they have at least one completed booking
    const canReview = bookings.length > 0;

    // Check if user has already reviewed this room
    const alreadyReviewed = bookings.some((booking) => booking.reviewId);

    res.status(200).json({
      success: true,
      data: {
        canReview,
        alreadyReviewed,
        completedBookings: bookings.map((booking) => booking._id),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error checking review eligibility',
      error: error.message,
    });
  }
};
