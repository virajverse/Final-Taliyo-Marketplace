'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, redirectToLogin, authLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    // प्रोटेक्टेड पेजेज की लिस्ट
    const protectedPaths = [
      '/wishlist',
      '/profile',
      '/orders',
      '/settings',
      '/notifications',
      '/reviews',
      '/order-status',
    ];

    // अगर यूजर लॉग्ड इन नहीं है और प्रोटेक्टेड पेज पर है
    const onProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const hasAuthCookie = (typeof document !== 'undefined') && document.cookie.includes('taliyo_auth=1');
    const isAuthed = isLoggedIn || hasAuthCookie;
    if (!isAuthed && onProtectedPath) {
      redirectToLogin();
    }
  }, [isLoggedIn, authLoading, pathname, redirectToLogin]);

  return <>{children}</>;
}