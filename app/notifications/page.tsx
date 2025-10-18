'use client';

import { useState, useEffect } from 'react';

import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/lib/supabaseClient';
import { Bell, ArrowLeft, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'booking' | 'reminder' | 'promotion' | 'system' | string;
  title: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) { setNotifications([]); return }
      const res = await fetch('/api/notifications?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('failed')
      const json = await res.json()
      const rows: Notification[] = (json.notifications || []).map((n: any) => ({
        id: n.id,
        type: n.type || 'system',
        title: n.title || 'Notification',
        message: n.message || '',
        is_read: n.is_read,
        created_at: n.created_at
      }))
      setNotifications(rows)
    } catch {
      setNotifications([])
    }
  }

  // Initial load + polling fallback
  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 60000)
    return () => clearInterval(id)
  }, [])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev: Notification[]) =>
      prev.map((notification: Notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    );
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return
        await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ids: [id] })
        })
      } catch {}
    })()
  };

  const markAllAsRead = () => {
    const ids = notifications.map((n) => n.id)
    setNotifications((prev: Notification[]) =>
      prev.map((notification: Notification) => ({ ...notification, is_read: true }))
    );
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token || ids.length === 0) return
        await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ids })
        })
      } catch {}
    })()
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

  const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
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
              className="w-full sm:w-auto text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                  notification.is_read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${
                        notification.is_read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                    
                    <p className={`text-sm mt-1 ${
                      notification.is_read ? 'text-gray-600' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    
                    {!notification.is_read && (
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