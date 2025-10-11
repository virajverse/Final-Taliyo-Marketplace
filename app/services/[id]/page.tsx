'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Star, MapPin, Clock, ArrowLeft, MessageCircle, ShoppingCart } from 'lucide-react';
import BookingModal from '@/components/BookingModal';

interface Service {
  id: string;
  title: string;
  description?: string;
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
  provider_bio?: string;
  provider_phone?: string;
  provider_verified: boolean;
  duration_minutes?: number;
  is_active: boolean;
  is_featured: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
}

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  useEffect(() => {
    fetchService();
  }, [params.id]);

  const fetchService = async () => {
    try {
      // Import API client dynamically
      const { apiService } = await import('@/lib/api');
      const serviceData = await apiService.getService(params.id as string);
      setService(serviceData);
      
      // Track service view
      await apiService.trackEvent({
        service_id: params.id as string,
        event_type: 'view'
      });
    } catch (error) {
      console.error('Failed to fetch service:', error);
      // Fallback to mock data if API fails
      const mockService: Service = {
        id: params.id as string,
        title: 'Professional Web Development',
        description: 'Full-stack web development services with modern technologies. We build responsive, fast, and SEO-friendly websites tailored to your business needs.',
        price_min: 5000,
        price_max: 15000,
        price_type: 'fixed',
        location: 'Delhi NCR',
        is_remote: true,
        images: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        ],
        rating_average: 4.8,
        rating_count: 124,
        provider_name: 'Tech Solutions',
        provider_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        provider_bio: 'Professional web development team with 5+ years of experience',
        provider_phone: '+917042523611',
        provider_verified: true,
        duration_minutes: 2880,
        is_active: true,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setService(mockService);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = () => {
    if (!service) return '';
    if (service.price_min && service.price_max) {
      if (service.price_min === service.price_max) {
        return `₹${service.price_min.toLocaleString()}`;
      }
      return `₹${service.price_min.toLocaleString()} - ₹${service.price_max.toLocaleString()}`;
    }
    if (service.price_min) {
      return `From ₹${service.price_min.toLocaleString()}`;
    }
    return 'Price on request';
  };

  const handleBookNow = () => {
    setIsBookingModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!service) return;
    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const idx = existingCart.findIndex((item: any) => item.service_id === service.id);
      if (idx > -1) {
        existingCart[idx].quantity += 1;
      } else {
        const firstImage = Array.isArray(service.images) ? service.images[0] : service.images;
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
      localStorage.setItem('cart', JSON.stringify(existingCart));
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch {}
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-4 pb-20 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-8 pb-20 px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Service not found</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 font-medium"
          >
            Go back
          </button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const images = Array.isArray(service.images) ? service.images : (service.images ? JSON.parse(service.images as string) : []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-32">
        {/* Back Button */}
        <div className="px-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Image Gallery */}
        <div className="mb-6">
          <div className="relative h-64 bg-gray-200">
            <img
              src={images[selectedImage] || images[0]}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 px-4 mt-2 overflow-x-auto">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`${service.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Service Info */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900">{service.rating_average}</span>
                <span className="text-sm text-gray-600">({service.rating_count} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              {(service.location || service.is_remote) && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{service.is_remote ? 'Remote' : service.location}</span>
                </div>
              )}
              {service.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(service.duration_minutes / 60)}h</span>
                </div>
              )}
            </div>

            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatPrice()}
              {service.price_type === 'hourly' && <span className="text-lg font-normal">/hr</span>}
            </div>

            {service.description && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Provider Info */}
        {service.provider_name && (
          <div className="px-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Service Provider</h3>
              
              <div className="flex items-start gap-4">
                <img
                  src={service.provider_avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop'}
                  alt={service.provider_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{service.provider_name}</h4>
                  {service.provider_bio && (
                    <p className="text-sm text-gray-600 mt-1">{service.provider_bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Removed Contact Taliyo Team section as requested */}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-3xl mx-auto px-2 flex gap-3">
          <button
            onClick={handleAddToCart}
            className={`flex-1 px-6 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${isAddedToCart ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'}`}
          >
            <ShoppingCart className="w-5 h-5" />
            {isAddedToCart ? '✓ Added' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBookNow}
            className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Book Now
          </button>
        </div>
      </div>

      <BottomNavigation />
      
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={service!}
      />
    </div>
  );
}
