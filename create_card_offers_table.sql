-- Create card_offers table for bank offers management
-- Note: Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS card_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type VARCHAR(100) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'flat')) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  terms TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_card_offers_active ON card_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_card_offers_validity ON card_offers(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_card_offers_bank ON card_offers(bank_name);

-- Enable Row Level Security
ALTER TABLE card_offers ENABLE ROW LEVEL SECURITY;

-- Allow public to view active offers
CREATE POLICY "Public can view active offers"
  ON card_offers
  FOR SELECT
  USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Allow admins to manage all offers (update this to match your admin check)
CREATE POLICY "Admins can manage all offers"
  ON card_offers
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_card_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_offers_updated_at_trigger
  BEFORE UPDATE ON card_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_card_offers_updated_at();
