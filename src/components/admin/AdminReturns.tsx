import { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { returnService } from '../../lib/supabaseEnhanced';
import { productService } from '../../lib/supabaseService';
import { Product } from '../../types';

interface AdminReturnsProps {
  products: Product[];
  onProductsChange?: () => void;
}

export function AdminReturns({ products, onProductsChange }: AdminReturnsProps) {
  const [returns, setReturns] = useState([] as any[]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null as any);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null as string | null);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await returnService.getAllReturnRequests();
      console.log('Loaded returns:', data);
      setReturns(data || []);
    } catch (error: any) {
      console.error('Failed to load returns:', error);
      setError(error.message || 'Failed to load return requests');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (returnId: string, status: 'approved' | 'rejected' | 'processing' | 'completed') => {
    try {
      setUpdating(true);
      await returnService.updateReturnStatus(returnId, status, adminNotes);
      
      // Restore stock when return is approved or completed (for refunds)
      if ((status === 'approved' || status === 'completed') && selectedReturn) {
        try {
          for (const item of selectedReturn.items) {
            const currentProduct = products.find(p => p.id === item.productId);
            if (currentProduct) {
              const newStock = currentProduct.stock + item.quantity;
              await productService.updateProductStock(
                item.productId,
                newStock,
                currentProduct.lowStockThreshold
              );
            }
          }
          // Refresh products to show updated stock
          if (onProductsChange) {
            await onProductsChange();
          }
        } catch (stockErr) {
          console.error('Failed to restore stock:', stockErr);
          // Non-fatal, return was still processed
        }
      }
      
      await loadReturns();
      setSelectedReturn(null);
      setAdminNotes('');
      alert(`Return request ${status} successfully! ${(status === 'approved' || status === 'completed') ? 'Stock has been restored.' : ''}`);
    } catch (error: any) {
      console.error('Failed to update return status:', error);
      alert(`Failed to update return: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      processing: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getReturnTypeBadge = (type: string) => {
    return type === 'refund' ? (
      <Badge className="bg-green-100 text-green-800">Refund</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">Replace</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Return Requests</h2>
          <p className="text-gray-600">Manage customer return and refund requests</p>
        </div>
        <Button onClick={loadReturns} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading Returns</h3>
              <p className="text-red-700">{error}</p>
              <Button onClick={loadReturns} variant="outline" className="mt-3" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!error && returns.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Return Requests</h3>
          <p className="text-gray-600">There are no return requests at this time.</p>
        </Card>
      ) : !error ? (
        <div className="grid gap-6">
          {returns.map((returnReq: any) => (
            <Card key={returnReq.id} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Return #{returnReq.id.slice(0, 8)}
                      </h3>
                      {getStatusBadge(returnReq.status)}
                      {getReturnTypeBadge(returnReq.return_type)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Order ID: {returnReq.order_id?.slice(0, 8) || 'N/A'}</p>
                      <p>Customer: {returnReq.profiles?.full_name || returnReq.profiles?.name || 'Unknown'} ({returnReq.profiles?.email || 'N/A'})</p>
                      <p>Requested: {new Date(returnReq.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹{returnReq.total_amount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {returnReq.return_type === 'refund' ? 'Refund Amount' : 'Replace Value'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Items to Return:</h4>
                  <div className="space-y-2">
                    {returnReq.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Return Reason:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{returnReq.reason}</p>
                </div>

                {/* Admin Notes */}
                {returnReq.admin_notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Admin Notes:</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{returnReq.admin_notes}</p>
                  </div>
                )}

                {/* Actions */}
                {returnReq.status === 'pending' && (
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={selectedReturn === returnReq.id ? adminNotes : ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          setSelectedReturn(returnReq.id);
                          setAdminNotes(e.target.value);
                        }}
                        placeholder="Add notes about this return request..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleUpdateStatus(returnReq.id, 'approved')}
                        disabled={updating}
                        className="flex-1 !bg-green-600 !hover:bg-green-700 !text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(returnReq.id, 'rejected')}
                        disabled={updating}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {returnReq.status === 'approved' && (
                  <div className="border-t pt-4">
                    <Button
                      onClick={() => handleUpdateStatus(returnReq.id, 'processing')}
                      disabled={updating}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Mark as Processing
                    </Button>
                  </div>
                )}

                {returnReq.status === 'processing' && (
                  <div className="border-t pt-4">
                    <Button
                      onClick={() => handleUpdateStatus(returnReq.id, 'completed')}
                      disabled={updating}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
