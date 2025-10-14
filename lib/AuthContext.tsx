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
  login: (user: User) => void;
  logout: () => void;
  redirectToLogin: () => void;
  showLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // isAuthenticated is an alias for isLoggedIn for compatibility
  const isAuthenticated = isLoggedIn;

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        const suser = session.user;
        // Try loading profile row (optional)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id,name,phone,avatar_url')
          .eq('id', suser.id)
          .maybeSingle();
        const u: User = {
          id: suser.id,
          name: profile?.name || (suser.user_metadata as any)?.name,
          email: suser.email || undefined,
          phone: profile?.phone,
          avatar_url: profile?.avatar_url,
        };
        setUser(u);
        setIsLoggedIn(true);
        // legacy compat for pages filtering by email/phone
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify({ email: u.email }));
          if (u.phone) localStorage.setItem('userPhone', u.phone);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const suser = session.user;
        setUser({
          id: suser.id,
          name: (suser.user_metadata as any)?.name,
          email: suser.email || undefined,
        });
        setIsLoggedIn(true);
        if (typeof window !== 'undefined' && suser.email) {
          localStorage.setItem('userData', JSON.stringify({ email: suser.email }));
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
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
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const redirectToLogin = () => {
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