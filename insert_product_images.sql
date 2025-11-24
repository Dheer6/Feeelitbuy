-- Insert product images into product_images table
-- First, we need to get product IDs. This assumes products exist in the database.

-- Headphones
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', true, 1, 'Premium Wireless Headphones'
FROM products WHERE name ILIKE '%headphone%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', false, 2, 'Headphones Side View'
FROM products WHERE name ILIKE '%headphone%' LIMIT 1;

-- TV
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80', true, 1, '4K Smart LED TV'
FROM products WHERE name ILIKE '%tv%' OR name ILIKE '%television%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1593359863503-f598bb7c4e6a?w=800&q=80', false, 2, 'Smart TV Display'
FROM products WHERE name ILIKE '%tv%' OR name ILIKE '%television%' LIMIT 1;

-- Laptop
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80', true, 1, 'Gaming Laptop'
FROM products WHERE name ILIKE '%laptop%' OR name ILIKE '%computer%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80', false, 2, 'Laptop Keyboard'
FROM products WHERE name ILIKE '%laptop%' OR name ILIKE '%computer%' LIMIT 1;

-- Smartphone
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', true, 1, 'Smartphone'
FROM products WHERE name ILIKE '%phone%' OR name ILIKE '%smartphone%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1592286927505-b0c2fc0dd8f7?w=800&q=80', false, 2, 'Phone Back View'
FROM products WHERE name ILIKE '%phone%' OR name ILIKE '%smartphone%' LIMIT 1;

-- Earbuds
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', true, 1, 'Wireless Earbuds'
FROM products WHERE name ILIKE '%earbud%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80', false, 2, 'Earbuds Case'
FROM products WHERE name ILIKE '%earbud%' LIMIT 1;

-- Smartwatch
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80', true, 1, 'Smart Watch'
FROM products WHERE name ILIKE '%watch%' OR name ILIKE '%smartwatch%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', false, 2, 'Watch Display'
FROM products WHERE name ILIKE '%watch%' OR name ILIKE '%smartwatch%' LIMIT 1;

-- Sofa
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', true, 1, 'L-Shaped Sofa'
FROM products WHERE name ILIKE '%sofa%' OR name ILIKE '%couch%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', false, 2, 'Sofa Detail'
FROM products WHERE name ILIKE '%sofa%' OR name ILIKE '%couch%' LIMIT 1;

-- Office Desk
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80', true, 1, 'Executive Desk'
FROM products WHERE name ILIKE '%desk%' AND (name ILIKE '%office%' OR name ILIKE '%executive%') LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80', false, 2, 'Desk Setup'
FROM products WHERE name ILIKE '%desk%' AND (name ILIKE '%office%' OR name ILIKE '%executive%') LIMIT 1;

-- Office Chair
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80', true, 1, 'Ergonomic Office Chair'
FROM products WHERE name ILIKE '%chair%' AND (name ILIKE '%office%' OR name ILIKE '%ergonomic%') LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80', false, 2, 'Chair Detail'
FROM products WHERE name ILIKE '%chair%' AND (name ILIKE '%office%' OR name ILIKE '%ergonomic%') LIMIT 1;

-- Bed
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', true, 1, 'King Size Bed'
FROM products WHERE name ILIKE '%bed%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&q=80', false, 2, 'Bedroom Setup'
FROM products WHERE name ILIKE '%bed%' LIMIT 1;

-- Dining Table
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80', true, 1, 'Dining Table Set'
FROM products WHERE name ILIKE '%dining%' OR name ILIKE '%table%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80', false, 2, 'Dining Room'
FROM products WHERE name ILIKE '%dining%' OR name ILIKE '%table%' LIMIT 1;

-- Bookshelf
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80', true, 1, 'Bookshelf Storage'
FROM products WHERE name ILIKE '%bookshelf%' OR name ILIKE '%shelf%' LIMIT 1;

INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT id, 'https://images.unsplash.com/photo-1588286292446-45744d37be8e?w=800&q=80', false, 2, 'Shelf Detail'
FROM products WHERE name ILIKE '%bookshelf%' OR name ILIKE '%shelf%' LIMIT 1;
