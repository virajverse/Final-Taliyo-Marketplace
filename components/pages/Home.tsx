'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';
import { TrendingUp, Star, Shield, Users, MessageCircle } from 'lucide-react';
import IconMapper from '@/components/IconMapper';
import { SearchIcon } from '@/components/CustomIcons';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface Service {
  id: string;
  title: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  price_type: 'fixed' | 'hourly' | 'negotiable';
  location?: string;
  is_remote: boolean;
  images: string[];
  rating_average: number;
  rating_count: number;
  provider_name?: string;
  provider_avatar?: string;
  provider_verified: boolean;
  duration_minutes?: number;
  is_active: boolean;
  is_featured: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/+917042523611', '_blank');
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const count = parsed.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.onLine) return;
    const channel = supabase
      .channel('home_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: services }, { data: categories }] = await Promise.all([
        supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(8)
      ]);

      setFeaturedServices(services || []);
      setPopularCategories((categories || []).slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setFeaturedServices([]);
      setPopularCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = (serviceId: string) => {
    console.log('Toggled wishlist for service:', serviceId);
  };

  const getIconName = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'web': 'web', 'mobile': 'mobile', 'design': 'design', 'home': 'home',
      'repair': 'package', 'electrical': 'package', 'garden': 'package', 'education': 'package',
      'beauty': 'beauty', 'fitness': 'package', 'photography': 'photography', 'writing': 'package',
      'music': 'music', 'cooking': 'package', 'marketing': 'marketing', 'consulting': 'consulting',
    };
    return iconMap[iconName] || 'package';
  };

  const { isLoggedIn, redirectToLogin } = useAuth();

  const handleWhatsAppSupport = () => {
    if (!isLoggedIn) {
      redirectToLogin();
      return;
    }
    
    const message = `Hi! I need help with Taliyo services.`;
    const phoneNumber = '+917042523611';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-8 pb-20 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartCount} />
      
      <div className="pt-4 pb-20 px-4">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Find Trusted Services</h2>
              <p className="text-blue-100 text-sm">Connect with verified professionals near you</p>
              <button
                onClick={handleWhatsAppSupport}
                className="mt-3 bg-white text-green-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-green-50 transition-colors flex items-center gap-2 w-fit"
              >
                <MessageCircle className="w-4 h-4" />
                +91 7042523611
              </button>
            </div>
            <div className="text-4xl">👋</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">1.2K+</div>
            <div className="text-xs text-gray-600">Services</div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
            <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">50K+</div>
            <div className="text-xs text-gray-600">Happy Customers</div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600 mb-1">4.8★</div>
            <div className="text-xs text-gray-600">Avg Rating</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-lg font-bold text-gray-900">Popular Categories</h3>
            <Link href="/categories" className="text-sm text-blue-600 font-medium">
              See All
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-20 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {popularCategories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                >
                  <div className="mb-2">
                    <IconMapper 
                      iconName={getIconName(category.icon || 'default')} 
                      size={28}
                      animated={true}
                    />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {category.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    View services
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-gray-900">Featured Services</h3>
          </div>
          
          {featuredServices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="mb-4">
                <IconMapper 
                  iconName="search" 
                  size={48}
                  animated={true}
                />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No Services Yet</h4>
              <p className="text-gray-600 text-sm">Services will appear here soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {featuredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onToggleWishlist={handleToggleWishlist}
                  onAddedToCart={(count) => setCartCount(count)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose Taliyo?</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Verified Services</h4>
                <p className="text-xs text-gray-600">All services are quality-checked</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Quality Guaranteed</h4>
                <p className="text-xs text-gray-600">Satisfaction guarantee on all services</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Trusted Community</h4>
                <p className="text-xs text-gray-600">50,000+ happy customers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🟢</div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-1">24/7 Live Support</h3>
              <p className="text-sm text-green-700">Get instant help via WhatsApp</p>
            </div>
            <button
              onClick={handleWhatsAppSupport}
              className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat Now
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
