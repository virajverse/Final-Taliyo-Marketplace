'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Star, ArrowLeft, Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
  serviceProvider: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Load user reviews from localStorage or API
    const savedUser = localStorage.getItem('taliyo_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // In production, fetch reviews from API
      // For now, show empty state for new users
      setReviews([]);
    }
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/profile"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-gray-600">Your service reviews and ratings</p>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {review.serviceName}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {review.serviceProvider}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {review.rating}/5
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Book a service and leave your first review!
            </p>
            <Link
              href="/categories"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Browse Services
            </Link>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}