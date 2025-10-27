'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CategoryIcon, CartIcon, ProfileIcon } from './CustomIcons';
import AnimatedIcon from './AnimatedIcon';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/categories', icon: CategoryIcon, label: 'Category' },
    { path: '/cart', icon: CartIcon, label: 'Cart' },
    { path: '/profile', icon: ProfileIcon, label: 'Profile' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <div className="mb-1">
                <AnimatedIcon size={20} hoverScale={1.2} clickScale={0.9}>
                  <IconComponent size={20} />
                </AnimatedIcon>
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
