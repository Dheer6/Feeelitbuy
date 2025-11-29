import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
  onViewProduct: (product: any) => void;
}

export function Cart({ items, onUpdateQuantity, onRemove, onCheckout, onContinueShopping, onViewProduct }: CartProps) {

  // Ensure each product has images array mapped from product_images
  const mappedItems = items.map(item => {
    const product = { ...item.product };
    if (product.product_images && Array.isArray(product.product_images) && product.product_images.length > 0) {
      product.images = product.product_images.map(img => img.image_url);
    } else if (product.image_url) {
      product.images = [product.image_url];
    } else {
      product.images = [];
    }
    return { ...item, product };
  });

  const subtotal = mappedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  if (mappedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button onClick={onContinueShopping}>Continue Shopping</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Shopping Cart ({mappedItems.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {mappedItems.map((item) => (
            <Card key={item.product.id} className="p-4">
              <div className="flex gap-4">
                <div
                  className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onViewProduct(item.product)}
                >
                  <ImageWithFallback
                    src={item.product.images?.[0] || ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="mb-1" style={{ fontSize: '16px' }}>
                        {item.product.name}
                      </h3>
                      <p className="text-indigo-600 text-sm mb-2">{item.product.brand}</p>
                      <p className="text-gray-600 mb-3">
                        {formatINR(item.product.price)} each
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="text-red-500 hover:text-red-700 h-8"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[60px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">Subtotal</p>
                      <p className="text-indigo-600">
                        {formatINR(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-20">
            <h3 className="mb-6">Order Summary</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
              </div>
              {subtotal < 500 && shipping > 0 && (
                <p className="text-sm text-indigo-600">
                  Add {formatINR(500 - subtotal)} more for free shipping!
                </p>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (18%)</span>
                <span>{formatINR(tax)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span>Total</span>
                <span className="text-indigo-600">{formatINR(total)}</span>
              </div>
            </div>

            <Button className="w-full mb-3" size="lg" onClick={onCheckout}>
              Proceed to Checkout
            </Button>
            <Button variant="outline" className="w-full" onClick={onContinueShopping}>
              Continue Shopping
            </Button>

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-gray-600">Secure checkout</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-gray-600">30-day return policy</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-green-600">✓</span>
                </div>
                <p className="text-gray-600">Real-time order tracking</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
