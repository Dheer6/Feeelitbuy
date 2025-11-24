# Supabase Full Integration Guide

## Overview
Complete Supabase integration for the Feel It Buy e-commerce platform with full database schema, RLS policies, storage configuration, and API services.

## Database Schema

### Core Tables

#### 1. **profiles**
User profile information linked to Supabase Auth.
```sql
- id (uuid, PK, FK to auth.users)
- email (text, unique)
- full_name (text)
- role (text: 'customer' | 'admin')
- phone (text)
- avatar_url (text)
- metadata (jsonb)
- created_at, updated_at (timestamptz)
```
**Trigger**: `handle_new_user()` - Auto-creates profile on signup
**RLS**: Users can view/update own profile; admins have full access

#### 2. **categories**
Product categories for organization.
```sql
- id (uuid, PK)
- name (text, unique)
- description (text)
- image_url (text)
- created_at (timestamptz)
```
**RLS**: Public read access; admins only for write operations

#### 3. **products**
Main product catalog.
```sql
- id (uuid, PK)
- name (text)
- description (text)
- price (numeric)
- category_id (uuid, FK)
- image_url (text)
- stock (integer)
- rating (numeric, 0-5)
- reviews_count (integer)
- is_featured (boolean)
- created_at, updated_at (timestamptz)
```
**RLS**: Public read access; admins only for write operations

#### 4. **product_variants**
Product variations (size, color, etc.).
```sql
- id (uuid, PK)
- product_id (uuid, FK)
- sku (text, unique)
- variant_name (text)
- attributes (jsonb) - e.g., {"size": "L", "color": "red"}
- price_adjustment (numeric)
- stock (integer)
- is_available (boolean)
- created_at, updated_at (timestamptz)
```
**RLS**: Public read access; admins only for write operations

#### 5. **product_images**
Multiple images per product.
```sql
- id (uuid, PK)
- product_id (uuid, FK)
- image_url (text)
- is_primary (boolean)
- display_order (integer)
- alt_text (text)
- created_at (timestamptz)
```
**RLS**: Public read access; admins only for write operations

#### 6. **cart_items**
User shopping cart.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- product_id (uuid, FK)
- quantity (integer)
- created_at, updated_at (timestamptz)
```
**RLS**: Users can only access their own cart

#### 7. **wishlist**
User wishlist for products.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- product_id (uuid, FK)
- created_at (timestamptz)
```
**RLS**: Users can only access their own wishlist

#### 8. **addresses**
Shipping/billing addresses.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- full_name (text)
- phone (text)
- address_line1, address_line2 (text)
- city, state, postal_code, country (text)
- is_default (boolean)
- created_at (timestamptz)
```
**RLS**: Users can only access their own addresses

#### 9. **orders**
Customer orders.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- total_amount (numeric)
- status (text: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')
- shipping_address_id (uuid, FK)
- payment_method (text)
- payment_status (text: 'pending' | 'paid' | 'failed' | 'refunded')
- created_at, updated_at (timestamptz)
```
**RLS**: Users can view own orders; admins can view/update all

#### 10. **order_items**
Items within an order.
```sql
- id (uuid, PK)
- order_id (uuid, FK)
- product_id (uuid, FK)
- quantity (integer)
- price (numeric)
- created_at (timestamptz)
```
**RLS**: Users can view own order items; admins can view all

#### 11. **reviews**
Product reviews and ratings.
```sql
- id (uuid, PK)
- product_id (uuid, FK)
- user_id (uuid, FK)
- rating (integer, 1-5)
- comment (text)
- created_at, updated_at (timestamptz)
```
**RLS**: Public read; users can create/update/delete own reviews; admins can delete any

#### 12. **inventory_transactions**
Stock movement tracking.
```sql
- id (uuid, PK)
- product_id (uuid, FK, nullable)
- variant_id (uuid, FK, nullable)
- transaction_type (text: 'restock' | 'sale' | 'return' | 'adjustment' | 'reserved')
- quantity_change (integer)
- quantity_after (integer)
- reason (text)
- reference_id (uuid) - order_id or other reference
- created_by (uuid, FK)
- created_at (timestamptz)
```
**RLS**: Admins only

