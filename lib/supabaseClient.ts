import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Dynamic storage adapter: routes Supabase session to localStorage when Remember Me is on,
// else sessionStorage for browser-session-only login.
const dynamicStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null as any;
    try {
      const useLocal = (localStorage.getItem('rememberMe') || 'true') === 'true';
      const primary = useLocal ? localStorage : sessionStorage;
      const secondary = useLocal ? sessionStorage : localStorage;
      const val = primary.getItem(key) ?? secondary.getItem(key);
      return val as any;
    } catch {
      // Fallback: try both storages
      try {
        return localStorage.getItem(key) as any;
      } catch {}
      try {
        return sessionStorage.getItem(key) as any;
      } catch {}
      return null as any;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    const useLocal = (localStorage.getItem('rememberMe') || 'true') === 'true';
    const store = useLocal ? localStorage : sessionStorage;
    store.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    // Remove from both to avoid stale session when toggling Remember Me
    try {
      localStorage.removeItem(key);
    } catch {}
    try {
      sessionStorage.removeItem(key);
    } catch {}
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: dynamicStorage as any,
  },
});
