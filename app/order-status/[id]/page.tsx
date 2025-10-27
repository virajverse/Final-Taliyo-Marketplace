'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

interface BookingRow {
  id: string;
  service_title?: string;
  provider_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  cart_items?: string | null;
  additional_notes?: string | null;
  files?: any;
}

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuth();
  const userEmail =
    authUser?.email ||
    (typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('userData') || 'null')?.email || ''
      : '');

  // 7-step timeline
  const steps = [
    { key: 'requested', label: 'Requested' },
    { key: 'details_confirmed', label: 'Details Confirmed' },
    { key: 'quoted', label: 'Quoted' },
    { key: 'advance_paid', label: 'Advance Paid' },
    { key: 'work_started', label: 'Work Started' },
    { key: 'in_review', label: 'In Review' },
    { key: 'delivered', label: 'Delivered' },
  ];

  useEffect(() => {
    if (!params?.id) return;
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const uid = authUser?.id || '';
        if (!uid && !userEmail) {
          router.push('/login');
          return;
        }
        let data: any = null;
        let error: any = null;
        if (uid) {
          const { data: row, error: err } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', params.id as string)
            .eq('user_id', uid)
            .single();
          data = row;
          error = err;
          // If not found via user_id (legacy row), fallback to email
          if ((error || !data) && userEmail) {
            const { data: row2, error: err2 } = await supabase
              .from('bookings')
              .select('*')
              .eq('id', params.id as string)
              .or(`email.eq.${userEmail},customer_email.eq.${userEmail}`)
              .single();
            data = row2;
            error = err2;
          }
        } else {
          const { data: row, error: err } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', params.id as string)
            .or(`email.eq.${userEmail},customer_email.eq.${userEmail}`)
            .single();
          data = row;
          error = err;
        }
        if (error) throw error;
        if (!mounted) return;
        setBooking(data as unknown as BookingRow);
      } catch (e) {
        setBooking(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel('order_status_page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `id=eq.${params.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [params?.id, userEmail]);

  const timeline = useMemo(() => {
    try {
      const notes = booking?.additional_notes ? JSON.parse(booking.additional_notes) : {};
      return Array.isArray(notes?.timeline)
        ? (notes.timeline as Array<{ step: number; label: string; at: string; note?: string }>)
        : [];
    } catch {
      return [];
    }
  }, [booking?.additional_notes]);

  const attachments = useMemo(() => {
    try {
      const f = (booking as any)?.files;
      return Array.isArray(f)
        ? f
            .filter((x: any) => x && typeof x.path === 'string')
            .map((x: any) => ({ name: x.name || x.path, path: x.path }))
        : [];
    } catch {
      return [];
    }
  }, [booking]);

  const downloadAttachment = async (path: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token || !booking?.id) return;
      const res = await fetch('/api/storage/sign-url', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: booking.id, path, expiresIn: 900 }),
      });
      const j = await res.json();
      if (res.ok && j?.url) window.open(j.url, '_blank');
    } catch {}
  };

  const cartItems = useMemo(() => {
    try {
      return booking?.cart_items ? JSON.parse(booking.cart_items) : [];
    } catch {
      return [];
    }
  }, [booking?.cart_items]);

  const currentStepIndex = useMemo(() => {
    // Prefer last timeline entry if present
    if (timeline.length) {
      const last = timeline[timeline.length - 1];
      return Math.max(0, Math.min(steps.length - 1, (Number(last.step) || 1) - 1));
    }
    // Fallback map from status
    const s = (booking?.status || '').toLowerCase();
    if (s === 'pending') return 0; // Requested
    if (s === 'confirmed') return 2; // Quoted
    if (s === 'in-progress') return 4; // Work Started
    if (s === 'completed') return 6; // Delivered
    return 0;
  }, [timeline, booking?.status]);

  const progressPct = useMemo(() => {
    if (steps.length <= 1) return 0;
    return Math.min(100, Math.max(0, Math.round((currentStepIndex / (steps.length - 1)) * 100)));
  }, [currentStepIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/2 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 text-gray-700">
              <AlertCircle className="w-5 h-5" />
              <span>Order not found</span>
            </div>
            <button onClick={() => router.back()} className="mt-4 text-blue-600">
              Go Back
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum: number, it: any) => sum + (Number(it?.price_min) || 0) * (it?.quantity || 1),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Status</h1>
            <p className="text-sm text-gray-600">Order #{booking.id}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-gray-600">Placed on</p>
            <p className="text-sm font-medium">
              {booking.created_at ? new Date(booking.created_at).toLocaleString() : '-'}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Progress</h3>
          <div className="relative">
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[560px] sm:min-w-0 px-1">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-7 gap-2">
                  {steps.map((st, idx) => {
                    const active = idx <= currentStepIndex;
                    return (
                      <div key={st.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${active ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-300 bg-white text-gray-400'}`}
                        >
                          {active ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-[11px] sm:text-xs leading-tight ${active ? 'text-green-700' : 'text-gray-600'}`}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {timeline.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
              <div className="space-y-2 text-sm">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Step {t.step}:</span> {t.label}
                      {t.note && <span className="text-gray-600"> — {t.note}</span>}
                    </div>
                    <div className="text-xs text-gray-500">{new Date(t.at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
            <div className="space-y-2 text-sm">
              {attachments.map((f: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="truncate pr-2">{f.name}</div>
                  <button
                    onClick={() => downloadAttachment(f.path)}
                    className="text-blue-600 hover:underline"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
          <div className="space-y-2 text-sm">
            {cartItems.map((it: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="truncate pr-2">
                  {it.title} × {it.quantity || 1}
                </div>
                <div className="font-medium">
                  ₹{((Number(it?.price_min) || 0) * (it?.quantity || 1)).toLocaleString()}
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
