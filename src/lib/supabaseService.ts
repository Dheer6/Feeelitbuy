import { supabase } from './supabase';
import type {
  Profile,
  Product,
  Category,
  CartItem,
  Order,
  OrderItem,
  Address,
  Review,
  Wishlist,
  HeroBanner
} from './supabase';

// ==================== AUTH SERVICES ====================

export const authService = {
  // Sign up new user
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

    // Profile will be automatically created by database trigger
    return data;
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get current user profile
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

  // Update profile
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
  // Get all products
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

  // Get single product
  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), product_images(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Product;
  },

  // Create product (admin only)
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'rating' | 'reviews_count'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  // Update product (admin only)
  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  // Delete product (admin only)
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update product stock (admin only)
  async updateProductStock(id: string, stock: number, lowStockThreshold?: number) {
    const updates: any = { stock };
    if (lowStockThreshold !== undefined) {
      updates.low_stock_threshold = lowStockThreshold;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },
};

// ==================== CATEGORY SERVICES ====================

export const categoryService = {
  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Category[];
  },

  // Get single category
  async getCategory(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Category;
  },

  // Create category (admin only)
  async createCategory(category: Omit<Category, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  // Update category (admin only)
  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  // Delete category (admin only)
  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ==================== CART SERVICES ====================

export const cartService = {
  // Get user's cart
  async getCart() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*, product_images(*))')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  },

  // Add item to cart
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
        .select('*, products(*, product_images(*))')
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
        .select('*, products(*, product_images(*))')
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select('*, products(*, product_images(*))')
      .single();

    if (error) throw error;
    return data;
  },

  // Remove item from cart
  async removeFromCart(itemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  // Clear cart
  async clearCart() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

// ==================== ORDER SERVICES ====================

export const orderService = {
  // Get user's orders
  async getOrders() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), addresses(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single order
  async getOrder(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), addresses(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create order
  async createOrder(orderData: {
    items: { product_id: string; quantity: number; price: number }[];
    shipping_address_id: string;
    payment_method: string;
  }) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
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

    // Clear cart
    await cartService.clearCart();

    return order;
  },

  // Update order status (admin only)
  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all orders (admin only)
  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), addresses(*), profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ==================== ADDRESS SERVICES ====================

export const addressService = {
  // Get user's addresses
  async getAddresses() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data as Address[];
  },

  // Create address
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

  // Update address
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
      .select()
      .single();

    if (error) throw error;
    return data as Address;
  },

  // Delete address
  async deleteAddress(id: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ==================== WISHLIST SERVICES ====================

export const wishlistService = {
  // Get user's wishlist
  async getWishlist() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  },

  // Add to wishlist
  async addToWishlist(productId: string) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        product_id: productId,
      })
      .select('*, products(*)')
      .single();

    if (error) throw error;
    return data;
  },

  // Remove from wishlist
  async removeFromWishlist(productId: string) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) throw error;
  },

  // Check if product is in wishlist
  async isInWishlist(productId: string) {
    const user = await authService.getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    return !!data;
  },
};

// ==================== REVIEW SERVICES ====================

export const reviewService = {
  // Get product reviews
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create review
  async createReview(productId: string, rating: number, comment: string) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
      })
      .select('*, profiles(full_name)')
      .single();

    if (error) throw error;

    // Update product rating
    await this.updateProductRating(productId);

    return data;
  },

  // Update review
  async updateReview(reviewId: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', reviewId)
      .select('*, profiles(full_name)')
      .single();

    if (error) throw error;

    // Update product rating
    if (data) {
      await this.updateProductRating(data.product_id);
    }

    return data;
  },

  // Delete review
  async deleteReview(reviewId: string) {
    const { data: review } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    // Update product rating
    if (review) {
      await this.updateProductRating(review.product_id);
    }
  },

  // Update product rating (internal helper)
  async updateProductRating(productId: string) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      await supabase
        .from('products')
        .update({
          rating: Math.round(avgRating * 100) / 100,
          reviews_count: reviews.length,
        })
        .eq('id', productId);
    } else {
      await supabase
        .from('products')
        .update({
          rating: 0,
          reviews_count: 0,
        })
        .eq('id', productId);
    }
  },
};

// ==================== ADMIN SERVICES ====================

export const adminService = {
  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Profile[];
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, role: 'customer' | 'admin') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // Get dashboard stats
  async getDashboardStats() {
    const [
      { count: totalProducts },
      { count: totalOrders },
      { count: totalUsers },
      { data: recentOrders }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    return {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
      recentOrders: recentOrders || [],
    };
  },
};

// ==================== HERO BANNER SERVICES ====================

export const bannerService = {
  // Get all active banners (public)
  async getActiveBanners() {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as HeroBanner[];
  },

  // Get all banners (admin only)
  async getAllBanners() {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as HeroBanner[];
  },

  // Create banner (admin only)
  async createBanner(banner: Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('hero_banners')
      .insert(banner)
      .select()
      .single();

    if (error) throw error;
    return data as HeroBanner;
  },

  // Update banner (admin only)
  async updateBanner(id: string, updates: Partial<HeroBanner>) {
    const { data, error } = await supabase
      .from('hero_banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as HeroBanner;
  },

  // Delete banner (admin only)
  async deleteBanner(id: string) {
    const { error } = await supabase
      .from('hero_banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Toggle banner active status (admin only)
  async toggleBannerActive(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('hero_banners')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as HeroBanner;
  },
};
