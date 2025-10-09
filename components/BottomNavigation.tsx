'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderOpen, ShoppingCart, User } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
    { path: '/categories', icon: FolderOpen, label: 'Category', emoji: '📂' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', emoji: '🛒' },
    { path: '/profile', icon: User, label: 'Profile', emoji: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <div className="text-lg mb-1">{item.emoji}</div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
