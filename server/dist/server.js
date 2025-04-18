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
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const supabase_1 = require("./config/supabase");
const imageService_1 = require("./services/imageService");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const promises_1 = __importDefault(require("fs/promises"));
// Import routes
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const earningsRoutes_1 = __importDefault(require("./routes/earningsRoutes"));
const emailVerificationRoutes_1 = __importDefault(require("./routes/emailVerificationRoutes"));
const adminEarningsRoutes_1 = __importDefault(require("./routes/adminEarningsRoutes"));
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            /\.vercel\.app$/,
            'https://openspace-reserve.vercel.app',
            process.env.CLIENT_URL,
        ].filter(Boolean)
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Cache-Control',
        'Pragma',
    ],
    exposedHeaders: ['set-cookie'],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use((req, res, next) => {
    const originalCookie = res.cookie.bind(res);
    res.cookie = function (name, val, options) {
        const cookieOptions = Object.assign({ sameSite: process.env.NODE_ENV === 'production'
                ? 'none'
                : 'lax', secure: process.env.NODE_ENV === 'production', httpOnly: true, path: '/', maxAge: 30 * 24 * 60 * 60 * 1000 }, options);
        console.log(`Setting cookie: ${name}`, cookieOptions);
        // Call original method with our enhanced options
        return originalCookie(name, val, cookieOptions);
    };
    next();
});
// API routes
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use('/api/earnings', earningsRoutes_1.default);
app.use('/api/email-verification', emailVerificationRoutes_1.default);
app.use('/api/admin/earnings', adminEarningsRoutes_1.default);
// Health check route
app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
const createUploadDirs = () => __awaiter(void 0, void 0, void 0, function* () {
    const dirs = [
        './src/uploads',
        './src/uploads/rooms',
        './src/uploads/profiles',
        './src/uploads/verifications',
    ];
    for (const dir of dirs) {
        try {
            yield promises_1.default.access(dir);
        }
        catch (_a) {
            yield promises_1.default.mkdir(dir, { recursive: true });
        }
    }
});
createUploadDirs().catch(console.error);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL not defined in environment variables');
        }
        yield mongoose_1.default.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');
        if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
            yield (0, supabase_1.checkSupabaseConnection)();
            yield (0, imageService_1.initializeStorage)();
        }
        else {
            console.warn('Supabase credentials not found, image storage will not be available');
        }
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
});
startServer();
exports.default = app;
