-- Delete existing product images first (clean slate)
DELETE FROM product_images;

-- Insert product images based on product names
-- This script handles multiple products by inserting images for each product ID

-- For each product type, we'll insert 2-3 high-quality images

-- ELECTRONICS PRODUCTS
-- Headphones
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%headphone%' OR LOWER(name) LIKE '%headset%';

-- TV/Television
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1593359863503-f598bb7c4e6a?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1552975084-6e027cd345c2?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%tv%' OR LOWER(name) LIKE '%television%' OR LOWER(name) LIKE '%smart tv%';

-- Laptops/Computers
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%computer%' OR LOWER(name) LIKE '%notebook%';

-- Smartphones/Phones
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1592286927505-b0c2fc0dd8f7?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%phone%' OR LOWER(name) LIKE '%smartphone%' OR LOWER(name) LIKE '%mobile%';

-- Earbuds/Airpods
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%earbud%' OR LOWER(name) LIKE '%airpod%' OR LOWER(name) LIKE '%earphone%';

-- Smartwatches
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%watch%' OR LOWER(name) LIKE '%smartwatch%';

-- Cameras
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1585790050230-5dd28404f1e4?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%camera%';

-- Tablets
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%tablet%' OR LOWER(name) LIKE '%ipad%';

-- FURNITURE PRODUCTS
-- Sofas/Couches
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%sofa%' OR LOWER(name) LIKE '%couch%';

-- Desks
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%desk%';

-- Chairs
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%chair%';

-- Beds
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%bed%' OR LOWER(name) LIKE '%mattress%';

-- Tables
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1595428773037-51e8c3c9d3dc?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%table%' AND LOWER(name) LIKE '%dining%';

-- Shelves/Bookcases
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1588286292446-45744d37be8e?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%shelf%' OR LOWER(name) LIKE '%bookcase%' OR LOWER(name) LIKE '%storage%';

-- Wardrobes
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    id, 
    CASE 
        WHEN display_order = 1 THEN 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80'
        WHEN display_order = 2 THEN 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80'
        ELSE 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
    END,
    CASE WHEN display_order = 1 THEN true ELSE false END,
    display_order,
    name || ' - Image ' || display_order
FROM products
CROSS JOIN (SELECT 1 AS display_order UNION SELECT 2 UNION SELECT 3) AS orders
WHERE LOWER(name) LIKE '%wardrobe%' OR LOWER(name) LIKE '%closet%' OR LOWER(name) LIKE '%armoire%';

-- Generic fallback for any products without images
INSERT INTO product_images (product_id, image_url, is_primary, display_order, alt_text)
SELECT 
    p.id,
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    true,
    1,
    p.name || ' - Product Image'
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE pi.id IS NULL;

-- Show summary
SELECT 
    p.name, 
    COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name
ORDER BY p.name;
