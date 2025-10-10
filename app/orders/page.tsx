'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';

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
  location: string;
  phone: string;
  rating?: number;
  review?: string;
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [orders] = useState<Order[]>([
    {
      id: 'ORD001',
      serviceTitle: 'Professional Web Development',
      providerName: 'Tech Solutions',
      providerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      amount: 12000,
      status: 'completed',
      bookingDate: '2024-01-15',
      scheduledDate: '2024-01-20',
      completedDate: '2024-01-25',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      description: 'E-commerce website with payment integration',
      location: 'Remote',
      phone: '+91 98765 43210',
      rating: 5,
      review: 'Excellent work! Very professional and delivered on time.'
    },
    {
      id: 'ORD002',
      serviceTitle: 'Digital Marketing Campaign',
      providerName: 'Digital Growth',
      providerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      amount: 8000,
      status: 'in-progress',
      bookingDate: '2024-01-18',
      scheduledDate: '2024-01-22',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      description: 'Social media marketing for 3 months',
      location: 'Bangalore',
      phone: '+91 87654 32109'
    },
    {
      id: 'ORD003',
      serviceTitle: 'Home Cleaning Service',
      providerName: 'CleanPro Services',
      providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      amount: 800,
      status: 'pending',
      bookingDate: '2024-01-20',
      scheduledDate: '2024-01-25',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      description: 'Deep cleaning for 3BHK apartment',
      location: 'Delhi NCR',
      phone: '+91 76543 21098'
    }
  ]);

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

  if (orders.length === 0) {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">{orders.length} booking{orders.length > 1 ? 's' : ''} total</p>
          </div>
          <button className="bg-white border border-gray-300 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
          </button>
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
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={order.image}
                    alt={order.serviceTitle}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{order.serviceTitle}</h3>
                    <p className="text-xs text-gray-600">Order #{order.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Provider Info */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={order.providerAvatar}
                  alt={order.providerName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{order.providerName}</p>
                  <p className="text-xs text-gray-600">{order.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{order.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Booked: {new Date(order.bookingDate).toLocaleDateString()}</span>
                </div>
                {order.scheduledDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{order.location}</span>
                </div>
                {order.completedDate && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed: {new Date(order.completedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Rating & Review (for completed orders) */}
              {order.status === 'completed' && order.rating && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
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
              <div className="flex gap-2">
                <button
                  onClick={() => handleContactProvider(order)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Provider
                </button>
                
                {order.status === 'completed' && !order.rating && (
                  <button className="flex-1 bg-yellow-50 text-yellow-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors flex items-center justify-center gap-2">
                    <Star className="w-4 h-4" />
                    Rate Service
                  </button>
                )}
                
                {order.status === 'pending' && (
                  <button className="bg-red-50 text-red-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
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

      <BottomNavigation />
    </div>
  );
}