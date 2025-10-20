import HomePage from '@/components/pages/Home';
import { supabaseServer } from '@/lib/supabaseServer';

export const revalidate = 0;

export default async function Page() {
  let featured: any[] = [];
  let categories: any[] = [];
  try {
    const [{ data: services }, { data: cats }] = await Promise.all([
      supabaseServer
        .from('services')
        .select('id,title,description,price_min,price_max,price_type,is_remote,images,rating_average,rating_count,provider_name,provider_avatar,is_featured,is_active,created_at')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabaseServer
        .from('categories')
        .select('id,name,icon,slug,is_active,sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(8),
    ]);
    featured = services || [];
    categories = cats || [];
  } catch {}
  return <HomePage initialFeaturedServices={featured} initialCategories={categories} />;
}
