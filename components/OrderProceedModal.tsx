'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface OrderProceedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderProceedModal({ isOpen, onClose }: OrderProceedModalProps) {
  const { isLoggedIn, user, redirectToLogin } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    whatsappNumber: '',
    instructions: ''
  });
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [cartPreview, setCartPreview] = useState<any[]>([]);

  const cartSubtotal = useMemo(() => {
    return cartPreview.reduce((sum, it) => sum + ((Number((it as any)?.price_min) || 0) * ((it as any)?.quantity || 1)), 0);
  }, [cartPreview]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('cart');
        setCartPreview(saved ? JSON.parse(saved) : []);
      } catch {}
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isLoggedIn && user) {
      try {
        const storedPhone = localStorage.getItem('userPhone') || '';
        const storedEmail = user.email || JSON.parse(localStorage.getItem('userData') || 'null')?.email || '';
        setForm(prev => ({
          ...prev,
          fullName: user.name || prev.fullName,
          email: storedEmail || prev.email,
          whatsappNumber: storedPhone || prev.whatsappNumber,
        }));
      } catch {}
    }
  }, [isOpen, isLoggedIn, user]);

  const validate = () => {
    const v: Record<string, string> = {};
    if (!form.fullName.trim()) v.fullName = 'Full name is required';
    if (!form.email.trim()) v.email = 'Email is required';
    else if (!/.+@.+\..+/.test(form.email)) v.email = 'Enter a valid email';
    if (!form.whatsappNumber.trim()) v.whatsappNumber = 'WhatsApp number is required';
    else if (form.whatsappNumber.replace(/\D/g, '').length < 10) v.whatsappNumber = 'Enter a valid WhatsApp number';
    setValidation(v);
    return Object.keys(v).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (validation[name]) {
      setValidation(prev => {
        const n = { ...prev } as any;
        delete n[name];
        return n;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');
    if (!isLoggedIn) {
      setServerError('Please sign in and verify your email before placing an order.');
      try { redirectToLogin?.(); } catch {}
      try { toast.info('Please sign in and verify your email.'); } catch {}
      return;
    }
    if (!validate()) return;

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('serviceId', 'cart-order');
      fd.append('serviceTitle', 'Cart Order');
      fd.append('servicePrice', `₹${cartSubtotal.toLocaleString()}`);
      fd.append('providerName', 'Multiple Providers');
      fd.append('fullName', form.fullName);
      // bookings.phone is NOT NULL; map whatsappNumber to phone as well
      fd.append('phone', form.whatsappNumber);
      fd.append('email', form.email);
      fd.append('whatsappNumber', form.whatsappNumber);
      fd.append('requirements', form.instructions);
      try {
        const cart = localStorage.getItem('cart');
        if (cart) fd.append('cartItems', cart);
      } catch {}

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to submit order');
      setServerSuccess('Order submitted successfully!');
      try { toast.success('Order submitted successfully'); } catch {}
      const bookingId = data?.booking?.id || data?.id;
      if (bookingId) {
        try { localStorage.removeItem('cart'); } catch {}
        router.push(`/order-status/${bookingId}`);
      } else {
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      setServerError(err?.message || 'Something went wrong');
      try { toast.error(err?.message || 'Order submission failed'); } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-start md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Proceed to Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto no-scrollbar" style={{ maxHeight: '85dvh' }}>
          <div className="px-6 py-5 pb-28 space-y-5 flex-1">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">{serverError}</div>
            )}
            {serverSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">{serverSuccess}</div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Items</span>
                <span className="font-medium">{cartPreview.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">₹{cartSubtotal.toLocaleString()}</span>
              </div>
            </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Your Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validation.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your full name"
                  required
                />
                {validation.fullName && <p className="text-xs text-red-600 mt-1">{validation.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validation.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="you@example.com"
                  required
                />
                {validation.email && <p className="text-xs text-red-600 mt-1">{validation.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validation.whatsappNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="+91 9876543210"
                  required
                />
                {validation.whatsappNumber && <p className="text-xs text-red-600 mt-1">{validation.whatsappNumber}</p>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Instructions (Optional)</h3>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={4}
              placeholder="Any specific requirements or notes for the order..."
            />
          </div>

          </div>

          <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-gray-200 bg-white shadow-[0_-1px_8px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 w-full sm:w-auto">Cancel</button>
              <button type="submit" disabled={submitting || !isLoggedIn} className="px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 w-full sm:w-auto">
                {submitting ? 'Submitting...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
