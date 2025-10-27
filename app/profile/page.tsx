'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { supabaseImageLoader, isSupabaseUrl } from '@/lib/supabaseImageLoader';
import { useToast } from '@/components/ToastProvider';
import { 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  Clock, 
  Star,
  Phone,
  Mail,
  Camera,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  joinDate?: string;
  stats: {
    bookings: number;
    favorites: number;
    reviews: number;
  };
}

export default function Profile() {
  const { isLoggedIn, user: authUser, logout, authLoading } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const toast = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailPending, setEmailPending] = useState(false);

  const loadProfile = async () => {
    if (!authUser?.id) return;
    // Immediate UI: prime user from auth without waiting for network
    setUser(prev => ({
      id: authUser.id,
      name: prev?.name || authUser.name || 'User',
      email: authUser.email,
      phone: prev?.phone,
      avatar: (prev as any)?.avatar || 'https://picsum.photos/seed/profile-fallback/150/150',
      joinDate: (prev as any)?.joinDate || new Date().toISOString(),
      stats: prev?.stats || { bookings: 0, favorites: 0, reviews: 0 },
    } as UserData));
    // Load profile row
    setProfileLoading(true);
    let p: any | null = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,name,phone,avatar_url,created_at')
        .eq('id', authUser.id)
        .maybeSingle();
      if (!error) p = data;
    } catch {}
    const u: UserData = {
      id: authUser.id,
      name: p?.name || authUser.name || 'User',
      email: authUser.email,
      phone: p?.phone,
      avatar: p?.avatar_url || 'https://picsum.photos/seed/profile-fallback/150/150',
      joinDate: p?.created_at || new Date().toISOString(),
      stats: { bookings: 0, favorites: 0, reviews: 0 },
    };
    setUser(u);
    setProfileLoading(false);

    // Stats
    const email = authUser.email || '';
    // Bookings count
    let bookingsCount = 0;
    try {
      let qb = supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true });
      if (email) {
        qb = qb.or(`customer_email.eq.${email},email.eq.${email}`);
      } else {
        throw new Error('no_email');
      }
      const { count: bcount } = await qb;
      bookingsCount = bcount || 0;
    } catch {}

    // Favorites count (wishlists)
    let favorites = 0;
    try {
      const { count: fcount } = await supabase
        .from('wishlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id);
      favorites = fcount || 0;
    } catch {}

    // Reviews count (by user's bookings)
    let reviews = 0;
    try {
      const { data: bIds } = await supabase
        .from('bookings')
        .select('id')
        .or(`customer_email.eq.${email},email.eq.${email}`)
        .order('created_at', { ascending: false })
        .limit(1000);
      const ids = (bIds || []).map(b => b.id);
      if (ids.length > 0) {
        const { count: rcount } = await supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .in('booking_id', ids)
          .eq('is_approved', true);
        reviews = rcount || 0;
      }
    } catch {}

    setUser(prev => prev ? { ...prev, stats: { bookings: bookingsCount, favorites, reviews } } : prev);
  };

  useEffect(() => {
    loadProfile();
  }, [authUser?.id, authUser?.email]);

  // Track email verification state from auth
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const ev = !!data.user?.email_confirmed_at;
      setEmailVerified(ev);
      // If user verified and previously pending, clear pending
      if (ev) setEmailPending(false);
    })();
  }, [authUser?.email]);

  // Realtime profile updates
  useEffect(() => {
    if (!authUser?.id) return;
    if (typeof window !== 'undefined' && !navigator.onLine) return;
    const channel = supabase
      .channel('profile_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${authUser.id}` }, () => loadProfile())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authUser?.id]);

  // Show toast notification
  const showToastMessage = (message: string) => { toast.info(message); };

  const resendVerificationEmail = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
        options: origin ? { emailRedirectTo: `${origin}/auth/callback` } : undefined as any,
      });
      showToastMessage('Verification email sent');
    } catch {}
  };

  // Handle sign out
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    showToastMessage('Signed out successfully');
  };

  

  // Update user data (live). Special handling for email triggers verification email.
  const updateUser = async (field: keyof UserData, value: string) => {
    if (!user) return;
    if (field === 'email') {
      try {
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined;
        const { error } = await supabase.auth.updateUser({ email: value }, { emailRedirectTo: redirectTo });
        if (error) throw error;
        setEmailPending(true);
        showToastMessage('Verification email sent. Please verify to update your email.');
      } catch (e: any) {
        showToastMessage('Could not send verification email.');
      }
      return;
    }
    // Live update UI
    const updatedUser = { ...user, [field]: value };
    setUser(updatedUser);
    // Persist to profiles table
    if (field === 'name' || field === 'phone') {
      await supabase.from('profiles').upsert({ id: user.id, name: updatedUser.name, phone: updatedUser.phone });
      // If phone changed, log a contact update event for admin visibility
      if (field === 'phone') {
        try {
          await fetch('/api/user/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email: updatedUser.email, phone: updatedUser.phone })
          });
        } catch {}
      }
    }
  };

  const stats = [
    { label: 'Bookings', value: user?.stats?.bookings || '0', icon: Clock, color: 'text-blue-500' },
    { label: 'Favorites', value: user?.stats?.favorites || '0', icon: Heart, color: 'text-red-500' },
    { label: 'Reviews', value: user?.stats?.reviews || '0', icon: Star, color: 'text-yellow-500' },
  ];

  const menuItems = [
    { 
      icon: Heart, 
      label: 'My Favorites', 
      href: '/wishlist',
      count: user?.stats?.favorites || '0', 
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    { 
      icon: Clock, 
      label: 'Booking History', 
      href: '/orders',
      count: user?.stats?.bookings || '0', 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: Star, 
      label: 'My Reviews', 
      href: '/reviews',
      count: user?.stats?.reviews || '0', 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      href: '/notifications',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/settings',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    },
    { 
      icon: Shield, 
      label: 'Privacy & Security', 
      href: '/privacy',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      href: '/help',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-4 pb-20 px-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-4 pb-20 px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile</h2>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          {/* Guest Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <User className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">Welcome to Taliyo Marketplace!</h3>
              <p className="text-gray-600 mb-6">Sign in to book services, save favorites, and track your orders</p>
              
              <div className="space-y-3">
                <Link
                  href="/login?next=/profile"
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 text-center block"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?next=/profile"
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors text-center block"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions for Guests */}
          <div className="space-y-3">
            <Link
              href="/categories"
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-medium text-gray-900">Browse Services</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              href="/help"
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-green-500" />
                </div>
                <span className="font-medium text-gray-900">Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 shadow-sm border border-gray-200 relative">
          {profileLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/5 animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="relative">
                  <Image
                    src={user?.avatar || "https://picsum.photos/seed/profile-fallback/150/150"}
                    alt="Profile"
                    width={64}
                    height={64}
                    loader={isSupabaseUrl(user?.avatar || '') ? supabaseImageLoader : undefined}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow"
                  />
                </div>
                
                <div className="flex-1">
                  <>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">{user?.name || 'User'}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-600 text-sm">{user?.email || 'user@example.com'}</span>
                      {emailVerified ? (
                        <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Verified</span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-[11px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          {emailPending ? 'Verification Pending' : 'Not Verified'}
                          <button type="button" onClick={resendVerificationEmail} className="underline text-blue-700">Send email</button>
                        </span>
                      )}
                    </div>
                  </>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.count && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleSignOut}
          className="w-full bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
}
