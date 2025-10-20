'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ServiceCard from '@/components/ServiceCard';
import { ArrowLeft, Package, AlertCircle } from 'lucide-react';
import IconMapper from '@/components/IconMapper';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

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
  created_at?: string;
  updated_at?: string;
}

export default function CategoryDetailClient({ initialCategory, initialServices, categoryId }: { initialCategory: Category | null; initialServices: Service[]; categoryId: string; }) {
  const router = useRouter();
  const { user, redirectToLogin } = useAuth();
  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [services, setServices] = useState<Service[]>(initialServices || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase
      .channel('category_detail')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `id=eq.${categoryId}` }, () => fetchCategoryData({ silent: true }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => fetchCategoryData({ silent: true }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [categoryId]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setWishlistIds(new Set()); return; }
      const { data } = await supabase
        .from('wishlists')
        .select('service_id')
        .eq('user_id', user.id);
      setWishlistIds(new Set((data || []).map((r: any) => r.service_id)));
    };
    load();
    if (!user?.id) return;
    const ch = supabase
      .channel('category_wishlist_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const fetchCategoryData = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) { setLoading(true); setError(''); }
      const [{ data: cat, error: catErr }, { data: svc, error: svcErr }] = await Promise.all([
        supabase.from('categories').select('id,name,description,icon,slug,is_active,sort_order').eq('id', categoryId).maybeSingle(),
        supabase
          .from('services')
          .select('id,title,description,price_min,price_max,price_type,location,is_remote,images,rating_average,rating_count,provider_name,provider_avatar,is_active,is_featured,created_at')
          .eq('category_id', categoryId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
      ]);
      if (catErr) throw catErr;
      if (svcErr) throw svcErr;
      setCategory((cat as any) || null);
      setServices((svc as any) || []);
    } catch (e) {
      setCategory(null);
      setServices([]);
      setError('Failed to load category. Please try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleToggleWishlist = async (serviceId: string) => {
    if (!user?.id) { redirectToLogin(); return; }
    try {
      if (wishlistIds.has(serviceId)) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('service_id', serviceId);
        setWishlistIds(prev => { const n = new Set(prev); n.delete(serviceId); return n; });
      } else {
        await supabase.from('wishlists').insert([{ user_id: user.id, service_id: serviceId }]);
        setWishlistIds(prev => { const n = new Set(prev); n.add(serviceId); return n; });
      }
    } catch {}
  };

  const getIconName = (iconName?: string) => {
    const iconMap: { [key: string]: string } = {
      'web': 'web', 'mobile': 'mobile', 'design': 'design', 'home': 'home',
      'repair': 'package', 'electrical': 'package', 'garden': 'package', 'education': 'package',
      'beauty': 'beauty', 'fitness': 'package', 'photography': 'photography', 'writing': 'package',
      'music': 'music', 'cooking': 'package', 'marketing': 'marketing', 'consulting': 'consulting',
    };
    return iconMap[iconName || 'default'] || 'package';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-4 pb-20 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!loading && error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-8 pb-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchCategoryData()}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
          >
            Retry
          </button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-8 pb-20 px-4 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">Category not found</h2>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 font-medium"
          >
            Go back
          </button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-4 pb-20 px-4">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div>
              <IconMapper 
                iconName={getIconName(category.icon)} 
                size={40}
                animated={true}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Services in {category.name}
          </h2>

          {services.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Available</h3>
              <p className="text-gray-600 mb-4">Services in this category will appear here soon.</p>
              <button
                onClick={() => router.push('/categories')}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
              >
                Explore Categories
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onToggleWishlist={handleToggleWishlist}
                  isInWishlist={wishlistIds.has(service.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
