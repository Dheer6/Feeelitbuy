import { useState } from 'react';
import { X, Package, RefreshCw, DollarSign } from 'lucide-react';
import { Order } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ReturnDialogProps {
  order: Order;
  onClose: () => void;
  onSubmit: (returnType: 'refund' | 'replace', reason: string, items: any[]) => Promise<void>;
}

export function ReturnDialog({ order, onClose, onSubmit }: ReturnDialogProps) {
  const [returnType, setReturnType] = useState('refund' as 'refund' | 'replace');
  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [submitting, setSubmitting] = useState(false);

  const handleItemToggle = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.size === 0) {
      alert('Please select at least one item to return');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for the return');
      return;
    }

    setSubmitting(true);
    try {
      const itemsToReturn = order.items
        .filter(item => selectedItems.has(item.product.id))
        .map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        }));

      await onSubmit(returnType, reason, itemsToReturn);
      onClose();
    } catch (error: any) {
      alert(`Failed to submit return request: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateReturnTotal = () => {
    return order.items
      .filter(item => selectedItems.has(item.product.id))
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Return Request</h2>
            <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Return Type Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Return Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setReturnType('refund')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  returnType === 'refund'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className={`w-8 h-8 mx-auto mb-2 ${
                  returnType === 'refund' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="font-semibold">Refund</div>
                <div className="text-sm text-gray-600">Get money back</div>
              </button>

              <button
                type="button"
                onClick={() => setReturnType('replace')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  returnType === 'replace'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RefreshCw className={`w-8 h-8 mx-auto mb-2 ${
                  returnType === 'replace' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="font-semibold">Replace</div>
                <div className="text-sm text-gray-600">Get new product</div>
              </button>
            </div>
          </div>

          {/* Items Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Items to Return</Label>
            <div className="space-y-3">
              {order.items.map((item) => (
                <label
                  key={item.product.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedItems.has(item.product.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.product.id)}
                    onChange={() => handleItemToggle(item.product.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.product.name}</div>
                    <div className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ₹{item.product.price.toLocaleString()} = ₹
                      {(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                  <Package className="w-5 h-5 text-gray-400" />
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason" className="text-base font-semibold mb-2 block">
              Reason for Return <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="Please describe why you want to return this item..."
              className="w-full min-h-[100px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              required
            />
          </div>

          {/* Total */}
          {selectedItems.size > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>
                  {returnType === 'refund' ? 'Refund' : 'Replace'} Amount:
                </span>
                <span className="text-blue-600">
                  ₹{calculateReturnTotal().toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedItems.size} item(s) selected
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 !bg-black !hover:bg-blue-700 !text-white"
              disabled={submitting || selectedItems.size === 0 || !reason.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Your return request will be reviewed within 24-48 hours
          </p>
        </form>
      </Card>
    </div>
  );
}
