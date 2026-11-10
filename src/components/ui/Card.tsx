import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'sage';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, className = '', ...props }, ref) => {
    const base = 'rounded-2xl transition-all duration-200';
    const variants = {
      default: 'bg-white dark:bg-[#1E251E] border border-gray-200/80 dark:border-gray-800 shadow-sm',
      bordered: 'bg-white dark:bg-[#1E251E] border-2 border-[#D0DDD0] dark:border-[#3E503A]',
      elevated: 'bg-white dark:bg-[#1E251E] shadow-md shadow-[#7C9A76]/10 border border-gray-100 dark:border-gray-800',
      sage: 'bg-[#F4F7F4] dark:bg-[#192218] border border-[#D0DDD0] dark:border-[#2D3B2D]',
    };
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div ref={ref} className={`${base} ${variants[variant]} ${paddings[padding]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;

