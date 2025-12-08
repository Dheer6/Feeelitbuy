# Review System Setup Guide

## Features Implemented

### 1. Purchase Verification
- Only users who have purchased a product can write reviews
- System checks `order_items` table for matching user_id and product_id
- Shows friendly message to non-purchasers: "Only verified purchasers can write reviews"

### 2. Image Upload for Reviews
- Users can upload up to 5 images per review
- Images are stored in Supabase Storage bucket 'reviews'
- Image previews shown before submission
- Uploaded images displayed with reviews (clickable to open full-size)

### 3. User Experience
- **Not logged in**: Shows "Please log in to write a review" message
- **Logged in but not purchased**: Shows amber warning with purchase prompt
- **Verified purchaser**: Full review form with star rating, text, and image upload

## Database Setup

### Step 1: Run the Migration
Execute the SQL migration file to add support for review images:

```bash
# File: supabase_migrations/add_review_images_support.sql
```

This migration:
1. Adds `images` column (TEXT array) to `reviews` table
2. Creates Supabase Storage bucket named 'reviews' (public)
3. Sets up storage policies:
   - Authenticated users can upload images
   - Anyone can view images
   - Users can delete their own images

### Step 2: Verify Database Changes

Run this query in Supabase SQL Editor to verify:

```sql
-- Check reviews table has images column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' AND column_name = 'images';

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'reviews';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

## Code Changes

### 1. supabaseService.ts
- **orderService.hasUserPurchasedProduct()**: Checks if user purchased product
  - Queries `order_items` table
  - Joins with `orders` table
  - Checks order status (pending, processing, shipped, delivered)
  
- **reviewService.createReview()**: Updated to accept image URLs
  - New parameter: `imageUrls?: string[]`
  - Stores images in `reviews.images` column

- **reviewService.uploadReviewImage()**: New function
  - Uploads image to Supabase Storage 'reviews' bucket
  - Returns public URL
  - File naming: `{userId}_{timestamp}.{extension}`

### 2. ProductDetail.tsx
- **New Props**: Added `currentUser: User | null`
- **New State Variables**:
  - `hasPurchased`: Boolean from purchase verification
  - `checkingPurchase`: Loading state for purchase check
  - `reviewImages`: Array of File objects
  - `imagePreviewUrls`: Array of preview URLs
  - `uploadingImages`: Loading state for image uploads

- **Purchase Check useEffect**: Runs when component loads
  - Calls `orderService.hasUserPurchasedProduct()`
  - Updates `hasPurchased` state

- **Image Handling Functions**:
  - `handleImageSelect()`: Adds images with 5-image limit
  - `handleRemoveImage()`: Removes image and revokes preview URL

- **Review Form**: Conditional rendering
  - Shows different UI based on auth and purchase status
  - Image upload section with drag-and-drop UI
  - Preview grid with remove buttons
  - Upload progress indicator

- **Review Display**: Shows review images
  - Clickable thumbnails (20x20 grid)
  - Opens full-size in new tab

### 3. App.tsx
- Passes `currentUser` prop to `ProductDetail` component

## Usage Instructions

### For Users

1. **Browse Product**: Navigate to any product detail page
2. **Purchase Product**: Complete a purchase to unlock review access
3. **Write Review**:
   - Scroll to "Reviews" tab
   - Rate with star rating (1-5)
   - Write review text
   - (Optional) Add up to 5 photos
   - Click "Submit Review"

### For Developers

#### Testing Purchase Verification

```javascript
// In browser console, check purchase status
const { orderService } = await import('./lib/supabaseService');
const hasPurchased = await orderService.hasUserPurchasedProduct(
  'user-uuid-here',
  'product-uuid-here'
);
console.log('Has purchased:', hasPurchased);
```

#### Testing Image Upload

```javascript
// In browser console, test image upload
const { reviewService } = await import('./lib/supabaseService');
const file = /* get File object from input */;
const userId = 'user-uuid';
const imageUrl = await reviewService.uploadReviewImage(file, userId);
console.log('Uploaded to:', imageUrl);
```

## Storage Configuration

### Bucket Details
- **Name**: `reviews`
- **Public**: Yes (anyone can view)
- **Path Structure**: `review-images/{userId}_{timestamp}.{ext}`

### Storage Policies

1. **Upload Policy**: Authenticated users only
   ```sql
   bucket_id = 'reviews' AND auth.role() = 'authenticated'
   ```

2. **View Policy**: Public access
   ```sql
   bucket_id = 'reviews'
   ```

3. **Delete Policy**: Own images only
   ```sql
   bucket_id = 'reviews' AND (storage.foldername(name))[1] = auth.uid()::text
   ```

## Troubleshooting

### Issue: "Only verified purchasers can write reviews" shows incorrectly

**Solution**: Check order status in database
```sql
SELECT o.status, oi.product_id 
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 'user-uuid' 
AND oi.product_id = 'product-uuid';
```

Order status must be: `pending`, `processing`, `shipped`, or `delivered`  
Cancelled or refunded orders don't count.

### Issue: Image upload fails

**Solutions**:
1. Check storage bucket exists: `SELECT * FROM storage.buckets WHERE id = 'reviews';`
2. Verify bucket is public: `UPDATE storage.buckets SET public = true WHERE id = 'reviews';`
3. Check storage policies are created (see migration file)
4. Ensure user is authenticated

### Issue: Images not displaying

**Solutions**:
1. Check `reviews.images` column contains URLs
2. Verify bucket is public
3. Check browser console for CORS errors
4. Ensure public URL format: `https://{project}.supabase.co/storage/v1/object/public/reviews/{path}`

## Security Considerations

1. **Purchase Verification**: Server-side check prevents fake reviews
2. **Authenticated Uploads**: Only logged-in users can upload
3. **Image Validation**: Client-side accepts `image/*` only
4. **Rate Limiting**: Consider adding rate limits for review submissions
5. **Image Size**: Consider adding file size limits (recommend 5MB max)

## Future Enhancements

1. **Image Compression**: Auto-compress images before upload
2. **Multiple Image Sizes**: Generate thumbnails for faster loading
3. **Review Editing**: Allow users to edit their reviews
4. **Review Voting**: Helpful/not helpful voting
5. **Verified Purchase Badge**: Show badge on reviews from purchasers
6. **Image Moderation**: Admin review of uploaded images
7. **Review Guidelines**: Terms and guidelines modal

## API Reference

### orderService.hasUserPurchasedProduct()
```typescript
async hasUserPurchasedProduct(
  userId: string, 
  productId: string
): Promise<boolean>
```

### reviewService.createReview()
```typescript
async createReview(
  productId: string,
  rating: number,
  comment: string,
  imageUrls?: string[]
): Promise<Review>
```

### reviewService.uploadReviewImage()
```typescript
async uploadReviewImage(
  file: File,
  userId: string
): Promise<string>
```

## Database Schema

### reviews table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',  -- New column
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Storage Structure
```
reviews/
└── review-images/
    ├── {userId1}_{timestamp1}.jpg
    ├── {userId1}_{timestamp2}.png
    ├── {userId2}_{timestamp3}.jpg
    └── ...
```
