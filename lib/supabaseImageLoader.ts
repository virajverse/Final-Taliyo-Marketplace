import type { ImageLoaderProps } from 'next/image';

export function isSupabaseUrl(src: string | undefined | null): boolean {
  if (!src) return false;
  try {
    const u = new URL(src);
    return u.hostname.endsWith('.supabase.co') && u.pathname.includes('/storage/v1/');
  } catch {
    return false;
  }
}

export function supabaseImageLoader({ src, width, quality }: ImageLoaderProps): string {
  try {
    const u = new URL(src);
    if (u.pathname.includes('/storage/v1/object/')) {
      u.pathname = u.pathname.replace('/storage/v1/object/', '/storage/v1/render/image/');
    } else if (u.pathname.includes('/storage/v1/')) {
      u.pathname = u.pathname.replace('/storage/v1/', '/storage/v1/render/image/');
    }
    const sp = u.searchParams;
    sp.set('width', String(width));
    if (quality) sp.set('quality', String(quality));
    if (!sp.has('format')) sp.set('format', 'webp');
    u.search = sp.toString();
    return u.toString();
  } catch {
    return src;
  }
}
