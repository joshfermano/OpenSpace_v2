import express from 'express';
import * as reviewController from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../config/multer';

const router = express.Router();

// Public routes
router.get('/room/:roomId', reviewController.getRoomReviews);

// Protected routes
router.use(protect);

// Check if user can review a room
router.get('/eligibility/:roomId', reviewController.checkReviewEligibility);

// Create, update, delete reviews
router.post('/', upload.array('photos', 3), reviewController.createReview);
router.put(
  '/:reviewId',
  upload.array('photos', 3),
  reviewController.updateReview
);
router.delete('/:reviewId', reviewController.deleteReview);

// Get user's own reviews
router.get('/user', reviewController.getUserReviews);

// Get reviews for host's properties
router.get('/host', reviewController.getHostReviews);

// Get a single review by ID
router.get('/:reviewId', reviewController.getReviewById);

export default router;
