import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

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
        <meta name="application-name" content="Taliyo" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Taliyo" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{__html: `try{var t=localStorage.getItem('theme');var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var d=(t==='dark')||(!t&&m);var el=document.documentElement;d?el.classList.add('dark'):el.classList.remove('dark');}catch(e){}`}} />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="https://placehold.co/180x180/png" />
      </head>
      <body className={`no-scrollbar overflow-x-hidden ${inter.className}`}>
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
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
