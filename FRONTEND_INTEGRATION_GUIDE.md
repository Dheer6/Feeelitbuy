# Frontend Integration Guide - Step by Step

This guide walks you through replacing mock data with real Supabase queries.

## Overview

Your database is **100% ready**. Now you need to connect your React components to fetch/save real data instead of using `mockProducts` and `localStorage`.

## Current State vs. Target State

| Feature | Current | Target |
|---------|---------|--------|
| Products | mockProducts array | productService.getProducts() |
| Cart | localStorage | cartService (database) |
| Orders | localStorage | orderService (database) |
| Wishlist | localStorage | wishlistService (database) |
| Auth | ✅ Supabase | ✅ Already working |

---

## Step 1: Load Real Products

### File: `src/components/Home.tsx`

**Replace** the mockProducts import and add real data loading:

```tsx
// REMOVE this line:
import { mockProducts } from '../data/mockProducts';

// ADD this import:
import { productService } from '../lib/supabaseService';
import { Product as SupabaseProduct } from '../lib/supabase';

// ADD state and useEffect:
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadProducts = async () => {
    try {
      const data = await productService.getProducts({ featured: true });
      // Map Supabase product to your Product type
      const mappedProducts = data.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image_url || '/placeholder.jpg',
        category: p.category_id || '',
        rating: Number(p.rating),
        reviews: p.reviews_count,
        description: p.description || '',
        stock: p.stock,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  loadProducts();
}, []);

// In your JSX, add loading state:
{loading ? (
  <div className="text-center py-12">Loading products...</div>
) : (
  // Your existing product grid
)}
```

### File: `src/components/ProductCatalog.tsx`

**Same pattern** - load products with optional category filter:

```tsx
import { productService } from '../lib/supabaseService';

useEffect(() => {
  const loadProducts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (category !== 'all') {
        filters.category = category;
      }
      const data = await productService.getProducts(filters);
      // Map to your format
      setProducts(mappedData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  loadProducts();
}, [category]);
```

---

## Step 2: Replace Cart with Database Cart

### File: `src/App.tsx`

**Replace** localStorage cart with database cart:

```tsx
// REMOVE localStorage logic
// ADD database cart loading:

useEffect(() => {
  const loadCart = async () => {
    if (currentUser) {
      try {
        const cartItems = await cartService.getCart();
        // Map to your CartItem type
        const mapped = cartItems.map(item => ({
          product: {
            id: item.products.id,
            name: item.products.name,
            price: Number(item.products.price),
            image: item.products.image_url || '/placeholder.jpg',
            // ... other fields
          },
          quantity: item.quantity,
        }));
        setCart(mapped);
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    } else {
      setCart([]); // Clear cart when logged out
    }
  };

  loadCart();
}, [currentUser]);

// UPDATE addToCart function:
const addToCart = async (product: Product, quantity: number = 1) => {
  if (!currentUser) {
    setAuthMode('login');
    setShowAuthModal(true);
    return;
  }

  try {
    await cartService.addToCart(product.id, quantity);
    // Reload cart from database
    const cartItems = await cartService.getCart();
    setCart(/* map cartItems */);
  } catch (error) {
    console.error('Failed to add to cart:', error);
  }
};

// UPDATE updateCartQuantity:
const updateCartQuantity = async (productId: string, quantity: number) => {
  if (!currentUser) return;

  try {
    if (quantity <= 0) {
      await removeFromCart(productId);
    } else {
      // Find cart item id
      const cartItem = cart.find(item => item.product.id === productId);
      if (cartItem) {
        await cartService.updateCartItem(/* item.id from DB */, quantity);
        // Reload cart
      }
    }
  } catch (error) {
    console.error('Failed to update cart:', error);
  }
};

// UPDATE removeFromCart:
const removeFromCart = async (productId: string) => {
  if (!currentUser) return;

  try {
    // Find cart item
    const cartItem = cart.find(item => item.product.id === productId);
    if (cartItem) {
      await cartService.removeFromCart(/* item.id */);
      // Reload cart
    }
  } catch (error) {
    console.error('Failed to remove from cart:', error);
  }
};
```

**Note**: You'll need to store the Supabase cart item ID along with your cart data, or reload the full cart after each operation.

---

