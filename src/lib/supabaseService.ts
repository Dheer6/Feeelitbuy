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

  // Update product color variant stocks (admin only)
  async updateProductColorStocks(
    id: string, 
    colors: Array<{ name: string; hex: string; stock: number; images?: string[]; price?: number; discount?: number }>
  ) {
    // Calculate total stock from all colors
    const totalStock = colors.reduce((sum, color) => sum + color.stock, 0);

    const { data, error } = await supabase
      .from('products')
      .update({
        colors: colors,
        stock: totalStock
      })
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
      .select('*, order_items(*, products(*)), addresses(*), coupon_usage(*, coupons(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single order
  async getOrder(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), addresses(*), coupon_usage(*, coupons(*))')
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
      .select('*, order_items(*, products(*)), addresses(*), profiles(full_name, email), coupon_usage(*, coupons(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Check if user has purchased a specific product
  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('order_items')
      .select('id, orders!inner(user_id, status)')
      .eq('product_id', productId)
      .eq('orders.user_id', userId)
      .in('orders.status', ['pending', 'processing', 'shipped', 'delivered'])
      .limit(1);

    if (error) {
      console.error('Error checking purchase history:', error);
      return false;
    }

    return data && data.length > 0;
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
      .select('id, product_id, user_id, rating, comment, created_at, image_urls, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      // If column doesn't exist, try without image_urls
      if (error.code === '42703') {
        const { data: dataNoImages, error: errorNoImages } = await supabase
          .from('reviews')
          .select('id, product_id, user_id, rating, comment, created_at, profiles(full_name)')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });
        
        if (errorNoImages) throw errorNoImages;
        return dataNoImages;
      }
      throw error;
    }
    
    console.log('Fetched reviews:', data);
    return data;
  },

  // Create review
  async createReview(productId: string, rating: number, comment: string, imageUrls?: string[]) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    console.log('Creating review with images:', imageUrls);

    // Insert review with images if provided
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
          image_urls: imageUrls || [],
        })
        .select('*, profiles(full_name)')
        .single();

      if (error) {
        console.error('Review insert error:', error);
        // If schema cache error, try without images field
        if (error.code === 'PGRST204' || error.message?.includes('schema cache')) {
          console.warn('Schema cache issue, inserting without images field');
          const { data: dataNoImages, error: errorNoImages } = await supabase
            .from('reviews')
            .insert({
              product_id: productId,
              user_id: user.id,
              rating,
              comment,
            })
            .select('*, profiles(full_name)')
            .single();
          
          if (errorNoImages) throw errorNoImages;
          
          // If we have images and the review was created, update it with images using SQL
          if (imageUrls && imageUrls.length > 0 && dataNoImages) {
            const { error: updateError } = await supabase.rpc('update_review_images', {
              review_id: dataNoImages.id,
              image_urls: imageUrls
            });
            
            if (updateError) {
              console.warn('Could not add images to review:', updateError);
            }
          }
          
          // Update product rating
          await this.updateProductRating(productId);
          return dataNoImages;
        }
        throw error;
      }

      // Update product rating
      await this.updateProductRating(productId);
      return data;
    } catch (err) {
      console.error('Create review error:', err);
      throw err;
    }
  },

  // Upload review image to storage
  async uploadReviewImage(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `review-images/${fileName}`;

      console.log('Starting image upload:', { 
        fileName, 
        fileExt, 
        size: file.size, 
        type: file.type,
        path: filePath
      });

      // Verify bucket exists and is accessible
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets?.map(b => b.name));
      
      const reviewBucket = buckets?.find(b => b.name === 'reviews');
      if (!reviewBucket) {
        throw new Error('Reviews bucket not found in list. Available buckets: ' + buckets?.map(b => b.name).join(', '));
      }
      console.log('Found reviews bucket:', reviewBucket);

      const { data, error: uploadError } = await supabase.storage
        .from('reviews')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          status: uploadError.status,
          statusCode: (uploadError as any).statusCode,
          error: uploadError
        });
        throw uploadError;
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('reviews')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    } catch (err) {
      console.error('Review image upload failed:', err);
      throw err;
    }
  },

  // Update review
  async updateReview(reviewId: string, rating: number, comment: string, imageUrls?: string[]) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user owns this review
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (!existingReview || existingReview.user_id !== user.id) {
      throw new Error('Unauthorized to edit this review');
    }

    const updateData: any = { 
      rating, 
      comment, 
      updated_at: new Date().toISOString() 
    };
    
    // Include images if provided
    if (imageUrls !== undefined) {
      updateData.image_urls = imageUrls;
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
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
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Get review details and verify ownership
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('product_id, user_id')
      .eq('id', reviewId)
      .single();

    if (fetchError) throw fetchError;
    
    if (!review || review.user_id !== user.id) {
      throw new Error('Unauthorized to delete this review');
    }

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

    if (error) {
      console.error('Create banner error:', error);
      throw error;
    }
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

    if (error) {
      console.error('Update banner error:', error);
      throw error;
    }
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

// ==================== WALLET SERVICES ====================

export const walletService = {
  // Get or create wallet for user
  async getWallet() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    let { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Create wallet if doesn't exist
    if (error && error.code === 'PGRST116') {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (createError) throw createError;
      wallet = newWallet;
    } else if (error) {
      throw error;
    }

    return wallet;
  },

  // Get wallet transactions
  async getTransactions(limit = 50) {
    const wallet = await this.getWallet();
    
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Add funds to wallet
  async addFunds(amount: number, type: string, description: string, referenceId?: string) {
    const wallet = await this.getWallet();
    
    // Create transaction
    const { error: txnError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type,
        amount,
        description,
        reference_id: referenceId,
      });

    if (txnError) throw txnError;

    // Update wallet balance
    const newBalance = parseFloat(wallet.balance) + amount;
    const updates: any = { balance: newBalance };

    if (type === 'referral_bonus') {
      updates.referral_amount = parseFloat(wallet.referral_amount) + amount;
    } else if (type === 'reward') {
      updates.reward_amount = parseFloat(wallet.reward_amount) + amount;
    }

    const { error: updateError } = await supabase
      .from('wallets')
      .update(updates)
      .eq('id', wallet.id);

    if (updateError) throw updateError;
    
    return await this.getWallet();
  },

  // Deduct funds from wallet
  async deductFunds(amount: number, description: string, referenceId?: string) {
    const wallet = await this.getWallet();
    
    if (parseFloat(wallet.balance) < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Create transaction
    const { error: txnError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'debit',
        amount: -amount,
        description,
        reference_id: referenceId,
      });

    if (txnError) throw txnError;

    // Update balance
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ balance: parseFloat(wallet.balance) - amount })
      .eq('id', wallet.id);

    if (updateError) throw updateError;
    
    return await this.getWallet();
  },
};

