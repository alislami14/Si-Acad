import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Settings,
} from 'lucide-react';

export const BottomNav = () => {
  const navItems = [
    { to: '/', label: 'Beranda', icon: LayoutDashboard },
    { to: '/schedule', label: 'Jadwal', icon: Calendar },
    { to: '/tasks', label: 'Tugas', icon: CheckSquare },
    { to: '/groups', label: 'Kelompok', icon: Users },
    { to: '/settings', label: 'Setelan', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAFAF7]/95 dark:bg-[#141814]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px] min-h-[46px] active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-[#7C9A76] dark:text-[#A8C5A0] font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

