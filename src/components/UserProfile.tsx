import { User, Mail, Phone, Calendar, Package, Edit2, Save, X, MapPin } from 'lucide-react';
import { User as UserType, Order } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';
import { authService } from '../lib/supabaseService';
import { formatINR } from '../lib/currency';
import { AddressManager } from './AddressManager';

interface UserProfileProps {
  user: UserType | null;
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

export function UserProfile({ user, orders, onViewOrder }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditForm({
        full_name: user.name,
        phone: user.phone,
      });
      setError(null);
      setSuccess(false);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    setSuccess(false);

    try {
      await authService.updateProfile({
        full_name: editForm.full_name,
        phone: editForm.phone,
      });
      
      setSuccess(true);
      setIsEditing(false);
      
      // Reload page to update user info
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const recentOrders = orders.slice(0, 5);
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3>Profile Information</h3>
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditToggle}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditToggle}
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm mb-4">
                Profile updated successfully!
              </div>
            )}

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="mb-2">{user.name}</h2>
              {user.role === 'admin' ? (
                <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-800">User</Badge>
              )}
            </div>

            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="mt-1"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
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
                <p className="text-indigo-600">{formatINR(totalSpent)}</p>
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

        {/* Recent Orders & Addresses */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">
                <Package className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="addresses">
                <MapPin className="w-4 h-4 mr-2" />
                Addresses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
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
                          <p className="text-indigo-600">{formatINR(order.total)}</p>
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
            </TabsContent>

            <TabsContent value="addresses" className="mt-6">
              <AddressManager />
            </TabsContent>
          </Tabs>

          {/* Refer and Earn */}
          <Card className="p-6 mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <h3 className="mb-3">Refer & Earn</h3>
            <p className="text-gray-700 mb-4">
              Share Feel It Buy with your friends and earn rewards! Get {formatINR(10)} for every friend who
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
