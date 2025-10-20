'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  redirectToLogin: () => void;
  showLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const router = useRouter();

  // isAuthenticated is an alias for isLoggedIn for compatibility
  const isAuthenticated = isLoggedIn;

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        const isVerified = !!session.user.email_confirmed_at;
        const isBlocked = !!(session.user.app_metadata as any)?.blocked;
        const suser = session.user;
        const uBase: User = {
          id: suser.id,
          name: (suser.user_metadata as any)?.name,
          email: suser.email || undefined,
        };
        setUser(uBase);
        setIsLoggedIn(isVerified && !isBlocked);
        setAuthLoading(false);
        if (typeof document !== 'undefined') {
          try {
            const secure = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '; Secure' : '';
            document.cookie = (isVerified && !isBlocked)
              ? `taliyo_auth=1; Path=/; Max-Age=2592000; SameSite=Lax${secure}`
              : `taliyo_auth=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
          } catch {}
        }
        if (typeof window !== 'undefined' && uBase.email) {
          localStorage.setItem('userData', JSON.stringify({ email: uBase.email }));
        }
        if (!isVerified || isBlocked) {
          try { await supabase.auth.signOut(); } catch {}
          return;
        }
        (async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id,name,phone,avatar_url')
            .eq('id', suser.id)
            .maybeSingle();
          if (!mounted) return;
          setUser(prev => ({
            id: uBase.id,
            name: profile?.name || prev?.name,
            email: uBase.email,
            phone: profile?.phone,
            avatar_url: profile?.avatar_url,
          } as User));
          if (typeof window !== 'undefined' && profile?.phone) {
            localStorage.setItem('userPhone', profile.phone);
          }
          try {
            const did = typeof window !== 'undefined' ? localStorage.getItem('pwa_device_id') : null;
            if (did && uBase.id) {
              await fetch('/api/pwa-installs/map-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ device_id: did, user_id: uBase.id, user_email: uBase.email || null })
              });
            }
          } catch {}
          // Log login event once per 6 hours
          try {
            const now = Date.now();
            const last = Number(localStorage.getItem('lastLoginLoggedAt') || '0');
            if (isVerified && !isBlocked && (!last || now - last > 6 * 60 * 60 * 1000)) {
              await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: uBase.id, email: uBase.email, phone: profile?.phone })
              });
              localStorage.setItem('lastLoginLoggedAt', String(now));
            }
          } catch {}
        })();
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setAuthLoading(false);
        if (typeof document !== 'undefined') {
          try {
            const secure = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '; Secure' : '';
            document.cookie = `taliyo_auth=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
          } catch {}
        }
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const isVerified = !!session.user.email_confirmed_at;
        const isBlocked = !!(session.user.app_metadata as any)?.blocked;
        const suser = session.user;
        const uBase: User = {
          id: suser.id,
          name: (suser.user_metadata as any)?.name,
          email: suser.email || undefined,
        };
        setUser(uBase);
        setIsLoggedIn(isVerified && !isBlocked);
        setAuthLoading(true);
        if (typeof document !== 'undefined') {
          try {
            const secure = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '; Secure' : '';
            document.cookie = (isVerified && !isBlocked)
              ? `taliyo_auth=1; Path=/; Max-Age=2592000; SameSite=Lax${secure}`
              : `taliyo_auth=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
          } catch {}
        }
        if (typeof window !== 'undefined' && uBase.email) {
          localStorage.setItem('userData', JSON.stringify({ email: uBase.email }));
        }
        (async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id,name,phone,avatar_url')
            .eq('id', suser.id)
            .maybeSingle();
          setUser(prev => ({
            id: uBase.id,
            name: profile?.name || prev?.name,
            email: uBase.email,
            phone: profile?.phone,
            avatar_url: profile?.avatar_url,
          } as User));
          if (typeof window !== 'undefined' && profile?.phone) {
            localStorage.setItem('userPhone', profile.phone);
          }
          try {
            const did = typeof window !== 'undefined' ? localStorage.getItem('pwa_device_id') : null;
            if (did && uBase.id) {
              await fetch('/api/pwa-installs/map-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ device_id: did, user_id: uBase.id, user_email: uBase.email || null })
              });
            }
          } catch {}
          // On explicit sign-in, log login event
          if (event === 'SIGNED_IN' && isVerified && !isBlocked) {
            try {
              const now = Date.now();
              const last = Number(localStorage.getItem('lastLoginLoggedAt') || '0');
              if (!last || now - last > 6 * 60 * 60 * 1000) {
                await fetch('/api/user/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: uBase.id, email: uBase.email, phone: profile?.phone })
                });
                localStorage.setItem('lastLoginLoggedAt', String(now));
              }
            } catch {}
          }
          setAuthLoading(false);
          // If signed in without verification, immediately sign out to enforce policy
          if ((!isVerified || isBlocked) && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            try { await supabase.auth.signOut(); } catch {}
            setIsLoggedIn(false);
          }
        })();
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setAuthLoading(false);
        if (typeof document !== 'undefined') {
          try {
            const secure = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '; Secure' : '';
            document.cookie = `taliyo_auth=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
          } catch {}
        }
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = (_userData: User): void => {
    // Deprecated: use supabase.auth in pages.
    router.push('/login');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    if (typeof document !== 'undefined') {
      try {
        const secure = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '; Secure' : '';
        document.cookie = `taliyo_auth=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
      } catch {}
    }
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const redirectToLogin = () => {
    try {
      const href = typeof window !== 'undefined' ? window.location.href : '';
      if (href) {
        const url = new URL(href);
        const next = url.pathname + (url.search || '');
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
    } catch {}
    router.push('/login');
  };

  const showLoginModal = () => {
    // For now, this just redirects to login page
    redirectToLogin();
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      isAuthenticated,
      authLoading,
      login, 
      logout, 
      redirectToLogin,
      showLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};