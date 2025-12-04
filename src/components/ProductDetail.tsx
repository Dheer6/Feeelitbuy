import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield, RotateCcw, AlertTriangle, Package, Zap } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onBack: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  onBack,
  isWishlisted,
  onToggleWishlist,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

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

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    onBuyNow(product, quantity);
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
            {product.images?.map((image, index) => (
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
          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 flex-1">
            <ImageWithFallback
              src={product.images?.[selectedImage] || ''}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
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
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-gray-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm">
                    Save {formatINR(product.originalPrice - product.price)}
                    {' '}
                    ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock === 0 ? (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-sm py-2 px-4">
                <Package className="w-4 h-4 mr-2" />
                Out of Stock - Currently Unavailable
              </Badge>
            ) : product.stock <= (product.lowStockThreshold || 10) ? (
              <div className="space-y-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-sm py-2 px-4">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Limited Stock - Only {product.stock} left!
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
              className="w-full !bg-orange-600 !hover:bg-orange-700 text-white"
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
          <form
            className="flex flex-col gap-4 mt-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setReviewSubmitting(true);
              try {
                const { reviewService } = await import('../lib/supabaseService');
                await reviewService.createReview(product.id, reviewRating, reviewText);
                setReviewText('');
                setReviewRating(0);
                setReviewSuccess(true);
                setTimeout(() => setReviewSuccess(false), 3000);
              } catch (err) {
                alert('Failed to submit review.');
              }
              setReviewSubmitting(false);
            }}
          >
            <label className="font-semibold mb-2">Your Rating:</label>
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="focus:outline-none"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
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
            <Button type="submit" disabled={reviewSubmitting || !reviewText || reviewRating === 0} className="self-start">
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            {reviewSuccess && <span className="text-green-600">Review submitted!</span>}
          </form>

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
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${r.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`} />
                        ))}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-line">{r.comment}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
