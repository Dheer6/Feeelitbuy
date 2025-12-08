import { useState, useEffect } from 'react';
import { Send, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

export function AdminWhatsAppNotifications() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [sentStatus, setSentStatus] = useState<any>(null);

  useEffect(() => {
    // Load products
    const loadProducts = async () => {
      try {
        const { productService } = await import('../../lib/supabaseService');
        const prods = await productService.getProducts();
        setProducts(prods || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
  }, []);

  const handleSendNotification = async () => {
    if (!selectedProduct || !message) {
      alert('Please select a product and enter a message');
      return;
    }

    setSending(true);
    try {
      const { supabase } = await import('../../lib/supabase');

      // Get product details
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', selectedProduct)
        .single();

      if (!product) {
        throw new Error('Product not found');
      }

      // Create notification record
      const { data: notification, error } = await supabase
        .from('whatsapp_notifications')
        .insert([
          {
            product_id: selectedProduct,
            message,
            recipient_count: recipientCount,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSentStatus({
        success: true,
        id: notification.id,
        message: 'Notification queued for sending!',
      });

      // Reset form
      setMessage('');
      setSelectedProduct('');
      setRecipientCount(0);

      setTimeout(() => setSentStatus(null), 5000);
    } catch (err) {
      setSentStatus({
        success: false,
        message: 'Error: ' + (err as Error).message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">WhatsApp Notifications</h1>
        <p className="text-gray-600 mt-1">Send product announcements to users</p>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Note:</p>
            <p>WhatsApp Business API integration required. Configure credentials in settings.</p>
          </div>
        </div>
      </Card>

      {/* Status Message */}
      {sentStatus && (
        <Card className={`p-4 flex items-center gap-3 ${
          sentStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          {sentStatus.success ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <div>
            <p className={sentStatus.success ? 'text-green-700' : 'text-red-700'}>
              {sentStatus.message}
            </p>
            {sentStatus.id && (
              <p className="text-xs text-green-600 mt-1">ID: {sentStatus.id}</p>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          {/* Product Selection */}
          <div>
            <Label htmlFor="product">Select Product</Label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2"
            >
              <option value="">-- Choose a product --</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.id.substring(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {/* Recipient Count */}
          <div>
            <Label htmlFor="recipients">Estimated Recipients</Label>
            <Input
              id="recipients"
              type="number"
              value={recipientCount}
              onChange={(e) => setRecipientCount(Number(e.target.value))}
              placeholder="Number of users to send to"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Will send to users who have wishlist or purchased this product</p>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="w-full mt-1 border rounded px-3 py-2 h-24 resize-none"
              maxLength={160}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Keep messages concise</p>
              <p className="text-xs text-gray-500">{message.length}/160</p>
            </div>
          </div>

          {/* Template Suggestions */}
          <div>
            <p className="text-sm font-semibold mb-2">Quick Templates:</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage('🔥 Special Offer! Limited time deal. Check now!')}
                className="w-full justify-start"
              >
                Special Offer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage('📢 New stock available! Get yours before it sells out.')}
                className="w-full justify-start"
              >
                Back in Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage('💝 Flash Sale! Use code FLASH20 for 20% off')}
                className="w-full justify-start"
              >
                Flash Sale
              </Button>
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setMessage('');
                setSelectedProduct('');
                setRecipientCount(0);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={!selectedProduct || !message || sending}
              className="min-w-[150px]"
            >
              {sending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Notifications */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Recent Notifications</h3>
        <div className="space-y-3">
          <p className="text-gray-500 text-center py-4">Load from database or mock data</p>
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-semibold text-sm">Product Notification</p>
                <p className="text-xs text-gray-500">Sent to ~150 users • 2 hours ago</p>
              </div>
              <Badge>Sent</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
