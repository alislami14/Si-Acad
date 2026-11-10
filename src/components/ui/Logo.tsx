import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'icon',
  size = 'md',
  className = '',
  alt = 'SI-Acad Logo',
}) => {
  // Ukuran standar
  const sizeMap: Record<string, string> = {
    sm: variant === 'icon' ? 'w-8 h-8' : 'h-8 w-auto',
    md: variant === 'icon' ? 'w-10 h-10' : 'h-10 w-auto',
    lg: variant === 'icon' ? 'w-14 h-14' : 'h-14 w-auto',
    xl: variant === 'icon' ? 'w-24 h-24 sm:w-28 sm:h-28' : 'h-24 sm:h-28 w-auto',
  };

  const sizeClass = typeof size === 'number' ? `w-[${size}px] h-[${size}px]` : sizeMap[size] || sizeMap.md;
  const inlineStyle = typeof size === 'number' ? { width: size, height: size } : undefined;

  const lightSrc = variant === 'icon' ? '/icons/logo-icon-light.png' : '/icons/logo-full-light.png';
  const darkSrc = variant === 'icon' ? '/icons/logo-icon-dark.png' : '/icons/logo-full-dark.png';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={inlineStyle}>
      {/* Light Mode Logo (Transparent) */}
      <img
        src={lightSrc}
        alt={alt}
        className={`${sizeClass} object-contain dark:hidden drop-shadow-2xs select-none`}
        draggable={false}
      />
      {/* Dark Mode Logo (Transparent with luminous contrast) */}
      <img
        src={darkSrc}
        alt={alt}
        className={`${sizeClass} object-contain hidden dark:block drop-shadow-sm select-none`}
        draggable={false}
      />
    </div>
  );
};

export default Logo;

