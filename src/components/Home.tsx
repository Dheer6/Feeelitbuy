import {
  ArrowRight,
  Search,
  Smartphone,
  Laptop,
  Sofa,
  Bed,
  Headphones,
  Truck,
  RefreshCw,
  Shield,
  Star,
  ChevronRight,
  ChevronLeft,
  Zap,
  TrendingUp,
  Award,
  Play,
  ShoppingBag,
  Package2,
  Clock,
  Users,
  CheckCircle,
  Quote,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Send,
  Gift,
  Percent,
  CreditCard,
  Tag,
  Heart,
  ThumbsUp,
  MessageCircle,
  BadgeCheck
} from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { useState, useEffect, useRef } from 'react';
import { formatINR } from '../lib/currency';
import { bannerService } from '../lib/supabaseService';
import type { HeroBanner } from '../lib/supabase';
import './Home.css';

interface HomeProps {
  onNavigate: (page: string) => void;
  onCategoryClick: (category: string) => void;
  onViewProduct: (product: Product) => void;
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export function Home({ onNavigate, onCategoryClick, onViewProduct, products }: HomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [bannersLoading, setBannersLoading] = useState(true);

  // Load Bootstrap CSS only when this component mounts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    link.id = 'bootstrap-css';
    document.head.appendChild(link);

    // Cleanup: remove Bootstrap when component unmounts
    return () => {
      const bootstrapLink = document.getElementById('bootstrap-css');
      if (bootstrapLink) {
        bootstrapLink.remove();
      }
    };
  }, []);

  const heroSlides = [
    {
      id: 1,
      title: 'Premium Electronics',
      subtitle: 'Latest Tech at Your Fingertips',
      description: 'Discover cutting-edge smartphones, laptops & accessories at unbeatable prices',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
      gradient: 'from-blue-600 to-indigo-600',
      badge: 'Up to 50% OFF'
    },
    {
      id: 2,
      title: 'Transform Your Space',
      subtitle: 'Furniture That Inspires',
      description: 'Elegant furniture pieces designed for modern living spaces',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',
      gradient: 'from-purple-600 to-pink-600',
      badge: 'New Arrivals'
    },
    {
      id: 3,
      title: 'Same Day Delivery',
      subtitle: 'Fast Across Karnataka',
      description: 'Get your orders delivered on time, every time with our express service',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      gradient: 'from-orange-600 to-red-600',
      badge: 'Free Shipping'
    }
  ];

  const categories = [
    
    {
      id: 'electronics',
      name: 'Electronics',
      icon: Laptop,
      color: 'from-purple-500 to-pink-500',
      count: '300+',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'
    },
    
    {
      id: 'furniture',
      name: 'Furniture',
      icon: Sofa,
      color: 'from-orange-500 to-red-500',
      count: '180+',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'
    },
   
    {
      id: 'all',
      name: 'View All',
      icon: ShoppingBag,
      color: 'from-gray-700 to-gray-900',
      count: '1500+',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'
    }
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'On orders above ₹500 across India',
      color: 'from-blue-500 to-cyan-500',
      detail: 'Get your products delivered to your doorstep at no extra cost'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% safe & protected transactions',
      color: 'from-green-500 to-emerald-500',
      detail: 'Multiple payment options with bank-level security'
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '7-day hassle-free return policy',
      color: 'from-purple-500 to-pink-500',
      detail: 'No questions asked return policy for damaged products'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Always here to help you',
      color: 'from-orange-500 to-red-500',
      detail: 'Round the clock customer support via chat, email & phone'
    }
  ];

  const stats = [
    { icon: Package2, value: '50K+', label: 'Products', color: 'from-blue-500 to-cyan-500' },
    { icon: Users, value: '100K+', label: 'Happy Customers', color: 'from-purple-500 to-pink-500' },
    { icon: TrendingUp, value: '99%', label: 'Satisfaction Rate', color: 'from-green-500 to-emerald-500' },
    { icon: Award, value: '500+', label: 'Brands', color: 'from-orange-500 to-red-500' }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      location: 'Bangalore, Karnataka',
      rating: 5,
      text: 'Absolutely love the quality of products! My laptop arrived the same day I ordered. The customer service is outstanding and prices are very competitive.',
      image: 'https://i.pravatar.cc/150?img=1',
      product: 'Dell Laptop'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      location: 'Mysore, Karnataka',
      rating: 5,
      text: 'Best furniture shopping experience ever! The sofa set quality exceeded my expectations. Installation was smooth and professional. Highly recommended!',
      image: 'https://i.pravatar.cc/150?img=3',
      product: 'Premium Sofa Set'
    },
    {
      id: 3,
      name: 'Anita Reddy',
      location: 'Hubli, Karnataka',
      rating: 5,
      text: 'Fast delivery and authentic products. I was skeptical about buying electronics online, but Feel It Buy proved me wrong. Great prices and quality!',
      image: 'https://i.pravatar.cc/150?img=5',
      product: 'Samsung Smartphone'
    },
    {
      id: 4,
      name: 'Vikram Patel',
      location: 'Mangalore, Karnataka',
      rating: 5,
      text: 'Amazing platform! Got my gaming setup delivered in perfect condition. The packaging was excellent and customer support helped me choose the right products.',
      image: 'https://i.pravatar.cc/150?img=7',
      product: 'Gaming Headphones'
    }
  ];

  const brands = [

    { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' },
    { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' }
  ];

  const benefits = [
    { icon: Gift, title: 'Special Offers', description: 'Exclusive deals for members' },
    { icon: Percent, title: 'Best Prices', description: 'Guaranteed lowest prices' },
    { icon: CreditCard, title: 'Easy Payment', description: 'Multiple payment options' },
    { icon: Tag, title: 'Smart Pricing', description: 'Regular discounts & sales' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch banners from database
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setBannersLoading(true);
        const data = await bannerService.getActiveBanners();
        setBanners(data || []);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setBannersLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const featuredProducts = products.slice(0, 8);
  const trendingProducts = products.filter(p => p.rating >= 4.5).slice(0, 4);
  const dealsProducts = products.filter(p => p.discount && p.discount > 20).slice(0, 6);
  const newArrivals = products.slice(8, 12);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="home-landing-page min-h-screen bg-white">

     

         {/* Promotional Banners Section */}
        {!bannersLoading && banners.length > 0 && (
          <section style={{ position: 'relative', height: 'clamp(400px, 60vh, 600px)', overflow: 'hidden' }} className="hero-carousel">
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0' }}>
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: index === currentBanner ? 1 : 0,
                      transform: index === currentBanner ? 'scale(1)' : 'scale(1.05)',
                      transition: 'all 1s',
                      zIndex: index === currentBanner ? 1 : 0
                    }}
                  >
                    {/* Background Image */}
                    {banner.image_url && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.3))",
                          opacity: 0.95
                        }} />
                      </div>
                    )}

                    {/* Content */}
                    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'clamp(1rem, 3vw, 6rem)', width: '100%' }}>
                        <div style={{ maxWidth: '42rem', color: 'white' }}>
                          {/* Offer Badge */}
                          {banner.offer_badge && (
                            <div style={{ display: 'inline-block', marginBottom: 'clamp(0.5rem, 2vw, 1rem)' }}>
                              <span style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(12px)',
                                padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.5rem)',
                                borderRadius: '9999px',
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.875rem)',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                animation: 'pulse 2s infinite'
                              }}>
                                <Zap style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                                {banner.offer_badge}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          <h2 style={{
                            fontSize: 'clamp(1.5rem, 5vw, 3.75rem)',
                            fontWeight: 'bold',
                            marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
                            lineHeight: '1.2'
                          }}>
                            {banner.title}
                          </h2>

                          {/* Subtitle */}
                          {banner.subtitle && (
                            <p style={{
                              fontSize: 'clamp(1rem, 3vw, 1.875rem)',
                              fontWeight: '600',
                              marginBottom: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                              opacity: 0.95
                            }}>
                              {banner.subtitle}
                            </p>
                          )}

                          {/* Description */}
                          {banner.description && (
                            <p style={{
                              fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
                              marginBottom: 'clamp(1rem, 3vw, 2rem)',
                              opacity: 0.9,
                              lineHeight: '1.5'
                            }}>
                              {banner.description}
                            </p>
                          )}

                          {/* CTA Button */}
                          <button
                            onClick={() => onNavigate(banner.cta_link.replace('/', ''))}
                            style={{
                              backgroundColor: 'white',
                              color: '#111827',
                              padding: 'clamp(0.875rem, 2vw, 1.25rem) clamp(1.5rem, 4vw, 2.5rem)',
                              fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
                              fontWeight: 'bold',
                              borderRadius: '9999px',
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                              transition: 'all 0.3s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {banner.cta_text}
                            <ArrowRight style={{ width: 'clamp(1.25rem, 2.5vw, 1.5rem)', height: 'clamp(1.25rem, 2.5vw, 1.5rem)' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Navigation Dots */}
                {banners.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'clamp(1rem, 2vw, 1.5rem)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                    zIndex: 20
                  }}>
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentBanner(index)}
                        style={{
                          height: 'clamp(0.375rem, 1vw, 0.5rem)',
                          width: index === currentBanner ? 'clamp(2rem, 5vw, 3rem)' : 'clamp(0.375rem, 1vw, 0.5rem)',
                          backgroundColor: index === currentBanner ? 'white' : 'rgba(255, 255, 255, 0.5)',
                          borderRadius: '9999px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          if (index !== currentBanner) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index !== currentBanner) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                          }
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Navigation Arrows */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
                      style={{
                        position: 'absolute',
                        left: 'clamp(0.5rem, 1.5vw, 1rem)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(12px)',
                        padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                        borderRadius: '9999px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        zIndex: 20
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                      <ChevronLeft style={{ width: 'clamp(1.25rem, 2.5vw, 1.5rem)', height: 'clamp(1.25rem, 2.5vw, 1.5rem)', color: 'white' }} />
                    </button>
                    <button
                      onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                      style={{
                        position: 'absolute',
                        right: 'clamp(0.5rem, 1.5vw, 1rem)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(12px)',
                        padding: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                        borderRadius: '9999px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        zIndex: 20
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                      <ChevronRight style={{ width: 'clamp(1.25rem, 2.5vw, 1.5rem)', height: 'clamp(1.25rem, 2.5vw, 1.5rem)', color: 'white' }} />
                    </button>
                  </>
                )}
            </div>
          </section>
        )}

        {/* Search Bar - Floating */}
        <section style={{ position: 'relative', marginTop: 'clamp(-2rem, -4vw, -3rem)', zIndex: 30, marginBottom: 'clamp(2rem, 4vw, 4rem)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)', backgroundColor: 'white', borderRadius: '1rem', border: 'none' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                  <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '1.5rem', height: '1.5rem' }} />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: '3rem',
                      paddingRight: '1rem',
                      paddingTop: 'clamp(0.875rem, 2vw, 1.25rem)',
                      paddingBottom: 'clamp(0.875rem, 2vw, 1.25rem)',
                      fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                      border: 'none',
                      borderRadius: '0.75rem',
                      backgroundColor: '#f9fafb',
                      width: '100%',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px #4f46e5'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                </div>
                <button
                  onClick={() => onNavigate('catalog')}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: 'clamp(0.875rem, 2vw, 1.25rem) clamp(1.5rem, 3vw, 2.5rem)',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

       

        {/* Stats Section */}
        <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'clamp(1rem, 2vw, 2rem)' }}>
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const gradients = {
                  'from-blue-500 to-cyan-500': 'linear-gradient(to bottom right, #3b82f6, #06b6d4)',
                  'from-purple-500 to-pink-500': 'linear-gradient(to bottom right, #a855f7, #ec4899)',
                  'from-green-500 to-emerald-500': 'linear-gradient(to bottom right, #22c55e, #10b981)',
                  'from-orange-500 to-red-500': 'linear-gradient(to bottom right, #f97316, #ef4444)'
                };
                return (
                  <div
                    key={index}
                    style={{ textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      width: '6rem',
                      height: '6rem',
                      margin: '0 auto 1.5rem',
                      borderRadius: '1.5rem',
                      background: gradients[stat.color as keyof typeof gradients],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s'
                    }}>
                      <Icon style={{ width: '3rem', height: '3rem', color: 'white' }} />
                    </div>
                    <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{stat.value}</h3>
                    <p style={{ color: '#4b5563', fontWeight: '600', fontSize: '1.125rem' }}>{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>Why Shop With Us?</h2>
              <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', color: '#6b7280', lineHeight: '1.6' }}>Unbeatable benefits that make your shopping experience better</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      borderRadius: '1.5rem',
                      background: 'linear-gradient(to bottom right, #f9fafb, white)',
                      border: '1px solid #f3f4f6',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-0.5rem)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      backgroundColor: '#e0e7ff',
                      width: '5rem',
                      height: '5rem',
                      borderRadius: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}>
                      <Icon style={{ width: '2.5rem', height: '2.5rem', color: '#4f46e5' }} />
                    </div>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#111827', marginBottom: '0.5rem' }}>{benefit.title}</h3>
                    <p style={{ color: '#4b5563' }}>{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: 'linear-gradient(to bottom, white, #f9fafb)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <span style={{
                  backgroundColor: '#e0e7ff',
                  color: '#4f46e5',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  BROWSE BY CATEGORY
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                Shop by Category
              </h2>
              <p style={{
                fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                color: '#6b7280',
                maxWidth: '48rem',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Find exactly what you're looking for from our vast collection of premium products
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
              {categories.map((category) => {
                const Icon = category.icon;
                const gradients = {
                  'from-blue-500 to-cyan-500': 'linear-gradient(to bottom right, #3b82f6, #06b6d4)',
                  'from-purple-500 to-pink-500': 'linear-gradient(to bottom right, #a855f7, #ec4899)',
                  'from-green-500 to-teal-500': 'linear-gradient(to bottom right, #22c55e, #14b8a6)',
                  'from-orange-500 to-red-500': 'linear-gradient(to bottom right, #f97316, #ef4444)',
                  'from-indigo-500 to-blue-500': 'linear-gradient(to bottom right, #6366f1, #3b82f6)',
                  'from-gray-700 to-gray-900': 'linear-gradient(to bottom right, #374151, #111827)'
                };
                return (
                  <div
                    key={category.id}
                    onClick={() => category.id === 'all' ? onNavigate('catalog') : onCategoryClick(category.id)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '1.5rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.5s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-0.75rem)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Category Image Background */}
                    <div style={{ aspectRatio: '1', position: 'relative' }}>
                      <img
                        src={category.image}
                        alt={category.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.7s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: gradients[category.color as keyof typeof gradients],
                        opacity: 0.8,
                        transition: 'opacity 0.3s'
                      }} />
                    </div>

                    {/* Content Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      padding: '1.5rem'
                    }}>
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(12px)',
                        padding: 'clamp(0.875rem, 2vw, 1.25rem)',
                        borderRadius: '1rem',
                        marginBottom: '0.75rem',
                        transition: 'transform 0.3s'
                      }}>
                        <Icon style={{ width: 'clamp(2rem, 5vw, 3rem)', height: 'clamp(2rem, 5vw, 3rem)' }} />
                      </div>
                      <h3 style={{
                        fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                        fontWeight: '700',
                        marginBottom: '0.375rem'
                      }}>{category.name}</h3>
                      <p style={{
                        fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                        fontWeight: '600',
                        opacity: 0.9
                      }}>{category.count} Products</p>
                      <div style={{ marginTop: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: 'white',
                          color: '#111827',
                          padding: '0.5rem 1.5rem',
                          borderRadius: '9999px',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>
                          Browse Now
                          <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', backgroundColor: 'white' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <TrendingUp style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} />
                    <span style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '1.125rem' }}>TRENDING NOW</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>Popular Picks</h2>
                  <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', color: '#6b7280', lineHeight: '1.6' }}>Top-rated products loved by our customers</p>
                </div>
                <button
                  onClick={() => onNavigate('catalog')}
                  style={{
                    border: '2px solid #e5e7eb',
                    backgroundColor: 'transparent',
                    padding: '1.5rem 2rem',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'none',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s'
                  }}
                  className="md:flex"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eef2ff';
                    e.currentTarget.style.borderColor = '#6366f1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  View All
                  <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: 'clamp(1rem, 2vw, 2rem)' }}>
                {trendingProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onViewProduct(product)}
                    style={{
                      cursor: 'pointer',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.5s',
                      transform: 'translateY(0)',
                      backgroundColor: 'white',
                      borderRadius: '1rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-0.75rem)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6', aspectRatio: '1' }}>
                      <ImageWithFallback
                        src={product.images?.[0] || ''}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.7s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {product.discount && product.discount > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          left: '1rem',
                          background: 'linear-gradient(to right, #ef4444, #ec4899)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                          {product.discount}% OFF
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        padding: '0.75rem',
                        borderRadius: '9999px',
                        opacity: 0,
                        transition: 'all 0.3s'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      >
                        <Heart style={{ width: '1.5rem', height: '1.5rem', color: '#ef4444' }} />
                      </div>
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)',
                        padding: '1rem',
                        opacity: 0,
                        transition: 'opacity 0.3s'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      >
                        <button style={{
                          width: '100%',
                          backgroundColor: 'white',
                          color: '#111827',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{
                        fontWeight: 'bold',
                        fontSize: '1.125rem',
                        color: '#111827',
                        marginBottom: '0.75rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        transition: 'color 0.3s'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
                      >
                        {product.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              style={{
                                width: '1.25rem',
                                height: '1.25rem',
                                fill: i < Math.floor(product.rating) ? '#facc15' : 'transparent',
                                color: i < Math.floor(product.rating) ? '#facc15' : '#d1d5db'
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: '500' }}>({product.reviewCount})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
                          {formatINR(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span style={{ fontSize: '1.125rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                            {formatINR(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Flash Deals */}
        {dealsProducts.length > 0 && (
          <section style={{
            padding: 'clamp(3rem, 6vw, 5rem) 0',
            background: 'linear-gradient(to right, #4f46e5, #9333ea, #ec4899)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Background Elements */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
              <div style={{
                position: 'absolute',
                top: '2.5rem',
                left: '2.5rem',
                width: '18rem',
                height: '18rem',
                backgroundColor: 'white',
                borderRadius: '9999px',
                filter: 'blur(48px)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '2.5rem',
                right: '2.5rem',
                width: '24rem',
                height: '24rem',
                backgroundColor: 'white',
                borderRadius: '9999px',
                filter: 'blur(48px)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s'
              }} />
            </div>

            <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(12px)',
                  padding: '1rem 2rem',
                  borderRadius: '9999px',
                  marginBottom: '1.5rem',
                  animation: 'bounce 1s infinite'
                }}>
                  <Zap style={{ width: '1.5rem', height: '1.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                  <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>LIMITED TIME ONLY</span>
                </div>
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '700', marginBottom: '1rem' }}>Flash Deals</h2>
                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', opacity: 0.9, marginBottom: '1.5rem', lineHeight: '1.5' }}>Save up to 60% on selected items - Hurry, limited stock!</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: 'clamp(1rem, 2vw, 2rem)' }}>
                {dealsProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onViewProduct(product)}
                    style={{
                      cursor: 'pointer',
                      overflow: 'hidden',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.5s',
                      transform: 'translateY(0)',
                      backgroundColor: 'white',
                      color: '#111827',
                      borderRadius: '1rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-0.75rem)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6', aspectRatio: '1' }}>
                      <ImageWithFallback
                        src={product.images?.[0] || ''}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.7s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                        <div style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '1rem',
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}>
                          {product.discount}% OFF
                        </div>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        backgroundColor: '#facc15',
                        color: '#111827',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Zap style={{ width: '1rem', height: '1rem' }} />
                        HOT DEAL
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        marginBottom: '1rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>{product.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#4f46e5' }}>
                          {formatINR(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span style={{ fontSize: '1.25rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                            {formatINR(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#16a34a', fontWeight: '600' }}>
                        <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                        <span>Save {formatINR(product.originalPrice! - product.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button
                  onClick={() => onNavigate('catalog')}
                  style={{
                    backgroundColor: 'white',
                    color: '#111827',
                    padding: '1.75rem 3rem',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    borderRadius: '9999px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  View All Deals
                  <ArrowRight style={{ width: '1.5rem', height: '1.5rem' }} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>Featured Products</h2>
                <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', color: '#6b7280', lineHeight: '1.6' }}>Handpicked premium items just for you</p>
              </div>
              <button
                onClick={() => onNavigate('catalog')}
                style={{
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'transparent',
                  padding: 'clamp(0.875rem, 2vw, 1.25rem) clamp(1.5rem, 3vw, 2rem)',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'none',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s',
                  fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'
                }}
                className="md:flex"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eef2ff';
                  e.currentTarget.style.borderColor = '#6366f1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                View All
                <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onViewProduct(product)}
                  style={{
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.5s',
                    transform: 'translateY(0)',
                    borderRadius: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-0.75rem)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6', aspectRatio: '1' }}>
                    <ImageWithFallback
                      src={product.images?.[0] || ''}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.7s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {product.discount && product.discount > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}>
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      color: '#111827',
                      marginBottom: '0.75rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      transition: 'color 0.3s'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#4f46e5'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
                    >
                      {product.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            style={{
                              width: '1rem',
                              height: '1rem',
                              fill: i < Math.floor(product.rating) ? '#facc15' : 'transparent',
                              color: i < Math.floor(product.rating) ? '#facc15' : '#d1d5db'
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>({product.reviewCount})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Why Choose Feel It Buy?</h2>
              <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', color: '#6b7280', maxWidth: '48rem', margin: '0 auto', lineHeight: '1.6' }}>
                Your satisfaction is our top priority. Experience premium shopping with unmatched service
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'clamp(1.5rem, 3vw, 2rem)' }}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const gradients = {
                  'from-blue-500 to-cyan-500': 'linear-gradient(to bottom right, #3b82f6, #06b6d4)',
                  'from-green-500 to-emerald-500': 'linear-gradient(to bottom right, #22c55e, #10b981)',
                  'from-purple-500 to-pink-500': 'linear-gradient(to bottom right, #a855f7, #ec4899)',
                  'from-orange-500 to-red-500': 'linear-gradient(to bottom right, #f97316, #ef4444)'
                };
                return (
                  <div
                    key={index}
                    style={{ textAlign: 'center', transition: 'all 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{
                      width: 'clamp(4.5rem, 10vw, 5.5rem)',
                      height: 'clamp(4.5rem, 10vw, 5.5rem)',
                      margin: '0 auto 1.5rem',
                      borderRadius: '1.5rem',
                      background: gradients[feature.color as keyof typeof gradients] || 'linear-gradient(to bottom right, #3b82f6, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                        e.currentTarget.style.transform = 'rotate(6deg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                      }}
                    >
                      <Icon style={{ width: 'clamp(2rem, 5vw, 2.5rem)', height: 'clamp(2rem, 5vw, 2.5rem)', color: 'white' }} />
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.125rem, 2vw, 1.375rem)', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>{feature.title}</h3>
                    <p style={{ color: '#6b7280', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', marginBottom: '0.25rem', lineHeight: '1.5' }}>{feature.description}</p>
                    <p style={{ fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)', color: '#9ca3af', lineHeight: '1.4' }}>{feature.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <BadgeCheck style={{ width: '1rem', height: '1rem' }} />
                  VERIFIED REVIEWS
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>What Our Customers Say</h2>
              <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', color: '#6b7280', lineHeight: '1.6' }}>Real experiences from real customers across Karnataka</p>
            </div>

            <div style={{ position: 'relative', maxWidth: '64rem', margin: '0 auto' }}>
              {/* Testimonial Carousel */}
              <div style={{ position: 'relative', height: '400px' }}>
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      transition: 'all 1s',
                      opacity: index === currentTestimonial ? 1 : 0,
                      transform: index === currentTestimonial ? 'scale(1)' : 'scale(0.95)'
                    }}
                  >
                    <div style={{
                      padding: '3rem',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      background: 'linear-gradient(to bottom right, white, #f9fafb)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      borderRadius: '1rem'
                    }}>
                      <Quote style={{ width: 'clamp(2.5rem, 5vw, 3rem)', height: 'clamp(2.5rem, 5vw, 3rem)', color: '#e0e7ff', marginBottom: '1rem' }} />
                      <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#374151', marginBottom: '1.5rem', lineHeight: '1.7', fontStyle: 'italic' }}>
                        "{testimonial.text}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          style={{ width: 'clamp(3.5rem, 8vw, 4.5rem)', height: 'clamp(3.5rem, 8vw, 4.5rem)', borderRadius: '9999px', border: '3px solid #e0e7ff' }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>{testimonial.name}</h4>
                          <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>{testimonial.location}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} style={{ width: '1.25rem', height: '1.25rem', fill: '#facc15', color: '#facc15' }} />
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Purchased</p>
                          <p style={{ fontWeight: '600', color: '#111827' }}>{testimonial.product}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial Navigation */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}>
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    style={{
                      height: '0.75rem',
                      borderRadius: '9999px',
                      transition: 'all 0.3s',
                      backgroundColor: index === currentTestimonial ? '#4f46e5' : '#d1d5db',
                      width: index === currentTestimonial ? '3rem' : '0.75rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>Trusted Brands</h2>
              <p style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', color: '#6b7280', lineHeight: '1.6' }}>We partner with the world's leading brands</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              {brands.map((brand, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'grayscale(100%)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.filter = 'grayscale(0%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'grayscale(100%)';
                  }}
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    style={{ maxHeight: '3rem', width: 'auto', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: 'linear-gradient(to right, #4f46e5, #9333ea)', color: 'white' }}>
          <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
            <Mail style={{ width: '5rem', height: '5rem', margin: '0 auto 1.5rem', opacity: 0.9 }} />
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', marginBottom: '1rem' }}>Stay Updated</h2>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: '2rem', opacity: 0.9, lineHeight: '1.5' }}>
              Subscribe to our newsletter and get exclusive deals, new arrivals, and special offers!
            </p>
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '40rem', margin: '0 auto' }} className="sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '1.75rem 2rem',
                  fontSize: '1.125rem',
                  borderRadius: '1rem',
                  border: 'none',
                  color: '#111827'
                }}
                required
              />
              <button
                type="submit"
                style={{
                  backgroundColor: 'white',
                  color: '#4f46e5',
                  padding: 'clamp(0.875rem, 2vw, 1.25rem) clamp(1.5rem, 3vw, 2.5rem)',
                  fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                  fontWeight: '600',
                  borderRadius: '1rem',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Send style={{ width: '1.5rem', height: '1.5rem' }} />
                Subscribe
              </button>
            </form>
            <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', opacity: 0.75 }}>
              Join 100,000+ subscribers. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: 'clamp(3rem, 6vw, 5rem) 0',
          background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '24rem', height: '24rem', backgroundColor: '#6366f1', borderRadius: '9999px', filter: 'blur(48px)' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24rem', height: '24rem', backgroundColor: '#a855f7', borderRadius: '9999px', filter: 'blur(48px)' }} />
          </div>

          <div style={{ position: 'relative', maxWidth: '64rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '700', marginBottom: '1.5rem', lineHeight: '1.2' }}>
              Ready to Start Shopping?
            </h2>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', marginBottom: '2rem', opacity: 0.9, maxWidth: '48rem', margin: '0 auto 2rem', lineHeight: '1.5' }}>
              Join thousands of happy customers across Karnataka and experience the best in online shopping
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }} className="sm:flex-row">
              <button
                onClick={() => onNavigate('catalog')}
                style={{
                  backgroundColor: '#4f46e5',
                  padding: 'clamp(0.875rem, 2vw, 1.25rem) clamp(2rem, 4vw, 3rem)',
                  fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                  fontWeight: '600',
                  borderRadius: '9999px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4338ca';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4f46e5';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Browse All Products
                <ArrowRight style={{ width: '1.75rem', height: '1.75rem' }} />
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                style={{
                  border: '2px solid white',
                  backgroundColor: 'transparent',
                  color: 'white',
                  padding: '2rem 3.5rem',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'white';
                }}
              >
                View Deals
                <Tag style={{ width: '1.75rem', height: '1.75rem' }} />
              </button>
            </div>
          </div>
        </section>

        {/* Contact/Footer Info Section */}
        <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0', backgroundColor: '#111827', color: 'white' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
              <div style={{ textAlign: 'center' }} className="md:text-left">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }} className="md:justify-start">
                  <Phone style={{ width: '2rem', height: '2rem', color: '#a5b4fc' }} />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Call Us</h3>
                    <p style={{ color: '#9ca3af' }}>1800-123-4567</p>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Mail style={{ width: '2rem', height: '2rem', color: '#a5b4fc' }} />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Email Us</h3>
                    <p style={{ color: '#9ca3af' }}>support@feelitbuy.com</p>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }} className="md:text-right">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }} className="md:justify-end">
                  <MapPin style={{ width: '2rem', height: '2rem', color: '#a5b4fc' }} />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Location</h3>
                    <p style={{ color: '#9ca3af' }}>Karnataka, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #1f2937', marginTop: '3rem', paddingTop: '3rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }} className="md:flex-row">
                <p style={{ color: '#9ca3af' }}>
                  © 2025 Feel It Buy. All rights reserved.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <Facebook style={{ width: '1.5rem', height: '1.5rem' }} />
                  </a>
                  <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <Twitter style={{ width: '1.5rem', height: '1.5rem' }} />
                  </a>
                  <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    <Instagram style={{ width: '1.5rem', height: '1.5rem' }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              padding: '1rem',
              borderRadius: '9999px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.3s',
              zIndex: 50,
              animation: 'bounce 1s infinite',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4338ca';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ChevronRight style={{ width: '1.5rem', height: '1.5rem', transform: 'rotate(-90deg)' }} />
          </button>
        )}
      </div>
    </>
  );
}
