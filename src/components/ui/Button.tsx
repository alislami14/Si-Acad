import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variants = {
      primary: 'bg-[#7C9A76] hover:bg-[#688562] text-white focus:ring-[#7C9A76] shadow-sm',
      secondary: 'bg-[#E6EDE5] hover:bg-[#D0DDD0] text-[#334230] dark:bg-[#253023] dark:hover:bg-[#334230] dark:text-[#D0DDD0] focus:ring-[#7C9A76]',
      outline: 'border border-[#B2C5B0] hover:bg-[#F4F7F4] text-[#4D6449] dark:border-[#4D6449] dark:hover:bg-[#1E251D] dark:text-[#B2C5B0] focus:ring-[#7C9A76]',
      ghost: 'text-[#4D6449] hover:bg-[#F4F7F4] dark:text-[#B2C5B0] dark:hover:bg-[#1E251D] focus:ring-[#7C9A76]',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

