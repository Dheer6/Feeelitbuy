import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield, RotateCcw, AlertTriangle, Package, Zap, Upload, X, Share2 } from 'lucide-react';
import { Product, User } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';
import { Product360Viewer } from './Product360Viewer';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
  onBuyNow: (product: Product, quantity: number, selectedColor?: string) => void;
  onBack: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  currentUser: User | null;
  onViewProduct?: (product: Product) => void;
}

export function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  onBack,
  isWishlisted,
  onToggleWishlist,
  currentUser,
  onViewProduct,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // Get images and price to display based on selected color
  const selectedColorData = product.colors?.find(c => c.name === selectedColor);
  const displayImages = selectedColor && selectedColorData
    ? (selectedColorData.images && selectedColorData.images.length > 0 ? selectedColorData.images : product.images || [])
    : (product.images || []);
  const displayPrice = selectedColorData?.price || product.price;
  const displayStock = selectedColorData?.stock ?? product.stock;

  // Reset selected image when color changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  // Share functionality
  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'twitter' | 'copy') => {
    const productUrl = `${window.location.origin}/?product=${product.id}`;
    const shareText = `Check out ${product.name} - ${formatINR(product.price)} on Feel It Buy!`;

    try {
      // Increment share count
      const { productEnhancementService } = await import('../lib/supabaseService');
      await productEnhancementService.incrementShareCount(product.id);

      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`, '_blank');
          break;
        case 'copy':
          await navigator.clipboard.writeText(productUrl);
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2000);
          break;
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // Check if user has purchased this product
  useEffect(() => {
    let mounted = true;
    async function checkPurchaseHistory() {
      if (!currentUser) {
        if (mounted) {
          setHasPurchased(false);
          setCheckingPurchase(false);
        }
        return;
      }

      // TEMPORARY: Allow all logged-in users to write reviews for testing
      // TODO: Re-enable purchase verification in production
      if (mounted) {
        setHasPurchased(true);
        setCheckingPurchase(false);
      }
      return;

      // Original purchase verification code (commented out for testing)
      /*
      try {
        const { orderService } = await import('../lib/supabaseService');
        const purchased = await orderService.hasUserPurchasedProduct(currentUser.id, product.id);
        if (mounted) setHasPurchased(purchased);
      } catch (err) {
        console.error('Error checking purchase history:', err);
        if (mounted) setHasPurchased(false);
      }
      if (mounted) setCheckingPurchase(false);
      */
    }
    checkPurchaseHistory();
    return () => { mounted = false; };
  }, [currentUser, product.id]);

  // Fetch reviews on mount and after submit
  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      setLoadingReviews(true);
      try {
        const { reviewService } = await import('../lib/supabaseService');
        const data = await reviewService.getProductReviews(product.id);
        if (mounted) setReviews(data || []);
      } catch (err) {
        if (mounted) setReviews([]);
      }
      setLoadingReviews(false);
    }
    fetchReviews();
    return () => { mounted = false; };
  }, [product.id, reviewSuccess]);

  // Fetch recommended/similar products
  useEffect(() => {
    let mounted = true;
    async function fetchRecommendedProducts() {
      setLoadingRecommended(true);
      try {
        const { productService } = await import('../lib/supabaseService');
        const allProducts = await productService.getProducts();

        const similar = allProducts
          .filter(p =>
            p.id !== product.id &&
            (p.category === product.category || p.brand === product.brand)
          )
          .slice(0, 6);

        if (mounted) setRecommendedProducts(similar);
      } catch (err) {
        console.error('Error fetching recommended products:', err);
        if (mounted) setRecommendedProducts([]);
      }
      setLoadingRecommended(false);
    }
    fetchRecommendedProducts();
    return () => { mounted = false; };
  }, [product.id, product.category, product.brand]);

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }
    onAddToCart(product, quantity, selectedColor || undefined);
    alert(`Added ${quantity} ${product.name}${selectedColor ? ` (${selectedColor})` : ''} to cart!`);
  };

  const handleBuyNow = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }
    onBuyNow(product, quantity, selectedColor || undefined);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = reviewImages.length + newFiles.length;

    if (totalImages > 5) {
      alert('You can upload a maximum of 5 images per review');
      return;
    }

    // Validate file sizes and types
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    for (const file of newFiles) {
      if (file.size > maxSizeBytes) {
        alert(`Image "${file.name}" is too large. Max 5MB per image.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not a valid image.`);
        return;
      }
    }

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

    setReviewImages(prev => [...prev, ...newFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setReviewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery - vertical sidebar */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`rounded-lg overflow-hidden border-2 transition-colors w-16 h-16 ${selectedImage === index ? 'border-indigo-600' : 'border-gray-200'}`}
              >
                <ImageWithFallback
                  src={image || ''}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-4">
            <div className="rounded-lg overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={displayImages[selectedImage] || ''}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* 360° Viewer */}
            {product.rotation_images && product.rotation_images.length > 0 && (
              <Product360Viewer
                images={product.rotation_images}
                productName={product.name}
              />
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <p className="text-indigo-600 mb-2">{product.brand}</p>
            <h1 className="mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-300 text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-indigo-600" style={{ fontSize: '32px' }}>
                {formatINR(displayPrice)}
              </span>
              {product.originalPrice && product.originalPrice > displayPrice && (
                <>
                  <span className="text-gray-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm">
                    Save {formatINR(product.originalPrice - displayPrice)}
                    {' '}
                    ({Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}% OFF)
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Select Color:</h3>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    disabled={color.stock === 0}
                    className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${selectedColor === color.name
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-400'
                      } ${color.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                    {color.stock === 0 && (
                      <span className="text-xs text-red-600">(Out of stock)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {displayStock === 0 ? (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-sm py-2 px-4">
                <Package className="w-4 h-4 mr-2" />
                Out of Stock - Currently Unavailable
              </Badge>
            ) : displayStock <= (product.lowStockThreshold || 10) ? (
              <div className="space-y-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-sm py-2 px-4">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Limited Stock - Only {displayStock} left!
                </Badge>
                <p className="text-sm text-orange-600">Order soon before it's gone!</p>
              </div>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-sm py-2 px-4">
                <Package className="w-4 h-4 mr-2" />
                In Stock - {product.stock} available
              </Badge>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1 || product.stock === 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity >= product.stock || product.stock === 0}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {product.stock > 0 && (
                <span className="text-sm text-gray-600">Max: {product.stock}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <Button
              className="w-full bg-orange-600! hover:bg-orange-700! text-white"
              size="lg"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              <Zap className="w-5 h-5 mr-2" />
              Buy Now
            </Button>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                size="lg"
                variant="outline"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onToggleWishlist(product.id)}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const dropdown = document.getElementById('share-dropdown');
                  if (dropdown) dropdown.classList.toggle('hidden');
                }}
                className="relative"
              >
                <Share2 className="w-5 h-5" />
                <div id="share-dropdown" className="hidden absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    {shareSuccess ? '✓ Copied!' : '📋 Copy Link'}
                  </button>
                </div>
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Truck className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm">Free Delivery</p>
              <p className="text-xs text-gray-500">On orders {formatINR(500)}+</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm">2 Year Warranty</p>
              <p className="text-xs text-gray-500">Manufacturer warranty</p>
            </Card>
            <Card className="p-4 text-center">
              <RotateCcw className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm">30-Day Returns</p>
              <p className="text-xs text-gray-500">Easy return policy</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Specifications</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-600">{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Description Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Description</h2>
        <Card className="p-6">
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
          <div className="mt-6">
            <h3 className="mb-4">Key Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Premium quality materials and construction</li>
              <li>Designed for durability and long-lasting performance</li>
              <li>Easy to use and maintain</li>
              <li>Backed by manufacturer warranty</li>
              <li>Free shipping on orders over {formatINR(500)}</li>
            </ul>
          </div>
        </Card>
      </section>

      {/* Reviews Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Reviews ({product.reviewCount})</h2>
        <Card className="p-6">
          <div className="flex items-center gap-6 mb-6 pb-6 border-b">
            <div className="text-center">
              <div className="text-indigo-600 mb-2" style={{ fontSize: '48px' }}>
                {product.rating}
              </div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-300 text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm">{product.reviewCount} reviews</p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r: any) => r.rating === rating).length;
                const percentage = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Review Form with Star Rating */}
          {!currentUser ? (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-center">Please log in to write a review</p>
            </div>
          ) : checkingPurchase ? (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-center">Checking purchase history...</p>
            </div>
          ) : !hasPurchased ? (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Only verified purchasers can write reviews</p>
                  <p className="text-sm text-amber-700 mt-1">Purchase this product to share your experience with other customers.</p>
                </div>
              </div>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4 mt-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setReviewSubmitting(true);
                setUploadingImages(true);
                try {
                  const { reviewService } = await import('../lib/supabaseService');

                  // Upload images first (with fallback if storage fails)
                  let imageUrls: string[] = [];
                  if (reviewImages.length > 0) {
                    try {
                      imageUrls = await Promise.all(
                        reviewImages.map(file => reviewService.uploadReviewImage(file, currentUser.id))
                      );
                    } catch (imgErr) {
                      console.warn('Image upload failed, submitting review without images:', imgErr);
                      // Continue without images - don't fail the entire review submission
                      imageUrls = [];
                    }
                  }

                  // Create review with images (or without if upload failed)
                  await reviewService.createReview(product.id, reviewRating, reviewText, imageUrls);

                  // Clean up
                  setReviewText('');
                  setReviewRating(0);
                  setReviewImages([]);
                  imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                  setImagePreviewUrls([]);
                  setReviewSuccess(true);
                  setTimeout(() => setReviewSuccess(false), 3000);
                } catch (err) {
                  console.error('Review submission error:', err);
                  const error = err as any;
                  const errorMessage = error?.message || 'Failed to submit review. Please try again.';
                  const errorCode = error?.code;

                  if (errorCode === '23505' || errorMessage.includes('duplicate key')) {
                    alert('You have already reviewed this product. Each user can only submit one review per product.');
                  } else if (errorMessage.includes('Bucket not found')) {
                    alert('Image upload unavailable. Review submitted without images. Please try again later for image uploads.');
                  } else if (errorMessage.includes('Permission denied')) {
                    alert('Permission denied. Please ensure you are logged in.');
                  } else if (errorMessage.includes('File too large')) {
                    alert('One or more images are too large. Max 5MB per image.');
                  } else {
                    alert(errorMessage || 'Failed to submit review. Please try again.');
                  }
                }
                setUploadingImages(false);
                setReviewSubmitting(false);
              }}
            >
              <label className="font-semibold mb-2">Your Rating:</label>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    disabled={reviewSubmitting}
                  >
                    <Star className={`w-7 h-7 ${reviewRating >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <label htmlFor="review" className="font-semibold">Write a review:</label>
              <textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="border rounded-lg p-3 min-h-[80px]"
                placeholder="Share your experience..."
                required
                disabled={reviewSubmitting}
              />

              {/* Image Upload Section */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Add Photos (Optional):</label>
                <div className="flex flex-wrap gap-3">
                  {/* Image Previews */}
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                      <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        disabled={reviewSubmitting}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  {reviewImages.length < 5 && (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={reviewSubmitting}
                      />
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">You can upload up to 5 images (Max {5 - reviewImages.length} remaining)</p>
              </div>

              <Button type="submit" disabled={reviewSubmitting || !reviewText || reviewRating === 0} className="self-start">
                {uploadingImages ? 'Uploading images...' : reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              {reviewSuccess && <span className="text-green-600">Review submitted successfully!</span>}
            </form>
          )}

          {/* Display submitted reviews */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Customer Reviews</h3>
            {loadingReviews ? (
              <p className="text-gray-500">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b pb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">{r.profiles?.full_name || 'Anonymous'}</span>
                      <span className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${r.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`} />
                        ))}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-line mb-3">{r.comment}</div>

                    {/* Review Images */}
                    {r.images && r.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {r.images.map((imageUrl: string, idx: number) => (
                          <img
                            key={idx}
                            src={imageUrl}
                            alt={`Review image ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          {loadingRecommended ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedProducts.map((recommendedProduct) => (
                <Card
                  key={recommendedProduct.id}
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  onClick={() => {
                    if (onViewProduct) {
                      onViewProduct(recommendedProduct);
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      window.location.href = `/?product=${recommendedProduct.id}`;
                    }
                  }}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={
                        recommendedProduct.product_images?.[0]?.image_url ||
                        recommendedProduct.image_url ||
                        'https://via.placeholder.com/400x400?text=No+Image'
                      }
                      alt={recommendedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {recommendedProduct.discount && recommendedProduct.discount > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        {recommendedProduct.discount}% OFF
                      </Badge>
                    )}
                    {recommendedProduct.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-indigo-600 mb-1">{recommendedProduct.brand}</p>
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {recommendedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(recommendedProduct.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-300 text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {recommendedProduct.rating} ({recommendedProduct.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-indigo-600">
                        {formatINR(recommendedProduct.price)}
                      </span>
                      {recommendedProduct.originalPrice && recommendedProduct.originalPrice > recommendedProduct.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatINR(recommendedProduct.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
