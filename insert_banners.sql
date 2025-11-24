-- Just insert sample banners (run this if table already exists)
INSERT INTO hero_banners (title, subtitle, description, image_url, cta_text, cta_link, bg_gradient, offer_badge, display_order, is_active) VALUES
(
  'Mega Summer Sale',
  'Up to 50% Off',
  'Shop the hottest deals on electronics, fashion, and home essentials. Limited time offers!',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80',
  'Shop Now',
  '/catalog',
  'from-indigo-600 via-purple-600 to-pink-600',
  '50% OFF',
  1,
  true
),
(
  'New Arrivals',
  'Latest Collection 2024',
  'Discover the newest products across all categories. Be the first to own them!',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
  'Explore Now',
  '/catalog',
  'from-rose-500 via-red-600 to-orange-600',
  'NEW',
  2,
  true
),
(
  'Premium Electronics',
  'Tech That Inspires',
  'Experience cutting-edge technology with our curated selection of premium gadgets and devices.',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&q=80',
  'Shop Electronics',
  '/catalog?category=electronics',
  'from-blue-600 via-cyan-600 to-teal-600',
  'EXCLUSIVE',
  3,
  true
),
(
  'Home & Living',
  'Transform Your Space',
  'Beautiful furniture and decor to make your house a home. Free shipping on orders above ₹2999!',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80',
  'Shop Home',
  '/catalog?category=furniture',
  'from-amber-600 via-orange-600 to-red-600',
  'FREE SHIPPING',
  4,
  true
);
