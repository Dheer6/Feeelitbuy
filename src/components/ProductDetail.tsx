import { useState } from 'react';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { formatINR } from '../lib/currency';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export function ProductDetail({
  product,
  onAddToCart,
  onBack,
  isWishlisted,
  onToggleWishlist,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div>
          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={product.images?.[selectedImage] || ''}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images?.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-indigo-600' : 'border-gray-200'
                  }`}
              >
                <ImageWithFallback
                  src={image || ''}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full aspect-square object-cover"
                />
              </button>
            ))}
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
              {product.originalPrice && (
                <>
                  <span className="text-gray-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm">
                    Save {formatINR(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-green-600">
                ✓ In Stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-600">Out of Stock</p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <Button
              className="flex-1"
              size="lg"
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
                className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''
                  }`}
              />
            </Button>
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

      {/* Tabs */}
      <Tabs defaultValue="specifications" className="mb-12">
        <TabsList>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="specifications" className="mt-6">
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
        </TabsContent>
        <TabsContent value="description" className="mt-6">
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
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
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
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${Math.random() * 80 + 20}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-center py-8">
              Customer reviews will be displayed here. This is a demo version.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
