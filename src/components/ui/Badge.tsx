import { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'sage' | 'outline';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'default', size = 'sm', children, className = '' }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
    sage: 'bg-[#E6EDE5] text-[#3E503A] border border-[#B2C5B0] dark:bg-[#1E271D] dark:text-[#B2C5B0] dark:border-[#3E503A]',
    outline: 'border border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

