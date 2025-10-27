import { supabaseServer } from '@/lib/supabaseServer';
import ServiceDetailClient from '@/components/ServiceDetailClient';

export const revalidate = 0;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let service: any = null;
  try {
    const { data } = await supabaseServer
      .from('services')
      .select(
        'id,title,description,price_min,price_max,price_type,is_remote,images,rating_average,rating_count,provider_name,provider_avatar,provider_bio,provider_phone,provider_verified,duration_minutes,is_active,is_featured,slug,created_at,updated_at',
      )
      .eq('id', id as string)
      .maybeSingle();
    service = data || null;
  } catch {}
  return <ServiceDetailClient initialService={service} serviceId={id} />;
}
