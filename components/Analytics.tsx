'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Analytics({ id }: { id?: string | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!id) return;
    if (typeof window === 'undefined') return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    try {
      // @ts-ignore
      if (typeof window.gtag === 'function') {
        // @ts-ignore
        window.gtag('config', id, { page_path: url });
      }
    } catch {}
  }, [id, pathname, searchParams]);

  return null;
}
