import type { ImageLoaderProps } from 'next/image';

export function isSupabaseUrl(src: string | undefined | null): boolean {
  if (!src) return false;
  try {
    if (src.startsWith('/storage/v1/') || src.startsWith('storage/v1/')) {
      return true;
    }
  } catch {}
  try {
    const u = new URL(src);
    return u.hostname.endsWith('.supabase.co') && u.pathname.includes('/storage/v1/');
  } catch {
    return src.startsWith('/storage/v1/') || src.startsWith('storage/v1/');
  }
}

export function supabaseImageLoader({ src, width, quality }: ImageLoaderProps): string {
  try {
    let u: URL;
    if (src.startsWith('/')) {
      const base = (() => {
        try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
          return url ? new URL(url).origin : '';
        } catch { return ''; }
      })();
      if (!base) return src;
      u = new URL(base + src);
    } else if (src.startsWith('storage/v1/')) {
      const base = (() => {
        try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
          return url ? new URL(url).origin : '';
        } catch { return ''; }
      })();
      if (!base) return src;
      u = new URL(base + '/' + src);
    } else {
      u = new URL(src);
    }
    if (u.pathname.includes('/storage/v1/object/')) {
      u.pathname = u.pathname.replace('/storage/v1/object/', '/storage/v1/render/image/');
    } else if (u.pathname.includes('/storage/v1/')) {
      u.pathname = u.pathname.replace('/storage/v1/', '/storage/v1/render/image/');
    }
    const sp = u.searchParams;
    sp.set('width', String(width));
    if (quality) sp.set('quality', String(quality));
    if (!sp.has('format')) {
      const ext = (u.pathname.split('.').pop() || '').toLowerCase();
      if (ext && ext !== 'svg' && ext !== 'gif' && ext !== 'webp') {
        sp.set('format', 'webp');
      }
    }
    u.search = sp.toString();
    return u.toString();
  } catch {
    return src;
  }
}
