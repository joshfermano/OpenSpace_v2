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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../controllers/userController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, './src/uploads/');
    },
    filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
// Profile management
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
// Profile image upload
router.post('/profile/upload-image', upload.single('profileImage'), userController.uploadProfileImage);
// Dashboard
router.get('/dashboard', userController.getDashboardData);
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:id/read', userController.markNotificationAsRead);
// Favorites/wishlist management
router.get('/saved-rooms', userController.getSavedRooms);
router.post('/save-room', userController.saveRoom);
router.delete('/saved-rooms/:roomId', userController.unsaveRoom);
// Admin-only routes
router.use('/admin', authMiddleware_1.adminOnly);
router.get('/admin/users', userController.getAllUsers);
router.get('/admin/users/:userId', userController.getUserById);
router.put('/admin/users/:userId', userController.updateUserById);
exports.default = router;
