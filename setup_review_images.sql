-- IMPORTANT: Run this in your Supabase SQL Editor
-- This will set up the review images feature

-- Step 1: Add images column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Step 2: Create storage bucket for review images
-- Note: This INSERT might fail if done via SQL. If it fails, create the bucket via Supabase Dashboard instead.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reviews', 
  'reviews', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Step 3: Set up storage policies for review images

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own review images" ON storage.objects;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reviews');

-- Allow anyone to view review images (public bucket)
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reviews');

-- Allow users to delete their own review images
CREATE POLICY "Users can delete their own review images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reviews' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 4: Verify setup
SELECT 
  'Reviews table has images column' as check_name,
  EXISTS(
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'reviews' 
    AND column_name = 'images'
  ) as status;

SELECT 
  'Storage bucket exists' as check_name,
  EXISTS(
    SELECT 1 
    FROM storage.buckets 
    WHERE id = 'reviews'
  ) as status;

COMMENT ON COLUMN reviews.images IS 'Array of image URLs for review photos (max 5)';
