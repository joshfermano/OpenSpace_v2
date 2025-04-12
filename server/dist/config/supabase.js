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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSupabaseConnection = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
require("dotenv/config");
// Make sure to add these variables to your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'openspace-images';
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
}
// Create Supabase client
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const checkSupabaseConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First, check if we can list buckets
        console.log('Checking Supabase connection...');
        const { data: buckets, error: listError } = yield exports.supabase.storage.listBuckets();
        if (listError) {
            console.error('⚠️ Supabase connection error when listing buckets:', listError.message);
            return false;
        }
        // Check if our bucket exists
        const bucketExists = buckets === null || buckets === void 0 ? void 0 : buckets.some((bucket) => bucket.name === BUCKET_NAME);
        if (!bucketExists) {
            console.warn(`⚠️ Bucket "${BUCKET_NAME}" not found, attempting to create...`);
            // Try to create the bucket if it doesn't exist
            const { error: createError } = yield exports.supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 10485760, // 10MB
            });
            if (createError) {
                console.error(`❌ Failed to create bucket "${BUCKET_NAME}":`, createError.message);
                console.warn(`Please manually create the "${BUCKET_NAME}" bucket in your Supabase dashboard.`);
                return false;
            }
            else {
                console.log(`✅ Successfully created bucket "${BUCKET_NAME}"`);
            }
        }
        else {
            console.log(`✅ Found bucket "${BUCKET_NAME}"`);
        }
        // Update bucket settings to ensure it's public
        const { error: updateError } = yield exports.supabase.storage.updateBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
        });
        if (updateError) {
            console.error(`⚠️ Failed to update bucket settings:`, updateError.message);
        }
        else {
            console.log(`✅ Bucket settings updated successfully`);
        }
        console.log('✅ Supabase connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Failed to connect to Supabase:', error);
        return false;
    }
});
exports.checkSupabaseConnection = checkSupabaseConnection;