// ==================== REFERRAL SERVICES ====================

export const referralService = {
  // Generate referral code for user
  async generateCode() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Check if code exists
    let { data: existing } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existing) return existing;

    // Generate unique code
    const code = `FEEL${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from('referral_codes')
      .insert({ user_id: user.id, code })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Apply referral code
  async applyReferralCode(code: string) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user already used a referral
    const { data: existing } = await supabase
      .from('referrals')
      .select('*')
      .eq('referee_id', user.id)
      .single();

    if (existing) {
      throw new Error('You have already used a referral code');
    }

    // Get referral code details
    const { data: refCode, error: codeError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (codeError || !refCode) {
      throw new Error('Invalid referral code');
    }

    if (refCode.user_id === user.id) {
      throw new Error('You cannot use your own referral code');
    }

    // Create referral record
    const { data: referral, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: refCode.user_id,
        referee_id: user.id,
        referral_code: code,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Update code usage count
    await supabase
      .from('referral_codes')
      .update({ uses_count: refCode.uses_count + 1 })
      .eq('id', refCode.id);

    return referral;
  },

  // Complete referral and distribute rewards
  async completeReferral(referralId: string) {
    const { data: referral, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .single();

    if (error) throw error;
    if (referral.status === 'rewarded') {
      return referral; // Already rewarded
    }

    // Add rewards to both users
    await walletService.addFunds(
      referral.referrer_reward,
      'referral_bonus',
      'Referral bonus - someone used your code',
      referralId
    );

    // Give reward to referee
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user?.id;
    
    // Temporarily switch context or use service key
    // For referee reward, we'll create a separate transaction
    
    await supabase
      .from('referrals')
      .update({ 
        status: 'rewarded',
        rewarded_at: new Date().toISOString()
      })
      .eq('id', referralId);

    return referral;
  },

  // Get user's referrals
  async getMyReferrals() {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referee:profiles!referee_id(full_name)
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ==================== CARD OFFERS SERVICES ====================

export const cardOffersService = {
  // Get active card offers
  async getActiveOffers() {
    const { data, error } = await supabase
      .from('card_offers')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .order('discount_value', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all offers (admin)
  async getAllOffers() {
    const { data, error } = await supabase
      .from('card_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create offer (admin)
  async createOffer(offer: any) {
    const { data, error} = await supabase
      .from('card_offers')
      .insert(offer)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update offer (admin)
  async updateOffer(id: string, updates: any) {
    const { data, error } = await supabase
      .from('card_offers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete offer (admin)
  async deleteOffer(id: string) {
    const { error } = await supabase
      .from('card_offers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Calculate discount for a card
  calculateDiscount(offer: any, amount: number) {
    if (amount < offer.min_transaction_amount) {
      return 0;
    }

    let discount = 0;
    if (offer.discount_type === 'percentage') {
      discount = (amount * offer.discount_value) / 100;
    } else {
      discount = offer.discount_value;
    }

    if (offer.max_discount && discount > offer.max_discount) {
      discount = offer.max_discount;
    }

    return discount;
  },
};

// ==================== ANALYTICS SERVICES ====================

export const analyticsService = {
  // Update user session
  async updateSession(isOnline: boolean = true) {
    const user = await authService.getCurrentUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('session_end', null)
      .single();

    if (existing && isOnline) {
      // Update last activity
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', existing.id);
    } else if (existing && !isOnline) {
      // End session
      await supabase
        .from('user_sessions')
        .update({ 
          is_online: false,
          session_end: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else if (!existing && isOnline) {
      // Create new session
      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          is_online: true,
          device_info: { userAgent: navigator.userAgent }
        });
    }
  },

  // Get online users count
  async getOnlineUsersCount() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { count, error } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_online', true)
      .gte('last_activity', fiveMinutesAgo);

    if (error) throw error;
    return count || 0;
  },

  // Log activity
  async logActivity(action: string, details?: any) {
    const user = await authService.getCurrentUser();
    
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user?.id,
        action,
        details,
        user_agent: navigator.userAgent,
      });
  },

  // Get activity logs (admin)
  async getActivityLogs(limit = 100) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get user's activity history
  async getMyActivity(limit = 50) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};

// ==================== APP SETTINGS SERVICES ====================

export const appSettingsService = {
  // Get setting
  async getSetting(key: string) {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || null;
  },

  // Update setting (admin)
  async updateSetting(key: string, value: string, description?: string) {
    const user = await authService.getCurrentUser();
    
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({
        key,
        value,
        description,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get tagline
  async getTagline() {
    return await this.getSetting('app_tagline');
  },
};

// ==================== PRODUCT ENHANCEMENTS ====================

export const productEnhancementService = {
  // Increment share count
  async incrementShareCount(productId: string) {
    const { data, error } = await supabase.rpc('increment_share_count', {
      product_id: productId
    });

    if (error) {
      // Fallback if function doesn't exist
      const { data: product } = await supabase
        .from('products')
        .select('share_count')
        .eq('id', productId)
        .single();

      await supabase
        .from('products')
        .update({ share_count: (product?.share_count || 0) + 1 })
        .eq('id', productId);
    }

    await analyticsService.logActivity('share_product', { product_id: productId });
  },

  // Update product colors (admin)
  async updateColors(productId: string, colors: any[]) {
    const { error } = await supabase
      .from('products')
      .update({ colors })
      .eq('id', productId);

    if (error) throw error;
  },

  // Update rotation images (admin)
  async updateRotationImages(productId: string, images: string[]) {
    const { error } = await supabase
      .from('products')
      .update({ rotation_images: images })
      .eq('id', productId);

    if (error) throw error;
  },
};

