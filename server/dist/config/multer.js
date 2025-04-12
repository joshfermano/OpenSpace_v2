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
exports.tempUpload = exports.reviewUpload = exports.idUpload = exports.roomUpload = exports.profileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// Create the upload directories if they don't exist
const createUploadDirs = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield promises_1.default.mkdir('./uploads/profiles', { recursive: true });
        yield promises_1.default.mkdir('./uploads/rooms', { recursive: true });
        yield promises_1.default.mkdir('./uploads/ids', { recursive: true });
        yield promises_1.default.mkdir('./uploads/reviews', { recursive: true });
        yield promises_1.default.mkdir('./temp-uploads', { recursive: true });
    }
    catch (err) {
        console.error('Error creating upload directories:', err);
    }
});
createUploadDirs();
// Profile image upload storage
const profileStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Room image upload storage
const roomStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/rooms/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// ID verification document upload storage
const idStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/ids/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'id-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Review photos upload storage
const reviewStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/reviews/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'review-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// Temporary upload storage
const tempStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'temp-uploads/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'temp-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// File filter for images only
const imageFileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'), false);
    }
};
// Create the multer upload objects
const profileUpload = (0, multer_1.default)({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: imageFileFilter,
});
exports.profileUpload = profileUpload;
const roomUpload = (0, multer_1.default)({
    storage: roomStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: imageFileFilter,
});
exports.roomUpload = roomUpload;
const idUpload = (0, multer_1.default)({
    storage: idStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: imageFileFilter,
});
exports.idUpload = idUpload;
const reviewUpload = (0, multer_1.default)({
    storage: reviewStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: imageFileFilter,
});
exports.reviewUpload = reviewUpload;
const tempUpload = (0, multer_1.default)({
    storage: tempStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});
exports.tempUpload = tempUpload;
