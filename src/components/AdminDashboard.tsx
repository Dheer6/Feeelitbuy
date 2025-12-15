import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  User,
  TrendingUp,
  DollarSign,
  Settings,
  Bell,
  Image,
  RotateCcw,
  Warehouse,
  FolderTree,
  CreditCard,
  Gift,
  Truck,
  Menu,
  X,
} from 'lucide-react';
import { Product, Order } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { AdminProducts } from './admin/AdminProducts';
import { AdminOrders } from './admin/AdminOrders';
import { AdminUsers } from './admin/AdminUsers';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminBanners } from './admin/AdminBanners';
import { AdminCoupons } from './admin/AdminCoupons';
import { AdminReturns } from './admin/AdminReturns';
import { AdminInventory } from './admin/AdminInventory';
import { AdminCategories } from './admin/AdminCategories';
import { AdminBankOffers } from './admin/AdminBankOffers';
import { AdminReferrals } from './admin/AdminReferrals';
import { AdminDeliveries } from './admin/AdminDeliveries';
import { AdminDeliveryPartners } from './admin/AdminDeliveryPartners';
import { AdminAccounts } from './admin/AdminAccounts';
import { formatINR } from '../lib/currency';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onProductsChange?: () => void;
  onNavigate?: (page: string) => void;
}

