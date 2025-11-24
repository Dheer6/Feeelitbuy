// Example of integrating Supabase services into React components
// This file shows patterns for using the database services

import { useEffect, useState } from 'react';
import { 
  authService, 
  productService, 
  cartService, 
  orderService,
  wishlistService,
  reviewService
} from './lib/supabaseService';
import type { Product, Profile } from './lib/supabase';

// =========================
// AUTHENTICATION EXAMPLE
// =========================

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const profile = await authService.getCurrentProfile();
      setUser(profile);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      await checkUser();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await authService.signUp(email, password, fullName);
      await checkUser();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return { user, loading, signIn, signUp, signOut };
}

// =========================
// PRODUCTS EXAMPLE
// =========================

export function useProducts(filters?: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(filters);
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id);
      setProduct(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  return { product, loading, error, refetch: fetchProduct };
}

// =========================
// CART EXAMPLE
// =========================

export function useCart() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await cartService.addToCart(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await cartService.removeFromCart(itemId);
      await fetchCart();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    loading,
    error,
    cartTotal,
    itemCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refetch: fetchCart,
  };
}

// =========================
// ORDERS EXAMPLE
// =========================

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      const order = await orderService.createOrder(orderData);
      await fetchOrders();
      return { success: true, order };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { orders, loading, error, createOrder, refetch: fetchOrders };
}

// =========================
// WISHLIST EXAMPLE
// =========================

export function useWishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlist(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      await wishlistService.addToWishlist(productId);
      await fetchWishlist();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      await fetchWishlist();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.product_id === productId);
  };

  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  };
}

// =========================
// REVIEWS EXAMPLE
// =========================

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProductReviews(productId);
      setReviews(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (rating: number, comment: string) => {
    try {
      await reviewService.createReview(productId, rating, comment);
      await fetchReviews();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment: string) => {
    try {
      await reviewService.updateReview(reviewId, rating, comment);
      await fetchReviews();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      await fetchReviews();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    reviews,
    loading,
    error,
    addReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  };
}

// =========================
// USAGE IN COMPONENTS
// =========================

/*
// Example: Using in a component

function ProductList() {
  const { products, loading, error } = useProducts({ featured: true });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductDetail({ productId }: { productId: string }) {
  const { product, loading } = useProduct(productId);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, 1);
    if (result.success) {
      alert('Added to cart!');
    }
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={() => addToWishlist(product.id)}>
        {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
      </button>
    </div>
  );
}

function CartPage() {
  const { cart, loading, cartTotal, updateQuantity, removeItem } = useCart();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Shopping Cart</h1>
      {cart.map(item => (
        <div key={item.id}>
          <h3>{item.products.name}</h3>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <h2>Total: ${cartTotal.toFixed(2)}</h2>
    </div>
  );
}

function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignIn = async () => {
    const result = await signIn(email, password);
    if (result.success) {
      alert('Signed in successfully!');
    } else {
      alert(result.error);
    }
  };

  const handleSignUp = async () => {
    const result = await signUp(email, password, fullName);
    if (result.success) {
      alert('Signed up successfully!');
    } else {
      alert(result.error);
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}
*/
