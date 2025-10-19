'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

export default function AuthCallback() {
  const router = useRouter();
  const search = useSearchParams();
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    let unsub: any;
    (async () => {
      try {
        // Ensure the session in the URL is captured (detectSessionInUrl is enabled in client)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setMessage('Sign-in complete. Redirecting...');
          setTimeout(() => router.replace('/profile'), 800);
        } else {
          // Listen for eventual session set by URL hash processing
          const { data } = supabase.auth.onAuthStateChange((event, sess) => {
            if (sess) {
              setMessage('Sign-in complete. Redirecting...');
              setTimeout(() => router.replace('/profile'), 800);
            }
          });
          unsub = data.subscription;
          // Fallback: if this was an email verification without immediate session, guide user
          const type = search?.get('type');
          if (type === 'signup') setMessage('Email verified. You may close this tab.');
          else setMessage('Waiting for confirmation...');
        }
      } catch {
        setMessage('Could not complete sign-in. You can close this tab.');
      }
    })();
    return () => { try { unsub?.unsubscribe?.(); } catch {} };
  }, [router, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-8 pb-20 px-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <p className="text-gray-700">{message}</p>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
