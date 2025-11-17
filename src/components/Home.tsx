import { ArrowRight, Zap, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HomeProps {
  onNavigate: (page: string) => void;
  onCategoryClick: (category: string) => void;
  onViewProduct: (product: Product) => void;
  products: Product[];
}

export function Home({ onNavigate, onCategoryClick, onViewProduct, products }: HomeProps) {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  const categories = [
    {
      name: 'Electronics',
      value: 'electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
      description: 'Latest gadgets and devices',
    },
    {
      name: 'Furniture',
      value: 'furniture',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
      description: 'Modern home & office furniture',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="mb-6">
              Feel the Quality,
              <br />
              Buy with Confidence
            </h1>
            <p className="mb-8 text-indigo-100">
              Discover premium electronics and furniture at unbeatable prices. Shop with confidence
              and enjoy real-time order tracking, secure payments, and exceptional customer service.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
                onClick={() => onNavigate('catalog')}
              >
                Shop Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => {
                  const element = document.getElementById('featured-products');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Deals
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="mb-2">Free Delivery</h3>
              <p className="text-gray-600">On orders over $500</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="mb-2">Secure Payments</h3>
              <p className="text-gray-600">100% secure transactions</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">Track your order live</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <HeadphonesIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="mb-2">24/7 Support</h3>
              <p className="text-gray-600">Always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Shop by Category</h2>
            <p className="text-gray-600">
              Explore our curated collections of electronics and furniture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {categories.map((category) => (
              <Card
                key={category.value}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-xl group"
                onClick={() => onCategoryClick(category.value)}
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="mb-2 text-white">{category.name}</h3>
                    <p className="text-white/90 mb-4">{category.description}</p>
                    <Button variant="secondary" size="sm">
                      Explore <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="mb-4">Featured Products</h2>
              <p className="text-gray-600">Hand-picked deals you don't want to miss</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate('catalog')}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
                onClick={() => onViewProduct(product)}
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {product.originalPrice && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md">
                      Save $
                      {(product.originalPrice - product.price).toFixed(0)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-indigo-600 text-sm mb-1">{product.brand}</p>
                  <h3 className="mb-2 line-clamp-2" style={{ fontSize: '16px' }}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-indigo-600">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-white">Ready to Start Shopping?</h2>
          <p className="mb-8 text-indigo-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Feel It Buy for their electronics and
            furniture needs. Experience quality, affordability, and exceptional service.
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-100"
            onClick={() => onNavigate('catalog')}
          >
            Browse All Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
