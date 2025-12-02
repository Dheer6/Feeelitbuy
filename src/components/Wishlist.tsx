import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';

interface WishlistProps {
  products: Product[];
  wishlistIds: string[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
  onContinueShopping: () => void;
}

export function Wishlist({
  products,
  wishlistIds,
  onRemoveFromWishlist,
  onAddToCart,
  onViewProduct,
  onContinueShopping,
}: WishlistProps) {
  // Filter products that are in the wishlist
  const wishlistProducts = products.filter((product) =>
    wishlistIds.includes(product.id)
  );

  if (wishlistProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-12 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-6">
            Save your favorite items here to buy them later!
          </p>
          <Button onClick={onContinueShopping}>Start Shopping</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <Button variant="outline" onClick={onContinueShopping}>
          Continue Shopping
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => (
          <Card key={product.id} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
            {/* Remove button */}
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onRemoveFromWishlist(product.id);
              }}
              className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-md transition-colors"
              aria-label="Remove from wishlist"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>

            {/* Product Image */}
            <div
              className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => onViewProduct(product)}
            >
              <ImageWithFallback
                src={product.images?.[0] || ''}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Stock Badge */}
              {product.stock === 0 && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  Out of Stock
                </Badge>
              )}
              {product.stock > 0 && product.stock <= (product.lowStockThreshold || 10) && (
                <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                  Limited Stock
                </Badge>
              )}
              
              {/* Discount Badge */}
              {product.originalPrice && product.originalPrice > product.price && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3
                className="font-semibold mb-1 cursor-pointer hover:text-indigo-600 transition-colors line-clamp-2"
                onClick={() => onViewProduct(product)}
              >
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{product.brand}</p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl font-bold text-indigo-600">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    onAddToCart(product, 1);
                    onRemoveFromWishlist(product.id);
                  }}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveFromWishlist(product.id)}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="mt-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{wishlistProducts.length}</p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">
              {wishlistProducts.filter((p) => p.stock > 0).length}
            </p>
            <p className="text-sm text-gray-600">In Stock</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">
              {formatINR(
                wishlistProducts.reduce((sum, p) => sum + p.price, 0)
              )}
            </p>
            <p className="text-sm text-gray-600">Total Value</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
