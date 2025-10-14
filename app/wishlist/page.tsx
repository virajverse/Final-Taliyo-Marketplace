'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ServiceCard from '@/components/ServiceCard';
import { Heart, ShoppingCart, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

interface WishlistItem {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  price_min?: number;
  price_max?: number;
  price_type: 'fixed' | 'hourly' | 'negotiable';
  location?: string;
  is_remote: boolean;
  images: string[];
  rating_average: number;
  rating_count: number;
  provider_name?: string;
  provider_avatar?: string;
  provider_verified: boolean;
  duration_minutes?: number;
  is_active: boolean;
  is_featured: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
  dateAdded: string;
}

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWishlist = async () => {
    if (!user?.id) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await supabase
        .from('wishlists')
        .select('created_at, service:services(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const items: WishlistItem[] = (data || [])
        .filter((row: any) => row.service)
        .map((row: any) => ({
          ...(row.service as any),
          images: Array.isArray(row.service.images) ? row.service.images : (row.service.images ? JSON.parse(row.service.images) : []),
          dateAdded: row.created_at,
        }));
      setWishlistItems(items);
    } catch (e) {
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('wishlists_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${user.id}` }, () => fetchWishlist())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const handleToggleWishlist = async (serviceId: string) => {
    if (!user?.id) return;
    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('service_id', serviceId);
    setWishlistItems(items => items.filter(item => item.id !== serviceId));
  };

  const handleAddToCart = (serviceId: string) => {
    // Add to cart logic
    console.log('Added to cart:', serviceId);
  };

  const handleShare = () => {
    const message = `Check out my wishlist on Taliyo Marketplace:\n\n${wishlistItems.map(item => 
      `${item.title} - ₹${item.price_min?.toLocaleString()}`
    ).join('\n')}\n\nDiscover amazing services at Taliyo!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Taliyo Wishlist',
        text: message,
      });
    } else {
      // Fallback to WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (!loading && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-8 pb-20 px-4">
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save services you love to book them later</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
            >
              Discover Services
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
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">{wishlistItems.length} service{wishlistItems.length > 1 ? 's' : ''} saved</p>
          </div>
          <button
            onClick={handleShare}
            className="bg-white border border-gray-300 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-pink-50 to-red-50 border border-pink-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-500" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-1">Your Favorites</h3>
              <p className="text-sm text-red-700">Services you've saved for later booking</p>
            </div>
            <button
              onClick={() => {
                // Add all to cart logic
                wishlistItems.forEach(item => handleAddToCart(item.id));
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add All to Cart
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative">
              <ServiceCard
                service={item}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={true}
              />
              
              {/* Date Added Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="text-xs text-gray-600">
                  Added {new Date(item.dateAdded).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Ready to book?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Contact our team to get personalized quotes for your saved services
            </p>
            <button
              onClick={() => {
                const message = `Hi! I'm interested in these services from my wishlist:\n\n${wishlistItems.map(item => 
                  `Service: ${item.title}\nPrice: ₹${item.price_min?.toLocaleString()} - ₹${item.price_max?.toLocaleString()}\nProvider: ${item.provider_name}\n`
                ).join('\n')}\nPlease provide more details and quotes.`;
                
                const phoneNumber = '+917042523611';
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <Heart className="w-4 h-4" />
              Get Quotes via WhatsApp
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}