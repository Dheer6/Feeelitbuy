import { supabase } from './supabase';
import type { 
  ProductVariant,
  ProductImage,
  InventoryTransaction,
  Coupon,
  CouponUsage,
  Payment
} from './supabase';

// ==================== PRODUCT VARIANTS SERVICES ====================

export const variantService = {
  // Get variants for a product
  async getProductVariants(productId: string) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_available', true)
      .order('display_order');

    if (error) throw error;
    return data as ProductVariant[];
  },

  // Get single variant
  async getVariant(id: string) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ProductVariant;
  },

  // Create variant (admin only)
  async createVariant(variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('product_variants')
      .insert(variant)
      .select()
      .single();

    if (error) throw error;
    return data as ProductVariant;
  },

  // Update variant (admin only)
  async updateVariant(id: string, updates: Partial<ProductVariant>) {
    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductVariant;
  },

  // Delete variant (admin only)
  async deleteVariant(id: string) {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ==================== PRODUCT IMAGES SERVICES ====================

export const productImageService = {
  // Get images for a product
  async getProductImages(productId: string) {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order');

    if (error) throw error;
    return data as ProductImage[];
  },

  // Upload product image (admin only)
  async uploadProductImage(productId: string, file: File, isPrimary: boolean = false, altText?: string) {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    // If setting as primary, unset other primary images
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
    }

    // Create database record
    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: publicUrl,
        is_primary: isPrimary,
        alt_text: altText,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ProductImage;
  },

  // Create product image record directly (for URL-based images)
  async createProductImageRecord(imageData: {
    product_id: string;
    image_url: string;
    is_primary?: boolean;
    display_order?: number;
    alt_text?: string;
  }) {
    // If setting as primary, unset other primary images
    if (imageData.is_primary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', imageData.product_id);
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: imageData.product_id,
        image_url: imageData.image_url,
        is_primary: imageData.is_primary || false,
        display_order: imageData.display_order || 0,
        alt_text: imageData.alt_text,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ProductImage;
  },

  // Delete product image (admin only)
  async deleteProductImage(id: string) {
    // Get image details first
    const { data: image } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', id)
      .single();

    if (image) {
      // Extract file path from URL
      const urlParts = image.image_url.split('/product-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('product-images')
          .remove([filePath]);
      }
    }

    // Delete database record
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Set primary image
  async setPrimaryImage(id: string, productId: string) {
    // Unset all primary images for this product
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    // Set this image as primary
    const { data, error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductImage;
  },
};

// ==================== INVENTORY SERVICES ====================

export const inventoryService = {
  // Get inventory transactions
  async getTransactions(filters?: {
    productId?: string;
    variantId?: string;
    transactionType?: InventoryTransaction['transaction_type'];
    limit?: number;
  }) {
    let query = supabase
      .from('inventory_transactions')
      .select('*');

    if (filters?.productId) {
      query = query.eq('product_id', filters.productId);
    }
    if (filters?.variantId) {
      query = query.eq('variant_id', filters.variantId);
    }
    if (filters?.transactionType) {
      query = query.eq('transaction_type', filters.transactionType);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as InventoryTransaction[];
  },

  // Adjust stock (admin only) - uses the DB function
  async adjustStock(params: {
    productId?: string;
    variantId?: string;
    quantityChange: number;
    transactionType: InventoryTransaction['transaction_type'];
    reason?: string;
    referenceId?: string;
  }) {
    const { error } = await supabase.rpc('adjust_product_stock', {
      p_product_id: params.productId || null,
      p_variant_id: params.variantId || null,
      p_quantity_change: params.quantityChange,
      p_transaction_type: params.transactionType,
      p_reason: params.reason || null,
      p_reference_id: params.referenceId || null,
    });

    if (error) throw error;
  },

  // Reserve stock for order (decrements stock)
  async reserveStock(items: { productId?: string; variantId?: string; quantity: number }[], orderId: string) {
    for (const item of items) {
      await this.adjustStock({
        productId: item.productId,
        variantId: item.variantId,
        quantityChange: -item.quantity,
        transactionType: 'reserved',
        reason: 'Reserved for order',
        referenceId: orderId,
      });
    }
  },

  // Return stock (increments stock)
  async returnStock(items: { productId?: string; variantId?: string; quantity: number }[], orderId: string, reason: string) {
    for (const item of items) {
      await this.adjustStock({
        productId: item.productId,
        variantId: item.variantId,
        quantityChange: item.quantity,
        transactionType: 'return',
        reason,
        referenceId: orderId,
      });
    }
  },
};

// ==================== COUPON SERVICES ====================

export const couponService = {
  // Get all active coupons
  async getActiveCoupons() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Coupon[];
  },

  // Get single coupon by code
  async getCouponByCode(code: string) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) throw error;
    return data as Coupon;
  },

  // Validate coupon (uses DB function)
  async validateCoupon(code: string, cartTotal: number, cartItems: any[]) {
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: code.toUpperCase(),
      p_cart_total: cartTotal,
      p_cart_items: cartItems,
    });

    if (error) throw error;
    return data;
  },

  // Apply coupon to order
  async applyCoupon(couponId: string, orderId: string, discountAmount: number) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    // Record coupon usage
    const { data, error } = await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: couponId,
        user_id: session.session.user.id,
        order_id: orderId,
        discount_amount: discountAmount,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment coupon usage count
    await supabase.rpc('increment', { 
      table_name: 'coupons',
      row_id: couponId,
      column_name: 'usage_count'
    });

    return data as CouponUsage;
  },

  // Create coupon (admin only)
  async createCoupon(coupon: Omit<Coupon, 'id' | 'usage_count' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        ...coupon,
        code: coupon.code.toUpperCase(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Coupon;
  },

  // Update coupon (admin only)
  async updateCoupon(id: string, updates: Partial<Coupon>) {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Coupon;
  },

  // Delete coupon (admin only)
  async deleteCoupon(id: string) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get user's coupon usage history
  async getUserCouponUsage() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('coupon_usage')
      .select('*, coupons(*)')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ==================== PAYMENT SERVICES ====================

export const paymentService = {
  // Get payments for an order
  async getOrderPayments(orderId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Payment[];
  },

  // Get user's payment history
  async getUserPayments() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .select('*, orders(*)')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create payment record
  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'processed_at' | 'refunded_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  // Update payment status
  async updatePaymentStatus(
    paymentId: string,
    status: Payment['status'],
    failureReason?: string,
    providerPaymentId?: string
  ) {
    const updates: Partial<Payment> = { status };
    if (failureReason) updates.failure_reason = failureReason;
    if (providerPaymentId) updates.provider_payment_id = providerPaymentId;

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  // Process refund (admin only)
  async processRefund(paymentId: string, reason: string) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        failure_reason: reason,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  // Get all payments (admin only)
  async getAllPayments(filters?: { status?: Payment['status']; limit?: number }) {
    let query = supabase
      .from('payments')
      .select('*, orders(*), profiles(full_name, email)');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },
};

// ==================== STORAGE/UPLOAD SERVICES ====================

export const uploadService = {
  // Upload user avatar
  async uploadAvatar(file: File) {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${session.session.user.id}/avatar.${fileExt}`;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(fileName, file, {
        upsert: true, // Replace if exists
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(fileName);

    // Update profile with avatar URL
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', session.session.user.id);

    return publicUrl;
  },

  // Delete user avatar
  async deleteAvatar() {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) throw new Error('Not authenticated');

    const fileName = `${session.session.user.id}/avatar`;

    // List all files in user's folder
    const { data: files } = await supabase.storage
      .from('user-avatars')
      .list(session.session.user.id);

    if (files && files.length > 0) {
      const filesToRemove = files.map(f => `${session.session.user.id}/${f.name}`);
      await supabase.storage
        .from('user-avatars')
        .remove(filesToRemove);
    }

    // Update profile to remove avatar URL
    await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', session.session.user.id);
  },
};
