import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import Analytics from '@/components/Analytics';

const inter = Inter({ subsets: ['latin'] });

// Metadata temporarily disabled to avoid unexpected token issues during dev build. Re-enable once stable.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="Taliyo Marketplace" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Taliyo Marketplace" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`no-scrollbar overflow-x-hidden ${inter.className}`}>
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            </Suspense>
          </AuthProvider>
        </ToastProvider>
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} 
  gtag('js', new Date());
  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
            <Suspense fallback={null}>
              <Analytics id={process.env.NEXT_PUBLIC_GA_ID} />
            </Suspense>
          </>
        ) : null}

        {process.env.NEXT_PUBLIC_SENTRY_DSN ? (
          <>
            <Script
              src="https://browser.sentry-cdn.com/7.114.0/bundle.tracing.min.js"
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
            <Script id="sentry-init" strategy="afterInteractive">
              {`
  try {
    if (typeof Sentry !== 'undefined') {
      Sentry.init({
        dsn: '${process.env.NEXT_PUBLIC_SENTRY_DSN}',
        tracesSampleRate: 0.1
      });
    }
  } catch {}
              `}
            </Script>
          </>
        ) : null}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    // Capture beforeinstallprompt early so UI can use it when mounted
    window.addEventListener('beforeinstallprompt', (e) => {
      try { e.preventDefault(); } catch {}
      try { window.__bip = e; window.__bipSetup = true; } catch {}
      try { window.dispatchEvent(new Event('bipready')); } catch {}
    });
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        try { navigator.serviceWorker.register('/sw.js'); } catch {}
      });
    }
  } catch {}
})();`,
          }}
        />
      </body>
    </html>
  );
}
