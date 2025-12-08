# Quick Setup Guide - Review Images Feature

## Error: "Bucket not found"

This means the Supabase Storage bucket hasn't been created yet. Follow these steps:

## Option 1: Manual Setup via Supabase Dashboard (RECOMMENDED)

### Step 1: Create Storage Bucket
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name**: `reviews`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`
6. Click **Create bucket**

### Step 2: Set Storage Policies
1. Click on the `reviews` bucket you just created
2. Click **Policies** tab
3. Click **New policy**

**Policy 1: Upload (INSERT)**
- **Policy name**: `Authenticated users can upload review images`
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **USING expression**: (leave empty)
- **WITH CHECK expression**: 
  ```sql
  bucket_id = 'reviews'
  ```

**Policy 2: View (SELECT)**
- **Policy name**: `Anyone can view review images`
- **Allowed operation**: SELECT
- **Target roles**: public
- **USING expression**: 
  ```sql
  bucket_id = 'reviews'
  ```

**Policy 3: Delete (DELETE)**
- **Policy name**: `Users can delete their own review images`
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **USING expression**: 
  ```sql
  bucket_id = 'reviews' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

### Step 3: Add Images Column to Reviews Table
1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New query**
3. Paste this SQL:
   ```sql
   ALTER TABLE reviews 
   ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
   ```
4. Click **Run**

### Step 4: Test
1. Refresh your Feel It Buy website
2. Go to any product you've purchased
3. Try submitting a review with images
4. It should work now! ✅

---

## Option 2: SQL Script (Alternative)

If you prefer SQL:

1. Go to **SQL Editor** in Supabase Dashboard
2. Open the file: `setup_review_images.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run**

**Note**: The storage bucket creation via SQL might not work in some Supabase versions. If you get an error, use Option 1 (manual setup) for the Storage bucket only, then run just the ALTER TABLE command from SQL.

---

## Verification

After setup, check these:

1. **Storage bucket exists**:
   - Go to Storage → You should see `reviews` bucket
   - It should show as "Public"

2. **Reviews table has images column**:
   - Go to Table Editor → `reviews` table
   - You should see an `images` column (type: text[])

3. **Policies are set**:
   - Go to Storage → `reviews` bucket → Policies
   - You should see 3 policies (INSERT, SELECT, DELETE)

---

## Common Issues

### "Bucket not found" - SOLUTION:
Create the bucket via Dashboard (Option 1, Step 1)

### "Permission denied" - SOLUTION:
Check policies are created correctly (Option 1, Step 2)

### "File too large" - SOLUTION:
Images must be under 5MB. Compress images before uploading.

### Images not displaying - SOLUTION:
1. Ensure bucket is PUBLIC (checkbox enabled)
2. Check browser console for errors
3. Verify image URLs in database start with `https://`

---

## Current Status

✅ Code is ready (ProductDetail.tsx, supabaseService.ts)  
❌ Database setup needed (follow steps above)  

Once you complete the setup, the review images feature will work immediately!
