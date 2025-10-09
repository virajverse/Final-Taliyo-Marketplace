import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
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
      <body>{children}</body>
    </html>
  );
}
