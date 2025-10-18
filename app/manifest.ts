import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const name = process.env.NEXT_PUBLIC_APP_NAME || 'Taliyo Marketplace'
  return {
    name,
    short_name: name,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      // Remote icons to avoid relying on gitignored public/ folder
      {
        src: 'https://via.placeholder.com/192.png?text=T',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: 'https://via.placeholder.com/512.png?text=T',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
}
