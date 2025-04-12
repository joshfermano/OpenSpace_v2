import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Earning from '../models/Earnings';
import Booking from '../models/Booking';
import User, { IUser } from '../models/User';

// Define a custom Request type that includes the user property
interface AuthRequest extends Request {
  user?: IUser;
}

interface IPopulatedHost {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

interface IPopulatedEarning {
  _id: mongoose.Types.ObjectId;
  booking?: {
    _id: mongoose.Types.ObjectId;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    room?: {
      title: string;
    };
  };
  host: {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  platformFee: number;
  hostPayout: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
}

interface IPopulatedEarningWithBooking {
  _id: mongoose.Types.ObjectId;
  booking: {
    _id: mongoose.Types.ObjectId;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    room?: {
      title: string;
    };
  };
  host: IPopulatedHost;
  amount: number;
  platformFee: number;
  hostPayout: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
}

const ensureAdmin = (req: AuthRequest, res: Response): boolean => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Only administrators can access this resource',
    });
    return false;
  }
  return true;
};

// Get platform revenue summary
export const getPlatformRevenueSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!ensureAdmin(req, res)) return;

    // Time period filters
    const period = (req.query.period as string) || 'all';
    let dateFilter: Record<string, any> = {};

    const now = new Date();
    if (period === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: startOfWeek } };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: startOfYear } };
    }

    // Calculate platform revenue
    const platformRevenue = await Earning.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$platformFee' },
          totalBookings: { $count: {} },
          avgFee: { $avg: '$platformFee' },
        },
      },
    ]);

    // Calculate revenue by payment method
    const revenueByPaymentMethod = await Earning.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: '$paymentMethod',
          totalFees: { $sum: '$platformFee' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalFees: -1 } },
    ]);

    // Get monthly trend data for current year
    const currentYear = new Date().getFullYear();
    const monthlyTrend = await Earning.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          platformFees: { $sum: '$platformFee' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary:
          platformRevenue.length > 0
            ? {
                totalFees: platformRevenue[0].totalFees,
                totalBookings: platformRevenue[0].totalBookings,
                avgFee: platformRevenue[0].avgFee,
              }
            : { totalFees: 0, totalBookings: 0, avgFee: 0 },
        byPaymentMethod: revenueByPaymentMethod,
        monthlyTrend: monthlyTrend.map((item) => ({
          month: item._id.month,
          revenue: item.platformFees,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching platform revenue data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform revenue data',
      error: error.message,
    });
  }
};

// Get top performing hosts
export const getTopPerformingHosts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!ensureAdmin(req, res)) return;

    const limit = parseInt(req.query.limit as string) || 10;
    const period = (req.query.period as string) || 'all';

    let dateFilter: Record<string, any> = {};
    const now = new Date();

    if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: startOfYear } };
    }

    // Aggregate top hosts by earnings
    const topHosts = await Earning.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: '$host',
          totalEarnings: { $sum: '$hostPayout' },
          totalPlatformFee: { $sum: '$platformFee' },
          bookingsCount: { $count: {} },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'hostDetails',
        },
      },
      {
        $project: {
          hostId: '$_id',
          totalEarnings: 1,
          totalPlatformFee: 1,
          bookingsCount: 1,
          host: {
            $arrayElemAt: ['$hostDetails', 0],
          },
        },
      },
      {
        $project: {
          hostId: 1,
          totalEarnings: 1,
          totalPlatformFee: 1,
          bookingsCount: 1,
          firstName: '$host.firstName',
          lastName: '$host.lastName',
          email: '$host.email',
          profileImage: '$host.profileImage',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topHosts,
    });
  } catch (error: any) {
    console.error('Error fetching top performing hosts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top performing hosts',
      error: error.message,
    });
  }
};

// Get transaction history
export const getTransactionHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!ensureAdmin(req, res)) return;

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const paymentMethod = req.query.paymentMethod as string;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : null;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : null;

    // Build filter object
    const filter: Record<string, any> = {};
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (startDate && endDate) {
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.createdAt = { $gte: startDate };
    } else if (endDate) {
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt = { $lte: endDate };
    }

    // Get transactions with populated booking and user details
    const transactions = (await Earning.find(filter)
      .populate({
        path: 'booking',
        select: 'checkIn checkOut user totalPrice room',
        populate: {
          path: 'user',
          select: 'firstName lastName email',
        },
      })
      .populate({
        path: 'host',
        select: 'firstName lastName email',
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })) as unknown as IPopulatedEarning[];

    // Get total count for pagination
    const total = await Earning.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: transactions.map((t) => {
        const guestInfo = t.booking?.user
          ? {
              firstName: t.booking.user.firstName,
              lastName: t.booking.user.lastName,
              email: t.booking.user.email,
            }
          : null;

        return {
          id: t._id,
          date: t.createdAt,
          bookingId: t.booking?._id,
          checkIn: t.booking?.checkIn,
          checkOut: t.booking?.checkOut,
          guest: guestInfo,
          host: {
            id: t.host._id,
            firstName: t.host.firstName,
            lastName: t.host.lastName,
            email: t.host.email,
          },
          totalAmount: t.amount,
          platformFee: t.platformFee,
          hostPayout: t.hostPayout,
          paymentMethod: t.paymentMethod,
          status: t.status,
        };
      }),
    });
  } catch (error: any) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction history',
      error: error.message,
    });
  }
};

