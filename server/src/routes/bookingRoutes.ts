import express from 'express';
import * as bookingController from '../controllers/bookingController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// User bookings
router.post('/', bookingController.createBooking);
router.get('/my/bookings', bookingController.getUserBookings);
router.get('/:bookingId', bookingController.getBookingById);
router.post('/payment', bookingController.processCardPayment);
router.patch('/:bookingId/cancel', bookingController.cancelBooking);
router.get('/room/:roomId/can-review', bookingController.canReviewRoom);

// Host booking management
router.get('/host/bookings', bookingController.getHostBookings);
router.patch('/:bookingId/confirm', bookingController.confirmBooking);
router.patch('/:bookingId/complete', bookingController.completeBooking);

// Admin booking management
router.use('/admin', adminOnly);
router.get('/admin/all', bookingController.getAllBookings);
router.patch(
  '/admin/:bookingId/update-status',
  bookingController.updateBookingStatus
);
router.delete('/admin/:bookingId', bookingController.deleteBooking);

export default router;
