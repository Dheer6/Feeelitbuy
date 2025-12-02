import { useState } from 'react';
import { X, Ban } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';

interface CancelOrderDialogProps {
  orderId: string;
  onClose: () => void;
  onSubmit: (orderId: string, reason: string) => Promise<void>;
}

export function CancelOrderDialog({ orderId, onClose, onSubmit }: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(orderId, reason);
      onClose();
    } catch (error: any) {
      alert(`Failed to cancel order: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white">
        <div className="bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cancel Order</h2>
            <p className="text-sm text-gray-600">Order #{orderId.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Reason */}
          <div>
            <Label htmlFor="reason" className="text-base font-semibold mb-2 block">
              Reason for Cancellation <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="Please describe why you want to cancel this order..."
              className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Common reasons: Changed mind, found better price, ordered by mistake, delivery time too long, etc.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Ban className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 mb-1">Cancellation Policy</p>
                <p className="text-yellow-700">
                  Once cancelled, this action cannot be undone. If you've already paid, your refund will be processed within 5-7 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={submitting || !reason.trim()}
            >
              {submitting ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
