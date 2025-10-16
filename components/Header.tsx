'use client';

import { Search, ShoppingCart, Menu, X, Home, Grid3X3, Heart, Clock, User, HelpCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Grid3X3, label: 'Categories', href: '/categories' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: Clock, label: 'Orders', href: '/orders' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div
      className="sticky top-0 bg-white shadow-sm z-40 border-b border-gray-200"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Taliyo
            </h1>
          </Link>
          
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Link href="/cart" className="relative">
            <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={closeMenu}
          ></div>
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Taliyo Menu
              </h2>
              <button 
                onClick={closeMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 flex-1 overflow-y-auto">
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <item.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-blue-600">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Contact Section */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Contact our support team for assistance
                </p>
                <button
                  onClick={() => {
                    const message = `Hi! I need help with Taliyo services.`;
                    const phoneNumber = '+917042523611';
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                    closeMenu();
                  }}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp Support
                </button>
              </div>

              {/* App Info */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Taliyo Marketplace</p>
                <p>Version 1.0.0</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
