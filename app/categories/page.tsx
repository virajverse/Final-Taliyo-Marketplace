import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import IconMapper from '@/components/IconMapper';
import { supabaseServer } from '@/lib/supabaseServer';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

export const revalidate = 0;

export default async function Categories() {
  let categories: Category[] = [];
  try {
    const { data } = await supabaseServer
      .from('categories')
      .select('id,name,description,icon,slug,is_active,sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    categories = (data as any) || [];
  } catch {}

  const getIconName = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      web: 'web',
      mobile: 'mobile',
      design: 'design',
      home: 'home',
      repair: 'package',
      electrical: 'package',
      garden: 'package',
      education: 'package',
      beauty: 'beauty',
      fitness: 'package',
      photography: 'photography',
      writing: 'package',
      music: 'music',
      cooking: 'package',
      marketing: 'marketing',
      consulting: 'consulting',
    };
    return iconMap[iconName] || 'package';
  };

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                <div className="mb-3">
                  <IconMapper
                    iconName={category.icon ? getIconName(category.icon) : 'package'}
                    size={32}
                    animated={true}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {category.description || 'Explore services in this category'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 font-medium">View services</span>
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
