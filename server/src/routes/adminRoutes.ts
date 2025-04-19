import express from 'express';
import * as adminController from '../controllers/adminController';
import { protect, adminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// Public endpoint - no middleware needed
router.get('/check-admin-exists', adminController.checkAdminExists);
router.post('/initial-admin-setup', adminController.initialAdminSetup);

// All other admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/banned', adminController.getBannedUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId', adminController.updateUserById);
router.post('/users/create-admin', adminController.createAdmin);
router.delete('/users/:userId', adminController.deleteUser);

// User banning/unbanning
router.patch('/users/:userId/ban', adminController.banUser);
router.patch('/users/:userId/unban', adminController.unbanUser);

// ID verification management
router.get('/id-verifications', adminController.getPendingIdVerifications);
router.patch('/id-verification/:userId', adminController.verifyUserIdDocument);

// Room approvals
router.get('/rooms/pending', adminController.getPendingRoomApprovals);
router.patch('/rooms/:roomId/approve', adminController.approveRejectRoom);

// Booking management
router.get('/bookings', adminController.getAllBookings);
router.patch(
  '/bookings/:bookingId/status',
  adminController.updateBookingStatus
);
router.delete('/bookings/:bookingId', adminController.deleteBooking);

// Dashboard
router.get('/dashboard-summary', adminController.getDashboardSummary);

export default router;
