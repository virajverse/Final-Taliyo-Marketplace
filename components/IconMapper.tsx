'use client';

import React from 'react';
import {
  HomeIcon,
  CategoryIcon,
  CartIcon,
  ProfileIcon,
  PackageIcon,
  MoneyIcon,
  StarIcon,
  ChatIcon,
  SearchIcon,
  WebIcon,
  MobileIcon,
  DesignIcon,
  BeautyIcon,
  MusicIcon,
  PhotographyIcon,
  MarketingIcon,
  ConsultingIcon
} from './CustomIcons';
import AnimatedIcon from './AnimatedIcon';

interface IconMapperProps {
  iconName: string;
  size?: number;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

const IconMapper: React.FC<IconMapperProps> = ({ 
  iconName, 
  size = 24, 
  className = '', 
  animated = true,
  onClick 
}) => {
  const getIconComponent = (name: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ size?: number; className?: string }> } = {
      // Navigation icons
      'home': HomeIcon,
      'category': CategoryIcon,
      'cart': CartIcon,
      'profile': ProfileIcon,
      
      // Service category icons
      'web': WebIcon,
      'mobile': MobileIcon,
      'design': DesignIcon,
      'beauty': BeautyIcon,
      'music': MusicIcon,
      'photography': PhotographyIcon,
      'marketing': MarketingIcon,
      'consulting': ConsultingIcon,
      
      // General icons
      'package': PackageIcon,
      'money': MoneyIcon,
      'star': StarIcon,
      'chat': ChatIcon,
      'search': SearchIcon,
      
      // Default fallback
      'default': PackageIcon
    };
    
    return iconMap[name] || iconMap['default'];
  };

  const IconComponent = getIconComponent(iconName);

  if (animated) {
    return (
      <AnimatedIcon 
        size={size} 
        className={className}
        onClick={onClick}
        hoverScale={1.1}
        clickScale={0.95}
      >
        <IconComponent size={size} />
      </AnimatedIcon>
    );
  }

  return <IconComponent size={size} className={className} />;
};

// Helper function to get icon from emoji mapping
export const getIconFromEmoji = (emoji: string): string => {
  const emojiToIconMap: { [key: string]: string } = {
    '🏠': 'home',
    '📂': 'category', 
    '🛒': 'cart',
    '👤': 'profile',
    '📦': 'package',
    '💰': 'money',
    '⭐': 'star',
    '💬': 'chat',
    '🔍': 'search',
    '💻': 'web',
    '📱': 'mobile',
    '🎨': 'design',
    '💄': 'beauty',
    '🎵': 'music',
    '📸': 'photography',
    '📈': 'marketing',
    '💼': 'consulting'
  };
  
  return emojiToIconMap[emoji] || 'default';
};

export default IconMapper;