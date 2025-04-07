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

// Admin routes
router.use('/admin', adminOnly);
router.post('/admin/process-payout', earningsController.processHostPayout);
router.patch('/admin/update-status', earningsController.updateEarningsStatus);

export default router;