#### 13. **coupons**
Discount coupons.
```sql
- id (uuid, PK)
- code (text, unique)
- description (text)
- discount_type (text: 'percentage' | 'fixed_amount')
- discount_value (numeric)
- min_purchase_amount (numeric)
- max_discount_amount (numeric)
- usage_limit (integer)
- usage_count (integer)
- valid_from, valid_until (timestamptz)
- is_active (boolean)
- applicable_categories, applicable_products (uuid[])
- created_by (uuid, FK)
- created_at, updated_at (timestamptz)
```
**RLS**: Public read for active coupons; admins full access

#### 14. **coupon_usage**
Tracks coupon redemptions.
```sql
- id (uuid, PK)
- coupon_id (uuid, FK)
- user_id (uuid, FK)
- order_id (uuid, FK)
- discount_amount (numeric)
- created_at (timestamptz)
```
**RLS**: Users can view own usage; admins view all; users can insert own usage

#### 15. **payments**
Payment transaction tracking.
```sql
- id (uuid, PK)
- order_id (uuid, FK)
- user_id (uuid, FK)
- amount (numeric)
- currency (text)
- payment_method (text)
- payment_provider (text)
- provider_payment_id (text)
- status (text: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled')
- failure_reason (text)
- metadata (jsonb)
- processed_at, refunded_at (timestamptz)
- created_at, updated_at (timestamptz)
```
**Trigger**: `handle_payment_status_change()` - Updates order payment status
**RLS**: Users can view/insert own payments; admins full access

## Storage Buckets

### 1. **product-images**
- Public bucket for product images
- Max file size: 5MB
- Allowed: JPEG, PNG, WebP, GIF
- **Policies**: Public read; admin write/update/delete

### 2. **user-avatars**
- Public bucket for user profile avatars
- Max file size: 2MB
- Allowed: JPEG, PNG, WebP
- **Policies**: Public read; users can upload/update/delete own avatar (organized by user_id folder)

## Database Functions

### 1. `handle_new_user()`
**Purpose**: Auto-create profile on auth signup
**Trigger**: After insert on auth.users
**Security**: SECURITY DEFINER (runs with elevated privileges)

### 2. `update_timestamp()`
**Purpose**: Auto-update updated_at field
**Trigger**: Before update on multiple tables

### 3. `adjust_product_stock()`
**Purpose**: Adjust inventory with transaction logging
**Parameters**:
- p_product_id (uuid)
- p_variant_id (uuid)
- p_quantity_change (integer)
- p_transaction_type (text)
- p_reason (text)
- p_reference_id (uuid)

**Usage**:
```sql
select adjust_product_stock(
  product_id, 
  null, 
  -5, 
  'sale', 
  'Order #123', 
  order_id
);
```

### 4. `validate_coupon()`
**Purpose**: Validate coupon code and calculate discount
**Parameters**:
- p_code (text)
- p_cart_total (numeric)
- p_cart_items (jsonb)

**Returns**: jsonb with validation result
```json
{
  "valid": true,
  "coupon_id": "uuid",
  "discount_amount": 10.50,
  "final_total": 89.50
}
```

### 5. `handle_payment_status_change()`
**Purpose**: Auto-update order status when payment completes
**Trigger**: Before update of status on payments table

## API Services

### Location
All services are in `src/lib/supabaseService.ts` and `src/lib/supabaseEnhanced.ts`

### Enhanced Services (New)

#### variantService
```ts
getProductVariants(productId)
getVariant(id)
createVariant(variant)
updateVariant(id, updates)
deleteVariant(id)
```

#### productImageService
```ts
getProductImages(productId)
uploadProductImage(productId, file, isPrimary, altText)
deleteProductImage(id)
setPrimaryImage(id, productId)
```

#### inventoryService
```ts
getTransactions(filters)
adjustStock(params)
reserveStock(items, orderId)
returnStock(items, orderId, reason)
```

