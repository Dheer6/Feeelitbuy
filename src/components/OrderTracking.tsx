import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, Download, RotateCcw, Ban } from 'lucide-react';
import { Order } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';
import { ReturnDialog } from './ReturnDialog';
import { CancelOrderDialog } from './CancelOrderDialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderTrackingProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
  onSubmitReturn?: (orderId: string, returnType: 'refund' | 'replace', reason: string, items: any[]) => Promise<void>;
}

export function OrderTracking({ orders, selectedOrderId, onSelectOrder, onCancelOrder, onSubmitReturn }: OrderTrackingProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const canCancelOrder = (order: Order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  const canReturnOrder = (order: Order) => {
    return order.status === 'delivered';
  };

  const handleCancelOrder = () => {
    setShowCancelDialog(true);
  };

  const handleSubmitCancel = async (orderId: string, reason: string) => {
    if (onCancelOrder) {
      onCancelOrder(orderId, reason);
    }
    setShowCancelDialog(false);
  };

  const handleReturnOrder = () => {
    setShowReturnDialog(true);
  };

  const handleSubmitReturn = async (returnType: 'refund' | 'replace', reason: string, items: any[]) => {
    if (selectedOrder && onSubmitReturn) {
      await onSubmitReturn(selectedOrder.id, returnType, reason, items);
    }
  };

  const downloadInvoice = (order: Order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add logo (if available, you can use base64 or URL)
    // For now, we'll add company name in bold
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FEEL IT BUY', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Feel the Quality, Buy with Confidence', 20, 32);
    
    // Company contact info
    doc.setFontSize(9);
    doc.text('Mumbai, Maharashtra, India', 20, 40);
    doc.text('Email: support@feelitbuy.com', 20, 45);
    doc.text('Phone: +91 12345 67890', 20, 50);
    
    // Invoice box on the right
    doc.setFillColor(245, 245, 245);
    doc.rect(130, 15, 60, 40, 'F');
    doc.setLineWidth(0.5);
    doc.rect(130, 15, 60, 40, 'S');
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 160, 25, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: INV-${order.id.substring(0, 8).toUpperCase()}`, 135, 33);
    doc.text(`Order ID: ${order.id.substring(0, 12)}`, 135, 38);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 135, 43);
    
    // Payment status badge
    const isPaid = order.paymentStatus === 'paid';
    if (isPaid) {
      doc.setFillColor(0, 0, 0);
      doc.rect(135, 47, 35, 6, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(135, 47, 35, 6, 'S');
      doc.setTextColor(0, 0, 0);
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(order.paymentStatus.toUpperCase(), 152.5, 51.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Line separator
    doc.setLineWidth(1);
    doc.line(20, 60, 190, 60);
    
    // Invoice Details and Shipping Address boxes
    doc.setLineWidth(0.5);
    
    // Invoice Details Box
    doc.rect(20, 68, 80, 35, 'S');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS', 25, 75);
    doc.line(20, 77, 100, 77);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${order.shippingAddress.name || 'Valued Customer'}`, 25, 83);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 25, 88);
    doc.text(`Payment: ${order.paymentMethod || 'Online Payment'}`, 25, 93);
    doc.text(`Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`, 25, 98);
    
    // Shipping Address Box
    doc.rect(110, 68, 80, 35, 'S');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SHIPPING ADDRESS', 115, 75);
    doc.line(110, 77, 190, 77);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${order.shippingAddress.name || 'Customer'}`, 115, 83);
    doc.text(`${order.shippingAddress.street}`, 115, 88);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 115, 93);
    doc.text(`${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`, 115, 98);
    
    // Items Table
    const tableStartY = 113;
    const tableData = order.items.map(item => [
      `${item.product.name}${item.product.brand ? `\n(${item.product.brand})` : ''}`,
      item.quantity.toString(),
      formatINR(item.product.price),
      formatINR(item.product.price * item.quantity)
    ]);
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['ITEM DESCRIPTION', 'QTY', 'UNIT PRICE', 'AMOUNT']],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249],
      },
      columnStyles: {
        0: { cellWidth: 85 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      },
    });
    
    // Get Y position after table
    const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 40;
    
    // Summary Box
    const summaryX = 130;
    const summaryY = finalY + 10;
    
    doc.setLineWidth(0.5);
    doc.rect(summaryX, summaryY, 60, 30, 'S');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', summaryX + 5, summaryY + 7);
    doc.text(formatINR(order.total), summaryX + 55, summaryY + 7, { align: 'right' });
    
    doc.text('Tax (GST 18%):', summaryX + 5, summaryY + 13);
    doc.text('Included', summaryX + 55, summaryY + 13, { align: 'right' });
    
    doc.text('Shipping:', summaryX + 5, summaryY + 19);
    doc.text('FREE', summaryX + 55, summaryY + 19, { align: 'right' });
    
    doc.setLineWidth(1);
    doc.line(summaryX, summaryY + 22, summaryX + 60, summaryY + 22);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', summaryX + 5, summaryY + 28);
    doc.text(formatINR(order.total), summaryX + 55, summaryY + 28, { align: 'right' });
    
    // Terms & Conditions
    const termsY = summaryY + 40;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, termsY, 170, 20, 'F');
    doc.setLineWidth(0.5);
    doc.rect(20, termsY, 170, 20, 'S');
    doc.setLineWidth(2);
    doc.line(20, termsY, 20, termsY + 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', 25, termsY + 5);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('• This is a computer-generated invoice and does not require a physical signature.', 25, termsY + 10);
    doc.text('• Please retain this invoice for your records and warranty claims.', 25, termsY + 14);
    doc.text('• For queries or support, contact us at support@feelitbuy.com or call +91 12345 67890.', 25, termsY + 18);
    
    // Signature Section
    const sigY = termsY + 30;
    
    // Customer signature
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('CUSTOMER ACKNOWLEDGEMENT', 40, sigY, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(25, sigY + 15, 75, sigY + 15);
    doc.setFont('helvetica', 'bold');
    doc.text('Signature', 50, sigY + 19, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Date: _____________', 50, sigY + 23, { align: 'center' });
    
    // Authorized signature
    doc.text('AUTHORIZED SIGNATORY', 160, sigY, { align: 'center' });
    doc.line(135, sigY + 15, 185, sigY + 15);
    doc.setFont('helvetica', 'bold');
    doc.text('Feel It Buy', 160, sigY + 19, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Management', 160, sigY + 23, { align: 'center' });
    
    // Footer
    const footerY = pageHeight - 25;
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY, pageWidth, 25, 'F');
    doc.setLineWidth(1);
    doc.line(0, footerY, pageWidth, footerY);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('THANK YOU FOR YOUR BUSINESS!', pageWidth / 2, footerY + 7, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Support: support@feelitbuy.com | Phone: +91 12345 67890', pageWidth / 2, footerY + 12, { align: 'center' });
    doc.text('Visit: www.feelitbuy.com', pageWidth / 2, footerY + 16, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `This invoice is computer generated and is valid without signature. | © ${new Date().getFullYear()} Feel It Buy. All Rights Reserved.`,
      pageWidth / 2,
      footerY + 21,
      { align: 'center' }
    );
    
    // Save the PDF
    doc.save(`invoice-${order.id.substring(0, 8)}.pdf`);
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
      case 'return_requested':
        return 'bg-orange-100 text-orange-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
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
      case 'return_requested':
        return <RotateCcw className="w-5 h-5" />;
      case 'returned':
        return <RotateCcw className="w-5 h-5" />;
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
                    onClick={handleReturnOrder}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Return Order
                  </Button>
                )}

                {canCancelOrder(selectedOrder) && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancelOrder}
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

              {selectedOrder.status === 'return_requested' && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    Your return request has been submitted and is under review. Our team will contact you within 24-48 hours.
                  </p>
                </div>
              )}

              {selectedOrder.status === 'returned' && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800">
                    This order has been returned. Your refund has been processed or replacement is being shipped.
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

      {/* Return Dialog */}
      {showReturnDialog && selectedOrder && (
        <ReturnDialog
          order={selectedOrder}
          onClose={() => setShowReturnDialog(false)}
          onSubmit={handleSubmitReturn}
        />
      )}

      {/* Cancel Order Dialog */}
      {showCancelDialog && selectedOrder && (
        <CancelOrderDialog
          orderId={selectedOrder.id}
          onClose={() => setShowCancelDialog(false)}
          onSubmit={handleSubmitCancel}
        />
      )}
    </div>
  );
}
