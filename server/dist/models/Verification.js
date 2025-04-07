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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const verificationSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        unique: true,
    },
    email: {
        token: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifiedAt: {
            type: Date,
        },
    },
}, {
    timestamps: true,
});
// Index for faster lookup by token
verificationSchema.index({ 'email.token': 1 });
// Clean up expired tokens (utility method)
verificationSchema.statics.cleanupExpired = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return this.deleteMany({
            'email.expiresAt': { $lt: new Date() },
            'email.isVerified': false,
        });
    });
};
// Middleware to create a new token
verificationSchema.statics.createToken = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const crypto = require('crypto');
        const token = crypto.randomBytes(20).toString('hex');
        const verification = yield this.findOneAndUpdate({ user: userId }, {
            user: userId,
            email: {
                token: token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                isVerified: false,
            },
        }, { upsert: true, new: true });
        return verification;
    });
};
// Middleware to verify email
verificationSchema.statics.verifyEmailToken = function (token) {
    return __awaiter(this, void 0, void 0, function* () {
        const verification = yield this.findOne({
            'email.token': token,
            'email.expiresAt': { $gt: new Date() },
        });
        if (!verification) {
            return null;
        }
        verification.email.isVerified = true;
        verification.email.verifiedAt = new Date();
        yield verification.save();
        // Update user's verification status
        const User = mongoose_1.default.model('User');
        yield User.findByIdAndUpdate(verification.user, {
            isEmailVerified: true,
        });
        return verification;
    });
};
const Verification = mongoose_1.default.model('Verification', verificationSchema);
exports.default = Verification;
