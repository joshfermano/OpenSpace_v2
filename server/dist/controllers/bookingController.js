"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReceiptEmail = exports.canCancelBooking = exports.markPaymentReceived = exports.rejectBooking = exports.completeBooking = exports.confirmBooking = exports.canReviewRoom = exports.getHostBookings = exports.getUserBookings = exports.getBookingById = exports.cancelBooking = exports.processPayment = exports.createBooking = exports.deleteBooking = exports.updateBookingStatus = exports.getAllBookings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Room_1 = __importDefault(require("../models/Room"));
const User_1 = __importDefault(require("../models/User"));
const Earnings_1 = __importDefault(require("../models/Earnings"));
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.status) {
            filter.bookingStatus = req.query.status;
        }
        const bookings = yield Booking_1.default.find(filter)
            .populate('room', 'title images location type')
            .populate('user', 'firstName lastName email')
            .populate('host', 'firstName lastName email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield Booking_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: bookings.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: bookings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message,
        });
    }
});
exports.getAllBookings = getAllBookings;
const updateBookingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const booking = yield Booking_1.default.findById(bookingId);
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
        yield booking.save();
        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: booking,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message,
        });
    }
});
exports.updateBookingStatus = updateBookingStatus;
const deleteBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        // Check if booking exists
        const booking = yield Booking_1.default.findById(bookingId);
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
        yield Booking_1.default.findByIdAndDelete(bookingId);
        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting booking',
            error: error.message,
        });
    }
});
exports.deleteBooking = deleteBooking;
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { roomId, checkIn, checkOut, checkInTime, // Extract check-in time from request
        checkOutTime, // Extract check-out time from request
        guests, totalPrice, priceBreakdown, paymentMethod, specialRequests, } = req.body;
        console.log('Creating booking with data:', req.body);
        // Validate required fields
        if (!roomId || !checkIn || !checkOut || !guests || !totalPrice) {
            res.status(400).json({
                success: false,
                message: 'Missing required booking information',
                details: { roomId, checkIn, checkOut, guests, totalPrice },
            });
            return;
        }
        // Find the room
        const room = yield Room_1.default.findById(roomId);
        if (!room) {
            res.status(404).json({
                success: false,
                message: 'Room not found',
            });
            return;
        }
        // Convert dates to Date objects
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        // Determine proper check-in and check-out times based on room type
        // For 'stay' type, use the room's defined times
        // For 'conference' and 'event', use the user-selected times
        let finalCheckInTime = room.houseRules.checkInTime; // Default from room
        let finalCheckOutTime = room.houseRules.checkOutTime; // Default from room
        if (room.type !== 'stay') {
            // For conference and event types, use the times provided in the request
            if (checkInTime)
                finalCheckInTime = checkInTime;
            if (checkOutTime)
                finalCheckOutTime = checkOutTime;
        }
        // Create the booking with proper times
        const booking = yield Booking_1.default.create({
            room: roomId,
            user: userId,
            host: room.host,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            checkInTime: finalCheckInTime, // Save the determined check-in time
            checkOutTime: finalCheckOutTime, // Save the determined check-out time
            guests: {
                adults: Number(guests),
            },
            totalPrice,
            priceBreakdown: priceBreakdown || {
                basePrice: totalPrice,
            },
            paymentStatus: 'pending',
            paymentMethod: paymentMethod || 'property',
            bookingStatus: 'pending',
            specialRequests,
        });
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking,
        });
    }
    catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message,
        });
    }
});
exports.createBooking = createBooking;
const processPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Payment request received:', req.body);
        const { bookingId, paymentMethod, cardDetails, mobilePaymentDetails } = req.body;
        const userId = req.user.id;
        // Validate booking ID
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required',
            });
            return;
        }
        // Check if payment method is provided
        if (!paymentMethod) {
            res.status(400).json({
                success: false,
                message: 'Payment method is required',
            });
            return;
        }
        // Check if booking exists and belongs to the user
        const booking = yield Booking_1.default.findById(bookingId);
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
        // Payment details object to store in the database
        const paymentDetails = {
            paymentDate: new Date(),
            amount: booking.totalPrice,
        };
        switch (paymentMethod) {
            case 'card':
                if (!cardDetails) {
                    res.status(400).json({
                        success: false,
                        message: 'Card details are required for card payment',
                    });
                    return;
                }
                const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails;
                // Validate card details
                if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
                    res.status(400).json({
                        success: false,
                        message: 'All card details are required',
                    });
                    return;
                }
                // Validate card number
                const isValidCard = simpleCardValidation(cardNumber);
                if (!isValidCard) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid card number',
                    });
                    return;
                }
                // Validate expiry date
                const [month, year] = expiryDate.split('/');
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1;
                if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate) ||
                    parseInt(year) < currentYear ||
                    (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid or expired card',
                    });
                    return;
                }
                // Validate CVV
                if (!/^\d{3,4}$/.test(cvv)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid CVV',
                    });
                    return;
                }
                paymentDetails.cardLast4 = cardNumber.slice(-4);
                paymentDetails.cardholderName = cardholderName;
                break;
            case 'gcash':
            case 'maya':
                if (!mobilePaymentDetails || !mobilePaymentDetails.mobileNumber) {
                    res.status(400).json({
                        success: false,
                        message: 'Mobile number is required for mobile payment methods',
                    });
                    return;
                }
                // Validate mobile number for Philippine mobile services
                const mobileNumberPattern = /^09\d{9}$/;
                if (!mobileNumberPattern.test(mobilePaymentDetails.mobileNumber)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid mobile number format. Must be 09XXXXXXXXX',
                    });
                    return;
                }
                paymentDetails.phoneNumber = mobilePaymentDetails.mobileNumber;
                paymentDetails.provider = paymentMethod;
                break;
            case 'property':
                paymentDetails.paymentLocation = 'property';
                break;
            default:
                res.status(400).json({
                    success: false,
                    message: 'Unsupported payment method',
                });
                return;
        }
        // Update booking
        booking.paymentMethod = paymentMethod;
        booking.paymentStatus = paymentMethod === 'property' ? 'pending' : 'paid';
        booking.bookingStatus =
            paymentMethod === 'property' ? 'pending' : 'confirmed';
        booking.paymentDetails = paymentDetails;
        yield booking.save();
        if (booking.paymentStatus === 'paid') {
            yield createEarningRecord(booking);
        }
        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                bookingId: booking._id,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus,
                bookingStatus: booking.bookingStatus,
            },
        });
    }
    catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message,
        });
    }
});
exports.processPayment = processPayment;
// Simple card validation helper function
const simpleCardValidation = (cardNumber) => {
    // Remove spaces and dashes
    const cleanedNumber = cardNumber.replace(/[\s-]/g, '');
    // Check if it's numeric and 16 digits
    if (!/^\d{16}$/.test(cleanedNumber)) {
        return false;
    }
    // Luhn algorithm (mod 10)
    let sum = 0;
    let isEven = false;
    // Loop through values starting from the rightmost one
    for (let i = cleanedNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanedNumber.charAt(i));
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
};
const createEarningRecord = (booking) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hostEarningPercentage = 0.8; // Host gets 80%
        const platformFeePercentage = 0.2; // Platform fee is 20%
        const amount = booking.totalPrice;
        const platformFee = amount * platformFeePercentage;
        const hostPayout = amount * hostEarningPercentage;
        // Set the status and date based on payment method
        let status = 'pending';
        let availableDate = new Date();
        // Different logic based on payment method
        if (['card', 'gcash', 'maya'].includes(booking.paymentMethod)) {
            // For online payments (card, gcash, maya), earnings become immediately available
            status = 'available';
            availableDate = new Date(); // Available immediately
        }
        else if (booking.paymentMethod === 'property') {
            // For pay at property, it remains pending until host marks booking as completed
            status = 'pending';
            // Set to far future as placeholder (will be updated when completed)
            availableDate = new Date();
            availableDate.setFullYear(availableDate.getFullYear() + 1);
        }
        // Check if an earnings record already exists (avoid duplicates)
        const existingEarning = yield Earnings_1.default.findOne({ booking: booking._id });
        if (existingEarning) {
            console.log(`Earnings record already exists for booking ${booking._id}`);
            return existingEarning;
        }
        // Create the earnings record
        const earningRecord = yield Earnings_1.default.create({
            host: booking.host,
            booking: booking._id,
            amount,
            platformFee,
            hostPayout,
            status,
            paymentMethod: booking.paymentMethod,
            availableDate,
        });
        console.log(`Earnings record created for host ${booking.host} - Amount: ${hostPayout}, Status: ${status}`);
        return earningRecord;
    }
    catch (error) {
        console.error('Error creating earnings record:', error);
    }
});
// Cancel booking
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;
        // Check if booking exists
        const booking = yield Booking_1.default.findById(bookingId);
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
        let cancelledBy = 'user';
        if (isHost)
            cancelledBy = 'host';
        if (isAdmin)
            cancelledBy = 'admin';
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
            }
            else if (daysBeforeCheckIn >= 7) {
                // Full refund if cancelled 7+ days before check-in
                refundAmount = booking.totalPrice;
            }
            else if (daysBeforeCheckIn >= 3) {
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
                        ? new mongoose_1.default.Types.ObjectId(userId)
                        : undefined,
                },
            ];
        }
        yield booking.save();
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message,
        });
    }
});
exports.cancelBooking = cancelBooking;
// Get booking by ID
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        const booking = yield Booking_1.default.findById(bookingId)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message,
        });
    }
});
exports.getBookingById = getBookingById;
// Get user bookings
const getUserBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { status } = req.query;
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build filter
        const filter = { user: userId };
        if (status)
            filter.bookingStatus = status;
        // Get bookings
        const bookings = yield Booking_1.default.find(filter)
            .populate('room', 'title images location type')
            .populate('host', 'firstName lastName profileImage')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield Booking_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: bookings.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: bookings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user bookings',
            error: error.message,
        });
    }
});
exports.getUserBookings = getUserBookings;
// Get host bookings
const getHostBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { status } = req.query;
        // Check if user is a host
        const user = yield User_1.default.findById(userId);
        if (!user || user.role !== 'host') {
            res.status(403).json({
                success: false,
                message: 'Only hosts can access their bookings',
            });
            return;
        }
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build filter
        const filter = { host: userId };
        if (status)
            filter.bookingStatus = status;
        // Get bookings
        const bookings = yield Booking_1.default.find(filter)
            .populate('room', 'title images location type')
            .populate('user', 'firstName lastName profileImage')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield Booking_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: bookings.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: bookings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching host bookings',
            error: error.message,
        });
    }
});
exports.getHostBookings = getHostBookings;
// Check if user can review a room
const canReviewRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { roomId } = req.params;
        // Check if room exists
        const room = yield Room_1.default.findById(roomId);
        if (!room) {
            res.status(404).json({
                success: false,
                message: 'Room not found',
            });
            return;
        }
        // Find completed bookings for this room and user
        const bookings = yield Booking_1.default.find({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking review eligibility',
            error: error.message,
        });
    }
});
exports.canReviewRoom = canReviewRoom;
const confirmBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        // Find the booking
        const booking = yield Booking_1.default.findById(bookingId);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
            return;
        }
        // Check if user is the host of this booking
        if (booking.host.toString() !== userId && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to confirm this booking',
            });
            return;
        }
        // Check if booking can be confirmed
        if (booking.bookingStatus !== 'pending') {
            res.status(400).json({
                success: false,
                message: `Cannot confirm a booking with status: ${booking.bookingStatus}`,
            });
            return;
        }
        // Update booking status
        booking.bookingStatus = 'confirmed';
        yield booking.save();
        res.status(200).json({
            success: true,
            message: 'Booking confirmed successfully',
            data: booking,
        });
    }
    catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming booking',
            error: error.message,
        });
    }
});
exports.confirmBooking = confirmBooking;
const completeBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        // Find the booking
        const booking = yield Booking_1.default.findById(bookingId);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
            return;
        }
        // Check if user is the host of this booking
        if (booking.host.toString() !== userId && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to complete this booking',
            });
            return;
        }
        // Check if booking can be completed
        if (booking.bookingStatus !== 'confirmed') {
            res.status(400).json({
                success: false,
                message: `Cannot complete a booking with status: ${booking.bookingStatus}`,
            });
            return;
        }
        // Check if checkout date has passed
        const checkOutDate = new Date(booking.checkOut);
        const currentDate = new Date();
        // Allow completion on checkout day or after
        if (currentDate < checkOutDate) {
            // If we're not on checkout day yet, don't allow completion unless admin
            if (req.user.role !== 'admin') {
                res.status(400).json({
                    success: false,
                    message: 'Cannot complete booking before checkout date',
                });
                return;
            }
        }
        // Update booking status
        booking.bookingStatus = 'completed';
        yield booking.save();
        // Update earning record if exists
        yield Earnings_1.default.updateOne({ booking: bookingId }, { status: 'ready' });
        res.status(200).json({
            success: true,
            message: 'Booking marked as completed',
            data: booking,
        });
    }
    catch (error) {
        console.error('Error completing booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing booking',
            error: error.message,
        });
    }
});
exports.completeBooking = completeBooking;
const rejectBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;
        // Check if booking exists
        const booking = yield Booking_1.default.findById(bookingId);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
            return;
        }
        // Check if user is authorized (host or admin)
        const isHost = booking.host.toString() === userId;
        const isAdmin = req.user.role === 'admin';
        if (!isHost && !isAdmin) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to reject this booking',
            });
            return;
        }
        // Check if booking can be rejected (must be in pending status)
        if (booking.bookingStatus !== 'pending') {
            res.status(400).json({
                success: false,
                message: `Cannot reject a booking with status: ${booking.bookingStatus}`,
            });
            return;
        }
        // Update booking status
        booking.bookingStatus = 'rejected';
        booking.cancellationDetails = {
            cancelledAt: new Date(),
            cancelledBy: isAdmin ? 'admin' : 'host',
            reason: reason || 'Booking rejected by host',
        };
        yield booking.save();
        res.status(200).json({
            success: true,
            message: 'Booking rejected successfully',
            data: booking,
        });
    }
    catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting booking',
            error: error.message,
        });
    }
});
exports.rejectBooking = rejectBooking;
const markPaymentReceived = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        // Find the booking
        const booking = yield Booking_1.default.findById(bookingId);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
            return;
        }
        // Check if user is the host of this booking or an admin
        if (booking.host.toString() !== userId && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to mark payment as received for this booking',
            });
            return;
        }
        // Check if booking payment can be marked as received
        if (booking.paymentStatus !== 'pending' ||
            booking.paymentMethod !== 'property') {
            res.status(400).json({
                success: false,
                message: `Cannot mark payment as received for a booking with status: ${booking.paymentStatus} and method: ${booking.paymentMethod}`,
            });
            return;
        }
        // Update booking payment status
        booking.paymentStatus = 'paid';
        booking.bookingStatus = 'confirmed';
        booking.paymentDetails = Object.assign(Object.assign({}, booking.paymentDetails), { paymentDate: new Date(), amount: booking.totalPrice, recordedBy: new mongoose_1.default.Types.ObjectId(userId) });
        yield booking.save();
        // Create earning record for the host
        yield createEarningRecord(booking);
        res.status(200).json({
            success: true,
            message: 'Payment marked as received successfully',
            data: booking,
        });
    }
    catch (error) {
        console.error('Error marking payment as received:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking payment as received',
            error: error.message,
        });
    }
});
exports.markPaymentReceived = markPaymentReceived;
const canCancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        // Find the booking
        const booking = yield Booking_1.default.findById(bookingId);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
            return;
        }
        // Check if user is authorized to view this booking
        const isGuest = booking.user.toString() === userId;
        const isHost = booking.host.toString() === userId;
        const isAdmin = req.user.role === 'admin';
        if (!isGuest && !isHost && !isAdmin) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking',
            });
            return;
        }
        // Check cancellation conditions
        const canCancel = 
        // Not already cancelled or completed
        !['cancelled', 'completed', 'rejected'].includes(booking.bookingStatus) &&
            // Admin can always cancel
            (isAdmin ||
                // Host can cancel pending bookings
                (isHost && booking.bookingStatus === 'pending') ||
                // Guest can cancel based on booking policy
                (isGuest && booking.isCancellable));
        // Calculate potential refund amount
        let refundAmount = 0;
        if (booking.paymentStatus === 'paid' && canCancel) {
            const now = new Date();
            const checkIn = new Date(booking.checkIn);
            const timeDifference = checkIn.getTime() - now.getTime();
            const daysBeforeCheckIn = timeDifference / (1000 * 60 * 60 * 24);
            if (isHost || isAdmin) {
                // Full refund if cancelled by host or admin
                refundAmount = booking.totalPrice;
            }
            else if (daysBeforeCheckIn >= 7) {
                // Full refund if cancelled 7+ days before check-in
                refundAmount = booking.totalPrice;
            }
            else if (daysBeforeCheckIn >= 3) {
                // 50% refund if cancelled 3-7 days before check-in
                refundAmount = booking.totalPrice * 0.5;
            }
            // No refund if cancelled less than 3 days before check-in
        }
        res.status(200).json({
            success: true,
            data: {
                canCancel,
                refundAmount,
                refundPercentage: refundAmount > 0
                    ? Math.round((refundAmount / booking.totalPrice) * 100)
                    : 0,
                reason: !canCancel
                    ? ['cancelled', 'completed', 'rejected'].includes(booking.bookingStatus)
                        ? `Booking is already ${booking.bookingStatus}`
                        : 'This booking cannot be cancelled according to the cancellation policy'
                    : undefined,
            },
        });
    }
    catch (error) {
        console.error('Error checking cancellation eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking if booking can be cancelled',
            error: error.message,
        });
    }
});
exports.canCancelBooking = canCancelBooking;
const sendReceiptEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        const { recipientEmail, receiptDetails } = req.body;
        // Check if booking exists
        const booking = yield Booking_1.default.findById(bookingId)
            .populate('room', 'title images location')
            .populate('user', 'firstName lastName email');
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
            return;
        }
        // Verify the user is authorized to access this booking
        if (booking.user._id.toString() !== userId && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to send receipt for this booking',
            });
            return;
        }
        const user = booking.user; // Cast to any to access populated fields
        const email = recipientEmail || user.email;
        let receipt;
        if (receiptDetails) {
            receipt = receiptDetails;
        }
        else {
            // Format check-in and check-out dates
            const checkInDate = new Date(booking.checkIn);
            const checkOutDate = new Date(booking.checkOut);
            // Calculate number of nights
            const nightsCount = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            const user = booking.user; // Cast to 'any' to access firstName and lastName
            receipt = {
                referenceNumber: booking._id.toString().slice(-8).toUpperCase(),
                bookingDetails: {
                    bookingId: booking._id,
                    propertyName: booking.room.title,
                    checkInDate: checkInDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                    checkOutDate: checkOutDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                    checkInTime: '3:00 PM', // Default time or from room.checkInTime
                    checkOutTime: '12:00 PM', // Default time or from room.checkOutTime
                    guestCount: booking.guests,
                    guestName: `${user.firstName} ${user.lastName}`,
                    totalPrice: booking.totalPrice,
                    priceBreakdown: booking.priceBreakdown,
                    nightsCount,
                    specialRequests: booking.specialRequests,
                },
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus,
                date: new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                }),
                time: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
        }
        // Import at the top of the file
        const { sendBookingReceiptEmail } = yield Promise.resolve().then(() => __importStar(require('../services/emailService')));
        // Send the receipt email
        yield sendBookingReceiptEmail(email, receipt);
        res.status(200).json({
            success: true,
            message: `Receipt sent to ${email} successfully`,
        });
    }
    catch (error) {
        console.error('Error sending receipt email:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending receipt email',
            error: error.message,
        });
    }
});
exports.sendReceiptEmail = sendReceiptEmail;
