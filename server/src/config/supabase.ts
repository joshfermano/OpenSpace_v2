import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Make sure to add these variables to your .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'openspace-images';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl as string,
  supabaseKey as string
);

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // First, check if we can list buckets
    console.log('Checking Supabase connection...');

    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error(
        '⚠️ Supabase connection error when listing buckets:',
        listError.message
      );
      return false;
    }

    // Check if our bucket exists
    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      console.warn(
        `⚠️ Bucket "${BUCKET_NAME}" not found, attempting to create...`
      );

      // Try to create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(
        BUCKET_NAME,
        {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        }
      );

      if (createError) {
        console.error(
          `❌ Failed to create bucket "${BUCKET_NAME}":`,
          createError.message
        );
        console.warn(
          `Please manually create the "${BUCKET_NAME}" bucket in your Supabase dashboard.`
        );
        return false;
      } else {
        console.log(`✅ Successfully created bucket "${BUCKET_NAME}"`);
      }
    } else {
      console.log(`✅ Found bucket "${BUCKET_NAME}"`);
    }

    // Update bucket settings to ensure it's public
    const { error: updateError } = await supabase.storage.updateBucket(
      BUCKET_NAME,
      {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      }
    );

    if (updateError) {
      console.error(
        `⚠️ Failed to update bucket settings:`,
        updateError.message
      );
    } else {
      console.log(`✅ Bucket settings updated successfully`);
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error);
    return false;
  }
};
