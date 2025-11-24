# Supabase Database Setup Guide

This document describes the database schema and setup for the Feel It Buy e-commerce application.

## Database Schema

### Tables

#### 1. **profiles**
Extends Supabase auth.users with additional user information.
- `id` (UUID, Primary Key) - References auth.users
- `email` (TEXT, Unique)
- `full_name` (TEXT)
- `role` (TEXT) - 'customer' or 'admin'
- `phone` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### 2. **categories**
Product categories.
- `id` (UUID, Primary Key)
- `name` (TEXT, Unique)
- `description` (TEXT)
- `image_url` (TEXT)
- `created_at` (TIMESTAMPTZ)

#### 3. **products**
Product catalog.
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `description` (TEXT)
- `price` (DECIMAL)
- `category_id` (UUID, Foreign Key)
- `image_url` (TEXT)
- `stock` (INTEGER)
- `rating` (DECIMAL)
- `reviews_count` (INTEGER)
- `is_featured` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### 4. **addresses**
User shipping addresses.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `full_name` (TEXT)
- `phone` (TEXT)
- `address_line1` (TEXT)
- `address_line2` (TEXT)
- `city` (TEXT)
- `state` (TEXT)
- `postal_code` (TEXT)
- `country` (TEXT)
- `is_default` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

#### 5. **orders**
Customer orders.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `total_amount` (DECIMAL)
- `status` (TEXT) - 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
- `shipping_address_id` (UUID, Foreign Key)
- `payment_method` (TEXT)
- `payment_status` (TEXT) - 'pending', 'paid', 'failed', 'refunded'
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### 6. **order_items**
Items within orders.
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (INTEGER)
- `price` (DECIMAL)
- `created_at` (TIMESTAMPTZ)

#### 7. **cart_items**
Shopping cart items.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- Unique constraint on (user_id, product_id)

#### 8. **wishlist**
User wishlist items.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMPTZ)
- Unique constraint on (user_id, product_id)

#### 9. **reviews**
Product reviews.
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `rating` (INTEGER) - 1 to 5
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- Unique constraint on (product_id, user_id)

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Public Access
- **categories**: Public read, admin write
- **products**: Public read, admin write
- **reviews**: Public read, users can create/edit their own

### User-Specific Access
- **profiles**: Users can view/edit their own profile
- **addresses**: Users can CRUD their own addresses
- **cart_items**: Users can CRUD their own cart items
- **wishlist**: Users can CRUD their own wishlist items
- **orders**: Users can view their own orders, create new orders
- **order_items**: Users can view items from their own orders

### Admin Access
- Admins can view/update all orders
- Admins can view all users
- Admins can CRUD categories and products
- Admins can delete any review

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Using the Service Functions

### Authentication

```typescript
import { authService } from './lib/supabaseService';

// Sign up
await authService.signUp('email@example.com', 'password', 'Full Name');

// Sign in
await authService.signIn('email@example.com', 'password');

// Get current user
const user = await authService.getCurrentUser();

// Get profile
const profile = await authService.getCurrentProfile();

// Sign out
await authService.signOut();
```

### Products

```typescript
import { productService } from './lib/supabaseService';

// Get all products
const products = await productService.getProducts();

// Filter products
const filtered = await productService.getProducts({
  category: 'category-id',
  featured: true,
  search: 'laptop',
  minPrice: 100,
  maxPrice: 500
});

// Get single product
const product = await productService.getProduct('product-id');

// Create product (admin only)
await productService.createProduct({
  name: 'Product Name',
  description: 'Description',
  price: 99.99,
  category_id: 'category-id',
  stock: 100,
  is_featured: false
});
```

### Cart

```typescript
import { cartService } from './lib/supabaseService';

// Get cart
const cart = await cartService.getCart();

// Add to cart
await cartService.addToCart('product-id', 2);

// Update quantity
await cartService.updateCartItem('cart-item-id', 5);

// Remove from cart
await cartService.removeFromCart('cart-item-id');

// Clear cart
await cartService.clearCart();
```

### Orders

```typescript
import { orderService } from './lib/supabaseService';

// Get user's orders
const orders = await orderService.getOrders();

// Create order
await orderService.createOrder({
  items: [
    { product_id: 'id1', quantity: 2, price: 99.99 },
    { product_id: 'id2', quantity: 1, price: 49.99 }
  ],
  shipping_address_id: 'address-id',
  payment_method: 'credit_card'
});

// Get single order
const order = await orderService.getOrder('order-id');

// Update status (admin only)
await orderService.updateOrderStatus('order-id', 'shipped');
```

### Wishlist

```typescript
import { wishlistService } from './lib/supabaseService';

// Get wishlist
const wishlist = await wishlistService.getWishlist();

// Add to wishlist
await wishlistService.addToWishlist('product-id');

// Remove from wishlist
await wishlistService.removeFromWishlist('product-id');

// Check if in wishlist
const inWishlist = await wishlistService.isInWishlist('product-id');
```

### Reviews

```typescript
import { reviewService } from './lib/supabaseService';

// Get product reviews
const reviews = await reviewService.getProductReviews('product-id');

// Create review
await reviewService.createReview('product-id', 5, 'Great product!');

// Update review
await reviewService.updateReview('review-id', 4, 'Updated comment');

// Delete review
await reviewService.deleteReview('review-id');
```

## Migrations Applied

1. **create_initial_schema** - Creates all database tables with proper constraints and indexes
2. **setup_rls_policies** - Implements Row Level Security policies
3. **seed_initial_data** - Seeds the database with sample categories and products

## Next Steps

1. Integrate the service functions into your React components
2. Replace mock data with real Supabase queries
3. Implement authentication UI
4. Test all CRUD operations
5. Set up admin user in Supabase dashboard (update role to 'admin' in profiles table)

## Creating an Admin User

To create an admin user:

1. Sign up normally through the app
2. Go to Supabase Dashboard → Table Editor → profiles
3. Find your user and change `role` from 'customer' to 'admin'
4. Sign out and sign in again to see admin features
