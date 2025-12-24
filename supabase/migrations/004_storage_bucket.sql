-- Storage bucket and policies for product images
-- This creates the bucket and sets up policies for admin image uploads

-- Create the product-images bucket if it doesn't exist
-- Note: Buckets are created via Supabase dashboard or supabase-js, not SQL
-- This migration sets up the RLS policies for the bucket

-- The bucket needs to be created manually in Supabase Dashboard:
-- 1. Go to Storage in your Supabase project
-- 2. Create a new bucket called "product-images"
-- 3. Set it to "Public" for read access

-- Storage policies for the product-images bucket
-- These policies should be applied after bucket creation

-- Allow public read access to all files in product-images bucket
INSERT INTO storage.policies (name, bucket_id, definition, check_expression)
SELECT 
  'Public Read Access',
  'product-images',
  '{"statement": {"effect": "allow"}}',
  'true'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'product-images' AND name = 'Public Read Access'
);

-- Alternative: Use Supabase Dashboard or CLI to set these policies:
-- 
-- For authenticated admins to upload:
-- Policy Name: Admin Upload
-- Allowed operation: INSERT
-- Policy definition: ((bucket_id = 'product-images'::text) AND (auth.role() = 'authenticated'::text))
--
-- For public read:
-- Policy Name: Public Read
-- Allowed operation: SELECT  
-- Policy definition: (bucket_id = 'product-images'::text)
--
-- For admins to delete:
-- Policy Name: Admin Delete
-- Allowed operation: DELETE
-- Policy definition: ((bucket_id = 'product-images'::text) AND (auth.role() = 'authenticated'::text))

-- IMPORTANT: The actual bucket creation must be done via:
-- 1. Supabase Dashboard > Storage > New bucket > "product-images" (Public)
-- 2. Or via Supabase CLI: supabase storage create product-images --public
-- 3. Or via supabase-js: supabase.storage.createBucket('product-images', { public: true })
