import express from 'express';
import * as userController from '../controllers/userController';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, './src/uploads/');
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.use(protect);

// Profile management
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);

// Profile image upload
router.post(
  '/profile/upload-image',
  upload.single('profileImage'),
  userController.uploadProfileImage
);

// Dashboard
router.get('/dashboard', userController.getDashboardData);
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:id/read', userController.markNotificationAsRead);

// Favorites/wishlist management
router.get('/saved-rooms', userController.getSavedRooms);
router.post('/save-room', userController.saveRoom);
router.delete('/saved-rooms/:roomId', userController.unsaveRoom);

// Admin-only routes
router.use('/admin', adminOnly);
router.get('/admin/users', userController.getAllUsers);
router.get('/admin/users/:userId', userController.getUserById);
router.put('/admin/users/:userId', userController.updateUserById);

export default router;
