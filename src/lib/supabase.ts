import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'admin';
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  stock: number;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address_id: string | null;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type Wishlist = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  variant_name: string;
  attributes: Record<string, any>;
  price_adjustment: number;
  stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  alt_text: string | null;
  created_at: string;
};

export type InventoryTransaction = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  transaction_type: 'restock' | 'sale' | 'return' | 'adjustment' | 'reserved';
  quantity_change: number;
  quantity_after: number;
  reason: string | null;
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  applicable_categories: string[] | null;
  applicable_products: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CouponUsage = {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string | null;
  discount_amount: number;
  created_at: string;
};

export type Payment = {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider: string | null;
  provider_payment_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  failure_reason: string | null;
  metadata: Record<string, any>;
  processed_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HeroBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string;
  bg_gradient: string;
  offer_badge: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};
