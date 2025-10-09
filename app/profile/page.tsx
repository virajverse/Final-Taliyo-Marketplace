'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  Clock, 
  Star,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Camera,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Toggle this for demo

  const stats = [
    { label: 'Bookings', value: '12', icon: Clock, color: 'text-blue-500' },
    { label: 'Favorites', value: '8', icon: Heart, color: 'text-red-500' },
    { label: 'Reviews', value: '5', icon: Star, color: 'text-yellow-500' },
  ];

  const menuItems = [
    { 
      icon: Heart, 
      label: 'My Favorites', 
      href: '/wishlist',
      count: '8', 
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    { 
      icon: Clock, 
      label: 'Booking History', 
      href: '/orders',
      count: '12', 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: Star, 
      label: 'My Reviews', 
      href: '/reviews',
      count: '5', 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      href: '/notifications',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/settings',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50'
    },
    { 
      icon: Shield, 
      label: 'Privacy & Security', 
      href: '/privacy',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      href: '/help',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-4 pb-20 px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile</h2>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          {/* Guest Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <User className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">Welcome to Taliyo!</h3>
              <p className="text-gray-600 mb-6">Sign in to book services, save favorites, and track your orders</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setIsLoggedIn(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200"
                >
                  Sign In
                </button>
                <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  Create Account
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions for Guests */}
          <div className="space-y-3">
            <Link
              href="/categories"
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-medium text-gray-900">Browse Services</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              href="/help"
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-green-500" />
                </div>
                <span className="font-medium text-gray-900">Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
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
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Rahul Sharma</h1>
              <p className="text-gray-600 text-sm">rahul.sharma@gmail.com</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Delhi NCR, India</span>
              </div>
            </div>

            <button className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="w-full bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.count && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => setIsLoggedIn(false)}
          className="w-full bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
}
