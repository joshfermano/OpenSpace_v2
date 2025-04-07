import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Earning from '../models/Earnings';
import User from '../models/User';
import Booking from '../models/Booking';

// Get host earnings
export const getHostEarnings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;

    // Check if user is a host
    const user = await User.findById(userId);
    if (!user || user.role !== 'host') {
      res.status(403).json({
        success: false,
        message: 'Only hosts can access earnings',
      });
      return;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filter by status if provided
    const filter: Record<string, any> = { host: userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get earnings
    const earnings = await Earning.find(filter)
      .populate({
        path: 'booking',
        select: 'checkIn checkOut totalPrice bookingStatus',
        populate: {
          path: 'room',
          select: 'title images',
        },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Earning.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: earnings.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: earnings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings',
      error: error.message,
    });
  }
};

// Get earnings summary
export const getEarningsSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;

    // Check if user is a host
    const user = await User.findById(userId);
    if (!user || user.role !== 'host') {
      res.status(403).json({
        success: false,
        message: 'Only hosts can access earnings summary',
      });
      return;
    }

    // Calculate total earnings
    const totalEarnings = await Earning.aggregate([
      { $match: { host: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$hostPayout' } } },
    ]);

    // Calculate available earnings (not yet paid out)
    const availableEarnings = await Earning.aggregate([
      {
        $match: {
          host: new mongoose.Types.ObjectId(userId),
          status: 'available',
        },
      },
      { $group: { _id: null, total: { $sum: '$hostPayout' } } },
    ]);

    // Calculate pending earnings
    const pendingEarnings = await Earning.aggregate([
      {
        $match: {
          host: new mongoose.Types.ObjectId(userId),
          status: 'pending',
        },
      },
      { $group: { _id: null, total: { $sum: '$hostPayout' } } },
    ]);

    // Calculate paid out earnings
    const paidOutEarnings = await Earning.aggregate([
      {
        $match: {
          host: new mongoose.Types.ObjectId(userId),
          status: 'paid_out',
        },
      },
      { $group: { _id: null, total: { $sum: '$hostPayout' } } },
    ]);

    // Get earnings by month (for chart data)
    const monthlyEarnings = await Earning.aggregate([
      { $match: { host: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$hostPayout' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }, // Last 12 months
    ]);

    // Format monthly data for easier consumption by frontend
    const formattedMonthlyEarnings = monthlyEarnings.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      total: item.total,
    }));

    res.status(200).json({
      success: true,
      data: {
        total: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        available:
          availableEarnings.length > 0 ? availableEarnings[0].total : 0,
        pending: pendingEarnings.length > 0 ? pendingEarnings[0].total : 0,
        paidOut: paidOutEarnings.length > 0 ? paidOutEarnings[0].total : 0,
        monthly: formattedMonthlyEarnings,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings summary',
      error: error.message,
    });
  }
};

// Get earnings by date range
export const getEarningsByDateRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Check if user is a host
    const user = await User.findById(userId);
    if (!user || user.role !== 'host') {
      res.status(403).json({
        success: false,
        message: 'Only hosts can access earnings',
      });
      return;
    }

    // Validate dates
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
      return;
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    // Get earnings within date range
    const earnings = await Earning.find({
      host: userId,
      createdAt: { $gte: start, $lte: end },
    })
      .populate({
        path: 'booking',
        select: 'checkIn checkOut totalPrice bookingStatus room',
        populate: {
          path: 'room',
          select: 'title images',
        },
      })
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalAmount = earnings.reduce(
      (sum, earning) => sum + earning.amount,
      0
    );
    const totalPlatformFee = earnings.reduce(
      (sum, earning) => sum + earning.platformFee,
      0
    );
    const totalHostPayout = earnings.reduce(
      (sum, earning) => sum + earning.hostPayout,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        earnings,
        summary: {
          count: earnings.length,
          totalAmount,
          totalPlatformFee,
          totalHostPayout,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings by date range',
      error: error.message,
    });
  }
};

