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
  const [userId, setUserId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 60000)
    return () => clearInterval(id)
  }, [])

  // Load current user id for realtime filtering
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserId(data.user?.id ?? null);
      } catch {}
    })();
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.onLine) return;
    const channel = supabase.channel('notifications_realtime');
    // Global notifications
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=is.null' }, () => { fetchNotifications() });
    // Per-user notifications
    if (userId) {
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => { fetchNotifications() })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => { fetchNotifications() });
    }
    channel.subscribe();
    return () => { supabase.removeChannel(channel) }
  }, [userId])

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <div className="pt-4 pb-20 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
              {notifications.length > 0 && (
                <p className="text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              )}
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
                className={`bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                  notification.is_read ? 'border-gray-200 dark:border-gray-800' : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${
                        notification.is_read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-gray-100 font-semibold'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                    
                    <p className={`text-sm mt-1 ${
                      notification.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
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
        ) : null}
      </div>

      <BottomNavigation />
    </div>
  );
}