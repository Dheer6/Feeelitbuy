import { Order, Product } from '../../types';
import { Card } from '../ui/card';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag } from 'lucide-react';

interface AdminAnalyticsProps {
  orders: Order[];
  products: Product[];
}

export function AdminAnalytics({ orders, products }: AdminAnalyticsProps) {
  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  const electronicsOrders = orders.filter((order) =>
    order.items.some((item) => item.product.category === 'electronics')
  );
  const furnitureOrders = orders.filter((order) =>
    order.items.some((item) => item.product.category === 'furniture')
  );

  const electronicsSales = electronicsOrders.reduce((sum, order) => sum + order.total, 0);
  const furnitureSales = furnitureOrders.reduce((sum, order) => sum + order.total, 0);

  const statusBreakdown = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const topSellingProducts = products
    .map((product) => {
      const itemsSold = orders.reduce((sum, order) => {
        const item = order.items.find((i) => i.product.id === product.id);
        return sum + (item?.quantity || 0);
      }, 0);
      const revenue = orders.reduce((sum, order) => {
        const item = order.items.find((i) => i.product.id === product.id);
        return sum + (item ? item.product.price * item.quantity : 0);
      }, 0);
      return { ...product, itemsSold, revenue };
    })
    .sort((a, b) => b.itemsSold - a.itemsSold)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Total Revenue</p>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-green-600 mb-2" style={{ fontSize: '28px' }}>
            ${totalRevenue.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% vs last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Avg. Order Value</p>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-blue-600 mb-2" style={{ fontSize: '28px' }}>
            ${avgOrderValue.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span>+8.2% vs last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Total Orders</p>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-purple-600 mb-2" style={{ fontSize: '28px' }}>
            {orders.length}
          </p>
          <div className="flex items-center gap-1 text-sm text-purple-600">
            <TrendingUp className="w-4 h-4" />
            <span>+15% vs last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Cancellation Rate</p>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-orange-600 mb-2" style={{ fontSize: '28px' }}>
            {orders.length > 0
              ? ((statusBreakdown.cancelled / orders.length) * 100).toFixed(1)
              : '0'}
            %
          </p>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingDown className="w-4 h-4" />
            <span>-2.3% vs last month</span>
          </div>
        </Card>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-6">Category Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Electronics</span>
                <span className="text-indigo-600">${electronicsSales.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{
                    width: `${(electronicsSales / (electronicsSales + furnitureSales)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {electronicsOrders.length} orders
              </p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Furniture</span>
                <span className="text-purple-600">${furnitureSales.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full"
                  style={{
                    width: `${(furnitureSales / (electronicsSales + furnitureSales)) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {furnitureOrders.length} orders
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-6">Order Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(count / orders.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card className="p-6">
        <h3 className="mb-6">Top Selling Products</h3>
        <div className="space-y-4">
          {topSellingProducts.map((product, index) => (
            <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-600">#{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="mb-1">{product.name}</p>
                <p className="text-sm text-gray-600">{product.brand}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-600 mb-1">${product.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{product.itemsSold} sold</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="mb-3 text-blue-900">Peak Sales Day</h3>
          <p className="text-blue-800 mb-2">Monday</p>
          <p className="text-sm text-blue-700">25% of weekly sales</p>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="mb-3 text-green-900">Customer Satisfaction</h3>
          <p className="text-green-800 mb-2">4.6 / 5.0</p>
          <p className="text-sm text-green-700">Based on 1,247 reviews</p>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="mb-3 text-purple-900">Avg. Delivery Time</h3>
          <p className="text-purple-800 mb-2">3.2 days</p>
          <p className="text-sm text-purple-700">Faster than industry avg</p>
        </Card>
      </div>
    </div>
  );
}
