import express from 'express';
import * as adminEarningsController from '../controllers/adminEarningsController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard summary
router.get('/dashboard-summary', adminEarningsController.getDashboardSummary);

// Revenue analysis
router.get(
  '/revenue-summary',
  adminEarningsController.getPlatformRevenueSummary
);
router.get('/top-hosts', adminEarningsController.getTopPerformingHosts);
router.get('/transactions', adminEarningsController.getTransactionHistory);

// Host payouts management
router.get(
  '/host-payout/:hostId',
  adminEarningsController.getHostPayoutDetails
);
router.post('/process-payout', adminEarningsController.processHostPayout);

export default router;
