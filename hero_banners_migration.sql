-- Create hero_banners table for homepage carousel management
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  cta_text TEXT NOT NULL DEFAULT 'Shop Now',
  cta_link TEXT NOT NULL DEFAULT '/catalog',
  bg_gradient TEXT NOT NULL DEFAULT 'from-indigo-600 via-purple-600 to-pink-600',
  offer_badge TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Public can view active banners"
  ON hero_banners
  FOR SELECT
  USING (is_active = true);

-- Admins can manage all banners
CREATE POLICY "Admins can manage all banners"
  ON hero_banners
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_hero_banners_display_order 
  ON hero_banners(display_order, created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hero_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER hero_banners_updated_at
  BEFORE UPDATE ON hero_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_banners_updated_at();

-- Insert default banners
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
