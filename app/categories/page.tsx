'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

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

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Import API client dynamically
      const { apiService } = await import('@/lib/api');
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getIconEmoji = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'web': '💻', 'mobile': '📱', 'design': '🎨', 'home': '🏠',
      'repair': '🔧', 'electrical': '⚡', 'garden': '🌱', 'education': '📚',
      'beauty': '💄', 'fitness': '💪', 'photography': '📸', 'writing': '✍️',
      'music': '🎵', 'cooking': '👨‍🍳', 'marketing': '📈', 'consulting': '💼',
    };
    return iconMap[iconName] || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-4 pb-20 px-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Categories</h2>
          <p className="text-gray-600">Find services by category</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Available</h3>
            <p className="text-gray-600">Categories will appear here once they're added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <div className="text-3xl mb-3">
                  {category.icon ? getIconEmoji(category.icon) : '📦'}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {category.description || 'Explore services in this category'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 font-medium">
                    View services
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
