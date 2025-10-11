'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, redirectToLogin } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // प्रोटेक्टेड पेजेज की लिस्ट
    const protectedPaths = [
      '/cart',
      '/wishlist',
      '/profile',
      '/orders',
      '/settings',
    ];

    // अगर यूजर लॉग्ड इन नहीं है और प्रोटेक्टेड पेज पर है
    if (!isLoggedIn && protectedPaths.some(path => pathname.startsWith(path))) {
      redirectToLogin();
    }
  }, [isLoggedIn, pathname, redirectToLogin]);

  return <>{children}</>;
}