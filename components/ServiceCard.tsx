'use client';

import { Star, Clock, Heart } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseImageLoader, isSupabaseUrl } from '@/lib/supabaseImageLoader';
import BookingModal from './BookingModal';
import { useAuth } from '@/lib/AuthContext';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description?: string;
    price_min?: number;
    price_max?: number;
    price_type: 'fixed' | 'hourly' | 'negotiable';
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
  };
  onToggleWishlist?: (serviceId: string) => void;
  isInWishlist?: boolean;
  onAddedToCart?: (newCount: number) => void;
}

export default function ServiceCard({
  service,
  onToggleWishlist,
  isInWishlist = false,
  onAddedToCart,
}: ServiceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { isLoggedIn, redirectToLogin } = useAuth();
  const images = Array.isArray(service.images)
    ? service.images
    : service.images
      ? JSON.parse(service.images as string)
      : [];
  const primaryImage = images[0] || 'https://picsum.photos/seed/service-card-fallback/400/300';

  const formatPrice = () => {
    if (service.price_min && service.price_max) {
      if (service.price_min === service.price_max) {
        return `₹${service.price_min}`;
      }
      return `₹${service.price_min} - ₹${service.price_max}`;
    }
    if (service.price_min) {
      return `From ₹${service.price_min}`;
    }
    return 'Price on request';
  };

  const formatDuration = () => {
    if (!service.duration_minutes) return '';
    const hours = Math.floor(service.duration_minutes / 60);
    const minutes = service.duration_minutes % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      redirectToLogin();
      return;
    }

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if item already exists
    const existingItemIndex = existingCart.findIndex((item: any) => item.service_id === service.id);

    if (existingItemIndex > -1) {
      // Increase quantity
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      const firstImage = Array.isArray(service.images)
        ? service.images[0]
        : (() => {
            try {
              const parsed = JSON.parse(service.images as unknown as string);
              return Array.isArray(parsed) ? parsed[0] : (service.images as unknown as string);
            } catch {
              return service.images as unknown as string;
            }
          })();
      const cartItem = {
        id: Date.now(),
        service_id: service.id,
        title: service.title,
        price_min: service.price_min,
        price_max: service.price_max,
        price_type: service.price_type,
        images: firstImage,
        provider_name: service.provider_name,
        quantity: 1,
      };
      existingCart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));

    const newCount = existingCart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    onAddedToCart?.(newCount);

    // Show feedback
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="relative">
          <Link href={`/services/${service.id}`} className="block">
            <Image
              src={
                imageError ? 'https://picsum.photos/seed/service-card-error/400/300' : primaryImage
              }
              alt={service.title}
              width={800}
              height={600}
              loader={
                isSupabaseUrl(imageError ? undefined : primaryImage)
                  ? supabaseImageLoader
                  : undefined
              }
              onError={() => setImageError(true)}
              className="w-full h-40 object-cover"
            />
          </Link>
          <button
            onClick={() => onToggleWishlist?.(service.id)}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
            <Link href={`/services/${service.id}`} className="hover:underline">
              {service.title}
            </Link>
          </h3>

          {service.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{service.description}</p>
          )}

          {service.provider_name && (
            <div className="flex items-center gap-2 mb-3">
              <Image
                src={service.provider_avatar || 'https://picsum.photos/seed/provider-avatar/40/40'}
                alt={service.provider_name || 'Provider avatar'}
                width={24}
                height={24}
                loader={
                  isSupabaseUrl(service.provider_avatar || '') ? supabaseImageLoader : undefined
                }
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs text-gray-600">by {service.provider_name}</span>
            </div>
          )}

          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900">
              {service.rating_average.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">({service.rating_count})</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-gray-500">
            {service.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-blue-600">
              {formatPrice()}
              {service.price_type === 'hourly' && <span className="text-xs font-normal">/hr</span>}
            </div>
            <button
              onClick={handleAddToCart}
              className={`px-4 py-2.5 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                isAddedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
              }`}
            >
              {isAddedToCart ? '✓ Added' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={service}
      />
    </>
  );
}
