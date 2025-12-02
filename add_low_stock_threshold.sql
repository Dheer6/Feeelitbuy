-- Add low_stock_threshold column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- Add a comment to document the column
COMMENT ON COLUMN products.low_stock_threshold IS 'Alert threshold - notify when stock falls below this number';

-- Update existing products to have a default threshold of 10
UPDATE products
SET low_stock_threshold = 10
WHERE low_stock_threshold IS NULL;
