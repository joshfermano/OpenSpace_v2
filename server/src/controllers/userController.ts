import { Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';
import Room from '../models/Room';
import Booking from '../models/Booking';
import { IUser } from '../models/User';

// Helper function to safely access req.user
function getUserFromRequest(req: Request, res: Response): IUser | null {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return null;
  }
  return req.user as IUser;
}

// Create a type for the safe user response
interface SafeUserResponse {
  password?: string;
  [key: string]: any;
}

export interface HostInfo {
  bio: string;
  languagesSpoken: string[];
  responseRate?: number;
  responseTime?: number;
  acceptanceRate?: number;
  hostSince: Date;
}

// Get all users (admin only)
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUser = getUserFromRequest(req, res);
    if (!currentUser) return;

    // Only admin can access all users
    if (currentUser.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
      return;
    }

    // Handle pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Handle filtering
    const filter: Record<string, any> = {};

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
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// Get user by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
      return;
    }

    // Find user
    const user = await User.findById(userId).select('-password');

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// Update user profile
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, profileImage, address, hostInfo } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profileImage) user.profileImage = profileImage;

    // Update address if provided
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    // Update host info if user is a host
    if (hostInfo && user.role === 'host') {
      const currentDate = new Date();
      user.hostInfo = {
        ...user.hostInfo,
        bio: hostInfo.bio || user.hostInfo?.bio || '',
        languagesSpoken:
          hostInfo.languagesSpoken || user.hostInfo?.languagesSpoken || [],
        hostSince: user.hostInfo?.hostSince || currentDate,
      };
    }

    // Save updated user
    await user.save();

    // Remove password from response
    const userResponse = user.toObject() as SafeUserResponse;
    userResponse.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// Change password
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};

// Save a room to favorites
export const saveRoom = async (req: Request, res: Response): Promise<void> => {
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
    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    // Add room to saved rooms if not already saved
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (!user.savedRooms.includes(roomId)) {
      user.savedRooms.push(roomId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Room saved to favorites',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error saving room to favorites',
      error: error.message,
    });
  }
};

// Remove a room from favorites
export const unsaveRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.savedRooms = user.savedRooms.filter((id) => id.toString() !== roomId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Room removed from favorites',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error removing room from favorites',
      error: error.message,
    });
  }
};

// Get saved rooms
export const getSavedRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get saved rooms with details
    const savedRooms = await Room.find({
      _id: { $in: user.savedRooms },
      isPublished: true,
      status: 'approved',
    });

    res.status(200).json({
      success: true,
      count: savedRooms.length,
      data: savedRooms,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching saved rooms',
      error: error.message,
    });
  }
};

// Get user dashboard data
export const getDashboardData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Different dashboard data based on user role
    let dashboardData: any = {
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
      const rooms = await Room.find({ host: userId });

      // Get recent bookings
      const recentBookings = await Booking.find({ host: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('room', 'title images')
        .populate('user', 'firstName lastName profileImage');

      // Calculate stats
      const pendingBookings = await Booking.countDocuments({
        host: userId,
        bookingStatus: 'pending',
      });

      const confirmedBookings = await Booking.countDocuments({
        host: userId,
        bookingStatus: 'confirmed',
      });

      dashboardData = {
        ...dashboardData,
        hostData: {
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
        },
      };
    } else {
      // Regular user dashboard
      // Get recent bookings
      const recentBookings = await Booking.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('room', 'title images')
        .populate('host', 'firstName lastName');

      // Get count of saved rooms
      const savedRoomsCount = user.savedRooms.length;

      dashboardData = {
        ...dashboardData,
        userData: {
          bookings: {
            recent: recentBookings,
            upcoming: await Booking.countDocuments({
              user: userId,
              bookingStatus: 'confirmed',
              checkIn: { $gte: new Date() },
            }),
            completed: await Booking.countDocuments({
              user: userId,
              bookingStatus: 'completed',
            }),
          },
          savedRooms: savedRoomsCount,
        },
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
};

// Update user by ID (admin only)
export const updateUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      role,
      verificationLevel,
      isEmailVerified,
      isPhoneVerified,
      profileImage,
      active,
    } = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Create an object with the fields to update
    const updateFields: Record<string, any> = {};

    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (role !== undefined) updateFields.role = role;
    if (verificationLevel !== undefined)
      updateFields.verificationLevel = verificationLevel;
    if (isEmailVerified !== undefined)
      updateFields.isEmailVerified = isEmailVerified;
    if (isPhoneVerified !== undefined)
      updateFields.isPhoneVerified = isPhoneVerified;
    if (profileImage !== undefined) updateFields.profileImage = profileImage;
    if (active !== undefined) updateFields.active = active;

    // Update user with new data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

export const getNotifications = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Placeholder for notifications implementation
    res.status(200).json({
      success: true,
      data: [],
      message: 'Notifications feature coming soon',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

export const uploadProfileImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUser = getUserFromRequest(req, res);
    if (!currentUser) return;

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
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: filePath },
      { new: true }
    ).select('-password');

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error uploading profile image',
      error: error.message,
    });
  }
};

// Get user profile (based on authenticated user)
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentUser = getUserFromRequest(req, res);
    if (!currentUser) return;

    const userId = currentUser._id;

    // Get fresh user data with populated fields if needed
    const user = await User.findById(userId).select('-password');

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    });
  }
};
