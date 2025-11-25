import { 
  ArrowRight, 
  Search, 
  Smartphone, 
  Laptop, 
  Home as HomeIcon, 
  Car,
  Gamepad2,
  Shirt,
  Zap, 
  Shield, 
  Truck, 
  HeadphonesIcon, 
  Star, 
  Users,
  Award,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Quote,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Package,
  CreditCard,
  Lock,
  Clock,
  Gift,
  Tag,
  Percent,
  Send,
  CheckCircle,
  Globe,
  Heart,
  Bell
} from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';
import { formatINR } from '../lib/currency';
import { bannerService } from '../lib/supabaseService';
import type { HeroBanner } from '../lib/supabase';

interface HomeProps {
  onNavigate: (page: string) => void;
  onCategoryClick: (category: string) => void;
  onViewProduct: (product: Product) => void;
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export function Home({ onNavigate, onCategoryClick, onViewProduct, products, onAddToCart }: HomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [adSlide, setAdSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState([] as HeroBanner[]);
  const [searchQuery, setSearchQuery] = useState('');

  const topProducts = products.slice(0, 8);
  const featuredProduct = products.find(p => p.featured) || products[0];
  const dealProducts = products.filter(p => {
    if (p.discount && p.discount > 20) return true;
    if (p.originalPrice && p.price < p.originalPrice) {
      const discount = ((p.originalPrice - p.price) / p.originalPrice) * 100;
      return discount > 20;
    }
    return false;
  }).slice(0, 6);

  // Categories with icons
  const categories = [
    { id: 'electronics', name: 'Electronics', icon: Smartphone, color: 'bg-blue-500' },
    { id: 'computers', name: 'Computers', icon: Laptop, color: 'bg-purple-500' },
    { id: 'home', name: 'Home & Garden', icon: HomeIcon, color: 'bg-green-500' },
    { id: 'automotive', name: 'Automotive', icon: Car, color: 'bg-red-500' },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'bg-indigo-500' },
    { id: 'fashion', name: 'Fashion', icon: Shirt, color: 'bg-pink-500' },
  ];

  // Advertisement banners - separate from hero
  const advertisements = [
    {
      id: 1,
      title: 'Flash Sale Alert!',
      subtitle: 'Limited Time Offer',
      description: 'Get 50% off on selected electronics',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      badge: 'HOT DEAL',
      color: 'from-red-600 to-orange-600'
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Latest Collection 2025',
      description: 'Explore the newest gadgets and accessories',
      image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=1200&q=80',
      badge: 'NEW',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 3,
      title: 'Weekend Special',
      subtitle: 'Save Big This Weekend',
      description: 'Up to 40% discount on furniture',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
      badge: 'SALE',
      color: 'from-green-600 to-teal-600'
    }
  ];

  // Brand logos
  const brands = [
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=100&fit=crop',
    'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=200&h=100&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=100&fit=crop',
    'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200&h=100&fit=crop',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=100&fit=crop',
  ];

  const features = [
    { icon: Truck, title: 'Free Delivery', description: 'On orders over ₹500', color: 'bg-blue-500' },
    { icon: Shield, title: 'Secure Payments', description: '100% secure transactions', color: 'bg-green-500' },
    { icon: RefreshCw, title: 'Easy Returns', description: '30-day return policy', color: 'bg-purple-500' },
    { icon: HeadphonesIcon, title: '24/7 Support', description: 'Always here to help', color: 'bg-orange-500' },
  ];

  const services = [
    { icon: Zap, title: 'Fast Shipping', description: 'Get your orders delivered in 2-3 days', color: 'from-yellow-400 to-orange-500' },
    { icon: Award, title: 'Quality Guarantee', description: 'All products come with quality assurance', color: 'from-blue-400 to-indigo-500' },
    { icon: Users, title: 'Expert Support', description: 'Our team of experts is here to help', color: 'from-purple-400 to-pink-500' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      rating: 5,
      comment: 'Excellent service and fast delivery! The product quality exceeded my expectations.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612e2cd?w=80&h=80&fit=crop&crop=face',
    },
    {
      name: 'Rahul Kumar',
      rating: 5,
      comment: 'Great shopping experience. User-friendly website and reliable customer support.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    },
    {
      name: 'Anjali Patel',
      rating: 4,
      comment: 'Wide variety of products at competitive prices. Highly recommended!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    },
  ];

  const trustBadges = [
    { icon: Lock, title: 'Secure Shopping', description: 'SSL Encrypted' },
    { icon: CreditCard, title: 'Safe Payments', description: 'Multiple Options' },
    { icon: Package, title: 'Fast Delivery', description: 'Track Your Order' },
    { icon: CheckCircle, title: 'Verified Products', description: '100% Authentic' },
  ];

  // Fetch banners from database
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const banners = await bannerService.getActiveBanners();
        if (banners.length > 0) {
          setHeroSlides(banners);
        } else {
          // Default demo banners
          setHeroSlides([
            {
              id: 'demo-1',
              title: 'Mega Sale Event',
              subtitle: 'Limited Time Only',
              description: 'Get up to 70% off on electronics and furniture',
              image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
              cta_text: 'Shop Now',
              cta_link: 'catalog',
              offer_badge: 'Up to 70% OFF',
              is_active: true,
              display_order: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-2',
              title: 'New Arrivals',
              subtitle: 'Fresh Collection',
              description: 'Discover the latest trends in electronics',
              image_url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
              cta_text: 'Explore Now',
              cta_link: 'catalog',
              offer_badge: 'NEW',
              is_active: true,
              display_order: 2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ] as HeroBanner[]);
        }
      } catch (error) {
        console.error('Failed to load banners:', error);
      }
    };
    loadBanners();
  }, []);

