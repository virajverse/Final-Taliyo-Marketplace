'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ServiceCard from '@/components/ServiceCard';
import { ArrowLeft, Package } from 'lucide-react';
import IconMapper from '@/components/IconMapper';

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

export default function CategoryDetail() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryData();
  }, [params.id]);

  const fetchCategoryData = async () => {
    try {
      const { apiService } = require('@/lib/api');
      
      // Fetch category details and services
      const [categoryData, servicesData] = await Promise.all([
        apiService.getCategory(params.id as string),
        apiService.getServices({ category_id: params.id as string })
      ]);
      
      setCategory(categoryData);
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to fetch category data:', error);
      // Fallback for category not found
      setCategory(null);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = (serviceId: string) => {
    console.log('Toggled wishlist for service:', serviceId);
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
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Category Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
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

        {/* Services */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Services in {category.name}
          </h2>
          
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Available</h3>
              <p className="text-gray-600">Services in this category will appear here soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onToggleWishlist={handleToggleWishlist}
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