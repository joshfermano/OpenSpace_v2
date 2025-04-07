"use strict";
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
exports.deleteReview = exports.updateReview = exports.getReviewById = exports.getHostReviews = exports.getUserReviews = exports.getRoomReviews = exports.createReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Review_1 = __importDefault(require("../models/Review"));
const Room_1 = __importDefault(require("../models/Room"));
const Booking_1 = __importDefault(require("../models/Booking"));
// Create a new review
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { roomId, bookingId, rating, comment, photos, isAnonymous } = req.body;
        // Validate required fields
        if (!roomId || !bookingId || !rating || !comment) {
            res.status(400).json({
                success: false,
                message: 'Room ID, booking ID, rating, and comment are required',
            });
            return;
        }
        // Check if the rating is valid (1-5)
        if (rating < 1 || rating > 5) {
            res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
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
        if (booking.user.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to review this booking',
            });
            return;
        }
        // Check if booking is completed
        if (booking.bookingStatus !== 'completed') {
            res.status(400).json({
                success: false,
                message: 'Cannot review a booking that is not completed',
            });
            return;
        }
        // Check if booking is for the specified room
        if (booking.room.toString() !== roomId) {
            res.status(400).json({
                success: false,
                message: 'Booking is not for the specified room',
            });
            return;
        }
        // Check if a review already exists for this booking
        if (booking.reviewId) {
            res.status(400).json({
                success: false,
                message: 'A review already exists for this booking',
            });
            return;
        }
        // Create the review
        const review = yield Review_1.default.create({
            room: roomId,
            user: userId,
            booking: bookingId,
            rating,
            comment,
            photos: photos || [],
            isAnonymous: isAnonymous || false,
        });
        // Update the booking with the review ID
        booking.reviewId = review._id;
        yield booking.save();
        // Update room rating
        yield updateRoomRating(roomId);
        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating review',
            error: error.message,
        });
    }
});
exports.createReview = createReview;
// Helper function to update room rating
const updateRoomRating = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all reviews for the room
        const reviews = yield Review_1.default.find({ room: roomId });
        if (reviews.length === 0) {
            // No reviews, set rating to 0
            yield Room_1.default.findByIdAndUpdate(roomId, {
                'ratings.average': 0,
                'ratings.count': 0,
            });
            return;
        }
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        // Update room with new rating
        yield Room_1.default.findByIdAndUpdate(roomId, {
            'ratings.average': parseFloat(averageRating.toFixed(1)),
            'ratings.count': reviews.length,
        });
    }
    catch (error) {
        console.error('Error updating room rating:', error);
    }
});
// Get reviews for a room
const getRoomReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get reviews
        const reviews = yield Review_1.default.find({ room: roomId })
            .populate({
            path: 'user',
            select: 'firstName lastName profileImage',
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        // Process reviews to handle anonymous ones
        const processedReviews = reviews.map((review) => {
            if (review.isAnonymous) {
                const anonymousReview = review.toObject();
                anonymousReview.user = {
                    firstName: 'Anonymous',
                    lastName: 'User',
                    profileImage: null,
                };
                return anonymousReview;
            }
            return review;
        });
        const total = yield Review_1.default.countDocuments({ room: roomId });
        res.status(200).json({
            success: true,
            count: processedReviews.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: processedReviews,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message,
        });
    }
});
exports.getRoomReviews = getRoomReviews;
// Get user's reviews
const getUserReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get reviews
        const reviews = yield Review_1.default.find({ user: userId })
            .populate({
            path: 'room',
            select: 'title images location',
        })
            .populate({
            path: 'booking',
            select: 'checkIn checkOut',
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield Review_1.default.countDocuments({ user: userId });
        res.status(200).json({
            success: true,
            count: reviews.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: reviews,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user reviews',
            error: error.message,
        });
    }
});
exports.getUserReviews = getUserReviews;
// Get host's received reviews
const getHostReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get rooms owned by the host
        const rooms = yield Room_1.default.find({ host: userId }).select('_id');
        const roomIds = rooms.map((room) => room._id);
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get reviews for host's rooms
        const reviews = yield Review_1.default.find({ room: { $in: roomIds } })
            .populate({
            path: 'user',
            select: 'firstName lastName profileImage',
        })
            .populate({
            path: 'room',
            select: 'title images location',
        })
            .populate({
            path: 'booking',
            select: 'checkIn checkOut',
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        // Process reviews to handle anonymous ones
        const processedReviews = reviews.map((review) => {
            if (review.isAnonymous) {
                const anonymousReview = review.toObject();
                anonymousReview.user = {
                    firstName: 'Anonymous',
                    lastName: 'User',
                    profileImage: null,
                };
                return anonymousReview;
            }
            return review;
        });
        const total = yield Review_1.default.countDocuments({ room: { $in: roomIds } });
        res.status(200).json({
            success: true,
            count: processedReviews.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: processedReviews,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching host reviews',
            error: error.message,
        });
    }
});
exports.getHostReviews = getHostReviews;
// Get a single review by ID
const getReviewById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewId } = req.params;
        // Check if ID is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(reviewId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid review ID',
            });
            return;
        }
        // Find review
        const review = yield Review_1.default.findById(reviewId)
            .populate({
            path: 'user',
            select: 'firstName lastName profileImage',
        })
            .populate({
            path: 'room',
            select: 'title images location host',
        })
            .populate({
            path: 'booking',
            select: 'checkIn checkOut',
        });
        if (!review) {
            res.status(404).json({
                success: false,
                message: 'Review not found',
            });
            return;
        }
        // Check if the user is authorized to view this review
        const user = review.user;
        const room = review.room;
        const isReviewer = user._id.toString() === req.user.id;
        const isRoomHost = room.host.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        // If anonymous and not authorized, hide user details
        let responseReview;
        if (review.isAnonymous && !isReviewer && !isRoomHost && !isAdmin) {
            const anonymousReview = review.toObject();
            anonymousReview.user = {
                firstName: 'Anonymous',
                lastName: 'User',
                profileImage: null,
            };
            responseReview = anonymousReview;
        }
        else {
            responseReview = review;
        }
        res.status(200).json({
            success: true,
            data: responseReview,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching review',
            error: error.message,
        });
    }
});
exports.getReviewById = getReviewById;
// Update a review
const updateReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        const { rating, comment, photos, isAnonymous } = req.body;
        // Find review
        const review = yield Review_1.default.findById(reviewId);
        if (!review) {
            res.status(404).json({
                success: false,
                message: 'Review not found',
            });
            return;
        }
        // Check if user is the reviewer
        if (review.user.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this review',
            });
            return;
        }
        // Check if the rating is valid (1-5)
        if (rating && (rating < 1 || rating > 5)) {
            res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
            return;
        }
        // Update review fields
        if (rating !== undefined)
            review.rating = rating;
        if (comment !== undefined)
            review.comment = comment;
        if (photos !== undefined)
            review.photos = photos;
        if (isAnonymous !== undefined)
            review.isAnonymous = isAnonymous;
        // Save updated review
        yield review.save();
        // Update room rating if the rating changed
        if (rating !== undefined) {
            yield updateRoomRating(review.room.toString());
        }
        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating review',
            error: error.message,
        });
    }
});
exports.updateReview = updateReview;
// Delete a review
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        // Find review
        const review = yield Review_1.default.findById(reviewId);
        if (!review) {
            res.status(404).json({
                success: false,
                message: 'Review not found',
            });
            return;
        }
        // Check if user is the reviewer or admin
        if (review.user.toString() !== userId && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review',
            });
            return;
        }
        // Get room ID before deleting for rating update
        const roomId = review.room.toString();
        // Find and update the booking to remove review reference
        yield Booking_1.default.findByIdAndUpdate(review.booking, {
            $unset: { reviewId: 1 },
        });
        // Delete the review
        yield Review_1.default.findByIdAndDelete(reviewId);
        // Update room rating
        yield updateRoomRating(roomId);
        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: error.message,
        });
    }
});
exports.deleteReview = deleteReview;
