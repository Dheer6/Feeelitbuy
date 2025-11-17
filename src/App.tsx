import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderTracking } from './components/OrderTracking';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { Product, User, Order, CartItem } from './types';
import { mockProducts } from './data/mockProducts';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('feelitbuy_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    const savedWishlist = localStorage.getItem('feelitbuy_wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
    const savedOrders = localStorage.getItem('feelitbuy_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('feelitbuy_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('feelitbuy_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('feelitbuy_orders', JSON.stringify(orders));
  }, [orders]);

  const handleLogin = (email: string, password: string) => {
    // Mock login - in real app, this would authenticate with backend
    const user: User = {
      id: '1',
      name: email.split('@')[0],
      email: email,
      phone: '+1234567890',
      role: email.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    setShowAuthModal(false);
    if (user.role === 'admin') {
      setCurrentPage('admin');
    }
  };

  const handleRegister = (name: string, email: string, phone: string, password: string) => {
    // Mock registration
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const placeOrder = (shippingDetails: any, paymentMethod: string) => {
    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      userId: currentUser?.id || 'guest',
      items: cart,
      total: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      status: 'pending',
      shippingAddress: shippingDetails,
      paymentMethod,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    setOrders((prev) => [...prev, newOrder]);
    setCart([]);
    setCurrentPage('order-tracking');
    setSelectedOrder(newOrder.id);
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
            products={mockProducts}
          />
        );
      case 'catalog':
        return (
          <ProductCatalog
            category={selectedCategory}
            products={mockProducts}
            onViewProduct={handleViewProduct}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        );
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onAddToCart={addToCart}
            onBack={() => setCurrentPage('catalog')}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            onToggleWishlist={toggleWishlist}
          />
        ) : null;
      case 'cart':
        return (
          <Cart
            items={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onCheckout={() => {
              if (!currentUser) {
                setAuthMode('login');
                setShowAuthModal(true);
              } else {
                setCurrentPage('checkout');
              }
            }}
            onContinueShopping={() => setCurrentPage('catalog')}
          />
        );
      case 'checkout':
        return (
          <Checkout
            items={cart}
            onPlaceOrder={placeOrder}
            onBack={() => setCurrentPage('cart')}
            user={currentUser}
          />
        );
      case 'order-tracking':
        return (
          <OrderTracking
            orders={orders}
            selectedOrderId={selectedOrder}
            onSelectOrder={setSelectedOrder}
          />
        );
      case 'profile':
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
            products={mockProducts}
            orders={orders}
            onUpdateOrderStatus={(orderId, status) => {
              setOrders((prev) =>
                prev.map((order) =>
                  order.id === orderId ? { ...order, status } : order
                )
              );
            }}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onNavigate={setCurrentPage}
        onAuthClick={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
        currentPage={currentPage}
      />
      
      <main className="pt-16">
        {renderPage()}
      </main>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSwitchMode={() =>
            setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
          }
        />
      )}
    </div>
  );
}
