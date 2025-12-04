import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Wishlist } from './components/Wishlist';
import { Checkout } from './components/Checkout';
import { PurchaseSuccess } from './components/PurchaseSuccess';
import { OrderTracking } from './components/OrderTracking';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Product, User, Order, CartItem } from './types';
import { mockProducts } from './data/mockProducts';
import { productService, cartService, wishlistService, authService, orderService, addressService } from './lib/supabaseService';
import { couponService, inventoryService, returnService } from './lib/supabaseEnhanced';
import { adaptDbProducts } from './lib/productAdapter';
import { adaptDbOrders } from './lib/orderAdapter';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyNowItems, setBuyNowItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  // Admin-only full orders list
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminOrdersHydrated, setAdminOrdersHydrated] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(mockProducts); // start with mocks
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [wishlistHydrated, setWishlistHydrated] = useState(false);
  const [ordersHydrated, setOrdersHydrated] = useState(false);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Check for existing session on mount
  useEffect(() => {
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        // Immediate fallback so UI updates without waiting for profile row
        const u = session.user;
        setCurrentUser((prev: User | null) => prev || {
          id: u.id,
          name: (u.user_metadata?.full_name as string) || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          phone: (u.user_metadata?.phone as string) || '',
          role: 'customer',
          createdAt: u.created_at || new Date().toISOString(),
        });

        // Retry loading profile (trigger-created) with backoff attempts
        const attemptProfileLoad = async (attempt: number) => {
          try {
            const profile = await authService.getCurrentProfile();
            if (profile) {
              setCurrentUser({
                id: profile.id,
                name: profile.full_name || profile.email.split('@')[0],
                email: profile.email,
                phone: profile.phone || '',
                role: profile.role,
                createdAt: profile.created_at,
              });
              if (profile.role === 'admin') setCurrentPage('admin');
              return; // success
            }
          } catch (err) {
            // swallow; will retry
          }
          if (attempt < 5) {
            setTimeout(() => attemptProfileLoad(attempt + 1), 300 * attempt);
          }
        };
        attemptProfileLoad(1);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const user = await authService.getCurrentUser();

      if (user) {
        let profileLoaded = false;
        try {
          const profile = await authService.getCurrentProfile();
          if (profile) {
            profileLoaded = true;
            setCurrentUser({
              id: profile.id,
              name: profile.full_name || profile.email.split('@')[0],
              email: profile.email,
              phone: profile.phone || '',
              role: profile.role,
              createdAt: profile.created_at,
            });
          }
        } catch (profileError) {
          // fallback below
        }
        if (!profileLoaded) {
          setCurrentUser({
            id: user.id,
            name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: (user.user_metadata?.phone as string) || '',
            role: 'customer',
            createdAt: user.created_at || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Load products from Supabase (after auth check completes so RLS applies if needed)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const rows = await productService.getProducts();
        const adapted = await adaptDbProducts(rows as any);
        // Preserve selectedProduct mapping if it existed from mocks
        setProducts(adapted.length > 0 ? adapted : mockProducts);
      } catch (e: any) {
        setProductsError(e.message || 'Failed to load products. Using local mock data.');
        setProducts(mockProducts); // fallback
      } finally {
        setProductsLoading(false);
      }
    };
    // Only attempt once initial auth loading complete (or if no auth)
    if (!authLoading) {
      loadProducts();
    }
  }, [authLoading]);

  // Load guest cart/wishlist from localStorage (if not logged in)
  useEffect(() => {
    if (!currentUser) {
      const savedCart = localStorage.getItem('feelitbuy_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem('feelitbuy_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    }
  }, []);

  // Save guest cart/wishlist to localStorage (only if not logged in)
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('feelitbuy_cart', JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('feelitbuy_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, currentUser]);

  const handleLogin = () => {
    setShowAuthModal(false);
    // Force immediate user check for faster UI update
    checkUser();
  };

  const handleRegister = () => {
    setShowAuthModal(false);
    // After registration sign-in, ensure user reflected
    checkUser();
  };

  // Hydrate cart & wishlist from Supabase after user becomes available
  useEffect(() => {
    const mergeGuestCart = async () => {
      const guestCartRaw = localStorage.getItem('feelitbuy_cart');
      if (guestCartRaw) {
        try {
          const guestCart: CartItem[] = JSON.parse(guestCartRaw);
          for (const item of guestCart) {
            await cartService.addToCart(item.product.id, item.quantity);
          }
          localStorage.removeItem('feelitbuy_cart');
        } catch (e) {
          console.error('Merging guest cart failed:', e);
        }
      }
    };
    const mergeGuestWishlist = async () => {
      const guestWishlistRaw = localStorage.getItem('feelitbuy_wishlist');
      if (guestWishlistRaw) {
        try {
          const guestWishlist: string[] = JSON.parse(guestWishlistRaw);
          for (const pid of guestWishlist) {
            if (!wishlist.includes(pid)) {
              await wishlistService.addToWishlist(pid);
            }
          }
          localStorage.removeItem('feelitbuy_wishlist');
        } catch (e) {
          console.error('Merging guest wishlist failed:', e);
        }
      }
    };

    const hydrateCart = async () => {
      try {
        const rows = await cartService.getCart();
        const hydrated: CartItem[] = rows.map((r: any) => ({
          product: adaptServerProduct(r),
          quantity: r.quantity,
          itemId: r.id,
        }));
        setCart(hydrated);
        setCartHydrated(true);
      } catch (e) {
        console.error('Cart hydration failed:', e);
      }
    };

    const hydrateWishlist = async () => {
      try {
        const rows = await wishlistService.getWishlist();
        const ids = rows.map((r: any) => r.product_id);
        setWishlist(ids);
        setWishlistHydrated(true);
      } catch (e) {
        console.error('Wishlist hydration failed:', e);
      }
    };

    const hydrateOrders = async () => {
      try {
        const rows = await orderService.getOrders();
        const adapted = adaptDbOrders(rows as any);
        setOrders(adapted);
        setOrdersHydrated(true);
      } catch (e) {
        console.error('Orders hydration failed:', e);
      }
    };

    const hydrateAdminOrders = async () => {
      if (currentUser?.role !== 'admin') return;
      try {
        const rows = await orderService.getAllOrders();
        const adapted = adaptDbOrders(rows as any);
        setAdminOrders(adapted);
        setAdminOrdersHydrated(true);
      } catch (e) {
        console.error('Admin orders hydration failed:', e);
      }
    };

    if (currentUser) {
      if (!cartHydrated) {
        mergeGuestCart().then(hydrateCart);
      }
      if (!wishlistHydrated) {
        mergeGuestWishlist().then(hydrateWishlist);
      }
      if (!ordersHydrated) {
        hydrateOrders();
      }
      if (currentUser.role === 'admin' && !adminOrdersHydrated) {
        hydrateAdminOrders();
      }
    }
  }, [currentUser, cartHydrated, wishlistHydrated, ordersHydrated, adminOrdersHydrated]);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setCurrentPage('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Placeholder image for server products missing images
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x600.png?text=Product';

  function adaptServerProduct(row: any): Product {
    const base = row.products || row; // cart_items returns products(*, product_images(*)) inside row
    const productImages = Array.isArray(base.product_images) ? base.product_images : [];
    const images = productImages.length
      ? productImages
          .sort((a: any, b: any) => {
            // Sort by is_primary first, then by display_order
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.display_order ?? 0) - (b.display_order ?? 0);
          })
          .map((pi: any) => pi.image_url)
          .filter(Boolean) // Filter out null/undefined URLs
      : base.image_url
        ? [base.image_url]
        : [PLACEHOLDER_IMAGE];
    return {
      id: base.id,
      name: base.name || 'Unnamed Product',
      description: base.description || 'No description provided.',
      price: base.price || 0,
      originalPrice: base.original_price || (base.price ? base.price * 1.2 : 0),
      category: 'electronics', // simplified until categories fully mapped
      subcategory: 'general',
      brand: base.brand || 'Generic',
      images,
      specifications: base.specifications || {},
      stock: base.stock ?? 0,
      rating: base.rating || 0,
      reviewCount: base.reviews_count || 0,
      featured: !!base.is_featured,
      reviews: [],
    };
  }

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (currentUser) {
      try {
        const row = await cartService.addToCart(product.id, quantity);
        const adaptedProduct = adaptServerProduct(row);
        setCart((prev: CartItem[]) => {
          const existing = prev.find((i: CartItem) => i.product.id === product.id);
          if (existing) {
            return prev.map((i: CartItem) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity, itemId: row.id }
                : i
            );
          }
          return [...prev, { product: adaptedProduct, quantity: row.quantity, itemId: row.id }];
        });
      } catch (e) {
        console.error('Failed to add to server cart, falling back to local:', e);
        setCart((prev: CartItem[]) => {
          const existingItem = prev.find((item: CartItem) => item.product.id === product.id);
          if (existingItem) {
            return prev.map((item: CartItem) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [...prev, { product, quantity }];
        });
      }
    } else {
      // Guest local cart
      setCart((prev: CartItem[]) => {
        const existingItem = prev.find((item: CartItem) => item.product.id === product.id);
        if (existingItem) {
          return prev.map((item: CartItem) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (currentUser) {
      const item = cart.find((c: CartItem) => c.product.id === productId);
      if (item?.itemId) {
        try {
          const row = await cartService.updateCartItem(item.itemId, quantity);
          setCart((prev: CartItem[]) => prev.map((i: CartItem) => (i.product.id === productId ? { ...i, quantity: row.quantity } : i)));
          return;
        } catch (e) {
          console.error('Failed to update server cart item, falling back local:', e);
        }
      }
    }
    // Fallback / guest
    setCart((prev: CartItem[]) => prev.map((item: CartItem) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const removeFromCart = async (productId: string) => {
    if (currentUser) {
      const item = cart.find((c: CartItem) => c.product.id === productId);
      if (item?.itemId) {
        try {
          await cartService.removeFromCart(item.itemId);
        } catch (e) {
          console.error('Failed to remove from server cart, will still remove locally:', e);
        }
      }
    }
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.product.id !== productId));
  };

  const toggleWishlist = async (productId: string) => {
    if (currentUser) {
      if (wishlist.includes(productId)) {
        try { await wishlistService.removeFromWishlist(productId); } catch (e) { console.error('Server wishlist remove failed:', e); }
        setWishlist((prev: string[]) => prev.filter((id: string) => id !== productId));
      } else {
        try { await wishlistService.addToWishlist(productId); } catch (e) { console.error('Server wishlist add failed:', e); }
        setWishlist((prev: string[]) => [...prev, productId]);
      }
    } else {
      setWishlist((prev: string[]) =>
        prev.includes(productId)
          ? prev.filter((id: string) => id !== productId)
          : [...prev, productId]
      );
    }
  };

  const placeOrder = async (shippingDetails: any, paymentMethod: string, coupon?: any, discountAmount?: number) => {
    if (!currentUser) {
      alert('Please login to place an order');
      return;
    }
    try {
      // Create or get default address
      let addressId: string;
      try {
        const existingAddresses = await addressService.getAddresses();
        if (existingAddresses.length > 0) {
          addressId = existingAddresses[0].id;
        } else {
          const addr = await addressService.createAddress({
            full_name: currentUser.name,
            phone: currentUser.phone || '',
            address_line1: shippingDetails.street,
            address_line2: null,
            city: shippingDetails.city,
            state: shippingDetails.state,
            postal_code: shippingDetails.zipCode,
            country: shippingDetails.country,
            is_default: true,
          });
          addressId = addr.id;
        }
      } catch (addrErr) {
        console.error('Address creation failed:', addrErr);
        throw new Error('Failed to save shipping address');
      }

      // Build order items
      const itemsToOrder = buyNowItems.length > 0 ? buyNowItems : cart;
      const orderItems = itemsToOrder.map((item: CartItem) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderData = {
        items: orderItems,
        shipping_address_id: addressId,
        payment_method: paymentMethod,
      };

      const createdOrder = await orderService.createOrder(orderData);

      // Automatically reserve stock for the order
      try {
        const stockItems = itemsToOrder.map((item: CartItem) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));
        await inventoryService.reserveStock(stockItems, createdOrder.id);
      } catch (stockErr: any) {
        console.error('Stock reservation failed:', stockErr);
        // Order is created but stock not reserved - admin should handle this
      }

      // Record coupon usage if applied
      if (coupon && discountAmount && discountAmount > 0) {
        try {
          await couponService.applyCoupon(coupon.id, createdOrder.id, discountAmount);
        } catch (couponErr: any) {
          console.error('Failed to record coupon usage:', couponErr);
          // Non-fatal
        }
      }

      // Fetch full order details
      const fullOrder = await orderService.getOrder(createdOrder.id);
      const adaptedOrder = adaptDbOrders([fullOrder as any])[0];

      setOrders((prev: Order[]) => [adaptedOrder, ...prev]);
      setCart([]);
      setBuyNowItems([]); // Clear buy now items
      setCartHydrated(false); // trigger re-hydration (cart cleared on server)
      setCompletedOrderId(adaptedOrder.id);
      setCurrentPage('purchase-success');
    } catch (err: any) {
      console.error('Order creation failed:', err);
      alert(`Failed to place order: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Map UI status to DB status (confirmed -> processing)
      const dbStatus = status === 'confirmed' ? 'processing' : status;
      await orderService.updateOrderStatus(orderId, dbStatus as any);
      setOrders((prev: Order[]) =>
        prev.map((order: Order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      // Also update adminOrders if present
      setAdminOrders((prev: Order[]) =>
        prev.map((order: Order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      alert(`Failed to update order status: ${err.message || 'Unknown error'}`);
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      // Update order status to cancelled with the reason
      await orderService.updateOrderStatus(orderId, 'cancelled');
      
      // You could also save the cancellation reason to the database if needed
      // For now, we'll just log it
      console.log('Order cancelled. Reason:', reason);
      
      setOrders((prev: Order[]) =>
        prev.map((order: Order) =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      setAdminOrders((prev: Order[]) =>
        prev.map((order: Order) =>
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
      alert('Order cancelled successfully. Refund will be processed if payment was made.');
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      alert(`Failed to cancel order: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSubmitReturn = async (
    orderId: string,
    returnType: 'refund' | 'replace',
    reason: string,
    items: any[]
  ) => {
    try {
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      await returnService.createReturnRequest({
        orderId,
        returnType,
        reason,
        items,
        totalAmount,
      });

      // Update order status to 'return_requested' in the local state
      setOrders((prev: Order[]) =>
        prev.map((order: Order) =>
          order.id === orderId ? { ...order, status: 'return_requested' as any } : order
        )
      );
      setAdminOrders((prev: Order[]) =>
        prev.map((order: Order) =>
          order.id === orderId ? { ...order, status: 'return_requested' as any } : order
        )
      );

      alert(
        `Return request submitted successfully!\n\n` +
        `Type: ${returnType === 'refund' ? 'Refund' : 'Replace'}\n` +
        `Amount: ₹${totalAmount.toLocaleString()}\n\n` +
        `Our team will review your request within 24-48 hours.`
      );
    } catch (err: any) {
      console.error('Failed to create return request:', err);
      throw new Error(err.message || 'Failed to submit return request');
    }
  };

  const handleProductsRefresh = async () => {
    try {
      const dbProducts = await productService.getProducts();
      const adaptedProducts = await adaptDbProducts(dbProducts as any);
      setProducts(adaptedProducts);
    } catch (err) {
      console.error('Failed to refresh products:', err);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage('catalog');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            onNavigate={setCurrentPage}
            onCategoryClick={handleCategoryClick}
            onViewProduct={handleViewProduct}
            products={products}
          />
        );
      case 'catalog':
        return (
          <ProductCatalog
            category={selectedCategory}
            products={products}
            onViewProduct={handleViewProduct}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onCategoryChange={setSelectedCategory}
          />
        );
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onAddToCart={addToCart}
            onBuyNow={(product, quantity) => {
              // Set buy now items as a separate cart
              setBuyNowItems([{ product, quantity, itemId: `buy-now-${product.id}` }]);
              if (currentUser) {
                setCurrentPage('checkout');
              } else {
                setAuthMode('login');
                setShowAuthModal(true);
              }
            }}
            onBack={() => setCurrentPage('catalog')}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            onToggleWishlist={toggleWishlist}
          />
        ) : null;
      case 'wishlist':
        return (
          <Wishlist
            products={products}
            wishlistIds={wishlist}
            onRemoveFromWishlist={toggleWishlist}
            onAddToCart={(product, quantity) => {
              addToCart(product, quantity);
              toggleWishlist(product.id); // Remove from wishlist after adding to cart
            }}
            onViewProduct={handleViewProduct}
            onContinueShopping={() => setCurrentPage('catalog')}
          />
        );
      case 'cart':
        return (
          <Cart
            items={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onCheckout={() => {
              // Clear buy now items when checking out from cart
              setBuyNowItems([]);
              if (!currentUser) {
                setAuthMode('login');
                setShowAuthModal(true);
              } else {
                setCurrentPage('checkout');
              }
            }}
            onContinueShopping={() => setCurrentPage('catalog')}
            onViewProduct={handleViewProduct}
          />
        );
      case 'checkout':
        return (
          <Checkout
            items={buyNowItems.length > 0 ? buyNowItems : cart}
            onPlaceOrder={placeOrder}
            onBack={() => setCurrentPage(buyNowItems.length > 0 ? 'product-detail' : 'cart')}
            user={currentUser}
          />
        );
      case 'purchase-success':
        return completedOrderId ? (
          <PurchaseSuccess
            orderId={completedOrderId}
            onTrackOrder={() => {
              setSelectedOrder(completedOrderId);
              setCurrentPage('order-tracking');
            }}
            onContinueShopping={() => {
              setCompletedOrderId(null);
              setCurrentPage('catalog');
            }}
          />
        ) : null;
      case 'order-tracking':
        return (
          <OrderTracking
            orders={orders}
            selectedOrderId={selectedOrder}
            onSelectOrder={setSelectedOrder}
            onCancelOrder={handleCancelOrder}
            onSubmitReturn={handleSubmitReturn}
          />
        );
      case 'profile':
        if (!currentUser) {
          setAuthMode('login');
          setShowAuthModal(true);
          setCurrentPage('home');
          return null;
        }
        return (
          <UserProfile
            user={currentUser}
            orders={orders}
            onViewOrder={(orderId) => {
              setSelectedOrder(orderId);
              setCurrentPage('order-tracking');
            }}
          />
        );
      case 'admin':
        return currentUser?.role === 'admin' ? (
          <AdminDashboard
            products={products}
            orders={currentUser.role === 'admin' ? adminOrders : orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onProductsChange={handleProductsRefresh}
          />
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <p>Access Denied. Admin privileges required.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        cartItemCount={cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onNavigate={setCurrentPage}
        onAuthClick={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
        currentPage={currentPage}
      />

      <main className="pt-16 pb-24 md:pb-8">
        {productsLoading && (
          <div className="container mx-auto px-4 py-4 text-sm text-gray-500">Loading products...</div>
        )}
        {productsError && (
          <div className="container mx-auto px-4 py-2 text-sm text-red-600">{productsError}</div>
        )}
        {renderPage()}
      </main>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSwitchMode={() =>
            setAuthMode((prev: 'login' | 'register') => (prev === 'login' ? 'register' : 'login'))
          }
        />
      )}

      <MobileBottomNav
        currentPage={currentPage}
        cartItemCount={cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onNavigate={(page) => {
          if (page === 'profile' && !currentUser) {
            setAuthMode('login');
            setShowAuthModal(true);
          } else {
            setCurrentPage(page);
          }
        }}
      />
    </div>
  );
}
