import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Database types (copied from web project)
export interface Profile {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: 'customer' | 'admin';
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    original_price: number | null;
    discount_percentage: number | null;
    category: 'electronics' | 'furniture';
    subcategory: string;
    brand: string;
    stock: number;
    rating: number;
    reviews_count: number;
    featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductImage {
    id: string;
    product_id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
    alt_text: string | null;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    parent_id: string | null;
    display_order: number;
    created_at: string;
}

export interface CartItem {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: string;
    payment_status: 'pending' | 'completed' | 'paid' | 'failed' | 'refunded';
    shipping_address_id: string;
    tracking_number: string | null;
    estimated_delivery: string | null;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    created_at: string;
}

export interface Address {
    id: string;
    user_id: string;
    full_name: string;
    phone: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    verified_purchase: boolean;
    created_at: string;
    updated_at: string;
}

export interface Wishlist {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
}

export interface HeroBanner {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    image_url: string;
    link_url: string | null;
    button_text: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    sku: string;
    name: string;
    price: number;
    stock: number;
    attributes: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface InventoryTransaction {
    id: string;
    product_id: string | null;
    variant_id: string | null;
    quantity_change: number;
    transaction_type: 'purchase' | 'sale' | 'adjustment' | 'return';
    reason: string | null;
    reference_id: string | null;
    created_at: string;
}

export interface Coupon {
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase_amount: number | null;
    max_discount_amount: number | null;
    usage_limit: number | null;
    usage_count: number;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CouponUsage {
    id: string;
    coupon_id: string;
    user_id: string;
    order_id: string;
    discount_amount: number;
    created_at: string;
}

export interface Payment {
    id: string;
    order_id: string;
    user_id: string;
    amount: number;
    payment_method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    provider_payment_id: string | null;
    provider_response: Record<string, any> | null;
    failure_reason: string | null;
    processed_at: string | null;
    refunded_at: string | null;
    created_at: string;
    updated_at: string;
}