// Generate earnings statement (for tax purposes)
export const generateEarningsStatement = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { year } = req.params;

    // Check if user is a host
    const user = await User.findById(userId);
    if (!user || user.role !== 'host') {
      res.status(403).json({
        success: false,
        message: 'Only hosts can access earnings statements',
      });
      return;
    }

    // Validate year
    const yearNum = parseInt(year);
    if (
      isNaN(yearNum) ||
      yearNum < 2000 ||
      yearNum > new Date().getFullYear()
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid year',
      });
      return;
    }

    // Get start and end date for the year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Get all earnings for the year
    const earnings = await Earning.find({
      host: userId,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: 'booking',
        select: 'checkIn checkOut room',
        populate: {
          path: 'room',
          select: 'title location',
        },
      })
      .sort({ createdAt: 1 });

    // Group earnings by month
    const monthlyEarnings: Record<string, any> = {};
    for (let i = 0; i < 12; i++) {
      monthlyEarnings[i + 1] = {
        month: i + 1,
        earnings: [],
        totalAmount: 0,
        totalPlatformFee: 0,
        totalHostPayout: 0,
      };
    }

    // Populate monthly earnings
    earnings.forEach((earning) => {
      const month = earning.createdAt.getMonth() + 1;
      monthlyEarnings[month].earnings.push(earning);
      monthlyEarnings[month].totalAmount += earning.amount;
      monthlyEarnings[month].totalPlatformFee += earning.platformFee;
      monthlyEarnings[month].totalHostPayout += earning.hostPayout;
    });

    // Calculate yearly totals
    const yearlyTotals = {
      totalAmount: earnings.reduce((sum, earning) => sum + earning.amount, 0),
      totalPlatformFee: earnings.reduce(
        (sum, earning) => sum + earning.platformFee,
        0
      ),
      totalHostPayout: earnings.reduce(
        (sum, earning) => sum + earning.hostPayout,
        0
      ),
      totalBookings: earnings.length,
    };

    res.status(200).json({
      success: true,
      data: {
        year: yearNum,
        hostDetails: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        monthlyEarnings: Object.values(monthlyEarnings),
        yearlyTotals,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error generating earnings statement',
      error: error.message,
    });
  }
};

// Get earnings for a specific booking
export const getBookingEarnings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    // Check if user is a host
    const user = await User.findById(userId);
    if (!user || user.role !== 'host') {
      res.status(403).json({
        success: false,
        message: 'Only hosts can access booking earnings',
      });
      return;
    }

    // Get the booking to verify ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
      return;
    }

    // Check if the booking belongs to this host
    if (booking.host.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access earnings for this booking',
      });
      return;
    }

    // Get earnings for this booking
    const earnings = await Earning.findOne({
      booking: bookingId,
      host: userId,
    }).populate({
      path: 'booking',
      select: 'checkIn checkOut totalPrice bookingStatus paymentMethod',
      populate: {
        path: 'room',
        select: 'title images location',
      },
    });

    if (!earnings) {
      res.status(404).json({
        success: false,
        message: 'No earnings found for this booking',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: earnings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking earnings',
      error: error.message,
    });
  }
};

// For admin: Process host payout
export const processHostPayout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Only admin can process payouts
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to process payouts',
      });
      return;
    }

    const { hostId, earningIds, payoutId } = req.body;

    if (!hostId || !earningIds || !Array.isArray(earningIds) || !payoutId) {
      res.status(400).json({
        success: false,
        message: 'Host ID, earning IDs array, and payout ID are required',
      });
      return;
    }

    // Check if host exists
    const host = await User.findById(hostId);
    if (!host || host.role !== 'host') {
      res.status(404).json({
        success: false,
        message: 'Host not found',
      });
      return;
    }

    // Update the specified earnings to paid_out status
    const updateResult = await Earning.updateMany(
      {
        _id: { $in: earningIds },
        host: hostId,
        status: 'available', // Only process available earnings
      },
      {
        status: 'paid_out',
        paidOutAt: new Date(),
        payoutId,
      }
    );

    // Check how many documents were updated
    if (updateResult.matchedCount === 0) {
      res.status(400).json({
        success: false,
        message: 'No eligible earnings found for payout',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed payout for ${updateResult.matchedCount} earnings`,
      data: {
        host: hostId,
        updated: updateResult.modifiedCount,
        payoutId,
        paidOutAt: new Date(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error processing host payout',
      error: error.message,
    });
  }
};

// Update pending earnings to available (scheduled job)
export const updateEarningsStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Only admins or system can run this
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update earnings status',
      });
      return;
    }

    const now = new Date();

    // Find pending earnings that have reached their available date
    const updateResult = await Earning.updateMany(
      {
        status: 'pending',
        availableDate: { $lte: now },
      },
      {
        status: 'available',
      }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${updateResult.modifiedCount} earnings to 'available' status`,
      data: {
        updated: updateResult.modifiedCount,
        timestamp: now,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating earnings status',
      error: error.message,
    });
  }
};
