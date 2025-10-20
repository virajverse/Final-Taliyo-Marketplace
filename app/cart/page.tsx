'use client';

import { useState } from 'react';
import React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { ShoppingCart, Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseImageLoader, isSupabaseUrl } from '@/lib/supabaseImageLoader';
import BookingModal from '@/components/BookingModal';
import OrderProceedModal from '@/components/OrderProceedModal';

interface CartItem {
  id: number;
  service_id: string;
  title: string;
  price_min?: number;
  price_max?: number;
  price_type: string;
  images?: string;
  provider_name: string;
  quantity: number;
}

export default function Cart() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProceedModalOpen, setIsProceedModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage whenever cartItems change
  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const getItemPrice = (item: CartItem) => {
    return item.price_min || 0;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0);
  const total = subtotal;

  const handleWhatsAppSupport = () => {
    const message = `Hi! I need help with my cart on Taliyo.`;
    const supportWhatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
    if (!supportWhatsapp) { console.warn('Support WhatsApp not configured'); return; }
    const whatsappUrl = `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={0} />
        
        <div className="pt-8 pb-20 px-4">
          <div className="text-center py-16">
            <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some services to get started!</p>
            <Link
              href="/"
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
            >
              Browse Services
            </Link>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartItems.length} />
      
      <div className="pt-4 pb-32 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shopping Cart</h2>
          <p className="text-gray-600">{cartItems.length} items in your cart</p>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex gap-4">
                <Image
                  src={item.images || 'https://picsum.photos/seed/cart-item/400/300'}
                  alt={item.title}
                  width={80}
                  height={80}
                  loader={isSupabaseUrl(item.images || '') ? supabaseImageLoader : undefined}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-gray-600">by {item.provider_name}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">₹{getItemPrice(item).toLocaleString()}</span>
                      <span className="text-xs text-gray-500 capitalize">({item.price_type})</span>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Bill Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary checkout action */}
        <div className="mb-6">
          <button
            onClick={() => {
              // Proceed to Order uses minimal order modal (separate from Booking)
              setIsProceedModalOpen(true);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-sm"
          >
            Proceed to Order
          </button>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🟢</div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-1">Ready to Book?</h3>
              <p className="text-sm text-green-700">Complete your booking via WhatsApp</p>
            </div>
            <button
              onClick={() => {
                // Create a combined service object for booking modal
                const combinedService = {
                  id: 'cart-booking',
                  title: `${cartItems.length} Service${cartItems.length > 1 ? 's' : ''} from Cart`,
                  price_min: subtotal,
                  price_max: total,
                  provider_name: 'Multiple Providers',
                  rating_average: 4.5
                };
                setSelectedService(combinedService);
                setIsBookingModalOpen(true);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Book Now
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
      
      <OrderProceedModal
        isOpen={isProceedModalOpen}
        onClose={() => setIsProceedModalOpen(false)}
      />

      {selectedService && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
        />
      )}
    </div>
  );
}
