import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-[#D0DDD0] dark:border-[#2D3B2D] bg-[#FAFAF7]/50 dark:bg-[#161D16]/50">
      <div className="w-14 h-14 rounded-2xl bg-[#E6EDE5] dark:bg-[#202C20] flex items-center justify-center text-[#627F5C] dark:text-[#A8C5A0] mb-3.5 shadow-xs">
        {icon}
      </div>
      <h3 className="text-base font-heading font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4 leading-relaxed">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;

