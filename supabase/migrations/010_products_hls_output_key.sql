-- Migration: 010_products_hls_output_key
-- Adds hls_output_key to products so the storefront can construct the
-- CloudFront .m3u8 playlist URL for AWS-transcoded videos.
--
-- Playback URL pattern (assemble in the player component):
--   https://<NEXT_PUBLIC_CLOUDFRONT_STREAM_URL>/<hls_output_key>/hls/index.m3u8
--
-- hls_output_key is set by the admin upload flow after startVideoTranscoding()
-- returns successfully. It is null for products that have no AWS-hosted video.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hls_output_key text DEFAULT NULL;

-- Index: product detail pages look up a product by slug then read hls_output_key.
-- No extra index needed — slug already has a unique index from the initial schema.
-- Adding a partial index so we can quickly find all products that have an HLS video
-- (useful for admin dashboards / reprocessing jobs in future).
CREATE INDEX IF NOT EXISTS idx_products_hls_output_key
  ON products (hls_output_key)
  WHERE hls_output_key IS NOT NULL;

COMMENT ON COLUMN products.hls_output_key IS
  'AWS MediaConvert output key prefix, e.g. "videos/1234-myvideo". '
  'Combine with NEXT_PUBLIC_CLOUDFRONT_STREAM_URL to build the .m3u8 URL. '
  'NULL means no AWS-hosted HLS video is attached to this product.';
