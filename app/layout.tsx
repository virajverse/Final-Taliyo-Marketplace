import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Taliyo Marketplace',
  description: 'Connect with trusted service providers in your area',
  openGraph: {
    title: 'Taliyo Marketplace',
    description: 'Connect with trusted service providers in your area',
    images: ['/og-image.png'],
    url: 'https://taliyo.com',
    type: 'website',
    siteName: 'Taliyo Marketplace',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@taliyo',
    title: 'Taliyo Marketplace',
    description: 'Connect with trusted service providers in your area',
    images: ['/og-image.png'],
  },
  // Icons are automatically handled by Next.js from app directory
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`no-scrollbar ${inter.className}`}>
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
