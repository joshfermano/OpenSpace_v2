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
exports.connectDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connectionString = process.env.MONGO_URL;
        yield mongoose_1.default.connect(connectionString);
        mongoose_1.default.connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
        });
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
            yield mongoose_1.default.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        }));
        return true;
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        return false;
    }
});
exports.connectDb = connectDb;
