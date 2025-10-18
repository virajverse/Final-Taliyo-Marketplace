import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const name = process.env.NEXT_PUBLIC_APP_NAME || 'Taliyo Marketplace'
  return {
    name,
    short_name: name,
    id: '/?source=pwa',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }
}
