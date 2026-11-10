import { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className = '' }: TabsProps) => {
  return (
    <div className={`flex gap-1.5 p-1.5 bg-[#E6EDE5]/60 dark:bg-[#1A231A] rounded-2xl overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-[#253023] text-[#334230] dark:text-[#E6EDE5] shadow-xs'
                : 'text-[#627F5C] dark:text-[#93AC91] hover:text-[#334230] dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-[#7C9A76] text-white'
                    : 'bg-[#D0DDD0] dark:bg-[#334230] text-[#334230] dark:text-[#D0DDD0]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;