#### couponService
```ts
getActiveCoupons()
getCouponByCode(code)
validateCoupon(code, cartTotal, cartItems)
applyCoupon(couponId, orderId, discountAmount)
createCoupon(coupon)
updateCoupon(id, updates)
deleteCoupon(id)
getUserCouponUsage()
```

#### paymentService
```ts
getOrderPayments(orderId)
getUserPayments()
createPayment(payment)
updatePaymentStatus(paymentId, status, failureReason, providerPaymentId)
processRefund(paymentId, reason)
getAllPayments(filters)
```

#### uploadService
```ts
uploadAvatar(file)
deleteAvatar()
```

### Existing Services

#### authService
```ts
signUp(email, password, fullName, phone)
signIn(email, password)
signOut()
getCurrentUser()
getCurrentProfile()
updateProfile(updates)
```

#### productService
```ts
getProducts(filters)
getProduct(id)
createProduct(product)
updateProduct(id, updates)
deleteProduct(id)
```

#### categoryService
```ts
getCategories()
getCategory(id)
createCategory(category)
updateCategory(id, updates)
deleteCategory(id)
```

#### cartService
```ts
getCart()
addToCart(productId, quantity)
updateCartItem(itemId, quantity)
removeFromCart(itemId)
clearCart()
```

#### orderService
```ts
getOrders()
getOrder(id)
createOrder(orderData)
updateOrderStatus(orderId, status)
getAllOrders() // admin
```

#### addressService
```ts
getAddresses()
createAddress(address)
updateAddress(id, updates)
deleteAddress(id)
```

#### wishlistService
```ts
getWishlist()
addToWishlist(productId)
removeFromWishlist(productId)
isInWishlist(productId)
```

#### reviewService
```ts
getProductReviews(productId)
createReview(productId, rating, comment)
updateReview(reviewId, rating, comment)
deleteReview(reviewId)
updateProductRating(productId) // internal
```

#### adminService
```ts
getAllUsers()
updateUserRole(userId, role)
getDashboardStats()
```

## Frontend Integration Steps

### 1. Update Components to Use Real Data

Replace `mockProducts` with live queries:

```tsx
// Before
import { mockProducts } from './data/mockProducts';

// After
import { productService } from './lib/supabaseService';

// In component
useEffect(() => {
  const loadProducts = async () => {
    const products = await productService.getProducts();
    setProducts(products);
  };
  loadProducts();
}, []);
```

### 2. Update Cart to Use Database

Replace localStorage cart with Supabase cart:

```tsx
// In Cart component
useEffect(() => {
  const loadCart = async () => {
    if (currentUser) {
      const cartItems = await cartService.getCart();
      setCart(cartItems);
    }
  };
  loadCart();
}, [currentUser]);
```

### 3. Implement Order Creation with Payment

```tsx
const handleCheckout = async () => {
  // Create payment record
  const payment = await paymentService.createPayment({
    order_id: orderId,
    user_id: currentUser.id,
    amount: total,
    currency: 'USD',
    payment_method: selectedPaymentMethod,
    status: 'pending',
    metadata: {},
  });

  // Process payment with provider (Stripe, PayPal, etc.)
  // ...

  // Update payment status
  await paymentService.updatePaymentStatus(
    payment.id,
    'completed',
    null,
    providerTransactionId
  );

  // Reserve inventory
  await inventoryService.reserveStock(orderItems, orderId);
};
```

### 4. Apply Coupons in Checkout

```tsx
const handleApplyCoupon = async (code: string) => {
  const validation = await couponService.validateCoupon(
    code,
    cartTotal,
    cartItems
  );

  if (validation.valid) {
    setDiscount(validation.discount_amount);
    setFinalTotal(validation.final_total);
    setCouponId(validation.coupon_id);
  } else {
    setError(validation.error);
  }
};
```

### 5. Upload Product Images (Admin)

```tsx
const handleImageUpload = async (productId: string, file: File) => {
  const image = await productImageService.uploadProductImage(
    productId,
    file,
    true, // is primary
    'Product image'
  );
  
  // Refresh product images
  const images = await productImageService.getProductImages(productId);
  setProductImages(images);
};
```

