import {
  ArrowRight,
  Search,
  Smartphone,
  Laptop,
  Sofa,
  Bed,
  Headphones,
  Gamepad2,
  Zap,
  Shield,
  Truck,
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
  Package,
  Lock,
  Star,
  Send,
  CheckCircle,
  Heart,
  TrendingUp,
  Award,
  Users,
  Globe,
  ChevronUp
} from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { useState, useEffect, useRef } from 'react';
import { formatINR } from '../lib/currency';

interface HomeProps {
  onNavigate: (page: string) => void;
  onCategoryClick: (category: string) => void;
  onViewProduct: (product: Product) => void;
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export function Home({ onNavigate, onCategoryClick, onViewProduct, products, onAddToCart }: HomeProps) {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [currentAdSlide, setCurrentAdSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Hero slides
  const heroSlides = [
    {
      id: 1,
      title: 'Electronics That Power Your Life',
      subtitle: 'Latest Smartphones, Laptops & More',
      description: 'Discover cutting-edge technology at unbeatable prices',
      gradient: 'from-blue-600 via-blue-500 to-cyan-500',
      cta: 'Shop Electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80'
    },
    {
      id: 2,
      title: 'Transform Your Home',
      subtitle: 'Premium Furniture Collection',
      description: 'Stylish & comfortable furniture for every room',
      gradient: 'from-red-600 via-red-500 to-orange-500',
      cta: 'Browse Furniture',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80'
    },
    {
      id: 3,
      title: 'Karnataka Special Delivery',
      subtitle: 'Same-Day Delivery in Bangalore',
      description: 'Fast & reliable delivery across Karnataka',
      gradient: 'from-indigo-600 via-purple-500 to-pink-500',
      cta: 'Order Now',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80'
    }
  ];

  // Advertisement banners
  const advertisements = [
    {
      id: 1,
      title: 'Mega Electronics Sale',
      subtitle: 'Up to 60% Off',
      description: 'Latest smartphones, laptops & accessories at unbeatable prices',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      badge: 'FLASH SALE',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600'
    },
    {
      id: 2,
      title: 'Furniture Bonanza',
      subtitle: 'Transform Your Space',
      description: 'Premium furniture collection with free delivery across Karnataka',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
      badge: 'NEW ARRIVAL',
      gradient: 'from-red-600 via-orange-600 to-yellow-600'
    },
    {
      id: 3,
      title: 'Weekend Specials',
      subtitle: 'Limited Time Offers',
      description: 'Exclusive deals on electronics & furniture - This weekend only!',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      badge: 'WEEKEND DEAL',
      gradient: 'from-green-600 via-teal-600 to-cyan-600'
    }
  ];

  // Categories
  const categories = [
    { id: 'smartphones', name: 'Smartphones', icon: Smartphone, color: 'bg-blue-500', count: '500+' },
    { id: 'laptops', name: 'Laptops', icon: Laptop, color: 'bg-indigo-500', count: '300+' },
    { id: 'headphones', name: 'Audio', icon: Headphones, color: 'bg-purple-500', count: '200+' },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'bg-cyan-500', count: '150+' },
    { id: 'sofas', name: 'Sofas', icon: Sofa, color: 'bg-red-500', count: '180+' },
    { id: 'beds', name: 'Beds', icon: Bed, color: 'bg-orange-500', count: '120+' }
  ];

  // Trust features
  const features = [
    { icon: Truck, title: 'Free Shipping', description: 'On all orders across India', color: 'text-blue-600' },
    { icon: Lock, title: 'Secure Payment', description: '100% protected transactions', color: 'text-indigo-600' },
    { icon: RefreshCw, title: 'Easy Returns', description: '7-day return policy', color: 'text-purple-600' },
    { icon: Headphones, title: '24/7 Support', description: 'Always here to help', color: 'text-cyan-600' }
  ];

  // Brands
  const brands = [
    'Samsung', 'LG', 'Sony', 'Apple', 'Dell', 'HP', 'Lenovo', 'Godrej', 'Nilkamal', 'Durian'
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      location: 'Bangalore, Karnataka',
      rating: 5,
      text: 'Excellent service! Got my laptop delivered the same day. Quality products and great prices.',
      image: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      location: 'Mysore, Karnataka',
      rating: 5,
      text: 'Best furniture shopping experience! The sofa set quality exceeded my expectations.',
      image: 'https://i.pravatar.cc/150?img=3'
    },
    {
      id: 3,
      name: 'Anita Reddy',
      location: 'Hubli, Karnataka',
      rating: 5,
      text: 'Fast delivery and authentic products. Highly recommend Feel It Buy for electronics!',
      image: 'https://i.pravatar.cc/150?img=5'
    }
  ];

