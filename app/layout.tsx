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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(rs => { try { rs.forEach(r => r.unregister()); } catch {} });
      try { caches.keys().then(keys => keys.forEach(k => caches.delete(k))); } catch {}
    }
    try { window.__bip = null; window.__bipSetup = false; } catch {}
  } catch {}
})();`,
          }}
        />
      </body>
    </html>
  );
}
