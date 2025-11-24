import { ArrowRight, Zap, Shield, Truck, HeadphonesIcon, ChevronLeft, ChevronRight, Star, Flame, Clock } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { formatINR } from '../lib/currency';
import { bannerService } from '../lib/supabaseService';
import type { HeroBanner } from '../lib/supabase';

interface HomeProps {
  onNavigate: (page: string) => void;
  onCategoryClick: (category: string) => void;
  onViewProduct: (product: Product) => void;
  products: Product[];
}

export function Home({ onNavigate, onCategoryClick, onViewProduct, products }: HomeProps) {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);
  const bestSellers = [...products].sort((a,b)=> (b.rating * b.reviewCount) - (a.rating * a.reviewCount)).slice(0,12);
  const newArrivals = [...products].slice(-12); // simplistic heuristic
  const dealOfDay = bestSellers[0];
  const categoriesDynamic = Array.from(new Set(products.map(p=>p.category)));
  const recommendations = [...products].sort((a,b)=> b.rating - a.rating).slice(0,10);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState([] as HeroBanner[]);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Fetch banners from database
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setBannersLoading(true);
        console.log('Fetching banners...');
        const banners = await bannerService.getActiveBanners();
        console.log('Banners fetched:', banners);
        if (banners.length > 0) {
          setHeroSlides(banners);
        } else {
          console.warn('No active banners found');
        }
      } catch (error) {
        console.error('Failed to load banners:', error);
      } finally {
        setBannersLoading(false);
      }
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev: number) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev: number) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const categories = categoriesDynamic.map(c => ({
    name: c.charAt(0).toUpperCase() + c.slice(1),
    value: c,
    image: c === 'electronics'
      ? 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80'
      : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    description: c === 'electronics' ? 'Latest gadgets and devices' : 'Modern home & office furniture'
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {bannersLoading ? (
          <div className="relative h-[500px] md:h-[600px] w-full flex items-center justify-center">
            <div className="text-gray-600 text-xl">Loading banners...</div>
          </div>
        ) : heroSlides.length === 0 ? (
          <div className="relative h-[500px] md:h-[600px] w-full flex items-center justify-center">
            <div className="text-gray-600 text-xl">No active banners found</div>
          </div>
        ) : (
          <div className="relative h-[500px] md:h-[600px] w-full">
            {heroSlides.map((slide: HeroBanner, index: number) => (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0 z-10'
                    : index < currentSlide
                    ? 'opacity-0 -translate-x-full z-0'
                    : 'opacity-0 translate-x-full z-0'
                }`}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
                  <div className="container mx-auto px-4 md:px-8 h-full flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                      {/* Left Content */}
                      <div className="text-left space-y-6">
                        {slide.offer_badge && (
                          <div className="inline-block">
                            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                              {slide.offer_badge}
                            </span>
                          </div>
                        )}

                        {slide.subtitle && (
                          <p className="text-sm md:text-base text-gray-600 font-medium uppercase tracking-wide">
                            {slide.subtitle}
                          </p>
                        )}

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                          {slide.title}
                        </h1>

                        {slide.description && (
                          <p className="text-base md:text-lg text-gray-600 max-w-xl">
                            {slide.description}
                          </p>
                        )}

                        <Button
                          size="lg"
                          className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-base"
                          onClick={() => onNavigate(slide.cta_link || 'catalog')}
                        >
                          {slide.cta_text || 'Shop Now'}
                        </Button>
                      </div>

                      {/* Right Image */}
                      <div className="hidden lg:flex justify-center items-center">
                        <div className="relative w-full max-w-md aspect-square">
                          <ImageWithFallback
                            src={slide.image_url || ''}
                            alt={slide.title}
                            className="w-full h-full object-contain drop-shadow-2xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Dots */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_slide: HeroBanner, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentSlide
                    ? 'bg-gray-900 w-8 h-3'
                    : 'bg-gray-400 w-3 h-3 hover:bg-gray-600'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Category Bar (Desktop) */}
      <div className="hidden md:block bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-2 flex gap-4 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => onCategoryClick(cat.value)}
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 whitespace-nowrap"
            >{cat.name}</button>
          ))}
        </div>
      </div>

      {/* Deal Of The Day */}
      {dealOfDay && (
        <section className="py-10 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-y">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm mb-4"><Flame className="w-4 h-4"/> Deal of the Day</div>
              <h2 className="mb-3 text-3xl lg:text-4xl">{dealOfDay.name}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{dealOfDay.description}</p>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl text-indigo-600 font-semibold">{formatINR(dealOfDay.price)}</span>
                {dealOfDay.originalPrice && <span className="line-through text-gray-400 text-sm">{formatINR(dealOfDay.originalPrice)}</span>}
              </div>
              <Button size="lg" onClick={()=>onViewProduct(dealOfDay)}>
                Grab Offer <ArrowRight className="w-5 h-5 ml-2"/>
              </Button>
            </div>
            <div className="w-full max-w-md h-64 rounded-xl overflow-hidden shadow-lg relative">
              <ImageWithFallback src={dealOfDay.images[0]} alt={dealOfDay.name} className="w-full h-full object-cover"/>
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">{dealOfDay.originalPrice ? Math.round(((dealOfDay.originalPrice - dealOfDay.price)/dealOfDay.originalPrice)*100) : 0}% OFF</div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="mb-2">Free Delivery</h3>
              <p className="text-gray-600">On orders over {formatINR(500)}</p>
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

      {/* Featured Products Carousel */}
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
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-thin">
              {featuredProducts.map(product => (
                <Card
                  key={product.id}
                  className="snap-start min-w-[260px] w-[260px] overflow-hidden cursor-pointer transition-all hover:shadow-lg group flex-shrink-0"
                  onClick={()=>onViewProduct(product)}
                >
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    <ImageWithFallback src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/>
                    {product.originalPrice && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[11px] px-2 py-1 rounded">
                        Save {formatINR(product.originalPrice - product.price)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] uppercase tracking-wide text-indigo-600 mb-1">{product.brand}</p>
                    <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_,i)=>(
                        <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}/>
                      ))}
                      <span className="text-xs text-gray-500">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-indigo-600 font-semibold text-sm">{formatINR(product.price)}</span>
                      {product.originalPrice && (<span className="text-[11px] line-through text-gray-400">{formatINR(product.originalPrice)}</span>)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">Best Sellers</h2>
            <Button variant="ghost" onClick={()=>onNavigate('catalog')}>View More <ArrowRight className="w-4 h-4 ml-1"/></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {bestSellers.map(p => (
              <Card key={p.id} className="group cursor-pointer" onClick={()=>onViewProduct(p)}>
                <div className="h-28 bg-gray-100 overflow-hidden rounded-t">
                  <ImageWithFallback src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-medium line-clamp-2 mb-1">{p.name}</h3>
                  <span className="text-indigo-600 text-sm font-semibold">{formatINR(p.price)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">New Arrivals</h2>
            <Clock className="w-5 h-5 text-indigo-600"/>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {newArrivals.map(p => (
              <Card key={p.id} className="group cursor-pointer" onClick={()=>onViewProduct(p)}>
                <div className="h-28 bg-gray-100 overflow-hidden">
                  <ImageWithFallback src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-medium line-clamp-2 mb-1">{p.name}</h3>
                  <span className="text-indigo-600 text-sm font-semibold">{formatINR(p.price)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl">Recommended For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recommendations.map(p => (
              <Card key={p.id} className="cursor-pointer group" onClick={()=>onViewProduct(p)}>
                <div className="h-40 bg-gray-100 overflow-hidden">
                  <ImageWithFallback src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2">{p.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_,i)=>(
                      <Star key={i} className={`w-3 h-3 ${i < Math.round(p.rating) ? 'text-yellow-400' : 'text-gray-300'}`}/>
                    ))}
                    <span className="text-[11px] text-gray-500">{p.reviewCount} reviews</span>
                  </div>
                  <span className="text-indigo-600 font-semibold text-sm">{formatINR(p.price)}</span>
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
