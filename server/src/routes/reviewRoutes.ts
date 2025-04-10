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

// Create review (needs roomId)
router.post(
  '/room/:roomId',
  upload.array('photos', 3),
  reviewController.createReview
);

// User's reviews
router.get('/user', reviewController.getUserReviews);

// Host reviews
router.get('/host', reviewController.getHostReviews);

// Single review operations
router.get('/:reviewId', reviewController.getReviewById);
router.put(
  '/:reviewId',
  upload.array('photos', 3),
  reviewController.updateReview
);
router.delete('/:reviewId', reviewController.deleteReview);

export default router;
