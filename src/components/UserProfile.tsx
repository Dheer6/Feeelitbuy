import { User, Mail, Phone, Calendar, Package } from 'lucide-react';
import { User as UserType, Order } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface UserProfileProps {
  user: UserType | null;
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

export function UserProfile({ user, orders, onViewOrder }: UserProfileProps) {
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-12 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="mb-4">Not Logged In</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </Card>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="mb-2">{user.name}</h2>
              {user.role === 'admin' && (
                <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="mb-4">Shopping Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Orders</p>
                <p className="text-indigo-600">{orders.length}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                <p className="text-indigo-600">${totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Orders</p>
                <p className="text-indigo-600">
                  {orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2>Recent Orders</h2>
              {orders.length > 5 && (
                <Button variant="outline" size="sm" onClick={() => onViewOrder(orders[0].id)}>
                  View All
                </Button>
              )}
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No orders yet</p>
                <p className="text-gray-500 text-sm">
                  Your order history will appear here once you make a purchase.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p>{order.id}</p>
                      </div>
                      <Badge
                        className={
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-indigo-600">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewOrder(order.id)}
                      >
                        Track Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Refer and Earn */}
          <Card className="p-6 mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <h3 className="mb-3">Refer & Earn</h3>
            <p className="text-gray-700 mb-4">
              Share Feel It Buy with your friends and earn rewards! Get $10 for every friend who
              makes their first purchase.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={`FEELITBUY-${user.id.toUpperCase()}`}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`FEELITBUY-${user.id.toUpperCase()}`);
                  alert('Referral code copied to clipboard!');
                }}
              >
                Copy Code
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
