import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Order } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';

interface OrderTrackingProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
}

export function OrderTracking({ orders, selectedOrderId, onSelectOrder }: OrderTrackingProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTrackingSteps = (order: Order) => {
    const steps = [
      { label: 'Order Placed', status: 'pending', date: order.createdAt },
      { label: 'Confirmed', status: 'confirmed', date: order.updatedAt || order.createdAt },
      { label: 'Processing', status: 'processing', date: order.updatedAt || order.createdAt },
      { label: 'Shipped', status: 'shipped', date: order.updatedAt },
      { label: 'Delivered', status: 'delivered', date: order.estimatedDelivery },
    ];

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Order Tracking</h1>

      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="mb-4">Your Orders</h3>
          {filteredOrders.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No orders found</p>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedOrder?.id === order.id ? 'ring-2 ring-indigo-600' : ''
                }`}
                onClick={() => onSelectOrder(order.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p>{order.id}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-indigo-600">{formatINR(order.total)}</p>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                </div>
                <div>
                  <h2 className="mb-1">
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </h2>
                  <p className="text-gray-600">Order {selectedOrder.id}</p>
                </div>
              </div>

              {/* Tracking Steps */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="relative">
                  {getTrackingSteps(selectedOrder).map((step, index) => (
                    <div key={index} className="flex gap-4 pb-8 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        {index < getTrackingSteps(selectedOrder).length - 1 && (
                          <div
                            className={`w-0.5 h-16 ${
                              step.completed ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                          ></div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={step.completed ? 'text-gray-900' : 'text-gray-500'}>
                          {step.label}
                        </p>
                        {step.date && step.completed && (
                          <p className="text-sm text-gray-500">
                            {new Date(step.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedOrder.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">This order has been cancelled.</p>
                </div>
              )}

              {selectedOrder.trackingNumber && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                  <p className="font-mono">{selectedOrder.trackingNumber}</p>
                </div>
              )}
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h3 className="mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="mb-1">{item.product.name}</p>
                      <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                      <p className="text-indigo-600">
                        {formatINR(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t flex justify-between">
                <span>Total</span>
                <span className="text-indigo-600">{formatINR(selectedOrder.total)}</span>
              </div>
            </Card>

            {/* Shipping Details */}
            <Card className="p-6">
              <h3 className="mb-4">Shipping Address</h3>
              <p className="text-gray-700">
                {selectedOrder.shippingAddress.street}
                <br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                {selectedOrder.shippingAddress.zipCode}
                <br />
                {selectedOrder.shippingAddress.country}
              </p>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="text-gray-700 capitalize">{selectedOrder.paymentMethod}</p>
                <Badge className={`mt-2 ${selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                </Badge>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
