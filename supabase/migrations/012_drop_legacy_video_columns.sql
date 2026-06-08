-- Migration: 012_drop_legacy_video_columns
-- Drop video_url and video_urls columns from the products table.
--
-- These were used by the original Cloudinary video pipeline and have not been
-- referenced in any application code since the AWS S3 + MediaConvert + CloudFront
-- HLS pipeline was introduced (hls_output_key added in migration 010).
--
-- After applying this migration, regenerate types/database.types.ts via:
--   npx supabase gen types typescript --linked > types/database.types.ts

ALTER TABLE products
  DROP COLUMN IF EXISTS video_url,
  DROP COLUMN IF EXISTS video_urls;
