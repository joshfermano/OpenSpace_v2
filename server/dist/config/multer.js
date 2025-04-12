"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../../temp-uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Create subdirectories for different types of uploads
['profiles', 'rooms', 'reviews', 'verifications'].forEach((dir) => {
    const subDir = path_1.default.join(uploadsDir, dir);
    if (!fs_1.default.existsSync(subDir)) {
        fs_1.default.mkdirSync(subDir, { recursive: true });
    }
});
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        // Different folders for different types of uploads
        if (file.fieldname === 'photos') {
            cb(null, path_1.default.join(uploadsDir, 'reviews'));
        }
        else if (file.fieldname === 'profileImage') {
            cb(null, path_1.default.join(uploadsDir, 'profiles'));
        }
        else if (file.fieldname === 'images') {
            cb(null, path_1.default.join(uploadsDir, 'rooms'));
        }
        else {
            cb(null, uploadsDir);
        }
    },
    filename: (_req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = (0, uuid_1.v4)();
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});
// File filter
const fileFilter = (_req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
// Configure upload middleware
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
exports.default = upload;
