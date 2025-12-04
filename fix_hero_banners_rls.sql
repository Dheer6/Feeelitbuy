-- Fix RLS policies for hero_banners table
-- This fixes the "Cannot coerce the result to a single JSON object" error

-- First, check if the table exists and view current policies
SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'hero_banners';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active banners" ON hero_banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON hero_banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON hero_banners;
DROP POLICY IF EXISTS "Admins can update banners" ON hero_banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON hero_banners;

-- Enable RLS on the table
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
ON hero_banners
FOR SELECT
USING (is_active = true);

-- Policy: Admins can view all banners
CREATE POLICY "Admins can view all banners"
ON hero_banners
FOR SELECT
TO authenticated
USING (is_admin());

-- Policy: Admins can insert banners
CREATE POLICY "Admins can insert banners"
ON hero_banners
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Policy: Admins can update banners
CREATE POLICY "Admins can update banners"
ON hero_banners
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Policy: Admins can delete banners
CREATE POLICY "Admins can delete banners"
ON hero_banners
FOR DELETE
TO authenticated
USING (is_admin());

-- Verify the policies were created
SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'hero_banners'
ORDER BY cmd, policyname;