## Step 3: Integrate Order Creation

### File: `src/App.tsx` - Update `placeOrder`

```tsx
const placeOrder = async (shippingDetails: any, paymentMethod: string) => {
  if (!currentUser) return;

  try {
    // Create address first (if new)
    let addressId = shippingDetails.existingAddressId;
    
    if (!addressId) {
      const newAddress = await addressService.createAddress({
        full_name: shippingDetails.fullName,
        phone: shippingDetails.phone,
        address_line1: shippingDetails.address,
        address_line2: null,
        city: shippingDetails.city,
        state: shippingDetails.state,
        postal_code: shippingDetails.zip,
        country: 'USA',
        is_default: false,
      });
      addressId = newAddress.id;
    }

    // Prepare order items
    const orderItems = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create order
    const order = await orderService.createOrder({
      items: orderItems,
      shipping_address_id: addressId,
      payment_method: paymentMethod,
    });

    // Create payment record
    await paymentService.createPayment({
      order_id: order.id,
      user_id: currentUser.id,
      amount: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      currency: 'USD',
      payment_method: paymentMethod,
      status: 'pending',
      metadata: {},
    });

    // Cart is auto-cleared by orderService.createOrder
    setCart([]);
    setCurrentPage('order-tracking');
    setSelectedOrder(order.id);
  } catch (error) {
    console.error('Failed to place order:', error);
    alert('Failed to place order. Please try again.');
  }
};
```

---

## Step 4: Load Real Orders

### File: `src/App.tsx`

**Replace** localStorage orders:

```tsx
// REMOVE localStorage orders
// ADD database orders:

useEffect(() => {
  const loadOrders = async () => {
    if (currentUser) {
      try {
        const data = await orderService.getOrders();
        // Map to your Order type
        const mapped = data.map(order => ({
          id: order.id,
          userId: order.user_id,
          items: order.order_items.map(item => ({
            product: {
              id: item.products.id,
              name: item.products.name,
              price: Number(item.price),
              // ...
            },
            quantity: item.quantity,
          })),
          total: Number(order.total_amount),
          status: order.status,
          shippingAddress: order.addresses,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          createdAt: order.created_at,
          estimatedDelivery: /* calculate based on created_at */,
        }));
        setOrders(mapped);
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    }
  };

  loadOrders();
}, [currentUser]);
```

---

## Step 5: Integrate Wishlist

### Similar pattern to cart:

```tsx
// Load wishlist from database
useEffect(() => {
  const loadWishlist = async () => {
    if (currentUser) {
      const items = await wishlistService.getWishlist();
      setWishlist(items.map(item => item.product_id));
    }
  };
  loadWishlist();
}, [currentUser]);

// Toggle wishlist
const toggleWishlist = async (productId: string) => {
  if (!currentUser) {
    setAuthMode('login');
    setShowAuthModal(true);
    return;
  }

  try {
    if (wishlist.includes(productId)) {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(id => id !== productId));
    } else {
      await wishlistService.addToWishlist(productId);
      setWishlist(prev => [...prev, productId]);
    }
  } catch (error) {
    console.error('Failed to update wishlist:', error);
  }
};
```

---

## Step 6: Add Loading & Error States

For better UX, add loading spinners and error messages:

```tsx
// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Error component
const ErrorMessage = ({ message, retry }: { message: string; retry?: () => void }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    <p>{message}</p>
    {retry && (
      <button onClick={retry} className="mt-2 text-sm underline">
        Try Again
      </button>
    )}
  </div>
);
```

---

## Step 7: Load Categories

### File: `src/components/Home.tsx` or wherever categories are displayed:

```tsx
import { categoryService } from '../lib/supabaseService';

const [categories, setCategories] = useState([]);

useEffect(() => {
  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };
  loadCategories();
}, []);
```

---

## Step 8: Product Detail Page

### File: `src/components/ProductDetail.tsx`

Load product with variants, images, and reviews:

