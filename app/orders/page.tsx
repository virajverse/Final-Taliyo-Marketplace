'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  MessageCircle,
  Star,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import BookingModal from '@/components/BookingModal';

interface Order {
  id: string;
  serviceTitle: string;
  providerName: string;
  providerAvatar: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  bookingDate: string;
  scheduledDate?: string;
  completedDate?: string;
  image: string;
  description: string;
  timeline?: string;
  phone: string;
  rating?: number;
  review?: string;
}

export default function Orders() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const storedPhone = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userPhone') || '';
  }, []);

  const userEmail = user?.email || (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('userData') || 'null')?.email || '') : '');

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const customService = useMemo(() => ({ id: 'custom', title: 'Custom Order' }), []);

  useEffect(() => {
    fetchBookings();
  }, [userEmail, storedPhone]);

  useEffect(() => {
    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchBookings())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userEmail, storedPhone]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let q = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      const phone = storedPhone?.trim();
      const email = userEmail?.trim();
      if (phone) {
        const digits = phone.replace(/\D/g, '');
        q = q.or(`phone.ilike.%${digits}%,customer_phone.ilike.%${digits}%`);
      } else if (email) {
        q = q.or(`email.eq.${email},customer_email.eq.${email}`);
      }

      const { data } = await q;
      setBookings(data || []);
    } catch (e) {
      console.error('Failed to load bookings', e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'in-progress':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const orders: Order[] = useMemo(() => {
    return (bookings || []).map((b: any) => ({
      id: b.id,
      serviceTitle: b.service_title || 'Service',
      providerName: b.provider_name || 'Provider',
      providerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      amount: Number(b.final_price || 0),
      status: (b.status || 'pending') as Order['status'],
      bookingDate: b.created_at,
      scheduledDate: b.preferred_date || undefined,
      completedDate: b.status === 'completed' ? b.updated_at : undefined,
      image: (Array.isArray(b.images) ? b.images[0] : (b.images ? JSON.parse(b.images || '[]')[0] : '')) || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      description: b.message || b.requirements || '',
      timeline: b.delivery_preference || b.timeline || '',
      phone: b.phone || b.customer_phone || ''
    }));
  }, [bookings]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'confirmed', 'in-progress'].includes(order.status);
    if (activeTab === 'completed') return ['completed', 'cancelled'].includes(order.status);
    return true;
  });

  const handleContactProvider = (order: Order) => {
    const message = `Hi ${order.providerName}! Regarding my booking:\n\nService: ${order.serviceTitle}\nOrder ID: ${order.id}\nScheduled: ${order.scheduledDate}\n\nI have a question about the service.`;
    const whatsappUrl = `https://wa.me/${order.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  

  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-8 pb-20 px-4">
          <div className="text-center py-16">
            <Clock className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">Your booking history will appear here</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
            >
              Book a Service
            </button>
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500">Ya customised requirement hai?</span>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                Custom Order
              </button>
            </div>
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">{orders.length} booking{orders.length > 1 ? 's' : ''} total</p>
          </div>
          <div className="w-full sm:w-auto">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              title="Customized order? Book as per your requirement"
            >
              <MessageCircle className="w-5 h-5" />
              Custom Order
            </button>
            <p className="text-xs text-gray-600 mt-2">
              Customized booking chahiye? Apni requirement ke hisaab se yahan se book kar sakte hain.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-200">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending', label: 'Active' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white/95 rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-start gap-3">
                  <img
                    src={order.image}
                    alt={order.serviceTitle}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                  />
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900 leading-tight">
                      {order.serviceTitle}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono tracking-tight">
                      #{order.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Provider Info */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 mb-5 flex items-center gap-3">
                <img
                  src={order.providerAvatar}
                  alt={order.providerName}
                  className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{order.providerName}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {order.description || 'Details to be shared soon.'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{order.amount.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-500">Quoted amount</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mb-5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium text-gray-700">Booked:</span>
                  <span>{new Date(order.bookingDate).toLocaleDateString()}</span>
                </div>
                {order.timeline && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium text-gray-700">Timeline:</span>
                    <span className="truncate">{order.timeline}</span>
                  </div>
                )}
                {order.scheduledDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium text-gray-700">Scheduled:</span>
                    <span>{new Date(order.scheduledDate).toLocaleDateString()}</span>
                  </div>
                )}
                {order.completedDate && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="font-medium text-gray-700">Completed:</span>
                    <span>{new Date(order.completedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Rating & Review (for completed orders) */}
              {order.status === 'completed' && order.rating && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < order.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-green-800">Your Review</span>
                  </div>
                  {order.review && (
                    <p className="text-xs text-green-700">{order.review}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link
                  href={`/order-status/${order.id}`}
                  className="flex items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  View Status
                </Link>
                <button
                  onClick={() => handleContactProvider(order)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 text-white py-2 text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Provider
                </button>

                {order.status === 'completed' && !order.rating && (
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400/20 text-yellow-700 py-2 text-sm font-medium hover:bg-yellow-400/30 transition-colors">
                    <Star className="w-4 h-4" />
                    Rate Service
                  </button>
                )}

                {order.status === 'pending' && (
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-red-50 text-red-600 py-2 text-sm font-medium hover:bg-red-100 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} orders
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending' ? 'No active bookings at the moment' : 'No completed orders yet'}
            </p>
          </div>
        )}
      </div>

      {/* Use existing BookingModal for custom order */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={customService as any}
      />

      <BottomNavigation />
    </div>
  );
}