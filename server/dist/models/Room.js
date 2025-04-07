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
const roomSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['stay', 'conference', 'event'],
        required: [true, 'Room type is required'],
    },
    host: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Host is required'],
    },
    price: {
        basePrice: {
            type: Number,
            required: [true, 'Base price is required'],
            min: [0, 'Price cannot be negative'],
        },
        cleaningFee: {
            type: Number,
            default: 0,
            min: [0, 'Cleaning fee cannot be negative'],
        },
        serviceFee: {
            type: Number,
            default: 0,
            min: [0, 'Service fee cannot be negative'],
        },
        tax: {
            type: Number,
            default: 0,
            min: [0, 'Tax cannot be negative'],
        },
    },
    location: {
        address: {
            type: String,
            required: [true, 'Address is required'],
        },
        city: {
            type: String,
            required: [true, 'City is required'],
        },
        state: {
            type: String,
            required: [true, 'State is required'],
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required'],
        },
        coordinates: {
            latitude: Number,
            longitude: Number,
        },
    },
    amenities: [{ type: String }],
    images: [
        { type: String, required: [true, 'At least one image is required'] },
    ],
    capacity: {
        maxGuests: {
            type: Number,
            required: [true, 'Maximum number of guests is required'],
            min: [1, 'Must accommodate at least 1 guest'],
        },
        bedrooms: { type: Number },
        beds: { type: Number },
        bathrooms: { type: Number },
    },
    availability: {
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        isAlwaysAvailable: {
            type: Boolean,
            default: false,
        },
        unavailableDates: [{ type: Date }],
    },
    houseRules: {
        checkInTime: {
            type: String,
            required: [true, 'Check-in time is required'],
        },
        checkOutTime: {
            type: String,
            required: [true, 'Check-out time is required'],
        },
        cancellationPolicy: {
            type: String,
            required: [true, 'Cancellation policy is required'],
            default: 'No cancellation within 1 day of booking date',
        },
        instantBooking: {
            type: Boolean,
            default: false,
        },
        additionalRules: [{ type: String }],
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'inactive'],
        default: 'pending',
    },
    rejectionReason: {
        type: String,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Indexes for search optimization
roomSchema.index({
    'location.city': 1,
    'location.state': 1,
    'location.country': 1,
});
roomSchema.index({ type: 1 });
roomSchema.index({ 'price.basePrice': 1 });
roomSchema.index({ 'capacity.maxGuests': 1 });
roomSchema.index({ 'ratings.average': -1 });
exports.default = mongoose_1.default.model('Room', roomSchema);
