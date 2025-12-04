import { useState } from 'react';
import { Eye, Search, User as UserIcon, RefreshCw, PackageOpen } from 'lucide-react';
import { Order } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { formatINR } from '../../lib/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export function AdminOrders({ orders, onUpdateOrderStatus }: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(q) ||
      (order.userName?.toLowerCase().includes(q) || false) ||
      (order.userEmail?.toLowerCase().includes(q) || false);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              {/* <TableHead>Customer</TableHead> */}
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Return</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="text-sm font-mono">{order.id.slice(0,8)}...</p>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    <span>{order.userName || 'Unknown'}</span>
                  </div>
                  {order.userEmail && (
                    <p className="text-[10px] text-gray-400">{order.userEmail}</p>
                  )}
                </TableCell>
                <TableCell>
                  <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-indigo-600">{formatINR(order.total)}</p>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm capitalize">{order.paymentMethod}</p>
                    <Badge
                      className={
                        order.paymentStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      onUpdateOrderStatus(order.id, value as Order['status'])
                    }
                  >
                    <SelectTrigger className={`w-32 ${getStatusColor(order.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {order.status === 'returned' ? (
                    <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1 w-fit">
                      <RefreshCw className="w-3 h-3" />
                      Returned
                    </Badge>
                  ) : order.status === 'delivered' ? (
                    <span className="text-xs text-black">No</span>
                  ) : (
                    <span className="text-xs text-black">Yes</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setViewingOrder(order);
                      setShowViewDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

      {/* View Order Dialog */}
      {viewingOrder && (
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order ID: {viewingOrder.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{viewingOrder.userName || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{viewingOrder.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p>{viewingOrder.shippingAddress.name}</p>
                  <p>{viewingOrder.shippingAddress.street}</p>
                  <p>{viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} {viewingOrder.shippingAddress.zipCode}</p>
                  <p>{viewingOrder.shippingAddress.country}</p>
                  {viewingOrder.shippingAddress.phone && <p className="mt-2">Phone: {viewingOrder.shippingAddress.phone}</p>}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Items ({viewingOrder.items.length})</h3>
                <div className="space-y-3">
                  {viewingOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatINR(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{viewingOrder.paymentMethod}</p>
                  <Badge className={viewingOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {viewingOrder.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <Badge className={getStatusColor(viewingOrder.status)}>
                    {viewingOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">{formatINR(viewingOrder.total)}</span>
                </div>
                {viewingOrder.couponCode && (
                  <p className="text-sm text-green-600 mt-1">Coupon applied: {viewingOrder.couponCode} (-{formatINR(viewingOrder.couponDiscount || 0)})</p>
                )}
              </div>

              {viewingOrder.trackingNumber && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-mono font-medium">{viewingOrder.trackingNumber}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
