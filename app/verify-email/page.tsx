'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (user?.email) setEmail(user.email);
        const ev = !!user?.email_confirmed_at;
        setVerified(ev);
      } catch {}
    })();
  }, []);

  const resend = async () => {
    if (!email) {
      setMessage('Enter your email first');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await supabase.auth.resend({
        type: 'signup',
        email,
        options: origin ? { emailRedirectTo: `${origin}/auth/callback` } : (undefined as any),
      });
      setMessage('Verification email sent. Please check your inbox.');
    } catch {
      setMessage('Could not send verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-6 pb-20 px-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Verify your email</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          {verified ? (
            <div className="space-y-3">
              <p className="text-green-700">Your email is already verified.</p>
              <Link href="/profile" className="text-blue-600 font-medium">
                Go to Profile
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Enter your email and resend the verification link.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full mb-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={resend}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend verification email'}
              </button>
              {message && <div className="mt-3 text-center text-sm text-gray-700">{message}</div>}
            </>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
