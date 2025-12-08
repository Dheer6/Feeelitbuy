import { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatINR } from '../../lib/currency';

export function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState({
    onlineUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
  });
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { analyticsService } = await import('../../lib/supabaseService');
        
        // Get online users count
        const onlineCount = await analyticsService.getOnlineUsersCount();
        
        // Get activity logs
        const logs = await analyticsService.getActivityLogs(100);
        
        setStats({
          onlineUsers: onlineCount || 0,
          totalRevenue: 45000, // This would come from order totals
          totalOrders: 250,
          conversionRate: 3.5,
        });
        
        setActivityLogs(logs || []);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 30000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [autoRefresh]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'purchase':
        return 'bg-green-50 text-green-700';
      case 'login':
        return 'bg-blue-50 text-blue-700';
      case 'view_product':
        return 'bg-purple-50 text-purple-700';
      case 'add_to_cart':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Button
          variant={autoRefresh ? 'default' : 'outline'}
          onClick={() => setAutoRefresh(!autoRefresh)}
          size="sm"
        >
          {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Online Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.onlineUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Last 5 minutes</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">{formatINR(stats.totalRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-orange-600">{stats.conversionRate}%</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activityLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            activityLogs.slice(0, 20).map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="outline" className={getActionColor(log.action)}>
                    {log.action.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{log.user_id?.substring(0, 8) || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{log.details || 'No details'}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {log.created_at 
                    ? new Date(log.created_at).toLocaleTimeString()
                    : 'Recently'
                  }
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Top Actions</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Product Views</span>
              <strong>1,234</strong>
            </div>
            <div className="flex justify-between">
              <span>Add to Cart</span>
              <strong>456</strong>
            </div>
            <div className="flex justify-between">
              <span>Purchases</span>
              <strong>89</strong>
            </div>
            <div className="flex justify-between">
              <span>Wishlist Adds</span>
              <strong>123</strong>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Peak Hours</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>8 PM - 10 PM</span>
              <strong className="text-green-600">High</strong>
            </div>
            <div className="flex justify-between">
              <span>10 PM - 12 AM</span>
              <strong className="text-orange-600">Medium</strong>
            </div>
            <div className="flex justify-between">
              <span>12 AM - 8 AM</span>
              <strong className="text-red-600">Low</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
