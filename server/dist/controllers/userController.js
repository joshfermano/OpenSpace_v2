"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.uploadProfileImage = exports.markNotificationAsRead = exports.getNotifications = exports.updateUserById = exports.getDashboardData = exports.getSavedRooms = exports.unsaveRoom = exports.saveRoom = exports.changePassword = exports.updateProfile = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const Room_1 = __importDefault(require("../models/Room"));
const Booking_1 = __importDefault(require("../models/Booking"));
// Helper function to safely access req.user
function getUserFromRequest(req, res) {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Not authenticated',
        });
        return null;
    }
    return req.user;
}
// Get all users (admin only)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getUserFromRequest(req, res);
        if (!currentUser)
            return;
        // Only admin can access all users
        if (currentUser.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource',
            });
            return;
        }
        // Handle pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Handle filtering
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.verificationLevel) {
            filter.verificationLevel = req.query.verificationLevel;
        }
        if (req.query.isEmailVerified) {
            filter.isEmailVerified = req.query.isEmailVerified === 'true';
        }
        // Get users
        const users = yield User_1.default.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalUsers = yield User_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: users.length,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            data: users,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message,
        });
    }
});
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if ID is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
            return;
        }
        // Find user
        const user = yield User_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Only admins or the user themselves can see full details
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            // For other users, return limited public information
            const publicUser = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage,
                role: user.role,
                hostInfo: user.hostInfo,
            };
            res.status(200).json({
                success: true,
                data: publicUser,
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message,
        });
    }
});
exports.getUserById = getUserById;
// Update user profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = req.user.id;
        const { firstName, lastName, profileImage, address, hostInfo } = req.body;
        // Check if user exists
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Update user fields
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (profileImage)
            user.profileImage = profileImage;
        // Update address if provided
        if (address) {
            user.address = Object.assign(Object.assign({}, user.address), address);
        }
        // Update host info if user is a host
        if (hostInfo && user.role === 'host') {
            const currentDate = new Date();
            user.hostInfo = Object.assign(Object.assign({}, user.hostInfo), { bio: hostInfo.bio || ((_a = user.hostInfo) === null || _a === void 0 ? void 0 : _a.bio) || '', languagesSpoken: hostInfo.languagesSpoken || ((_b = user.hostInfo) === null || _b === void 0 ? void 0 : _b.languagesSpoken) || [], hostSince: ((_c = user.hostInfo) === null || _c === void 0 ? void 0 : _c.hostSince) || currentDate });
        }
        // Save updated user
        yield user.save();
        // Remove password from response
        const userResponse = user.toObject();
        userResponse.password = undefined;
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: userResponse,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message,
        });
    }
});
exports.updateProfile = updateProfile;
// Change password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
            return;
        }
        // Find user
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Check if current password is correct
        const isMatch = yield user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
            return;
        }
        // Update password
        user.password = newPassword;
        yield user.save();
        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message,
        });
    }
});
exports.changePassword = changePassword;
// Save a room to favorites
const saveRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { roomId } = req.body;
        if (!roomId) {
            res.status(400).json({
                success: false,
                message: 'Room ID is required',
            });
            return;
        }
        // Check if room exists
        const room = yield Room_1.default.findById(roomId);
        if (!room) {
            res.status(404).json({
                success: false,
                message: 'Room not found',
            });
            return;
        }
        // Add room to saved rooms if not already saved
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (!user.savedRooms.includes(roomId)) {
            user.savedRooms.push(roomId);
            yield user.save();
        }
        res.status(200).json({
            success: true,
            message: 'Room saved to favorites',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving room to favorites',
            error: error.message,
        });
    }
});
exports.saveRoom = saveRoom;
// Remove a room from favorites
const unsaveRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { roomId } = req.params;
        if (!roomId) {
            res.status(400).json({
                success: false,
                message: 'Room ID is required',
            });
            return;
        }
        // Remove room from saved rooms
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        user.savedRooms = user.savedRooms.filter((id) => id.toString() !== roomId);
        yield user.save();
        res.status(200).json({
            success: true,
            message: 'Room removed from favorites',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing room from favorites',
            error: error.message,
        });
    }
});
exports.unsaveRoom = unsaveRoom;
// Get saved rooms
const getSavedRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Get saved rooms with details
        const savedRooms = yield Room_1.default.find({
            _id: { $in: user.savedRooms },
            isPublished: true,
            status: 'approved',
        });
        res.status(200).json({
            success: true,
            count: savedRooms.length,
            data: savedRooms,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching saved rooms',
            error: error.message,
        });
    }
});
exports.getSavedRooms = getSavedRooms;
// Get user dashboard data
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Different dashboard data based on user role
        let dashboardData = {
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImage: user.profileImage,
                role: user.role,
                verificationLevel: user.verificationLevel,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
            },
        };
        if (user.role === 'host') {
            // Get host rooms
            const rooms = yield Room_1.default.find({ host: userId });
            // Get recent bookings
            const recentBookings = yield Booking_1.default.find({ host: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('room', 'title images')
                .populate('user', 'firstName lastName profileImage');
            // Calculate stats
            const pendingBookings = yield Booking_1.default.countDocuments({
                host: userId,
                bookingStatus: 'pending',
            });
            const confirmedBookings = yield Booking_1.default.countDocuments({
                host: userId,
                bookingStatus: 'confirmed',
            });
            dashboardData = Object.assign(Object.assign({}, dashboardData), { hostData: {
                    rooms: {
                        total: rooms.length,
                        published: rooms.filter((room) => room.isPublished).length,
                        pending: rooms.filter((room) => room.status === 'pending').length,
                    },
                    bookings: {
                        recent: recentBookings,
                        pending: pendingBookings,
                        confirmed: confirmedBookings,
                    },
                } });
        }
        else {
            // Regular user dashboard
            // Get recent bookings
            const recentBookings = yield Booking_1.default.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('room', 'title images')
                .populate('host', 'firstName lastName');
            // Get count of saved rooms
            const savedRoomsCount = user.savedRooms.length;
            dashboardData = Object.assign(Object.assign({}, dashboardData), { userData: {
                    bookings: {
                        recent: recentBookings,
                        upcoming: yield Booking_1.default.countDocuments({
                            user: userId,
                            bookingStatus: 'confirmed',
                            checkIn: { $gte: new Date() },
                        }),
                        completed: yield Booking_1.default.countDocuments({
                            user: userId,
                            bookingStatus: 'completed',
                        }),
                    },
                    savedRooms: savedRoomsCount,
                } });
        }
        res.status(200).json({
            success: true,
            data: dashboardData,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message,
        });
    }
});
exports.getDashboardData = getDashboardData;
// Update user by ID (admin only)
const updateUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { firstName, lastName, role, verificationLevel, isEmailVerified, isPhoneVerified, profileImage, active, } = req.body;
        // Check if ID is valid
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid user ID',
            });
            return;
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Create an object with the fields to update
        const updateFields = {};
        if (firstName !== undefined)
            updateFields.firstName = firstName;
        if (lastName !== undefined)
            updateFields.lastName = lastName;
        if (role !== undefined)
            updateFields.role = role;
        if (verificationLevel !== undefined)
            updateFields.verificationLevel = verificationLevel;
        if (isEmailVerified !== undefined)
            updateFields.isEmailVerified = isEmailVerified;
        if (isPhoneVerified !== undefined)
            updateFields.isPhoneVerified = isPhoneVerified;
        if (profileImage !== undefined)
            updateFields.profileImage = profileImage;
        if (active !== undefined)
            updateFields.active = active;
        // Update user with new data
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true }).select('-password');
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message,
        });
    }
});
exports.updateUserById = updateUserById;
const getNotifications = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Placeholder for notifications implementation
        res.status(200).json({
            success: true,
            data: [],
            message: 'Notifications feature coming soon',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message,
        });
    }
});
exports.getNotifications = getNotifications;
const markNotificationAsRead = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message,
        });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
const uploadProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getUserFromRequest(req, res);
        if (!currentUser)
            return;
        const userId = currentUser._id;
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
            return;
        }
        // Get the file path for storage
        const filePath = file.path.replace('src/', '');
        // Update user's profile image
        const user = yield User_1.default.findByIdAndUpdate(userId, { profileImage: filePath }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                profileImage: filePath,
                user,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading profile image',
            error: error.message,
        });
    }
});
exports.uploadProfileImage = uploadProfileImage;
// Get user profile (based on authenticated user)
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUser = getUserFromRequest(req, res);
        if (!currentUser)
            return;
        const userId = currentUser._id;
        // Get fresh user data with populated fields if needed
        const user = yield User_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message,
        });
    }
});
exports.getUserProfile = getUserProfile;
