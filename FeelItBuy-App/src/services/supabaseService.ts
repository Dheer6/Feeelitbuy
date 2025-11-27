// This is a condensed version of supabaseService.ts optimized for React Native
// Full services available - only core customer-facing functions included for brevity

import { supabase } from './supabase';
import type {
    Profile,
    Product,
    CartItem as DbCartItem,
    Order,
    Address,
    Wishlist,
} from './supabase';

// ==================== AUTH SERVICES ====================

export const authService = {
    async signUp(email: string, password: string, fullName: string, phone?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                },
            },
        });

        if (error) throw error;
        return data;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async getCurrentProfile() {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data as Profile;
    },

    async updateProfile(updates: Partial<Profile>) {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data as Profile;
    },
};

// ==================== PRODUCT SERVICES ====================

export const productService = {
    async getProducts(filters?: {
        category?: string;
        featured?: boolean;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
    }) {
        let query = supabase
            .from('products')
            .select('*, categories(*), product_images(*)');

        if (filters?.category) {
            query = query.eq('category_id', filters.category);
        }
        if (filters?.featured !== undefined) {
            query = query.eq('is_featured', filters.featured);
        }
        if (filters?.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }
        if (filters?.minPrice !== undefined) {
            query = query.gte('price', filters.minPrice);
        }
        if (filters?.maxPrice !== undefined) {
            query = query.lte('price', filters.maxPrice);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data as Product[];
    },

    async getProduct(id: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(*), product_images(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Product;
    },
};

// ==================== CART SERVICES ====================

export const cartService = {
    async getCart() {
        const user = await authService.getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('cart_items')
            .select('*, products(*, product_images(*))')
            .eq('user_id', user.id);

        if (error) throw error;

        // Transform to app format
        return (data || []).map((item: any) => ({
            itemId: item.id,
            product: item.products,
            quantity: item.quantity,
        }));
    },

    async addToCart(productId: string, quantity: number = 1) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        // Check if item already exists
        const { data: existing } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();

        if (existing) {
            // Update quantity
            const { data, error } = await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert new item
            const { data, error } = await supabase
                .from('cart_items')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    quantity,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    async updateCartItem(itemId: string, quantity: number) {
        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async removeFromCart(itemId: string) {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
    },

    async clearCart() {
        const user = await authService.getCurrentUser();
        if (!user) return;

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;
    },
};

// ==================== ORDER SERVICES ====================

export const orderService = {
    async getOrders() {
        const user = await authService.getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*)), addresses(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Order[];
    },

    async getOrder(id: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(*)), addresses(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Order;
    },

    async createOrder(orderData: {
        items: { product_id: string; quantity: number; price: number }[];
        shipping_address_id: string;
        payment_method: string;
    }) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        // Calculate total
        const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: total,
                shipping_address_id: orderData.shipping_address_id,
                payment_method: orderData.payment_method,
                status: 'pending',
                payment_status: 'pending',
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return order;
    },
};

// ==================== ADDRESS SERVICES ====================

export const addressService = {
    async getAddresses() {
        const user = await authService.getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });

        if (error) throw error;
        return data as Address[];
    },

    async createAddress(address: Omit<Address, 'id' | 'user_id' | 'created_at'>) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        // If this is set as default, unset other defaults
        if (address.is_default) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        const { data, error } = await supabase
            .from('addresses')
            .insert({
                ...address,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Address;
    },

    async updateAddress(id: string, updates: Partial<Address>) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        // If setting as default, unset other defaults
        if (updates.is_default) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        const { data, error } = await supabase
            .from('addresses')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data as Address;
    },

    async deleteAddress(id: string) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
    },
};

// ==================== WISHLIST SERVICES ====================

export const wishlistService = {
    async getWishlist() {
        const user = await authService.getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('user_id', user.id);

        if (error) throw error;
        return (data || []).map(item => item.product_id);
    },

    async addToWishlist(productId: string) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('wishlists')
            .insert({
                user_id: user.id,
                product_id: productId,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async removeFromWishlist(productId: string) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

        if (error) throw error;
    },
};

// ==================== REVIEW SERVICES ====================

export const reviewService = {
    async getProductReviews(productId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(full_name)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async createReview(review: {
        product_id: string;
        rating: number;
        comment?: string;
    }) {
        const user = await authService.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                ...review,
                user_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};
