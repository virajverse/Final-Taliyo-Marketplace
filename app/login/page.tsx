'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ToastProvider';

import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  Phone
} from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(true);

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const showToastMessage = (message: string) => { toast.info(message); };
  
  const isDisposableEmail = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    if (!domain) return true;
    const block = [
      'tempmail.com','10minutemail.com','guerrillamail.com','sharklasers.com','mailinator.com','yopmail.com','trashmail.com','discard.email','getnada.com','nada.ltd','maildrop.cc','mintemail.com','spambog.com','moakt.com','fakeinbox.com','temporary-mail.net','temp-mail.io','mytemp.email','emailondeck.com','throwawaymail.com','inboxkitten.com','mail7.io','tmails.net','tmpmail.org'
    ];
    return block.some(b => domain === b || domain.endsWith('.' + b));
  };
  
  const handleResetPassword = async () => {
    if (!loginForm.email) {
      toast.info('Enter your email above first');
      return;
    }
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await supabase.auth.resetPasswordForEmail(loginForm.email, {
        redirectTo: origin ? `${origin}/reset-password` : undefined,
      });
      toast.success('Password reset email sent');
    } catch {
      toast.error('Failed to send reset email');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form
    if (!loginForm.email || !loginForm.password) {
      toast.info('Please fill all fields');
      setLoading(false);
      return;
    }

    try {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
        }
      } catch {}
      // Server-side disposable email check
      try {
        const res = await fetch('/api/auth/check-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginForm.email }),
        });
        const json = await res.json();
        if (res.ok && json?.disposable) {
          toast.error('Disposable/temporary emails are not allowed.');
          setLoading(false);
          return;
        }
      } catch {}

      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) throw error;
      // Enforce email verification after password sign-in
      const { data } = await supabase.auth.getUser();
      const verified = !!data.user?.email_confirmed_at;
      if (!verified) {
        try { if (typeof window !== 'undefined') localStorage.setItem('pendingVerifyEmail', loginForm.email); } catch {}
        await supabase.auth.signOut();
        toast.info('Please verify your email first. Check your inbox.');
      } else {
        toast.success('Login successful!');
        try {
          if (typeof document !== 'undefined') {
            const secure = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '; Secure' : '';
            document.cookie = `taliyo_auth=1; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
          }
        } catch {}
        setTimeout(() => {
          const next = searchParams?.get('next');
          try { if (typeof window !== 'undefined') localStorage.removeItem('pendingVerifyEmail'); } catch {}
          router.push(next || '/');
        }, 800);
      }
    } catch (error: any) {
      const msg = (error?.message || '').toString().toLowerCase();
      if (msg.includes('confirm') || msg.includes('verify')) {
        toast.info('Please verify your email first. Check your inbox.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!signupForm.name || !signupForm.email || !signupForm.phone || !signupForm.password) {
        toast.info('Please fill in all required fields');
        setLoading(false);
        return;
      }
      if (isDisposableEmail(signupForm.email)) {
        toast.error('Disposable/temporary emails are not allowed. Use a real email.');
        setLoading(false);
        return;
      }
      if (signupForm.password !== signupForm.confirmPassword) {
        toast.info('Passwords do not match');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          phone: signupForm.phone,
          password: signupForm.password,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        toast.error(json?.error || 'Could not create account');
        setLoading(false);
        return;
      }
      toast.success(json?.message || 'Check your email to verify your account before signing in.');
      setIsLogin(true);
    } catch (e) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6">
          <Link
            href="/profile"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Welcome back to Taliyo!' : 'Join Taliyo today!'}
            </p>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-200">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              isLogin
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              !isLogin
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded"
                  />
                  Remember me
                </label>
                <button type="button" onClick={handleResetPassword} className="text-blue-500 text-sm hover:text-blue-600">
                  Forgot your password?
                </button>
              </div>

              <div className="mt-3 text-right">
                <Link href="/verify-email" className="text-blue-500 text-sm hover:text-blue-600">
                  Didn\'t receive verification email?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="mt-4 text-center text-sm text-gray-600">
                By creating an account, you agree to our{' '}
                <Link href="/privacy" className="text-blue-500 hover:text-blue-600">
                  Terms & Privacy Policy
                </Link>
              </div>
            </div>
          </form>
      )}

      </div>

      <BottomNavigation />
    </div>
  );
}