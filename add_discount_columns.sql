-- Add discount columns to products table
-- This migration adds support for product discounts

-- Add discount percentage column (0-100)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2) DEFAULT NULL;

-- Add original_price column to track pre-discount price
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2) DEFAULT NULL;

-- Add comments to explain the columns
COMMENT ON COLUMN products.discount IS 'Discount percentage (0-100). NULL means no discount.';
COMMENT ON COLUMN products.original_price IS 'Original price before discount. NULL means no discount applied.';

-- Add a check constraint to ensure discount is between 0 and 100
ALTER TABLE products 
ADD CONSTRAINT check_discount_range 
CHECK (discount IS NULL OR (discount >= 0 AND discount <= 100));

-- Add a check constraint to ensure original_price is greater than or equal to current price when set
ALTER TABLE products 
ADD CONSTRAINT check_original_price 
CHECK (original_price IS NULL OR original_price >= price);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products' 
  AND column_name IN ('discount', 'original_price')
ORDER BY column_name;
