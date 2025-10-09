'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { ShoppingCart, Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: number;
  service_id: number;
  title: string;
  price_min?: number;
  price_max?: number;
  price_type: string;
  images?: string;
  provider_name: string;
  quantity: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      service_id: 1,
      title: 'Professional Web Development',
      price_min: 12000,
      price_max: 15000,
      price_type: 'fixed',
      images: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      provider_name: 'Tech Solutions',
      quantity: 1
    },
    {
      id: 2,
      service_id: 2,
      title: 'Digital Marketing Package',
      price_min: 8000,
      price_type: 'fixed',
      images: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      provider_name: 'Digital Growth',
      quantity: 1
    }
  ]);

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
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  const handleWhatsAppSupport = () => {
    const message = `Hi! I need help with my cart on Taliyo.`;
    const phoneNumber = '+917042523611';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
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
                <img
                  src={item.images || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'}
                  alt={item.title}
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
            
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
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
                const message = `Hi! I want to book these services:\n\n${cartItems.map(item => 
                  `📦 ${item.title}\n💰 ₹${getItemPrice(item).toLocaleString()} x ${item.quantity}\n👤 ${item.provider_name}\n`
                ).join('\n')}\n💵 Total: ₹${total.toLocaleString()}\n\nPlease confirm the booking details.`;
                
                const phoneNumber = '+917042523611';
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
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
    </div>
  );
}