export function AdminDashboard({ products, orders, onUpdateOrderStatus, onProductsChange, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Handle stock updates
  const handleUpdateStock = async (productId: string, newStock: number, lowStockThreshold?: number) => {
    try {
      const { productService } = await import('../lib/supabaseService');
      await productService.updateProductStock(productId, newStock, lowStockThreshold);
      
      // Refresh products to show updated stock
      if (onProductsChange) {
        await onProductsChange();
      }
      
      alert('Stock updated successfully!');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert(`Failed to update stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle color variant stock updates
  const handleUpdateColorStock = async (
    productId: string, 
    colors: Array<{ name: string; hex: string; stock: number; images?: string[]; price?: number; discount?: number }>
  ) => {
    try {
      const { productService } = await import('../lib/supabaseService');
      await productService.updateProductColorStocks(productId, colors);
      
      // Refresh products to show updated stock
      if (onProductsChange) {
        await onProductsChange();
      }
      
      alert('Color variant stocks updated successfully!');
    } catch (error) {
      console.error('Error updating color stocks:', error);
      alert(`Failed to update color stocks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status)
  ).length;
  const lowStockProducts = products.filter((p) => {
    const threshold = p.lowStockThreshold || 10;
    return p.stock > 0 && p.stock <= threshold;
  }).length;
  
  const recentOrders = orders.slice(0, 5);
  const topProducts = products
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, 5);

  // Generate notifications
  const notifications = [
    // New orders (pending/processing)
    ...orders
      .filter(o => ['pending', 'processing'].includes(o.status))
      .slice(0, 3)
      .map(order => ({
        id: `order-${order.id}`,
        type: 'order' as const,
        title: 'New Order',
        message: `Order #${order.id.slice(0, 8)} - ${formatINR(order.total)}`,
        time: new Date(order.createdAt).toLocaleString(),
        icon: ShoppingBag,
        color: 'blue',
        action: () => setActiveTab('orders')
      })),
    // Low stock alerts
    ...products
      .filter(p => {
        const threshold = p.lowStockThreshold || 10;
        return p.stock > 0 && p.stock <= threshold;
      })
      .slice(0, 3)
      .map(product => ({
        id: `stock-${product.id}`,
        type: 'stock' as const,
        title: 'Low Stock Alert',
        message: `${product.name} - Only ${product.stock} left`,
        time: 'Just now',
        icon: Package,
        color: 'orange',
        action: () => setActiveTab('inventory')
      })),
    // Recent deliveries
    ...orders
      .filter(o => o.status === 'shipped')
      .slice(0, 2)
      .map(order => ({
        id: `delivery-${order.id}`,
        type: 'delivery' as const,
        title: 'Order Shipped',
        message: `Order #${order.id.slice(0, 8)} is on the way`,
        time: new Date(order.createdAt).toLocaleString(),
        icon: Truck,
        color: 'green',
        action: () => setActiveTab('deliveries')
      }))
  ].slice(0, 8); // Limit to 8 notifications

  const unreadCount = notifications.length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Important Tabs */}
      <div className={`bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-48'}`}>
        {/* Logo and Brand */}
        <div className={`border-b border-gray-200 ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-2">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <img 
                  src="/fib-logo.png" 
                  alt="FIB Logo" 
                  className="w-auto h-10 object-contain"
                />
                {/* <div>
                  <h1 className="text-xl font-bold text-gray-900">Feel It Buy</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div> */}
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Navigation - Scrollable */}
        <nav className={`flex-1 space-y-2 overflow-y-auto pb-4 ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Overview"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Overview</span>}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'products'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Products"
          >
            <Package className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Products</span>}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'inventory'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Inventory"
          >
            <Warehouse className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Inventory</span>}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Orders"
          >
            <ShoppingBag className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Orders</span>}
          </button>

          

          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'accounts'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Accounts"
          >
            <DollarSign className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Accounts</span>}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Analytics"
          >
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Analytics</span>}
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'returns'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Returns"
          >
            <RotateCcw className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Returns</span>}
          </button>

          <button
            onClick={() => setActiveTab('deliveries')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'deliveries'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Deliveries"
          >
            <Truck className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Deliveries</span>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            } ${sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
            title="Users"
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Users</span>}
          </button>
        </nav>

        {/* Bottom Actions - Sticky at bottom */}
        <div className={`mt-auto border-t border-gray-200 space-y-2 bg-white ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`w-full text-gray-700 hover:bg-gray-100 ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start'}`}
            onClick={() => onNavigate?.('home')}
            title="Settings"
          >
            <Settings className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
            {!sidebarCollapsed && <span className="font-medium">Settings</span>}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full border-red-200 text-red-600 hover:bg-red-50 ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start'}`}
            onClick={() => onNavigate?.('home')}
            title="Back to Store"
          >
            <svg className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!sidebarCollapsed && <span className="font-medium">Back to Store</span>}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto px-8 py-6">
          {/* Top Action Bar */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'products' && 'Products'}
                {activeTab === 'inventory' && 'Inventory'}
                {activeTab === 'orders' && 'Orders'}
                {activeTab === 'users' && 'Customers'}
                {activeTab === 'accounts' && 'Accounts'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'returns' && 'Returns'}
                {activeTab === 'deliveries' && 'Deliveries'}
                {activeTab === 'banners' && 'Banners'}
                {activeTab === 'coupons' && 'Coupons'}
                {activeTab === 'categories' && 'Categories'}
                {activeTab === 'bankoffers' && 'Bank Offers'}
                {activeTab === 'referrals' && 'Referrals'}
                {activeTab === 'delivery-partners' && 'Partners'}
              </h2>
              <p className="text-sm text-gray-600">
                {activeTab === 'overview' && 'Monitor your store performance'}
                {activeTab === 'products' && 'Manage your product catalog'}
                {activeTab === 'inventory' && 'Track stock levels and inventory'}
                {activeTab === 'orders' && 'View and manage customer orders'}
                {activeTab === 'users' && 'Manage customer accounts'}
                {activeTab === 'accounts' && 'Financial reports and statements'}
                {activeTab === 'analytics' && 'View detailed insights and reports'}
                {activeTab === 'returns' && 'Handle product return requests'}
                {activeTab === 'deliveries' && 'Manage delivery operations'}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                      {/* Header */}
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <Badge className="bg-red-100 text-red-700">
                            {unreadCount} new
                          </Badge>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No new notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => {
                              const IconComponent = notification.icon;
                              return (
                                <button
                                  key={notification.id}
                                  onClick={() => {
                                    notification.action();
                                    setShowNotifications(false);
                                  }}
                                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex gap-3"
                                >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                    notification.color === 'blue' ? 'bg-blue-100' :
                                    notification.color === 'orange' ? 'bg-orange-100' :
                                    notification.color === 'green' ? 'bg-green-100' :
                                    'bg-gray-100'
                                  }`}>
                                    <IconComponent className={`w-5 h-5 ${
                                      notification.color === 'blue' ? 'text-blue-600' :
                                      notification.color === 'orange' ? 'text-orange-600' :
                                      notification.color === 'green' ? 'text-green-600' :
                                      'text-gray-600'
                                    }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm mb-1">
                                      {notification.title}
                                    </p>
                                    <p className="text-gray-600 text-sm mb-1 truncate">
                                      {notification.message}
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                      {notification.time}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <button 
                            className="w-full text-center text-sm text-red-600 hover:text-red-700 font-medium"
                            onClick={() => setShowNotifications(false)}
                          >
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Secondary Tabs - Less Important */}
            <div className="mb-6">
              <TabsList className="bg-white border border-gray-200">
                <TabsTrigger value="banners" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
                  <Image className="w-4 h-4 mr-2" />
                  Banners
                </TabsTrigger>
                <TabsTrigger value="coupons" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Coupons
                </TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
                  <FolderTree className="w-4 h-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="bankoffers" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Bank Offers
                </TabsTrigger>
                <TabsTrigger value="referrals" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
                  <Gift className="w-4 h-4 mr-2" />
                  Referrals
                </TabsTrigger>
                <TabsTrigger value="delivery-partners" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
                  <User className="w-4 h-4 mr-2" />
                  Partners
                </TabsTrigger>
              </TabsList>
            </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">Total Revenue</p>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-green-600 mb-1" style={{ fontSize: '28px' }}>
                {formatINR(totalRevenue)}
              </p>
              <p className="text-sm text-gray-500">+12.5% from last month</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">Total Orders</p>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-blue-600 mb-1" style={{ fontSize: '28px' }}>
                {totalOrders}
              </p>
              <p className="text-sm text-gray-500">{activeOrders} active orders</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">Total Products</p>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-purple-600 mb-1" style={{ fontSize: '28px' }}>
                {totalProducts}
              </p>
              <p className="text-sm text-orange-500">{lowStockProducts} low stock</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">Avg. Order Value</p>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-indigo-600 mb-1" style={{ fontSize: '28px' }}>
                {totalOrders > 0 ? formatINR(totalRevenue / totalOrders) : formatINR(0)}
              </p>
              <p className="text-sm text-gray-500">+8.2% from last month</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card className="p-6">
              <h3 className="mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="text-sm mb-1">{order.id}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-indigo-600">{formatINR(order.total)}</p>
                      <Badge
                        className={
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Products */}
            <Card className="p-6">
              <h3 className="mb-4">Top Rated Products</h3>
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="text-sm mb-1">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-indigo-600">{formatINR(product.price)}</p>
                      <p className="text-xs text-gray-600">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts > 0 && (
            <Card className="p-6 bg-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-orange-900">Low Stock Alert</h3>
                  <p className="text-orange-800 mb-3">
                    {lowStockProducts} product{lowStockProducts !== 1 ? 's' : ''} running low on
                    stock. Review and restock to avoid shortages.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-300 hover:bg-orange-100"
                    onClick={() => setActiveTab('products')}
                  >
                    View Products
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <AdminProducts products={products} onProductsChange={onProductsChange} />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <AdminInventory 
            products={products} 
            onUpdateStock={handleUpdateStock}
            onUpdateColorStock={handleUpdateColorStock}
          />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <AdminOrders orders={orders} onUpdateOrderStatus={onUpdateOrderStatus} />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners">
          <AdminBanners />
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <AdminCoupons />
        </TabsContent>

        {/* Returns Tab */}
        <TabsContent value="returns">
          <AdminReturns products={products} onProductsChange={onProductsChange} />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <AdminCategories />
        </TabsContent>

        {/* Bank Offers Tab */}
        <TabsContent value="bankoffers">
          <AdminBankOffers />
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <AdminReferrals />
        </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries">
          <AdminDeliveries />
        </TabsContent>

        {/* Delivery Partners Tab */}
        <TabsContent value="delivery-partners">
          <AdminDeliveryPartners />
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <AdminAccounts />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AdminAnalytics orders={orders} products={products} />
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}
