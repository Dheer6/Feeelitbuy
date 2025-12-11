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
  onSearch?: (query: string) => void;
}

// Counter component for animated stats
function StatCard({ 
  icon: Icon, 
  value, 
  suffix, 
  label, 
  color, 
  inView 
}: { 
  icon: any; 
  value: number; 
  suffix: string; 
  label: string; 
  color: string; 
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    const duration = 2000;
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = Math.floor(value * easeOutQuad(progress));
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, inView]);

  const gradients = {
    'from-blue-500 to-cyan-500': 'linear-gradient(to bottom right, #3b82f6, #06b6d4)',
    'from-purple-500 to-pink-500': 'linear-gradient(to bottom right, #a855f7, #ec4899)',
    'from-green-500 to-emerald-500': 'linear-gradient(to bottom right, #22c55e, #10b981)',
    'from-orange-500 to-red-500': 'linear-gradient(to bottom right, #f97316, #ef4444)'
  };

  return (
    <div
      style={{ textAlign: 'center', transition: 'transform 0.3s', cursor: 'pointer' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{
        width: '6rem',
        height: '6rem',
        margin: '0 auto 1.5rem',
        borderRadius: '1.5rem',
        background: gradients[color as keyof typeof gradients],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s'
      }}>
        <Icon style={{ width: '3rem', height: '3rem', color: 'white' }} />
      </div>
      <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
        {count}{suffix}
      </h3>
      <p style={{ color: '#4b5563', fontWeight: '600', fontSize: '1.125rem' }}>{label}</p>
    </div>
  );
}

// Simple counter for download stats
function AnimatedNumber({ value, inView }: { value: number; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    const duration = 2000;
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = Math.floor(value * easeOutQuad(progress));
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, inView]);

  return <>{count}</>;
}

