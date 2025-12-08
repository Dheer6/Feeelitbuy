-- Add color variants and 360° rotation images support to products table

-- Add colors column to store color variants with their images
ALTER TABLE products
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;

-- Add rotation_images column for 360° product viewer
ALTER TABLE products
ADD COLUMN IF NOT EXISTS rotation_images JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN products.colors IS 'Array of color variants: [{name: string, hex: string, stock: number, images: string[]}]';
COMMENT ON COLUMN products.rotation_images IS 'Array of image URLs for 360° product rotation viewer';

-- Create index for better query performance on JSONB columns
CREATE INDEX IF NOT EXISTS idx_products_colors ON products USING GIN (colors);
CREATE INDEX IF NOT EXISTS idx_products_rotation_images ON products USING GIN (rotation_images);
