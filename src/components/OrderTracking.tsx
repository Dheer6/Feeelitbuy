import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, Download, RotateCcw, Ban } from 'lucide-react';
import { Order } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';

interface OrderTrackingProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
  onReturnOrder?: (orderId: string) => void;
}

export function OrderTracking({ orders, selectedOrderId, onSelectOrder, onCancelOrder, onReturnOrder }: OrderTrackingProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const canCancelOrder = (order: Order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  const canReturnOrder = (order: Order) => {
    return order.status === 'delivered';
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      onCancelOrder?.(orderId);
    }
  };

  const handleReturnOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to return this order? A return request will be created.')) {
      onReturnOrder?.(orderId);
    }
  };

  const downloadInvoice = (order: Order) => {
    // Generate professional invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 40px 30px; 
            background: #ffffff;
            color: #333;
            line-height: 1.6;
          }
          
          /* Header Section */
          .invoice-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 40px; 
            padding-bottom: 30px; 
            border-bottom: 3px solid #4F46E5; 
          }
          .company-info {
            flex: 1;
          }
          .logo-container {
            margin-bottom: 15px;
          }
          .logo {
            max-width: 180px;
            height: auto;
          }
          .company-name { 
            font-size: 32px; 
            font-weight: bold; 
            color: #4F46E5; 
            margin-bottom: 8px; 
          }
          .company-tagline {
            color: #666;
            font-size: 14px;
            font-style: italic;
            margin-bottom: 12px;
          }
          .company-contact {
            font-size: 13px;
            color: #555;
            line-height: 1.8;
          }
          .company-contact p {
            margin: 4px 0;
          }
          
          .invoice-meta {
            text-align: right;
            background: #F3F4F6;
            padding: 20px;
            border-radius: 8px;
            min-width: 280px;
          }
          .invoice-title { 
            font-size: 28px; 
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 15px;
            letter-spacing: 1px;
          }
          .invoice-meta p {
            margin: 6px 0;
            font-size: 14px;
          }
          .invoice-meta strong {
            color: #4F46E5;
            font-weight: 600;
          }
          
          /* Details Section */
          .details-container { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px; 
          }
          .details-box {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4F46E5;
          }
          .details-box h3 { 
            font-size: 16px; 
            color: #4F46E5; 
            margin-bottom: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .details-box p {
            margin: 6px 0;
            font-size: 14px;
            color: #374151;
          }
          .details-box strong {
            color: #1F2937;
            font-weight: 600;
            display: inline-block;
            min-width: 120px;
          }
          
          /* Table Styles */
          .table-wrapper {
            margin: 30px 0;
            overflow-x: auto;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse;
            background: white;
          }
          thead {
            background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
          }
          th { 
            padding: 16px 12px; 
            text-align: left; 
            color: white;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td { 
            padding: 14px 12px; 
            border-bottom: 1px solid #E5E7EB;
            font-size: 14px;
            color: #374151;
          }
          tbody tr:hover {
            background-color: #F9FAFB;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          
          /* Summary Section */
          .summary-section {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
          }
          .summary-box {
            min-width: 350px;
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #E5E7EB;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            color: #374151;
          }
          .summary-row.subtotal {
            border-bottom: 1px solid #D1D5DB;
          }
          .summary-row.total {
            font-size: 18px;
            font-weight: bold;
            color: #1F2937;
            padding-top: 12px;
            border-top: 2px solid #4F46E5;
            margin-top: 8px;
          }
          .summary-row.total .amount {
            color: #4F46E5;
            font-size: 22px;
          }
          
          /* Notes Section */
          .notes-section {
            margin: 40px 0 30px 0;
            padding: 20px;
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            border-radius: 4px;
          }
          .notes-section h4 {
            color: #92400E;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
          }
          .notes-section p {
            color: #78350F;
            font-size: 13px;
          }
          
          /* Signature Section */
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            padding-top: 30px;
            border-top: 2px solid #E5E7EB;
          }
          .signature-box {
            text-align: center;
            min-width: 250px;
          }
          .signature-line {
            width: 200px;
            margin: 40px auto 10px auto;
            border-top: 2px solid #374151;
          }
          .signature-label {
            font-size: 13px;
            color: #6B7280;
            margin-top: 8px;
          }
          .signature-name {
            font-weight: 600;
            color: #1F2937;
            font-size: 15px;
            margin-top: 4px;
          }
          .signature-designation {
            font-size: 12px;
            color: #9CA3AF;
            font-style: italic;
          }
          
          /* Footer */
          .footer { 
            margin-top: 50px; 
            text-align: center; 
            padding-top: 25px; 
            border-top: 2px solid #E5E7EB;
          }
          .footer-thank-you {
            font-size: 16px;
            color: #4F46E5;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .footer-contact {
            color: #6B7280; 
            font-size: 13px;
            margin: 6px 0;
          }
          .footer-legal {
            margin-top: 15px;
            font-size: 11px;
            color: #9CA3AF;
          }
          
          /* Payment Status Badge */
          .payment-status {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
          }
          .payment-status.paid {
            background: #D1FAE5;
            color: #065F46;
          }
          .payment-status.pending {
            background: #FEF3C7;
            color: #92400E;
          }
          
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- Header with Logo and Invoice Info -->
        <div class="invoice-header">
          <div class="company-info">
            <div class="logo-container">
              <img src="/fib-logo.png" alt="Feel It Buy Logo" class="logo" />
            </div>
            <div class="company-tagline">Your Trusted Shopping Destination</div>
            <div class="company-contact">
              <p>📍 Mumbai, Maharashtra, India</p>
              <p>📧 support@feelitbuy.com</p>
              <p>📞 +91 12345 67890</p>
              <p>🌐 www.feelitbuy.com</p>
            </div>
          </div>
          
          <div class="invoice-meta">
            <div class="invoice-title">INVOICE</div>
            <p><strong>Invoice #:</strong> INV-${order.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Order ID:</strong> ${order.id.substring(0, 12)}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
            <div class="payment-status ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}">
              ${order.paymentStatus.toUpperCase()}
            </div>
          </div>
        </div>
        
        <!-- Bill To and Ship To Details -->
        <div class="details-container">
          <div class="details-box">
            <h3>📋 Invoice Details</h3>
            <p><strong>Customer Name:</strong> ${order.shippingAddress.name || 'Valued Customer'}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Online Payment'}</p>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          </div>
          
          <div class="details-box">
            <h3>🚚 Shipping Address</h3>
            <p><strong>Name:</strong> ${order.shippingAddress.name || 'Customer'}</p>
            <p>${order.shippingAddress.street}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
            <p>${order.shippingAddress.zipCode}</p>
            <p>${order.shippingAddress.country}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Item Description</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 17.5%; text-align: right;">Unit Price</th>
                <th style="width: 17.5%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.product.name}</strong>
                    ${item.product.brand ? `<br><small style="color: #6B7280;">Brand: ${item.product.brand}</small>` : ''}
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatINR(item.product.price)}</td>
                  <td style="text-align: right;"><strong>${formatINR(item.product.price * item.quantity)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
          <div class="summary-box">
            <div class="summary-row subtotal">
              <span>Subtotal:</span>
              <span>${formatINR(order.total)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (included):</span>
              <span>${formatINR(0)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div class="summary-row total">
              <span>Grand Total:</span>
              <span class="amount">${formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="notes-section">
          <h4>💡 Important Notes:</h4>
          <p>• This is a computer-generated invoice and does not require a physical signature.</p>
          <p>• Please retain this invoice for your records and warranty claims.</p>
          <p>• For any queries or support, contact us at support@feelitbuy.com</p>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-label">Customer Acknowledgement</div>
            <div class="signature-line"></div>
            <div class="signature-name">Signature</div>
            <div class="signature-designation">Date: _____________</div>
          </div>
          
          <div class="signature-box">
            <div class="signature-label">Authorized Signatory</div>
            <div class="signature-line"></div>
            <div class="signature-name">Feel It Buy Management</div>
            <div class="signature-designation">Director & Owner</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-thank-you">Thank you for shopping with Feel It Buy!</div>
          <p class="footer-contact">For support: support@feelitbuy.com | +91 12345 67890</p>
          <p class="footer-contact">Visit us at www.feelitbuy.com</p>
          <p class="footer-legal">
            This invoice is generated electronically and is valid without signature. | 
            Terms & Conditions Apply | 
            © ${new Date().getFullYear()} Feel It Buy. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order.id.substring(0, 8)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

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
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedOrder?.id === order.id ? 'ring-2 ring-indigo-600' : ''
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
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed
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
                            className={`w-0.5 h-16 ${step.completed ? 'bg-indigo-600' : 'bg-gray-200'
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
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <ImageWithFallback
                        src={item.product.images?.[0] || ''}
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

            {/* Order Actions */}
            <Card className="p-6">
              <h3 className="mb-4">Order Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => downloadInvoice(selectedOrder)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>

                {canReturnOrder(selectedOrder) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleReturnOrder(selectedOrder.id)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Return Order
                  </Button>
                )}

                {canCancelOrder(selectedOrder) && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>

              {selectedOrder.status === 'cancelled' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    This order has been cancelled. If you were charged, your refund will be processed within 5-7 business days.
                  </p>
                </div>
              )}

              {selectedOrder.status === 'delivered' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Your order has been delivered. You can return this order within 7 days of delivery.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
