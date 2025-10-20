/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co', 'picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/render/image/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(process.env.NODE_ENV === 'production'
            ? [
                { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                {
                  key: 'Content-Security-Policy',
                  value:
                    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.sentry.io; frame-ancestors https://taliyotechnologies.com https://www.taliyotechnologies.com; base-uri 'self'; form-action 'self';",
                },
              ]
            : []),
        ],
      },
    ];
  },
}

export default nextConfig;
