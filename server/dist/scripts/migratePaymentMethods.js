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
const Booking_1 = __importDefault(require("../models/Booking"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function migratePaymentMethods() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGO_URL);
            // Update all creditCard payment methods to card
            yield Booking_1.default.updateMany({ paymentMethod: 'creditCard' }, { $set: { paymentMethod: 'card' } });
            console.log('Payment methods migration completed successfully');
            process.exit(0);
        }
        catch (error) {
            console.error('Error migrating payment methods:', error);
            process.exit(1);
        }
    });
}
migratePaymentMethods();
