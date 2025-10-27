import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  const make = (path: string, priority = 0.7): MetadataRoute.Sitemap[0] => ({
    url: (base ? `${base}${path}` : path) as string,
    changeFrequency: 'daily',
    priority,
  });
  return [
    make('/', 1),
    make('/categories', 0.8),
    make('/search', 0.6),
    make('/services', 0.5),
    make('/cart', 0.5),
    make('/profile', 0.5),
    make('/orders', 0.5),
    make('/wishlist', 0.5),
    make('/reviews', 0.4),
    make('/settings', 0.4),
    make('/help', 0.3),
    make('/privacy', 0.3),
  ];
}
