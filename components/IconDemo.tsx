'use client';

import React from 'react';
import IconMapper from './IconMapper';
import AnimatedIcon from './AnimatedIcon';
import { 
  HomeIcon, 
  CategoryIcon, 
  CartIcon, 
  ProfileIcon, 
  PackageIcon, 
  MoneyIcon, 
  StarIcon, 
  ChatIcon,
  WebIcon,
  MobileIcon,
  DesignIcon,
  BeautyIcon,
  MusicIcon,
  PhotographyIcon,
  MarketingIcon,
  ConsultingIcon
} from './CustomIcons';

const IconDemo: React.FC = () => {
  const iconList = [
    { name: 'home', component: HomeIcon, label: 'Home' },
    { name: 'category', component: CategoryIcon, label: 'Category' },
    { name: 'cart', component: CartIcon, label: 'Cart' },
    { name: 'profile', component: ProfileIcon, label: 'Profile' },
    { name: 'package', component: PackageIcon, label: 'Package' },
    { name: 'money', component: MoneyIcon, label: 'Money' },
    { name: 'star', component: StarIcon, label: 'Star' },
    { name: 'chat', component: ChatIcon, label: 'Chat' },
    { name: 'web', component: WebIcon, label: 'Web' },
    { name: 'mobile', component: MobileIcon, label: 'Mobile' },
    { name: 'design', component: DesignIcon, label: 'Design' },
    { name: 'beauty', component: BeautyIcon, label: 'Beauty' },
    { name: 'music', component: MusicIcon, label: 'Music' },
    { name: 'photography', component: PhotographyIcon, label: 'Photography' },
    { name: 'marketing', component: MarketingIcon, label: 'Marketing' },
    { name: 'consulting', component: ConsultingIcon, label: 'Consulting' }
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Custom Icons with Animations Demo
      </h2>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        {iconList.map((icon) => (
          <div key={icon.name} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
            <div className="mb-3">
              <IconMapper 
                iconName={icon.name} 
                size={32}
                animated={true}
                onClick={() => console.log(`Clicked ${icon.label}`)}
              />
            </div>
            <span className="text-xs font-medium text-gray-700">{icon.label}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>✅ <strong>Hover Animation:</strong> Icons scale up on hover</li>
          <li>✅ <strong>Click Animation:</strong> Icons scale down on click</li>
          <li>✅ <strong>Black Spark Effect:</strong> Black sparks appear on click</li>
          <li>✅ <strong>Custom SVG Icons:</strong> Replaced all emojis with custom icons</li>
          <li>✅ <strong>Dock.tsx Style:</strong> Clean, modern icon design</li>
        </ul>
      </div>
    </div>
  );
};

export default IconDemo;