```tsx
import { productService, productImageService, variantService, reviewService } from '../lib/supabaseService';

const [product, setProduct] = useState(null);
const [variants, setVariants] = useState([]);
const [images, setImages] = useState([]);
const [reviews, setReviews] = useState([]);

useEffect(() => {
  const loadProductDetails = async () => {
    try {
      const [productData, variantsData, imagesData, reviewsData] = await Promise.all([
        productService.getProduct(productId),
        variantService.getProductVariants(productId),
        productImageService.getProductImages(productId),
        reviewService.getProductReviews(productId),
      ]);

      setProduct(productData);
      setVariants(variantsData);
      setImages(imagesData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to load product details:', error);
    }
  };

  loadProductDetails();
}, [productId]);
```

---

## Step 9: Apply Coupons in Checkout

### File: `src/components/Checkout.tsx`

```tsx
import { couponService } from '../lib/supabaseEnhanced';

const [couponCode, setCouponCode] = useState('');
const [discount, setDiscount] = useState(0);
const [couponId, setCouponId] = useState(null);

const handleApplyCoupon = async () => {
  try {
    const cartItems = items.map(item => ({
      product_id: item.product.id,
      category_id: item.product.categoryId,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const result = await couponService.validateCoupon(
      couponCode,
      cartTotal,
      cartItems
    );

    if (result.valid) {
      setDiscount(result.discount_amount);
      setCouponId(result.coupon_id);
      alert(`Coupon applied! You saved $${result.discount_amount.toFixed(2)}`);
    } else {
      alert(result.error);
    }
  } catch (error) {
    alert('Invalid coupon code');
  }
};
```

---

## Step 10: Test Everything

### Testing Checklist

1. **Products**
   - [ ] Products load from database on home page
   - [ ] Categories filter works
   - [ ] Search functionality works
   - [ ] Product details display correctly

2. **Cart**
   - [ ] Add to cart saves to database
   - [ ] Cart persists across page refreshes
   - [ ] Quantity updates work
   - [ ] Remove from cart works
   - [ ] Cart shows correct totals

3. **Checkout**
   - [ ] Address form works
   - [ ] Coupon validation works
   - [ ] Order creation succeeds
   - [ ] Payment record created
   - [ ] Cart clears after order

4. **Orders**
   - [ ] Order history loads
   - [ ] Order details display correctly
   - [ ] Order status updates (admin)

5. **Wishlist**
   - [ ] Add/remove from wishlist
   - [ ] Wishlist persists
   - [ ] Heart icon toggles correctly

6. **Auth**
   - [ ] Signup creates profile
   - [ ] Login/logout works
   - [ ] Profile updates save
   - [ ] Avatar upload works

---

## Common Issues & Solutions

### Issue: "Failed to fetch"
**Solution**: Check your `.env` file has correct Supabase URL and anon key.

### Issue: "Row level security policy violation"
**Solution**: User not authenticated. Ensure `currentUser` exists before database calls.

### Issue: "Column does not exist"
**Solution**: Field names in your code don't match database. Check `supabase.ts` types.

### Issue: Cart doesn't update immediately
**Solution**: After each cart operation, reload the cart from database:
```tsx
const refreshCart = async () => {
  const items = await cartService.getCart();
  setCart(mapCartItems(items));
};
```

---

## Performance Tips

1. **Batch Requests**: Load products, categories, etc. in parallel with `Promise.all()`
2. **Cache Data**: Store fetched products/categories in state to avoid re-fetching
3. **Debounce Search**: Add debouncing to search input to reduce queries
4. **Pagination**: Use `limit` and `offset` for large product lists
5. **Optimistic Updates**: Update UI immediately, sync with DB in background

---

## Next Steps After Frontend Integration

1. **Admin Dashboard**: Build full CRUD UI for products, categories, coupons
2. **Payment Integration**: Add Stripe/PayPal SDK
3. **Email Notifications**: Set up Supabase Edge Functions for emails
4. **Real-time Updates**: Use Supabase subscriptions for live cart/order updates
5. **Analytics**: Add charts to admin dashboard
6. **Image Optimization**: Compress/resize uploaded images
7. **SEO**: Add meta tags, sitemap, structured data

---

## Need Help?

- Check `SUPABASE_INTEGRATION.md` for full API documentation
- Review `MCP_COMMANDS.md` for database queries
- Test queries in Supabase SQL Editor first
- Use browser console to debug API calls
- Check Supabase logs for server errors

**You're ready to integrate! Start with Step 1 (load real products) and work through each step.**