  // Auto-rotate hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate advertisements
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdSlide((prev) => (prev + 1) % advertisements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Scroll detection for back-to-top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSuccess(true);
    setTimeout(() => {
      setEmail('');
      setNewsletterSuccess(false);
    }, 3000);
  };

  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.discount && p.discount > 20).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <section className="relative h-[90vh] md:h-screen overflow-hidden bg-gray-900">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentHeroSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            style={{
              transform: index === currentHeroSlide ? 'translateX(0)' : index < currentHeroSlide ? 'translateX(-100%)' : 'translateX(100%)'
            }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80`} />
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 flex items-center">
              <div className="max-w-2xl text-white">
                <div
                  className="transform transition-all duration-1000 delay-300"
                  style={{
                    opacity: index === currentHeroSlide ? 1 : 0,
                    transform: index === currentHeroSlide ? 'translateY(0)' : 'translateY(30px)'
                  }}
                >
                  <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-2xl md:text-3xl mb-3 font-medium">
                    {slide.subtitle}
                  </p>
                  <p className="text-lg md:text-xl mb-8 opacity-90">
                    {slide.description}
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 rounded-full font-semibold transform hover:scale-105 transition-transform duration-300 shadow-2xl"
                    onClick={() => onNavigate('catalog')}
                  >
                    {slide.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentHeroSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* Search Bar Section */}
      <section className="relative -mt-8 z-20">
        <div className="container mx-auto px-4">
          <Card className="p-6 shadow-2xl bg-white rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-pulse" />
                <Input
                  type="text"
                  placeholder="Search for electronics, furniture, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-300 hover:shadow-md"
                />
              </div>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Search
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Advertisement Carousel Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            {advertisements.map((ad, index) => (
              <div
                key={ad.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentAdSlide ? 'opacity-100 translate-x-0' : 'opacity-0'
                  }`}
                style={{
                  transform: index === currentAdSlide ? 'translateX(0)' : index < currentAdSlide ? 'translateX(-100%)' : 'translateX(100%)'
                }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${ad.gradient} opacity-90`} />
                </div>

                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-8 md:px-16">
                    <div className="max-w-2xl text-white">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 animate-pulse">
                        <Zap className="w-5 h-5" />
                        <span className="font-bold text-sm">{ad.badge}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-4xl md:text-6xl font-bold mb-3 leading-tight">
                        {ad.title}
                      </h2>

                      {/* Subtitle */}
                      <p className="text-2xl md:text-3xl font-semibold mb-4 opacity-95">
                        {ad.subtitle}
                      </p>

                      {/* Description */}
                      <p className="text-lg md:text-xl mb-8 opacity-90">
                        {ad.description}
                      </p>

                      {/* CTA Button */}
                      <Button
                        size="lg"
                        className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-6 rounded-full font-bold transform hover:scale-105 transition-all duration-300 shadow-2xl"
                        onClick={() => onNavigate('catalog')}
                      >
                        Shop Now
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
              {advertisements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAdSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentAdSlide ? 'bg-white w-10' : 'bg-white/50 hover:bg-white/75'
                    }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentAdSlide((prev) => (prev - 1 + advertisements.length) % advertisements.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentAdSlide((prev) => (prev + 1) % advertisements.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section
        ref={(el) => (sectionRefs.current['categories'] = el)}
        id="categories"
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Shop by Category</h2>
            <p className="text-lg text-gray-600">Electronics & Furniture for Every Need</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className={`p-6 text-center cursor-pointer group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-2 border-transparent hover:border-${category.color.replace('bg-', 'border-')} ${visibleSections.has('categories') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                  onClick={() => onCategoryClick(category.id)}
                >
                  <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} items</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section
        ref={(el) => (sectionRefs.current['products'] = el)}
        id="products"
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-lg text-gray-600">Handpicked items just for you</p>
            </div>
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 border-2 hover:bg-blue-50 hover:border-blue-500 transition-all duration-300"
              onClick={() => onNavigate('catalog')}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <Card
                key={product.id}
                className={`group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${visibleSections.has('products') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
                onClick={() => onViewProduct(product)}
              >
                <div className="relative overflow-hidden bg-gray-100 aspect-square">
                  <ImageWithFallback
                    src={product.images?.[0] || ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      -{product.discount}%
                    </div>
                  )}
                  <button className="absolute bottom-3 left-3 right-3 bg-blue-600 text-white py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-700">
                    Quick View
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({product.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{formatINR(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">{formatINR(product.originalPrice)}</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      {dealProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-4">
                <Zap className="w-5 h-5 animate-pulse" />
                <span className="font-semibold">Limited Time Offers</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3">Hot Deals</h2>
              <p className="text-xl opacity-90">Grab them before they're gone!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dealProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-white text-gray-900 cursor-pointer group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  onClick={() => onViewProduct(product)}
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-square">
                    <ImageWithFallback
                      src={product.images?.[0] || ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg animate-pulse">
                      SAVE {product.discount}%
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-red-600">{formatINR(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">{formatINR(product.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Features Section */}
      <section
        ref={(el) => (sectionRefs.current['features'] = el)}
        id="features"
        className="py-16 bg-blue-50"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`text-center transform transition-all duration-500 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                  style={{
                    transitionDelay: `${index * 150}ms`
                  }}
                >
                  <div className={`${feature.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-white shadow-lg transform hover:scale-110 hover:-translate-y-2 transition-all duration-300`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Karnataka Special Section */}
      <section className="py-16 bg-white border-t-4 border-red-600">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full mb-4 animate-pulse">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">Karnataka Special</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Same-Day Delivery in Bangalore
                </h2>
                <p className="text-xl text-gray-700 mb-6">
                  Fast & reliable delivery across Karnataka. Order before 2 PM for same-day delivery in Bangalore, Mysore, and other major cities.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span>Free delivery on orders above ₹999</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span>Local language support available</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span>Cash on delivery available</span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300"
                  onClick={() => onNavigate('catalog')}
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80"
                    alt="Karnataka Delivery"
                    className="w-full h-64 object-cover rounded-xl mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Delivery Time</p>
                      <p className="text-2xl font-bold text-gray-900">Same Day</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                      Available Now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Showcase Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Trusted Brands</h2>
            <p className="text-lg text-gray-600">We partner with the best</p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-12 items-center">
              {[...brands, ...brands].map((brand, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-32 h-20 bg-white rounded-lg shadow-md flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110 cursor-pointer"
                >
                  <span className="text-xl font-bold text-gray-700">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={(el) => (sectionRefs.current['testimonials'] = el)}
        id="testimonials"
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">Real reviews from real people</p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-500 ${index === currentTestimonial ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'
                  }`}
              >
                <Card className="p-8 md:p-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
                  <Quote className="w-12 h-12 text-blue-600 mb-6 opacity-50" />
                  <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.location}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}

            {/* Testimonial Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get 10% Off Your First Order</h2>
            <p className="text-xl mb-8 opacity-90">
              Subscribe to our newsletter and stay updated with exclusive deals and new arrivals
            </p>

            {newsletterSuccess ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 transform scale-100 animate-bounce">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <p className="text-2xl font-semibold">Thank you for subscribing!</p>
                <p className="text-lg opacity-90 mt-2">Check your email for your discount code</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-6 py-4 text-lg rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:border-white focus:ring-2 focus:ring-white/50 transition-all duration-300"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  Subscribe
                  <Send className="ml-2 w-5 h-5" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* About */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
                Feel It Buy
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Your trusted destination for electronics and furniture across India. Quality products, great prices, and exceptional service.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-blue-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-bold mb-6">Shop Categories</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Electronics
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Smartphones
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Laptops
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Furniture
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Home Decor
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold mb-6">Customer Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Returns & Refunds
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                    Track Order
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-6">Get In Touch</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-blue-500" />
                  <span>Bangalore, Karnataka, India</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-5 h-5 flex-shrink-0 text-blue-500" />
                  <span>+91 1800-123-4567</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5 flex-shrink-0 text-blue-500" />
                  <span>support@feelitbuy.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Feel It Buy. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 z-50 animate-bounce"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
