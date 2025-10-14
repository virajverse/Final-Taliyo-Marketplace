'use client';

import React from 'react';
import { motion } from 'motion/react';
import ClickSpark from './ClickSpark';

interface AnimatedIconProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: number;
  hoverScale?: number;
  clickScale?: number;
  sparkColor?: string;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  children,
  onClick,
  className = '',
  size = 24,
  hoverScale = 1.1,
  clickScale = 0.95,
  sparkColor = '#000'
}) => {
  return (
    <ClickSpark sparkColor={sparkColor} sparkCount={6} sparkRadius={12} duration={300}>
      <motion.div
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
        style={{ width: size, height: size }}
        whileHover={{ 
          scale: hoverScale,
          transition: { duration: 0.2, ease: 'easeOut' }
        }}
        whileTap={{ 
          scale: clickScale,
          transition: { duration: 0.1, ease: 'easeInOut' }
        }}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {children}
      </motion.div>
    </ClickSpark>
  );
};

export default AnimatedIcon;