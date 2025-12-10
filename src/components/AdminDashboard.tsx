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
import { formatINR } from '../lib/currency';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onProductsChange?: () => void;
}

export function AdminDashboard({ products, orders, onUpdateOrderStatus, onProductsChange }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1>Admin Dashboard</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto mb-8">
          <TabsList className="inline-flex min-w-full w-max">
            <TabsTrigger value="overview">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Warehouse className="w-4 h-4 mr-2" />
              Inventory
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="banners">
            <Image className="w-4 h-4 mr-2" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="coupons">
            <DollarSign className="w-4 h-4 mr-2" />
            Coupons
          </TabsTrigger>
          <TabsTrigger value="returns">
            <RotateCcw className="w-4 h-4 mr-2" />
            Returns
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderTree className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="bankoffers">
            <CreditCard className="w-4 h-4 mr-2" />
            Bank Offers
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Gift className="w-4 h-4 mr-2" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="deliveries">
            <Truck className="w-4 h-4 mr-2" />
            Deliveries
          </TabsTrigger>
          <TabsTrigger value="delivery-partners">
            <User className="w-4 h-4 mr-2" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
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
          <AdminInventory products={products} onUpdateStock={handleUpdateStock} />
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

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AdminAnalytics orders={orders} products={products} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
