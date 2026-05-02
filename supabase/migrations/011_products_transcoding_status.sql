-- Migration: 011_products_transcoding_status
-- Adds a transcoding lifecycle column so the storefront and admin UI can
-- distinguish between a video that is still processing vs. one ready to stream.
--
-- State machine:
--   NULL        → no video attached to this product
--   'processing' → MediaConvert job queued / running
--   'complete'  → job finished; HLS segments are in dehairvault-stream
--   'error'     → job failed; admin must re-upload

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS transcoding_status text DEFAULT NULL
  CONSTRAINT transcoding_status_values
    CHECK (transcoding_status IN ('processing', 'complete', 'error'));

-- Partial index so the admin dashboard can quickly find stuck jobs.
CREATE INDEX IF NOT EXISTS idx_products_transcoding_status
  ON products (transcoding_status)
  WHERE transcoding_status IS NOT NULL;

COMMENT ON COLUMN products.transcoding_status IS
  'Lifecycle state of the AWS MediaConvert HLS transcoding job. '
  'NULL = no video. processing = job running. complete = ready to stream. '
  'error = job failed.';
