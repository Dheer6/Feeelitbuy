-- Add images column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for review images

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

COMMENT ON COLUMN reviews.images IS 'Array of image URLs for review photos';
