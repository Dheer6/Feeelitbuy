import { useEffect, useState } from 'react';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface PurchaseSuccessProps {
  orderId: string;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
}

export function PurchaseSuccess({ orderId, onTrackOrder, onContinueShopping }: PurchaseSuccessProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full p-8 text-center">
        {/* Animated Success Icon */}
        <div className="mb-6 flex justify-center">
          <div
            className={`relative transition-all duration-700 ${
              showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            <CheckCircle className="w-24 h-24 text-green-500 relative z-10" strokeWidth={2} />
          </div>
        </div>

        {/* Success Message */}
        <div
          className={`transition-all duration-700 delay-300 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Purchase Successful! 🎉
          </h1>
          <p className="text-gray-600 mb-2">
            Thank you for your order. Your purchase has been confirmed.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Order ID: <span className="font-mono font-semibold text-gray-700">{orderId}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <div
          className={`transition-all duration-700 delay-500 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-3">
              <Package className="w-5 h-5" />
              <p className="font-medium">What's Next?</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              We've sent a confirmation email with your order details. You can track your order status
              and view the invoice from your orders page.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`space-y-3 transition-all duration-700 delay-700 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <Button
            onClick={onTrackOrder}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base"
          >
            <Package className="w-5 h-5 mr-2" />
            Track Order
          </Button>
          
          <Button
            onClick={onContinueShopping}
            variant="outline"
            className="w-full h-12 text-base"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@feelitbuy.com" className="text-indigo-600 hover:underline">
              support@feelitbuy.com
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
