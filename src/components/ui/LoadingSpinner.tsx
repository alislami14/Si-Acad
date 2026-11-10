import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner = ({ size = 'md', text, fullPage = false }: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <Loader2 className={`${sizes[size]} text-[#7C9A76] animate-spin`} />
      {text && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>;
  }

  return content;
};

export default LoadingSpinner;

