'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Bell, ArrowLeft, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'booking' | 'reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your home cleaning service has been confirmed for tomorrow at 10:00 AM.',
        time: '2 hours ago',
        read: false
      },
      {
        id: '2',
        type: 'reminder',
        title: 'Service Reminder',
        message: 'Your AC maintenance is scheduled for today at 2:00 PM.',
        time: '4 hours ago',
        read: false
      },
      {
        id: '3',
        type: 'promotion',
        title: 'Special Offer',
        message: 'Get 20% off on your next plumbing service. Use code SAVE20.',
        time: '1 day ago',
        read: true
      },
      {
        id: '4',
        type: 'system',
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated.',
        time: '2 days ago',
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'promotion':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                  notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${
                        notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    
                    <p className={`text-sm mt-1 ${
                      notification.read ? 'text-gray-600' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Notifications
            </h3>
            <p className="text-gray-600">
              You're all caught up! We'll notify you when something important happens.
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}