export function Home({ onNavigate, onCategoryClick, onViewProduct, products, onSearch }: HomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [statsInView, setStatsInView] = useState(false);
  const [downloadStatsInView, setDownloadStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const downloadStatsRef = useRef<HTMLDivElement>(null);

  // Counter animation hook
  const useCountUp = (end: number, duration: number = 2000, start: number = 0) => {
    const [count, setCount] = useState(start);

    useEffect(() => {
      if (!statsInView) return;

      let startTime: number | null = null;
      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOutQuad = (t: number) => t * (2 - t);
        const currentCount = Math.floor(start + (end - start) * easeOutQuad(progress));
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [end, duration, start, statsInView]);

    return count;
  };

  // Intersection observer for stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsInView) {
          setStatsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsInView]);

  // Intersection observer for download stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !downloadStatsInView) {
          setDownloadStatsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (downloadStatsRef.current) {
      observer.observe(downloadStatsRef.current);
    }

    return () => {
      if (downloadStatsRef.current) {
        observer.unobserve(downloadStatsRef.current);
      }
    };
  }, [downloadStatsInView]);

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
{ name: "Samsung", logo: "data:image/png;base64,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" },
  { name: "LG", logo: "data:image/png;base64,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" },
  { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
  { name: "Panasonic", logo: "data:image/png;base64,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" },
  { name: "Mi (Xiaomi)", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg" },
{ name: "IKEA", logo: "data:image/png;base64,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" },
{ name: "Urban Ladder", logo: "data:image/png;base64,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" },
   { name: "Godrej Interio", logo: "data:image/jpeg;base64,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" },
   { name: "Nilkamal", logo: "data:image/png;base64,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" }
  
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

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
      onNavigate('catalog');
    } else {
      onNavigate('catalog');
    }
  };

  return (
    <>
      <div className="home-landing-page min-h-screen bg-white">

     

         {/* Promotional Banners Section */}
        {!bannersLoading && banners.length > 0 && (
          <section style={{ position: 'relative', height: 'clamp(650px, 60vh, 600px)', overflow: 'hidden' }} className="hero-carousel">
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
        {/* <section style={{ position: 'relative', marginTop: 'clamp(-2rem, -4vw, -3rem)', zIndex: 30, marginBottom: 'clamp(2rem, 4vw, 4rem)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)', backgroundColor: 'white', borderRadius: '1rem', border: 'none' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
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
                  type="submit"
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
              </form>
            </div>
          </div>
        </section> */}

       

        {/* Stats Section */}
        <section ref={statsRef} style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0', background: 'linear-gradient(to bottom, #f9fafb, white)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'clamp(1rem, 2vw, 2rem)' }}>
              <StatCard
                icon={Package2}
                value={50}
                suffix="K+"
                label="Products"
                color="from-blue-500 to-cyan-500"
                inView={statsInView}
              />
              <StatCard
                icon={Users}
                value={100}
                suffix="K+"
                label="Happy Customers"
                color="from-purple-500 to-pink-500"
                inView={statsInView}
              />
              <StatCard
                icon={TrendingUp}
                value={99}
                suffix="%"
                label="Satisfaction Rate"
                color="from-green-500 to-emerald-500"
                inView={statsInView}
              />
              <StatCard
                icon={Award}
                value={500}
                suffix="+"
                label="Brands"
                color="from-orange-500 to-red-500"
                inView={statsInView}
              />
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
                    filter: 'grayscale(50%)'
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

        {/* Download App Section */}
        <section className="download-app-section" style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            <div className="download-app-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              {/* Left Content */}
              <div style={{ color: '#fff' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                  <Smartphone style={{ width: '1rem', height: '1rem' }} />
                  DOWNLOAD OUR APP
                </div>
                <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                  Experience Shopping<br />
                  Like Never Before
                </h2>
                <p style={{ fontSize: '1.125rem', marginBottom: '2.5rem', lineHeight: '1.7', opacity: 0.95 }}>
                  Join 50,000+ happy shoppers. Download our app and unlock exclusive deals, seamless checkout, and personalized recommendations. Plus, get ₹100 off on your first order!
                </p>
                
                {/* App Store Buttons */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                  <a 
                    href="#" 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      color: '#fff',
                      padding: '0.875rem 1.75rem',
                      borderRadius: '1rem',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.625rem', opacity: 0.8 }}>Download on the</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600' }}>App Store</div>
                    </div>
                  </a>
                  
                  <a 
                    href="#" 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      color: '#fff',
                      padding: '0.875rem 1.75rem',
                      borderRadius: '1rem',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.625rem', opacity: 0.8 }}>GET IT ON</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600' }}>Google Play</div>
                    </div>
                  </a>
                </div>

                {/* Stats */}
                <div ref={downloadStatsRef} className="download-app-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', paddingTop: '2.5rem', borderTop: '2px solid rgba(255, 255, 255, 0.2)' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                      <AnimatedNumber value={50} inView={downloadStatsInView} />K+
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Downloads</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                      <AnimatedNumber value={4} inView={downloadStatsInView} />.8⭐
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Rating</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>24/7</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Support</div>
                  </div>
                </div>
              </div>

              {/* Right - Phone Mockup */}
              <div className="download-app-phone" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ 
                  position: 'relative', 
                  width: '300px', 
                  height: '600px',
                  backgroundColor: '#1f2937',
                  borderRadius: '3rem',
                  padding: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                  {/* Notch */}
                  <div style={{ 
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40%',
                    height: '30px',
                    backgroundColor: '#1f2937',
                    borderRadius: '0 0 1rem 1rem',
                    zIndex: 10
                  }} />
                  
                  {/* Screen */}
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: '#2d3748',
                    borderRadius: '2.5rem',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {/* App Header */}
                    <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#ef4444', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700' }}>
                        FIB
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '600' }}>Feel It Buy!</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.625rem' }}>Welcome back!</div>
                      </div>
                    </div>

                    {/* Special Offer Card */}
                    <div style={{ margin: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem' }}>
                      <div style={{ color: '#fff', fontSize: '0.625rem', marginBottom: '0.25rem', opacity: 0.9 }}>Special Offer</div>
                      <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>₹100 OFF</div>
                      <div style={{ color: '#fff', fontSize: '0.75rem', opacity: 0.9 }}>On your first app order</div>
                    </div>

                    {/* Product Grid Placeholder */}
                    <div style={{ padding: '0 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ 
                          backgroundColor: '#374151', 
                          borderRadius: '0.75rem', 
                          height: '120px',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }} />
                      ))}
                    </div>

                    {/* Bottom Coupon Badge */}
                    <div style={{ 
                      position: 'absolute',
                      bottom: '1rem',
                      right: '1rem',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: '#fff',
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}>
                      ₹100
                    </div>
                  </div>

                  {/* Green Check Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    backgroundColor: '#10b981',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
                  }}>
                    <CheckCircle style={{ width: '32px', height: '32px', color: '#fff' }} />
                  </div>
                </div>
              </div>
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
        <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', backgroundColor: '#111827', color: 'white' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
            {/* About Section */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '48rem', margin: '0 auto 4rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 'bold', marginBottom: '1rem' }}>Feel It Buy</h2>
              <p style={{ color: '#9ca3af', lineHeight: '1.8', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
                Your one-stop e-commerce store for all electronic appliances. We offer the best prices, warranty, and 24/7 support. 
                Plus, receive a free gift product with every purchase!
              </p>
            </div>

            {/* Footer Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
              {/* My Account */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#a5b4fc' }}>My Account</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('orders'); }} style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Track Orders
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); }} style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Order History
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('wishlist'); }} style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Wishlist
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Returns
                    </a>
                  </li>
                </ul>
              </div>

              {/* Information */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#a5b4fc' }}>Information</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Our Story
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Careers
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Privacy Policy
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#a5b4fc' }}>Categories</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('electronics'); }} style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Electronics
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('furniture'); }} style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Furniture
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('appliances'); }} style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Home Appliances
                    </a>
                  </li>
                  <li style={{ marginBottom: '0.75rem' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onCategoryClick('air-solutions'); }} style={{ color: '#9ca3af', transition: 'color 0.2s', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                      Air Solutions
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#a5b4fc' }}>Talk To Us</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Got Questions? Call us</p>
                  <a href="tel:9483509264" style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone style={{ width: '1.25rem', height: '1.25rem', color: '#a5b4fc' }} />
                    94835 09264
                  </a>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <a href="mailto:support@feelitbuy.com" style={{ color: '#9ca3af', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                    <Mail style={{ width: '1rem', height: '1rem' }} />
                    support@feelitbuy.com
                  </a>
                </div>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'flex', alignItems: 'start', gap: '0.5rem', lineHeight: '1.6' }}>
                    <MapPin style={{ width: '1rem', height: '1rem', marginTop: '0.25rem', flexShrink: 0 }} />
                    Ground floor, Lakshmikanth Complex, Jodurasthe, Karkala - 576117, Udupi, Karnataka
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ borderTop: '1px solid #1f2937', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }} className="md:flex-row">
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  © 2025 Feel It Buy. All rights reserved. Your one-stop shop for electronic appliances.
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
