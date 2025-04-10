import express from 'express';
import * as earningsController from '../controllers/earningsController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// All earnings routes require authentication
router.use(protect);

// Host earnings routes
router.get('/', earningsController.getHostEarnings);
router.get('/summary', earningsController.getEarningsSummary);
router.get('/date-range', earningsController.getEarningsByDateRange);
router.get('/statement/:year', earningsController.generateEarningsStatement);
router.get('/booking/:bookingId', earningsController.getBookingEarnings);
router.get('/withdrawals', earningsController.getWithdrawalHistory);

// Mark booking as completed (for pay-at-property bookings)
router.patch(
  '/complete-booking/:bookingId',
  earningsController.markBookingCompleted
);

// Process withdrawal
router.post('/withdraw', earningsController.processWithdrawal);

// Admin routes
router.use('/admin', adminOnly);
router.post('/admin/process-payout', earningsController.processHostPayout);
router.patch('/admin/update-status', earningsController.updateEarningsStatus);

export default router;
