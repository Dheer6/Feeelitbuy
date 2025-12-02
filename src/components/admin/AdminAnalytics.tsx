import { Order, Product } from '../../types';
import { Card } from '../ui/card';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, Users, Repeat, BarChart3 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

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
    return_requested: orders.filter((o) => o.status === 'return_requested').length,
    returned: orders.filter((o) => o.status === 'returned').length,
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

  // Prepare data for revenue trend (last 30 days)
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const revenueTrendData = getLast30Days().map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === dateStr;
    });
    const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(revenue.toFixed(2)),
      orders: dayOrders.length
    };
  });

  // Prepare data for order status pie chart
  const pieChartData = Object.entries(statusBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value: count
    }));

  // Prepare data for category comparison
  const categoryData = [
    { category: 'Electronics', sales: electronicsSales, orders: electronicsOrders.length },
    { category: 'Furniture', sales: furnitureSales, orders: furnitureOrders.length }
  ];

  // Prepare data for daily sales pattern
  const salesByDayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
    const dayOrders = orders.filter(order => new Date(order.createdAt).getDay() === index);
    return {
      day,
      sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
      orders: dayOrders.length
    };
  });

  // Customer analytics
  const uniqueCustomers = new Set(orders.map(o => o.userId)).size;
  const repeatCustomers = orders.reduce((acc, order) => {
    const customerOrders = orders.filter(o => o.userId === order.userId);
    if (customerOrders.length > 1 && !acc.has(order.userId)) {
      acc.add(order.userId);
    }
    return acc;
  }, new Set()).size;
  
  const customerLifetimeValue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

  // Colors for charts
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('sales') ? '₹' : ''}{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            ₹{totalRevenue.toFixed(2)}
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
            ₹{avgOrderValue.toFixed(2)}
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

      {/* Revenue Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Revenue Trend (Last 30 Days)</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#6366f1" 
              strokeWidth={2}
              name="Revenue (₹)"
              dot={{ fill: '#6366f1', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Orders Count"
              dot={{ fill: '#10b981', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Order Status & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Performance Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Category Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sales" fill="#6366f1" name="Sales (₹)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="orders" fill="#10b981" name="Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Sales by Day of Week */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Sales Pattern by Day of Week</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesByDayOfWeek}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSales)" 
              name="Sales (₹)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Customer Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Total Customers</p>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-indigo-600 mb-2" style={{ fontSize: '28px' }}>
            {uniqueCustomers}
          </p>
          <p className="text-sm text-gray-600">Unique customers</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Repeat Customers</p>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-purple-600 mb-2" style={{ fontSize: '28px' }}>
            {repeatCustomers}
          </p>
          <p className="text-sm text-gray-600">
            {uniqueCustomers > 0 ? ((repeatCustomers / uniqueCustomers) * 100).toFixed(1) : '0'}% retention rate
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Customer LTV</p>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-green-600 mb-2" style={{ fontSize: '28px' }}>
            ₹{customerLifetimeValue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Average lifetime value</p>
        </Card>
      </div>

      {/* Top Selling Products with Horizontal Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Top Selling Products</h3>
        <div className="space-y-6">
          {topSellingProducts.map((product, index) => (
            <div key={product.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-indigo-600 font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600">₹{product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{product.itemsSold} sold</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-linear-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(product.itemsSold / Math.max(...topSellingProducts.map(p => p.itemsSold))) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="mb-3 text-blue-900 font-semibold">Peak Sales Day</h3>
          <p className="text-blue-800 mb-2 text-xl font-bold">
            {salesByDayOfWeek.reduce((max, day) => day.sales > max.sales ? day : max).day}
          </p>
          <p className="text-sm text-blue-700">
            ₹{salesByDayOfWeek.reduce((max, day) => day.sales > max.sales ? day : max).sales.toFixed(2)} in sales
          </p>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="mb-3 text-green-900 font-semibold">Conversion Rate</h3>
          <p className="text-green-800 mb-2 text-xl font-bold">
            {orders.length > 0 && uniqueCustomers > 0 
              ? ((orders.filter(o => o.status === 'delivered').length / orders.length) * 100).toFixed(1)
              : '0'}%
          </p>
          <p className="text-sm text-green-700">Orders successfully delivered</p>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="mb-3 text-purple-900 font-semibold">Active Orders</h3>
          <p className="text-purple-800 mb-2 text-xl font-bold">
            {statusBreakdown.processing + statusBreakdown.confirmed + statusBreakdown.shipped}
          </p>
          <p className="text-sm text-purple-700">In processing & transit</p>
        </Card>
      </div>
    </div>
  );
}
