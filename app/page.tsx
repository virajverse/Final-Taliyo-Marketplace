import HomePage from '@/components/pages/Home';
import { supabaseServer } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const revalidate = 0;

export default async function Page() {
  let featured: any[] = [];
  let categories: any[] = [];
  let banners: any[] = [];
  try {
    const client = supabaseAdmin || supabaseServer;
    const [{ data: services }, { data: cats }] = await Promise.all([
      supabaseServer
        .from('services')
        .select(
          'id,title,description,price_min,price_max,price_type,is_remote,images,rating_average,rating_count,provider_name,provider_avatar,is_featured,is_active,created_at',
        )
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
    // Get banner limit from site_settings and fetch banners
    let limit = 3;
    try {
      const { data: setting } = await client
        .from('site_settings')
        .select('value')
        .eq('key', 'home_banner_limit')
        .maybeSingle();
      const parsed = Number((setting as any)?.value);
      if (!Number.isNaN(parsed) && parsed > 0) limit = parsed;
    } catch {}
    try {
      const { data: bnn } = await client
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .limit(limit);
      banners = bnn || [];
    } catch {}
  } catch {}
  return (
    <HomePage
      initialFeaturedServices={featured}
      initialCategories={categories}
      initialBanners={banners}
    />
  );
}
