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
exports.processHostPayout = exports.getHostPayoutDetails = exports.getDashboardSummary = exports.getTransactionHistory = exports.getTopPerformingHosts = exports.getPlatformRevenueSummary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Earnings_1 = __importDefault(require("../models/Earnings"));
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const ensureAdmin = (req, res) => {
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
const getPlatformRevenueSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!ensureAdmin(req, res))
            return;
        // Time period filters
        const period = req.query.period || 'all';
        let dateFilter = {};
        const now = new Date();
        if (period === 'today') {
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfDay } };
        }
        else if (period === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfWeek } };
        }
        else if (period === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        }
        else if (period === 'year') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateFilter = { createdAt: { $gte: startOfYear } };
        }
        // Calculate platform revenue
        const platformRevenue = yield Earnings_1.default.aggregate([
            { $match: Object.assign({}, dateFilter) },
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
        const revenueByPaymentMethod = yield Earnings_1.default.aggregate([
            { $match: Object.assign({}, dateFilter) },
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
        const monthlyTrend = yield Earnings_1.default.aggregate([
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
                summary: platformRevenue.length > 0
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
    }
    catch (error) {
        console.error('Error fetching platform revenue data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching platform revenue data',
            error: error.message,
        });
    }
});
exports.getPlatformRevenueSummary = getPlatformRevenueSummary;
// Get top performing hosts
const getTopPerformingHosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!ensureAdmin(req, res))
            return;
        const limit = parseInt(req.query.limit) || 10;
        const period = req.query.period || 'all';
        let dateFilter = {};
        const now = new Date();
        if (period === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        }
        else if (period === 'year') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateFilter = { createdAt: { $gte: startOfYear } };
        }
        // Aggregate top hosts by earnings
        const topHosts = yield Earnings_1.default.aggregate([
            { $match: Object.assign({}, dateFilter) },
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
    }
    catch (error) {
        console.error('Error fetching top performing hosts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching top performing hosts',
            error: error.message,
        });
    }
});
exports.getTopPerformingHosts = getTopPerformingHosts;
// Get transaction history
const getTransactionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!ensureAdmin(req, res))
            return;
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        // Filters
        const paymentMethod = req.query.paymentMethod;
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : null;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : null;
        // Build filter object
        const filter = {};
        if (paymentMethod)
            filter.paymentMethod = paymentMethod;
        if (startDate && endDate) {
            // Set end date to end of day
            endDate.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: startDate, $lte: endDate };
        }
        else if (startDate) {
            filter.createdAt = { $gte: startDate };
        }
        else if (endDate) {
            endDate.setHours(23, 59, 59, 999);
            filter.createdAt = { $lte: endDate };
        }
        // Get transactions with populated booking and user details
        const transactions = (yield Earnings_1.default.find(filter)
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
            .sort({ createdAt: -1 }));
        // Get total count for pagination
        const total = yield Earnings_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: transactions.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: transactions.map((t) => {
                var _a, _b, _c, _d;
                const guestInfo = ((_a = t.booking) === null || _a === void 0 ? void 0 : _a.user)
                    ? {
                        firstName: t.booking.user.firstName,
                        lastName: t.booking.user.lastName,
                        email: t.booking.user.email,
                    }
                    : null;
                return {
                    id: t._id,
                    date: t.createdAt,
                    bookingId: (_b = t.booking) === null || _b === void 0 ? void 0 : _b._id,
                    checkIn: (_c = t.booking) === null || _c === void 0 ? void 0 : _c.checkIn,
                    checkOut: (_d = t.booking) === null || _d === void 0 ? void 0 : _d.checkOut,
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
    }
    catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction history',
            error: error.message,
        });
    }
});
exports.getTransactionHistory = getTransactionHistory;
// Get dashboard summary
const getDashboardSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!ensureAdmin(req, res))
            return;
        // Get current date
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        // Get today's earnings
        const todayEarnings = yield Earnings_1.default.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$platformFee' } } },
        ]);
        // Get this month's earnings
        const monthEarnings = yield Earnings_1.default.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$platformFee' } } },
        ]);
        // Get previous month's earnings for comparison
        const prevMonthEarnings = yield Earnings_1.default.aggregate([
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
        const totalEarnings = yield Earnings_1.default.aggregate([
            { $group: { _id: null, total: { $sum: '$platformFee' } } },
        ]);
        // Calculate growth percentage
        const thisMonthTotal = monthEarnings.length > 0 ? monthEarnings[0].total : 0;
        const prevMonthTotal = prevMonthEarnings.length > 0 ? prevMonthEarnings[0].total : 0;
        let growth = 0;
        if (prevMonthTotal > 0) {
            growth = ((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
        }
        // Get counts
        const totalHosts = yield User_1.default.countDocuments({ role: 'host' });
        const totalUsers = yield User_1.default.countDocuments({ role: 'user' });
        const totalBookings = yield Booking_1.default.countDocuments();
        const pendingBookings = yield Booking_1.default.countDocuments({
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
    }
    catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard summary',
            error: error.message,
        });
    }
});
exports.getDashboardSummary = getDashboardSummary;
const getHostPayoutDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!ensureAdmin(req, res))
            return;
        const { hostId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(hostId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid host ID format',
            });
            return;
        }
        // Verify host exists
        const host = yield User_1.default.findById(hostId);
        if (!host || host.role !== 'host') {
            res.status(404).json({
                success: false,
                message: 'Host not found',
            });
            return;
        }
        // Get host earnings details
        const hostEarnings = yield Earnings_1.default.aggregate([
            { $match: { host: new mongoose_1.default.Types.ObjectId(hostId) } },
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$hostPayout' },
                    count: { $sum: 1 },
                },
            },
        ]);
        const availableEarnings = (yield Earnings_1.default.find({
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
            .sort({ createdAt: -1 }));
        // Format the earnings summary
        const earningsSummary = {
            available: 0,
            pending: 0,
            paid_out: 0,
        };
        hostEarnings.forEach((item) => {
            if (item._id === 'available')
                earningsSummary.available = item.total;
            if (item._id === 'pending')
                earningsSummary.pending = item.total;
            if (item._id === 'paid_out')
                earningsSummary.paid_out = item.total;
        });
        res.status(200).json({
            success: true,
            data: {
                hostId,
                hostName: `${host.firstName} ${host.lastName}`,
                email: host.email,
                summary: earningsSummary,
                availableEarnings: availableEarnings.map((earning) => {
                    var _a;
                    const bookingData = earning.booking
                        ? {
                            id: earning.booking._id,
                            checkIn: earning.booking.checkIn,
                            checkOut: earning.booking.checkOut,
                            price: earning.booking.totalPrice,
                            roomTitle: ((_a = earning.booking.room) === null || _a === void 0 ? void 0 : _a.title) || 'Room',
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
    }
    catch (error) {
        console.error('Error fetching host payout details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching host payout details',
            error: error.message,
        });
    }
});
exports.getHostPayoutDetails = getHostPayoutDetails;
// Process host payout
const processHostPayout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!ensureAdmin(req, res))
            return;
        const { hostId, earningIds, method, reference } = req.body;
        if (!hostId || !earningIds || !Array.isArray(earningIds) || !method) {
            res.status(400).json({
                success: false,
                message: 'Host ID, earning IDs array, and payment method are required',
            });
            return;
        }
        // Verify host exists
        const host = yield User_1.default.findById(hostId);
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
        const updateResult = yield Earnings_1.default.updateMany({
            _id: { $in: earningIds },
            host: hostId,
            status: 'available',
        }, {
            status: 'paid_out',
            paidOutAt: now,
            payoutId,
            paymentMethod: method,
        });
        if (updateResult.matchedCount === 0) {
            res.status(400).json({
                success: false,
                message: 'No eligible earnings found for payout',
            });
            return;
        }
        // Calculate total amount paid
        const updatedEarnings = yield Earnings_1.default.find({
            _id: { $in: earningIds },
            payoutId,
        });
        const totalPaid = updatedEarnings.reduce((sum, earning) => sum + earning.hostPayout, 0);
        res.status(200).json({
            success: true,
            message: `Successfully processed payout of ₱${totalPaid.toFixed(2)} for ${updateResult.modifiedCount} earnings`,
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
    }
    catch (error) {
        console.error('Error processing host payout:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing host payout',
            error: error.message,
        });
    }
});
exports.processHostPayout = processHostPayout;