## Admin Features

### Product Management
- Create/edit/delete products
- Upload multiple images per product
- Manage product variants (size, color, etc.)
- Track inventory with transaction history

### Order Management
- View all orders
- Update order status
- Process refunds
- View payment history

### User Management
- View all users
- Update user roles (customer/admin)
- View user activity

### Coupon Management
- Create discount coupons
- Set usage limits and validity periods
- Track coupon usage
- Apply to specific products/categories

### Inventory Management
- Adjust stock levels
- View inventory transactions
- Set low stock alerts
- Track reserved stock for pending orders

### Analytics Dashboard
- Total sales
- Revenue trends
- Popular products
- Customer insights

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can only access their own data (cart, wishlist, orders, addresses, payments)
- Admins have full access to all data
- Public read access for products, categories, reviews
- Secure admin-only operations

### Database Functions
- SECURITY DEFINER functions run with elevated privileges
- Input validation and error handling
- Transaction support for atomicity

### Storage Policies
- File type restrictions
- File size limits
- User-specific folder organization for avatars
- Admin-only access for product image management

## Environment Setup

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Project Configuration
1. Project ID: `jgyvkttbypjatuoigchc`
2. Region: us-east-1
3. Database: PostgreSQL 17.6.1.044

## Migrations Applied

1. ✅ `create_profiles_and_trigger` - Profiles table with auto-creation trigger
2. ✅ `create_product_variants_and_images` - Product variants and images
3. ✅ `create_inventory_tracking` - Inventory transactions and stock functions
4. ✅ `create_coupons_and_discounts` - Coupons and usage tracking
5. ✅ `create_payments_tracking` - Payment records and status triggers
6. ✅ `add_avatar_metadata_to_profiles` - Avatar and metadata fields
7. ✅ Storage bucket creation and policies

## Testing Checklist

### Authentication
- [ ] User signup creates profile automatically
- [ ] Login/logout works correctly
- [ ] Profile updates save properly
- [ ] Avatar upload and display

### Products
- [ ] Products load from database
- [ ] Product filtering and search
- [ ] Product variants display correctly
- [ ] Multiple product images display

### Shopping Cart
- [ ] Add to cart saves to database
- [ ] Cart persists across sessions
- [ ] Quantity updates work
- [ ] Cart clears after order

### Checkout
- [ ] Address management
- [ ] Coupon validation and application
- [ ] Order creation
- [ ] Payment processing
- [ ] Inventory reservation

### Orders
- [ ] Order history displays
- [ ] Order status updates
- [ ] Payment status tracking
- [ ] Order details with items

### Admin
- [ ] Admin dashboard loads stats
- [ ] Product CRUD operations
- [ ] Order management
- [ ] User role management
- [ ] Coupon management
- [ ] Inventory adjustments

### Reviews
- [ ] Submit product reviews
- [ ] Product rating updates
- [ ] Review moderation (admin)

## Next Steps

1. **Frontend Integration** (in progress)
   - Replace all mock data with Supabase queries
   - Update components to use real-time data
   - Add loading states and error handling

2. **Payment Integration**
   - Integrate Stripe or PayPal
   - Set up webhook handlers
   - Test payment flows

3. **Email Notifications**
   - Order confirmation emails
   - Shipping updates
   - Password reset emails

4. **Search & Filtering**
   - Full-text search on products
   - Advanced filtering UI
   - Price range filters

5. **Performance Optimization**
   - Add database indexes
   - Implement caching
   - Optimize image loading

6. **Testing & QA**
   - Write integration tests
   - Test all user flows
   - Security audit

## Support & Resources

- Supabase Documentation: https://supabase.com/docs
- Project Dashboard: https://supabase.com/dashboard/project/jgyvkttbypjatuoigchc
- TypeScript Types: `src/lib/supabase.ts`
- Service Layer: `src/lib/supabaseService.ts` & `src/lib/supabaseEnhanced.ts`