  // Hero carousel auto-rotation
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Advertisement carousel auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setAdSlide((prev: number) => (prev + 1) % advertisements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [advertisements.length]);

  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev: number) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev: number) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextAdSlide = () => {
    setAdSlide((prev: number) => (prev + 1) % advertisements.length);
  };

  const prevAdSlide = () => {
    setAdSlide((prev: number) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  const calculateDiscount = (product: Product) => {
    if (product.originalPrice && product.price < product.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return product.discount || 0;
  };

  const getDiscountedPrice = (product: Product) => {
    if (product.discount && product.discount > 0) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onNavigate('catalog');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. MAIN HERO CAROUSEL */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-0">
        <div className="relative h-[500px] md:h-[600px] w-full">
          {heroSlides.map((slide: HeroBanner, index: number) => (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-95 z-0'
              }`}
            >
              <div className="container mx-auto px-4 md:px-8 lg:px-12 h-full flex items-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
                  <div className="text-left space-y-4 md:space-y-6 order-2 lg:order-1 pb-8 lg:pb-0">
                    {slide.offer_badge && (
                      <div className="inline-block animate-bounce">
                        <span className="bg-yellow-400 text-gray-900 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg">
                          🔥 {slide.offer_badge}
                        </span>
                      </div>
                    )}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
                      {slide.description}
                    </p>
                    <Button
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-yellow-400 hover:text-gray-900 shadow-2xl transition-all px-6 md:px-10 py-4 md:py-6 text-base md:text-lg font-bold rounded-xl hover:scale-105"
                      onClick={() => onNavigate(slide.cta_link || 'catalog')}
                    >
                      {slide.cta_text || 'Shop Now'} <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                    </Button>
                  </div>
                  <div className="flex justify-center items-center order-1 lg:order-2 pt-8 lg:pt-0">
                    <div className="relative w-full max-w-md lg:max-w-lg">
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl rotate-6"></div>
                      <ImageWithFallback
                        src={slide.image_url || ''}
                        alt={slide.title}
                        className="relative z-10 w-full h-64 md:h-80 object-contain drop-shadow-2xl rounded-3xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          {heroSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 md:p-3 rounded-full transition-all shadow-xl"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 md:p-3 rounded-full transition-all shadow-xl"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Dots */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
            {heroSlides.map((_: HeroBanner, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentSlide ? 'bg-white w-6 md:w-8 h-2 md:h-3' : 'bg-white/50 w-2 md:w-3 h-2 md:h-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRUST BADGES BAR */}
      <section className="bg-white border-b border-gray-200 py-4 md:py-6">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex items-center justify-center gap-2 md:gap-3">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs md:text-sm font-semibold text-gray-900">{badge.title}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SEARCH BAR SECTION */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 md:w-6 md:h-6" />
              <Input
                type="text"
                placeholder="Search for products, brands, and more..."
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                onKeyPress={(e: any) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 md:pl-14 pr-24 md:pr-32 py-4 md:py-5 text-base md:text-lg rounded-2xl border-2 border-gray-200 focus:border-indigo-500 shadow-lg"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-4 md:px-6 py-2 md:py-3"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ADVERTISEMENT CAROUSEL - DEDICATED SECTION */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <div className="relative h-[300px] md:h-[400px] w-full">
              {advertisements.map((ad, index) => (
                <div
                  key={ad.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === adSlide
                      ? 'opacity-100 translate-x-0 z-10'
                      : index < adSlide
                      ? 'opacity-0 -translate-x-full z-0'
                      : 'opacity-0 translate-x-full z-0'
                  }`}
                >
                  <div className={`w-full h-full bg-gradient-to-r ${ad.color} relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="container mx-auto px-6 md:px-12 h-full flex items-center relative z-10">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                        <div className="text-left space-y-4 md:space-y-6">
                          <div className="inline-block">
                            <span className="bg-white/90 text-gray-900 px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg">
                              {ad.badge}
                            </span>
                          </div>
                          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-xl">
                            {ad.title}
                          </h2>
                          <p className="text-base md:text-xl text-white/95 max-w-lg font-medium">
                            {ad.description}
                          </p>
                          <Button
                            size="lg"
                            className="bg-white text-gray-900 hover:bg-yellow-300 shadow-2xl transition-all px-6 md:px-10 py-4 md:py-6 text-base md:text-lg font-bold rounded-xl hover:scale-105"
                            onClick={() => onNavigate('catalog')}
                          >
                            Shop This Deal <Tag className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                          </Button>
                        </div>
                        <div className="hidden lg:flex justify-center">
                          <div className="relative">
                            <ImageWithFallback
                              src={ad.image}
                              alt={ad.title}
                              className="w-full max-w-md h-72 object-cover rounded-2xl shadow-2xl ring-4 ring-white/30"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Advertisement Navigation */}
              <button
                onClick={prevAdSlide}
                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 p-2 md:p-3 rounded-full transition-all shadow-xl"
                aria-label="Previous ad"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={nextAdSlide}
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 p-2 md:p-3 rounded-full transition-all shadow-xl"
                aria-label="Next ad"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Advertisement Dots */}
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-3">
                {advertisements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setAdSlide(index)}
                    className={`transition-all rounded-full ${
                      index === adSlide ? 'bg-white w-6 md:w-8 h-2 md:h-3' : 'bg-white/60 w-2 md:w-3 h-2 md:h-3'
                    }`}
                    aria-label={`Go to ad ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CATEGORIES GRID */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Shop by Category</h2>
            <p className="text-base md:text-lg text-gray-600">Discover our wide range of products</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white rounded-2xl p-4 md:p-6 text-center border-2 border-transparent hover:border-indigo-200"
                  onClick={() => onCategoryClick(category.id)}
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. HOT DEALS SECTION */}
      {dealProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 shadow-lg">
                <Percent className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-bold text-sm md:text-base">HOT DEALS</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Limited Time Offers</h2>
              <p className="text-base md:text-lg text-gray-600">Grab these amazing deals before they're gone!</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {dealProducts.map((product) => {
                const discount = calculateDiscount(product);
                const finalPrice = getDiscountedPrice(product);
                return (
                  <Card
                    key={product.id}
                    className="group cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden border-2 border-red-200 hover:border-red-400"
                  >
                    <div className="relative" onClick={() => onViewProduct(product)}>
                      <ImageWithFallback
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-red-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm md:text-base font-black shadow-xl animate-pulse">
                        {discount}% OFF
                      </div>
                      {product.stock < 10 && (
                        <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-orange-600 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-lg">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                          Only {product.stock} left
                        </div>
                      )}
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 md:mb-3 line-clamp-2 group-hover:text-red-600 transition-colors min-h-[3rem]">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2 md:mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 ${
                              i < Math.round(product.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs md:text-sm text-gray-500 ml-1">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl md:text-2xl font-black text-red-600">{formatINR(finalPrice)}</p>
                          <p className="text-sm md:text-base text-gray-500 line-through">{formatINR(product.price)}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e: any) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="bg-red-600 hover:bg-red-700 rounded-xl px-3 md:px-4 py-2 md:py-3"
                        >
                          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. TOP PRODUCTS SECTION */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 shadow-lg">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
              <span className="font-bold text-sm md:text-base">TRENDING NOW</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Top Products</h2>
            <p className="text-base md:text-lg text-gray-600">Discover our most popular items</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {topProducts.map((product) => {
              const discount = calculateDiscount(product);
              const finalPrice = getDiscountedPrice(product);
              return (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white rounded-2xl overflow-hidden border-2 border-transparent hover:border-indigo-200"
                >
                  <div className="relative" onClick={() => onViewProduct(product)}>
                    <ImageWithFallback
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-52 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount > 0 && (
                      <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-red-600 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-lg">
                        {discount}% OFF
                      </div>
                    )}
                    {product.stock < 10 && (
                      <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-orange-600 text-white px-2 md:px-3 py-1 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-lg flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        Only {product.stock} left
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-2 md:mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2 md:mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 ${
                            i < Math.round(product.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs md:text-sm text-gray-500 ml-1">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg md:text-xl font-bold text-indigo-600">{formatINR(finalPrice)}</p>
                        {discount > 0 && (
                          <p className="text-xs md:text-sm text-gray-500 line-through">{formatINR(product.price)}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FEATURED PRODUCT BANNER */}
      {featuredProduct && (
        <section className="py-12 md:py-16 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-bold shadow-lg">
                  <Gift className="w-5 h-5" />
                  Featured Product
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  {featuredProduct.name}
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {featuredProduct.description}
                </p>
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                  <p className="text-3xl md:text-4xl font-black text-indigo-600">
                    {formatINR(getDiscountedPrice(featuredProduct))}
                  </p>
                  {calculateDiscount(featuredProduct) > 0 && (
                    <div className="bg-red-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base shadow-lg">
                      {calculateDiscount(featuredProduct)}% OFF
                    </div>
                  )}
                </div>
                <div className="flex gap-3 md:gap-4 flex-wrap">
                  <Button
                    size="lg"
                    onClick={() => onViewProduct(featuredProduct)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 md:px-8 py-4 md:py-5 text-base md:text-lg font-bold rounded-xl shadow-xl hover:scale-105 transition-all"
                  >
                    View Details <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleAddToCart(featuredProduct)}
                    className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-6 md:px-8 py-4 md:py-5 text-base md:text-lg font-bold rounded-xl shadow-xl hover:scale-105 transition-all"
                  >
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
              <div className="flex justify-center order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl rotate-6 blur-3xl opacity-30"></div>
                  <ImageWithFallback
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    className="relative z-10 w-full max-w-md h-80 md:h-96 object-contain rounded-3xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. WHY CHOOSE US / FEATURES */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Why Choose Us</h2>
            <p className="text-base md:text-lg text-gray-600">Experience the difference with our premium services</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group text-center p-6 md:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-200"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. SERVICES SECTION */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Our Services</h2>
            <p className="text-base md:text-lg text-gray-600">Comprehensive solutions for all your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="group text-center p-8 md:p-10 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-2 border-transparent hover:border-purple-200"
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl`}>
                    <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">{service.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{service.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. BRANDS SECTION */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">Trusted Brands</h2>
            <p className="text-base md:text-lg text-gray-600">Partnering with industry leaders worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 md:p-8 bg-gray-50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 grayscale hover:grayscale-0 hover:scale-105 border-2 border-transparent hover:border-gray-200"
              >
                <ImageWithFallback
                  src={brand}
                  alt={`Brand ${index + 1}`}
                  className="w-full h-12 md:h-16 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. ABOUT SECTION */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-gray-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-bold">
                <Globe className="w-5 h-5" />
                About Us
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                About Feel It Buy
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                We are your trusted destination for high-quality electronics and furniture. 
                With years of experience in the industry, we pride ourselves on offering 
                the best products at competitive prices.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Our commitment to customer satisfaction and quality assurance makes us 
                the preferred choice for thousands of customers across India.
              </p>
              <div className="grid grid-cols-2 gap-6 md:gap-8 pt-4">
                <div className="text-center bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-3xl md:text-4xl font-black text-indigo-600 mb-2">10K+</h3>
                  <p className="text-sm md:text-base text-gray-600 font-medium">Happy Customers</p>
                </div>
                <div className="text-center bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-3xl md:text-4xl font-black text-indigo-600 mb-2">5K+</h3>
                  <p className="text-sm md:text-base text-gray-600 font-medium">Products Sold</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 rounded-3xl rotate-6 blur-2xl opacity-20"></div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
                  alt="About us"
                  className="relative z-10 w-full max-w-md h-80 md:h-96 object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. TESTIMONIALS SECTION */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full mb-4 shadow-lg">
              <Heart className="w-5 h-5" />
              <span className="font-bold text-sm md:text-base">CUSTOMER REVIEWS</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">What Our Customers Say</h2>
            <p className="text-base md:text-lg text-gray-600">Don't just take our word for it</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200"
              >
                <div className="flex items-center mb-6">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover ring-4 ring-purple-200"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-base md:text-lg text-gray-900">{testimonial.name}</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 ${
                            i < testimonial.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Quote className="w-8 h-8 md:w-10 md:h-10 text-purple-600 mb-4" />
                <p className="text-sm md:text-base text-gray-700 italic leading-relaxed">{testimonial.comment}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 14. NEWSLETTER SECTION */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 md:px-6 py-2 md:py-3 rounded-full mb-6 shadow-lg">
              <Bell className="w-5 h-5" />
              <span className="font-bold text-sm md:text-base">STAY UPDATED</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
              Get exclusive deals, new arrivals, and special offers delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 md:px-6 py-4 md:py-5 rounded-xl text-base md:text-lg bg-white border-2 border-white focus:border-yellow-400"
              />
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 md:px-8 py-4 md:py-5 rounded-xl shadow-xl hover:scale-105 transition-all text-base md:text-lg"
              >
                Subscribe <Send className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-xs md:text-sm text-white/80 mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates
            </p>
          </div>
        </div>
      </section>

      {/* 15. FOOTER */}
      <footer className="bg-gray-900 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Feel It Buy</h3>
              <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
                Your trusted destination for quality electronics and furniture.
              </p>
              <div className="flex space-x-3 md:space-x-4">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 p-2 md:p-3 rounded-lg">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 p-2 md:p-3 rounded-lg">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 p-2 md:p-3 rounded-lg">
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Quick Links</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Products</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Policies</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Return Policy</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Contact Info</h4>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm md:text-base text-gray-400">+91 12345 67890</span>
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm md:text-base text-gray-400">support@feelitbuy.com</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm md:text-base text-gray-400">Mumbai, India</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-sm md:text-base text-gray-400">
              © 2025 Feel It Buy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
