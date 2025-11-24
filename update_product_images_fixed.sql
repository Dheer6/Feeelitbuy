-- Update product images with high-quality Unsplash images (image_url only)

-- Electronics
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
WHERE name ILIKE '%headphone%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80'
WHERE name ILIKE '%tv%' OR name ILIKE '%television%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80'
WHERE name ILIKE '%laptop%' OR name ILIKE '%computer%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
WHERE name ILIKE '%phone%' OR name ILIKE '%smartphone%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'
WHERE name ILIKE '%earbud%' OR name ILIKE '%airpod%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'
WHERE name ILIKE '%watch%' OR name ILIKE '%smartwatch%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1585790050230-5dd28404f1e4?w=800&q=80'
WHERE name ILIKE '%camera%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'
WHERE name ILIKE '%tablet%' OR name ILIKE '%ipad%';

-- Furniture
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
WHERE name ILIKE '%sofa%' OR name ILIKE '%couch%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80'
WHERE name ILIKE '%desk%' AND (name ILIKE '%office%' OR name ILIKE '%executive%');

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80'
WHERE name ILIKE '%chair%' AND (name ILIKE '%office%' OR name ILIKE '%ergonomic%');

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80'
WHERE name ILIKE '%bed%' OR name ILIKE '%mattress%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80'
WHERE name ILIKE '%dining%' OR name ILIKE '%table%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80'
WHERE name ILIKE '%bookshelf%' OR name ILIKE '%shelf%' OR name ILIKE '%storage%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80'
WHERE name ILIKE '%wardrobe%' OR name ILIKE '%closet%';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
WHERE name ILIKE '%armchair%' OR name ILIKE '%recliner%';

-- Generic fallback for any products without images
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
WHERE image_url IS NULL OR image_url = '';
