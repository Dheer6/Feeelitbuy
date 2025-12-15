import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Wallet, Building2, Banknote, Loader2 } from 'lucide-react';
import { CartItem, User, Address } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';
import { addressService } from '../lib/supabaseService';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = 'rzp_test_NgwEwXk1hnhpL6';

interface CheckoutProps {
  items: CartItem[];
  onPlaceOrder: (shippingDetails: Address, paymentMethod: string, coupon?: any, discountAmount?: number, walletCoinsUsed?: number) => void;
  onBack: () => void;
  user: User | null;
}

export function Checkout({ items, onPlaceOrder, onBack, user }: CheckoutProps) {
  const [shippingDetails, setShippingDetails] = useState<Address>({
    name: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
    phone: user?.phone || '',
    alternatePhone: user?.address?.alternatePhone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const taxRate = 0.18; // 18% GST
  const tax = subtotal * taxRate;
  
  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Card offers state
  const [cardOffers, setCardOffers] = useState<any[]>([]);
  const [selectedCardOffer, setSelectedCardOffer] = useState<any | null>(null);
  const [cardOfferDiscount, setCardOfferDiscount] = useState<number>(0);
  const [loadingCardOffers, setLoadingCardOffers] = useState(true);

  // Wallet coins state
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [useWalletCoins, setUseWalletCoins] = useState<boolean>(false);
  const [walletCoinsToUse, setWalletCoinsToUse] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState(true);

  // Load wallet balance
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) {
        setLoadingWallet(false);
        return;
      }
      try {
        const { walletService } = await import('../lib/supabaseService');
        const wallet = await walletService.getWallet();
        setWalletBalance(wallet?.balance || 0);
      } catch (err) {
        console.error('Failed to load wallet:', err);
        setWalletBalance(0);
      } finally {
        setLoadingWallet(false);
      }
    };
    fetchWallet();
  }, [user]);

  // Load card offers
  useEffect(() => {
    const fetchCardOffers = async () => {
      try {
        const { cardOffersService } = await import('../lib/supabaseService');
        const offers = await cardOffersService.getActiveOffers();
        setCardOffers(offers || []);
      } catch (err) {
        console.error('Failed to load card offers:', err);
      } finally {
        setLoadingCardOffers(false);
      }
    };
    fetchCardOffers();
  }, []);

  // Calculate wallet coins to use
  useEffect(() => {
    if (useWalletCoins && walletBalance > 0) {
      // Can use up to 50% of order total or entire wallet balance, whichever is less
      const maxUsable = Math.min(walletBalance, (subtotal + shipping + tax - discountAmount - cardOfferDiscount) * 0.5);
      setWalletCoinsToUse(Math.max(0, maxUsable));
    } else {
      setWalletCoinsToUse(0);
    }
  }, [useWalletCoins, walletBalance, subtotal, shipping, tax, discountAmount, cardOfferDiscount]);

  // Compute total after discounts
  const total = Math.max(0, subtotal + shipping + tax - discountAmount - cardOfferDiscount - walletCoinsToUse);
  
  // Check if COD is available (only for orders below 5000)
  const isCODAvailable = total < 5000;

  // Load saved address on mount
  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!user) {
        setLoadingAddress(false);
        return;
      }
      
      try {
        const addresses = await addressService.getAddresses();
        if (addresses && addresses.length > 0) {
          // Use the most recent address
          const latestAddress = addresses[0] as any;
          setShippingDetails({
            name: user.name || '',
            street: latestAddress.address_line1 || '',
            city: latestAddress.city || '',
            state: latestAddress.state || '',
            zipCode: latestAddress.postal_code || '',
            country: latestAddress.country || 'India',
            phone: latestAddress.phone || user.phone || '',
            alternatePhone: latestAddress.alternate_phone || '',
          });
        }
      } catch (error) {
        console.error('Failed to load saved address:', error);
      } finally {
        setLoadingAddress(false);
      }
    };

    loadSavedAddress();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate shipping details
    if (!shippingDetails.name || !shippingDetails.street || !shippingDetails.city || !shippingDetails.state || !shippingDetails.zipCode || !shippingDetails.phone) {
      alert('Please fill in all required shipping details');
      return;
    }
    
    if (paymentMethod === 'cod') {
      // COD - directly place order
      setIsProcessing(true);
      try {
        await onPlaceOrder(shippingDetails, 'cod', appliedCoupon, discountAmount, walletCoinsToUse);
      } catch (error) {
        console.error('Order placement failed:', error);
        setIsProcessing(false);
      }
    } else {
      // Razorpay payment
      initiateRazorpayPayment();
    }
  };

  const initiateRazorpayPayment = () => {
    if (!window.Razorpay) {
      alert('Razorpay is not loaded. Please refresh the page and try again.');
      return;
    }

    setIsProcessing(true);

    const options = {
      key: RAZORPAY_KEY,
      amount: Math.round(total * 100), // Amount in paise (multiply by 100)
      currency: 'INR',
      name: 'Feel It Buy',
      description: `Order for ${items.length} item(s)`,
      image: '/fib-logo.png',
      handler: function (response: any) {
        // Payment successful
        console.log('Payment successful:', response);
        setIsProcessing(false);
        // Now place the order with payment ID and wallet coins used
        onPlaceOrder(shippingDetails, `razorpay_${response.razorpay_payment_id}`, appliedCoupon, discountAmount, walletCoinsToUse);
      },
      prefill: {
        name: shippingDetails.name || user?.name || '',
        email: user?.email || '',
        contact: shippingDetails.phone || user?.phone || ''
      },
      notes: {
        address: `${shippingDetails.street}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}`,
        items: items.map(item => `${item.product.name} x${item.quantity}`).join(', ')
      },
      theme: {
        color: '#4F46E5' // Indigo color matching your theme
      },
      modal: {
        ondismiss: function () {
          console.log('Payment cancelled by user');
          setIsProcessing(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      setIsProcessing(false);
      alert(`Payment failed: ${response.error.description}`);
    });

    razorpay.open();
  };

  return (
    <>
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-2xl">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Order</h3>
            <p className="text-sm text-gray-600">Please wait while we confirm your order...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6" disabled={isProcessing}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

      <h1 className="mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="p-6">
              <h2 className="mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={shippingDetails.name}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, name: e.target.value })
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={shippingDetails.phone}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone (Optional)</Label>
                  <Input
                    id="alternatePhone"
                    value={shippingDetails.alternatePhone}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, alternatePhone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={shippingDetails.street}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, street: e.target.value })
                    }
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingDetails.city}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, city: e.target.value })
                    }
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shippingDetails.state}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, state: e.target.value })
                    }
                    placeholder="NY"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingDetails.zipCode}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, zipCode: e.target.value })
                    }
                    placeholder="10001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={shippingDetails.country}
                    onChange={(e) =>
                      setShippingDetails({ ...shippingDetails, country: e.target.value })
                    }
                    placeholder="india"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="mb-6">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 mr-3 text-indigo-600" />
                      <div>
                        <div className="font-medium">Razorpay</div>
                        <div className="text-xs text-gray-500">UPI, Cards, Wallets, Net Banking</div>
                      </div>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 border rounded-lg p-4 ${isCODAvailable ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}>
                    <RadioGroupItem value="cod" id="cod" disabled={!isCODAvailable} />
                    <Label htmlFor="cod" className={`flex items-center flex-1 ${isCODAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      <Banknote className="w-5 h-5 mr-3 text-indigo-600" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-xs text-gray-500">
                          {isCODAvailable ? 'Pay when you receive' : 'Only available for orders below ₹5000'}
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h3 className="mb-6">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  // Get color-specific image if color is selected
                  const displayImage = item.selectedColor && item.product.colors
                    ? (item.product.colors.find(c => c.name === item.selectedColor)?.images?.[0] || item.product.images?.[0] || '')
                    : (item.product.images?.[0] || '');

                  return (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <ImageWithFallback
                          src={displayImage}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.product.name}</p>
                        {item.selectedColor && (
                          <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                        )}
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm text-indigo-600">
                          {formatINR(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Offers */}
              {!loadingCardOffers && cardOffers.length > 0 && (
                <div className="mb-6">
                  <Label className="mb-2 block">Card Offers</Label>
                  {selectedCardOffer ? (
                    <div className="flex items-center justify-between border rounded-lg p-3 bg-blue-50">
                      <div>
                        <p className="text-sm font-semibold text-blue-700">
                          {selectedCardOffer.card_type} Card Applied
                        </p>
                        <p className="text-xs text-blue-600">
                          You saved {formatINR(cardOfferDiscount)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCardOffer(null);
                          setCardOfferDiscount(0);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cardOffers.map((offer) => {
                        const isEligible = subtotal >= offer.min_amount;
                        const { cardOffersService } = require('../lib/supabaseService');
                        const discount = cardOffersService.calculateDiscount(offer, subtotal);
                        
                        return (
                          <button
                            key={offer.id}
                            onClick={() => {
                              if (isEligible) {
                                setSelectedCardOffer(offer);
                                setCardOfferDiscount(discount);
                              }
                            }}
                            disabled={!isEligible}
                            className={`w-full text-left p-3 border rounded-lg transition-colors ${
                              isEligible
                                ? 'hover:bg-blue-50 hover:border-blue-400 cursor-pointer'
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm">{offer.card_type} Card Offer</p>
                                <p className="text-xs text-gray-600">
                                  {offer.discount_type === 'percentage'
                                    ? `${offer.discount_value}% off`
                                    : `Flat ${formatINR(offer.discount_value)} off`}
                                  {' on orders above '}{formatINR(offer.min_amount)}
                                </p>
                                {!isEligible && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Add {formatINR(offer.min_amount - subtotal)} more to avail
                                  </p>
                                )}
                              </div>
                              {isEligible && (
                                <span className="text-green-600 font-semibold">
                                  Save {formatINR(discount)}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Wallet Coins */}
              {!loadingWallet && walletBalance > 0 && (
                <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-orange-600" />
                      <Label className="text-sm font-semibold">Use Wallet Coins</Label>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useWalletCoins}
                        onChange={(e) => setUseWalletCoins(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="mb-1">Available Balance: <span className="font-bold text-orange-600">{formatINR(walletBalance)}</span></p>
                    {useWalletCoins && walletCoinsToUse > 0 && (
                      <p className="text-green-600 font-semibold">
                        ✓ Using {formatINR(walletCoinsToUse)} from wallet (Save up to 50% of order total)
                      </p>
                    )}
                    {useWalletCoins && walletCoinsToUse === 0 && (
                      <p className="text-gray-500 text-xs">Not enough balance or already at maximum discount</p>
                    )}
                  </div>
                </div>
              )}

              {/* Coupon Code */}
              <div className="mb-6">
                <Label htmlFor="coupon" className="mb-2 block">Coupon Code</Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between border rounded-lg p-3 bg-green-50">
                    <div>
                      <p className="text-sm font-semibold text-green-700">{appliedCoupon.code} applied</p>
                      <p className="text-xs text-green-600">You saved {formatINR(discountAmount)}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(''); }}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="SAVE10"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!couponCode || validatingCoupon}
                      onClick={async () => {
                        setCouponError(null);
                        setValidatingCoupon(true);
                        try {
                          // Fetch coupon by code using edge (simple manual validation)
                          const { couponService } = await import('../lib/supabaseEnhanced');
                          const all = await couponService.getAllCoupons();
                          const found = all.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
                          if (!found) {
                            setCouponError('Invalid coupon code');
                          } else {
                            const now = new Date();
                            const starts = new Date(found.valid_from);
                            const ends = found.valid_until ? new Date(found.valid_until) : null;
                            if (!found.is_active || now < starts || (ends && now > ends)) {
                              setCouponError('Coupon not active');
                            } else if (subtotal < found.min_purchase_amount) {
                              setCouponError(`Minimum purchase ${formatINR(found.min_purchase_amount)}`);
                            } else if (found.usage_limit && found.usage_count >= found.usage_limit) {
                              setCouponError('Coupon usage limit reached');
                            } else {
                              let discount = found.discount_type === 'percentage'
                                ? (subtotal * (found.discount_value / 100))
                                : found.discount_value;
                              if (found.max_discount_amount && discount > found.max_discount_amount) {
                                discount = found.max_discount_amount;
                              }
                              discount = Math.min(discount, subtotal);
                              setAppliedCoupon(found);
                              setDiscountAmount(discount);
                            }
                          }
                        } catch (err: any) {
                          setCouponError(err.message || 'Failed to validate coupon');
                        } finally {
                          setValidatingCoupon(false);
                        }
                      }}
                    >
                      {validatingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6 pt-6 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (GST 18%)</span>
                  <span>{formatINR(tax)}</span>
                </div>
                {cardOfferDiscount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Card Offer ({selectedCardOffer?.card_type})</span>
                    <span>-{formatINR(cardOfferDiscount)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                {walletCoinsToUse > 0 && (
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>Wallet Coins</span>
                    <span>-{formatINR(walletCoinsToUse)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-indigo-600">{formatINR(total)}</span>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  Inclusive of all taxes
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Pay ${formatINR(total)}`}
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </Card>
          </div>
        </div>
      </form>
      </div>
    </>
  );
}
