import CategoryDetailClient from '@/components/CategoryDetailClient';
import { supabaseServer } from '@/lib/supabaseServer';
export const revalidate = 0;
export default async function Page({ params }: { params: { id: string } }) {
  let category: any = null;
  let services: any[] = [];
  try {
    const [{ data: cat }, { data: svc }] = await Promise.all([
      supabaseServer
        .from('categories')
        .select('id,name,description,icon,slug,is_active,sort_order')
        .eq('id', params.id as string)
        .maybeSingle(),
      supabaseServer
        .from('services')
        .select('id,title,description,price_min,price_max,price_type,location,is_remote,images,rating_average,rating_count,provider_name,provider_avatar,is_active,is_featured,created_at')
        .eq('category_id', params.id as string)
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
    ]);
    category = cat || null;
    services = (svc as any) || [];
  } catch {}
  return (
    <CategoryDetailClient initialCategory={category} initialServices={services} categoryId={params.id} />
  );
}