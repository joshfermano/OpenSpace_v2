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
const reviewController = __importStar(require("../controllers/reviewController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = require("../config/multer");
const router = express_1.default.Router();
// Public routes
router.get('/room/:roomId', reviewController.getRoomReviews);
// Protected routes
router.use(authMiddleware_1.protect);
// Check if user can review a room
router.get('/eligibility/:roomId', reviewController.checkReviewEligibility);
// Create review (needs roomId)
router.post('/room/:roomId', multer_1.reviewUpload.array('photos', 3), reviewController.createReview);
// User's reviews
router.get('/user', reviewController.getUserReviews);
// Host reviews
router.get('/host', reviewController.getHostReviews);
// Single review operations
router.get('/:reviewId', reviewController.getReviewById);
router.put('/:reviewId', multer_1.reviewUpload.array('photos', 3), reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);
exports.default = router;