// Get dashboard summary
export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!ensureAdmin(req, res)) return;

    // Get current date
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get today's earnings
    const todayEarnings = await Earning.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]);

    // Get this month's earnings
    const monthEarnings = await Earning.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]);

    // Get previous month's earnings for comparison
    const prevMonthEarnings = await Earning.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfPrevMonth,
            $lte: endOfPrevMonth,
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]);

    // Get total earnings (all time)
    const totalEarnings = await Earning.aggregate([
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]);

    // Calculate growth percentage
    const thisMonthTotal =
      monthEarnings.length > 0 ? monthEarnings[0].total : 0;
    const prevMonthTotal =
      prevMonthEarnings.length > 0 ? prevMonthEarnings[0].total : 0;

    let growth = 0;
    if (prevMonthTotal > 0) {
      growth = ((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
    }

    // Get counts
    const totalHosts = await User.countDocuments({ role: 'host' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({
      bookingStatus: 'pending',
    });

    res.status(200).json({
      success: true,
      data: {
        earnings: {
          today: todayEarnings.length > 0 ? todayEarnings[0].total : 0,
          month: thisMonthTotal,
          total: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
          growth: parseFloat(growth.toFixed(2)),
        },
        counts: {
          totalHosts,
          totalUsers,
          totalBookings,
          pendingBookings,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message,
    });
  }
};

export const getHostPayoutDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { hostId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hostId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid host ID format',
      });
      return;
    }

    // Verify host exists
    const host = await User.findById(hostId);
    if (!host || host.role !== 'host') {
      res.status(404).json({
        success: false,
        message: 'Host not found',
      });
      return;
    }

    // Get host earnings details
    const hostEarnings = await Earning.aggregate([
      { $match: { host: new mongoose.Types.ObjectId(hostId) } },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$hostPayout' },
          count: { $sum: 1 },
        },
      },
    ]);

    const availableEarnings = (await Earning.find({
      host: hostId,
      status: 'available',
    })
      .populate({
        path: 'booking',
        select: 'checkIn checkOut totalPrice room',
        populate: {
          path: 'room',
          select: 'title',
        },
      })
      .sort({ createdAt: -1 })) as unknown as IPopulatedEarningWithBooking[];

    // Format the earnings summary
    const earningsSummary = {
      available: 0,
      pending: 0,
      paid_out: 0,
    };

    hostEarnings.forEach((item) => {
      if (item._id === 'available') earningsSummary.available = item.total;
      if (item._id === 'pending') earningsSummary.pending = item.total;
      if (item._id === 'paid_out') earningsSummary.paid_out = item.total;
    });

    res.status(200).json({
      success: true,
      data: {
        hostId,
        hostName: `${host.firstName} ${host.lastName}`,
        email: host.email,
        summary: earningsSummary,
        availableEarnings: availableEarnings.map((earning) => {
          const bookingData = earning.booking
            ? {
                id: earning.booking._id,
                checkIn: earning.booking.checkIn,
                checkOut: earning.booking.checkOut,
                price: earning.booking.totalPrice,
                roomTitle: earning.booking.room?.title || 'Room',
              }
            : null;

          return {
            id: earning._id,
            amount: earning.hostPayout,
            platformFee: earning.platformFee,
            totalAmount: earning.amount,
            date: earning.createdAt,
            booking: bookingData,
          };
        }),
      },
    });
  } catch (error: any) {
    console.error('Error fetching host payout details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching host payout details',
      error: error.message,
    });
  }
};

// Process host payout
export const processHostPayout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { hostId, earningIds, method, reference } = req.body;

    if (!hostId || !earningIds || !Array.isArray(earningIds) || !method) {
      res.status(400).json({
        success: false,
        message: 'Host ID, earning IDs array, and payment method are required',
      });
      return;
    }

    // Verify host exists
    const host = await User.findById(hostId);
    if (!host || host.role !== 'host') {
      res.status(404).json({
        success: false,
        message: 'Host not found',
      });
      return;
    }

    // Generate payout ID
    const payoutId = reference || `PO-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date();

    // Update the specified earnings to paid_out status
    const updateResult = await Earning.updateMany(
      {
        _id: { $in: earningIds },
        host: hostId,
        status: 'available',
      },
      {
        status: 'paid_out',
        paidOutAt: now,
        payoutId,
        paymentMethod: method,
      }
    );

    if (updateResult.matchedCount === 0) {
      res.status(400).json({
        success: false,
        message: 'No eligible earnings found for payout',
      });
      return;
    }

    // Calculate total amount paid
    const updatedEarnings = await Earning.find({
      _id: { $in: earningIds },
      payoutId,
    });

    const totalPaid = updatedEarnings.reduce(
      (sum, earning) => sum + earning.hostPayout,
      0
    );

    res.status(200).json({
      success: true,
      message: `Successfully processed payout of ₱${totalPaid.toFixed(2)} for ${
        updateResult.modifiedCount
      } earnings`,
      data: {
        payoutId,
        hostId,
        hostName: `${host.firstName} ${host.lastName}`,
        totalAmount: totalPaid,
        earningsCount: updateResult.modifiedCount,
        method,
        paidAt: now,
      },
    });
  } catch (error: any) {
    console.error('Error processing host payout:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing host payout',
      error: error.message,
    });
  }
};
