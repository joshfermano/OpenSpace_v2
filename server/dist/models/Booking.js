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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    room: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Room is required'],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    host: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Host is required'],
    },
    checkIn: {
        type: Date,
        required: [true, 'Check-in date is required'],
    },
    checkOut: {
        type: Date,
        required: [true, 'Check-out date is required'],
    },
    guests: {
        adults: {
            type: Number,
            required: [true, 'Number of adults is required'],
            min: [1, 'At least one adult is required'],
        },
        children: {
            type: Number,
            default: 0,
        },
        infants: {
            type: Number,
            default: 0,
        },
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative'],
    },
    priceBreakdown: {
        basePrice: {
            type: Number,
            required: [true, 'Base price is required'],
        },
        cleaningFee: {
            type: Number,
            default: 0,
        },
        serviceFee: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'cancelled'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: ['property', 'creditCard'],
        default: 'property',
    },
    paymentId: {
        type: String,
    },
    paymentDetails: {
        paymentDate: Date,
        amount: Number,
        recordedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    refunds: [
        {
            amount: Number,
            date: Date,
            reason: String,
            refundId: String,
            processedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            },
        },
    ],
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
        default: 'pending',
    },
    cancellationDetails: {
        cancelledAt: {
            type: Date,
        },
        cancelledBy: {
            type: String,
            enum: ['user', 'host', 'admin'],
        },
        reason: {
            type: String,
        },
        refundAmount: {
            type: Number,
        },
    },
    isCancellable: {
        type: Boolean,
        default: true,
    },
    cancellationDeadline: {
        type: Date,
    },
    specialRequests: {
        type: String,
    },
    reviewId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Review',
    },
}, {
    timestamps: true,
});
bookingSchema.pre('save', function (next) {
    if (this.isNew) {
        // Check if the booking is within 24 hours
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const timeDifference = this.checkIn.getTime() - Date.now();
        if (timeDifference <= oneDay) {
            this.isCancellable = false;
        }
        else {
            // Set cancellation deadline to 24 hours before check-in
            this.cancellationDeadline = new Date(this.checkIn.getTime() - oneDay);
        }
    }
    next();
});
// Add indexes for common queries
bookingSchema.index({ user: 1, bookingStatus: 1 });
bookingSchema.index({ host: 1, bookingStatus: 1 });
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ bookingStatus: 1, checkIn: 1 });
exports.default = mongoose_1.default.model('Booking', bookingSchema);
