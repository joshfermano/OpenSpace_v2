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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Earnings_1 = __importDefault(require("../models/Earnings"));
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGO_URL || '')
    .then(() => {
    console.log('Connected to MongoDB');
    migrateEarnings();
})
    .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
function migrateEarnings() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Starting earnings migration...');
            // Find all earnings from online payments that are still pending
            const earningsToUpdate = yield Earnings_1.default.find({
                paymentMethod: { $in: ['card', 'gcash', 'maya'] },
                status: 'pending',
            });
            console.log(`Found ${earningsToUpdate.length} earnings to update...`);
            let updatedCount = 0;
            for (const earning of earningsToUpdate) {
                // Update to available status with immediate availability
                earning.status = 'available';
                earning.availableDate = new Date();
                yield earning.save();
                updatedCount++;
                if (updatedCount % 10 === 0) {
                    console.log(`Updated ${updatedCount} records so far...`);
                }
            }
            console.log(`Successfully updated ${updatedCount} earnings to available status.`);
            console.log('Migration completed!');
            process.exit(0);
        }
        catch (error) {
            console.error('Error during migration:', error);
            process.exit(1);
        }
    });
}
