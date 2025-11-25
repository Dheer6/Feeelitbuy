# Discount Feature - Setup Complete ✅

## Database Migration Applied

The following columns have been successfully added to the `products` table:

1. **discount** (DECIMAL 5,2) - Stores discount percentage (0-100)
2. **original_price** (DECIMAL 10,2) - Stores the original price before discount

## Schema Constraints Added

- `check_discount_range`: Ensures discount is between 0 and 100
- `check_original_price`: Ensures original_price >= current price when set

## Schema Cache Refreshed

A schema reload notification has been sent to PostgREST to refresh the API cache.

## How to Use

### In Admin Dashboard:

1. Go to **Admin Dashboard → Products**
2. Click **Add Product** or **Edit** an existing product
3. You'll see a new **Discount (Optional)** section with:
   - Discount Type dropdown: No Discount | Percentage (%) | Fixed Amount (₹)
   - Discount Value input field
   - Live preview showing Original Price, Discounted Price, and Savings

### Setting Discounts:

**Option 1: Percentage Discount**
- Price: ₹8,000 (final price customers pay)
- Discount Type: Percentage (%)
- Discount Value: 20
- Result: Original Price = ₹10,000, Save ₹2,000 (20%)

**Option 2: Fixed Amount Discount**
- Price: ₹8,000 (final price customers pay)  
- Discount Type: Fixed Amount (₹)
- Discount Value: 2000
- Result: Original Price = ₹10,000, Save ₹2,000 (20%)

## Troubleshooting

If you still see the schema cache error:

1. **Hard Refresh the Browser**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Restart Dev Server**: Stop the terminal (`Ctrl + C`) and run `npm run dev` again
3. **Clear Browser Cache**: In DevTools, go to Application → Clear Storage → Clear site data

## Testing the Feature

Try adding a product with a discount:
1. Go to Admin → Products → Add Product
2. Fill in: Name, Description, Price (e.g., 5000), Stock
3. Set Discount Type to "Percentage (%)" and Value to "20"
4. You should see the preview: Original Price: ₹6,250, Discounted: ₹5,000, Save: 20% (₹1,250)
5. Click Save

The product should now appear with a discount badge on the homepage!

## Frontend Display

Products with discounts will automatically show:
- ❌ **Strike-through original price**
- ✅ **Discount badge** (e.g., "20% OFF")
- ⚡ **"Only X left" badge** for low stock
- 🔥 **Featured in "Hot Deals" section** (for discounts > 20%)
