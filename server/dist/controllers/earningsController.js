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
exports.updateEarningsStatus = exports.processHostPayout = exports.getBookingEarnings = exports.generateEarningsStatement = exports.getEarningsByDateRange = exports.getEarningsSummary = exports.getHostEarnings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Earnings_1 = __importDefault(require("../models/Earnings"));
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
// Get host earnings
const getHostEarnings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Check if user is a host
        const user = yield User_1.default.findById(userId);
        if (!user || user.role !== 'host') {
            res.status(403).json({
                success: false,
                message: 'Only hosts can access earnings',
            });
            return;
        }
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filter by status if provided
        const filter = { host: userId };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        // Get earnings
        const earnings = yield Earnings_1.default.find(filter)
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
        const total = yield Earnings_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: earnings.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: earnings,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching earnings',
            error: error.message,
        });
    }
});
exports.getHostEarnings = getHostEarnings;
// Get earnings summary
const getEarningsSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Check if user is a host
        const user = yield User_1.default.findById(userId);
        if (!user || user.role !== 'host') {
            res.status(403).json({
                success: false,
                message: 'Only hosts can access earnings summary',
            });
            return;
        }
        // Calculate total earnings
        const totalEarnings = yield Earnings_1.default.aggregate([
            { $match: { host: new mongoose_1.default.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: '$hostPayout' } } },
        ]);
        // Calculate available earnings (not yet paid out)
        const availableEarnings = yield Earnings_1.default.aggregate([
            {
                $match: {
                    host: new mongoose_1.default.Types.ObjectId(userId),
                    status: 'available',
                },
            },
            { $group: { _id: null, total: { $sum: '$hostPayout' } } },
        ]);
        // Calculate pending earnings
        const pendingEarnings = yield Earnings_1.default.aggregate([
            {
                $match: {
                    host: new mongoose_1.default.Types.ObjectId(userId),
                    status: 'pending',
                },
            },
            { $group: { _id: null, total: { $sum: '$hostPayout' } } },
        ]);
        // Calculate paid out earnings
        const paidOutEarnings = yield Earnings_1.default.aggregate([
            {
                $match: {
                    host: new mongoose_1.default.Types.ObjectId(userId),
                    status: 'paid_out',
                },
            },
            { $group: { _id: null, total: { $sum: '$hostPayout' } } },
        ]);
        // Get earnings by month (for chart data)
        const monthlyEarnings = yield Earnings_1.default.aggregate([
            { $match: { host: new mongoose_1.default.Types.ObjectId(userId) } },
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
                available: availableEarnings.length > 0 ? availableEarnings[0].total : 0,
                pending: pendingEarnings.length > 0 ? pendingEarnings[0].total : 0,
                paidOut: paidOutEarnings.length > 0 ? paidOutEarnings[0].total : 0,
                monthly: formattedMonthlyEarnings,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching earnings summary',
            error: error.message,
        });
    }
});
exports.getEarningsSummary = getEarningsSummary;
// Get earnings by date range
const getEarningsByDateRange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;
        // Check if user is a host
        const user = yield User_1.default.findById(userId);
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
        const start = new Date(startDate);
        const end = new Date(endDate);
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
        const earnings = yield Earnings_1.default.find({
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
        const totalAmount = earnings.reduce((sum, earning) => sum + earning.amount, 0);
        const totalPlatformFee = earnings.reduce((sum, earning) => sum + earning.platformFee, 0);
        const totalHostPayout = earnings.reduce((sum, earning) => sum + earning.hostPayout, 0);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching earnings by date range',
            error: error.message,
        });
    }
});
exports.getEarningsByDateRange = getEarningsByDateRange;
// Generate earnings statement (for tax purposes)
const generateEarningsStatement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { year } = req.params;
        // Check if user is a host
        const user = yield User_1.default.findById(userId);
        if (!user || user.role !== 'host') {
            res.status(403).json({
                success: false,
                message: 'Only hosts can access earnings statements',
            });
            return;
        }
        // Validate year
        const yearNum = parseInt(year);
        if (isNaN(yearNum) ||
            yearNum < 2000 ||
            yearNum > new Date().getFullYear()) {
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
        const earnings = yield Earnings_1.default.find({
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
        const monthlyEarnings = {};
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
            totalPlatformFee: earnings.reduce((sum, earning) => sum + earning.platformFee, 0),
            totalHostPayout: earnings.reduce((sum, earning) => sum + earning.hostPayout, 0),
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating earnings statement',
            error: error.message,
        });
    }
});
exports.generateEarningsStatement = generateEarningsStatement;
// Get earnings for a specific booking
const getBookingEarnings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;
        // Check if user is a host
        const user = yield User_1.default.findById(userId);
        if (!user || user.role !== 'host') {
            res.status(403).json({
                success: false,
                message: 'Only hosts can access booking earnings',
            });
            return;
        }
        // Get the booking to verify ownership
        const booking = yield Booking_1.default.findById(bookingId);
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
        const earnings = yield Earnings_1.default.findOne({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking earnings',
            error: error.message,
        });
    }
});
exports.getBookingEarnings = getBookingEarnings;
// For admin: Process host payout
const processHostPayout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const host = yield User_1.default.findById(hostId);
        if (!host || host.role !== 'host') {
            res.status(404).json({
                success: false,
                message: 'Host not found',
            });
            return;
        }
        // Update the specified earnings to paid_out status
        const updateResult = yield Earnings_1.default.updateMany({
            _id: { $in: earningIds },
            host: hostId,
            status: 'available', // Only process available earnings
        }, {
            status: 'paid_out',
            paidOutAt: new Date(),
            payoutId,
        });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing host payout',
            error: error.message,
        });
    }
});
exports.processHostPayout = processHostPayout;
// Update pending earnings to available (scheduled job)
const updateEarningsStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updateResult = yield Earnings_1.default.updateMany({
            status: 'pending',
            availableDate: { $lte: now },
        }, {
            status: 'available',
        });
        res.status(200).json({
            success: true,
            message: `Updated ${updateResult.modifiedCount} earnings to 'available' status`,
            data: {
                updated: updateResult.modifiedCount,
                timestamp: now,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating earnings status',
            error: error.message,
        });
    }
});
exports.updateEarningsStatus = updateEarningsStatus;
