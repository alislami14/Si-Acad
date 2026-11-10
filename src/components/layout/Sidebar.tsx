import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';

export const Sidebar = () => {
  const { profile, signOut } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/schedule', label: 'Jadwal Kuliah', icon: Calendar },
    { to: '/tasks', label: 'Tugas & Catatan', icon: CheckSquare },
    { to: '/groups', label: 'Group Planner', icon: Users },
    { to: '/notifications', label: 'Notifikasi', icon: Bell },
    { to: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200/80 dark:border-gray-800/80 bg-[#FAFAF7] dark:bg-[#141814] h-screen sticky top-0 p-4 justify-between">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-3 py-2">
          <Logo variant="icon" size="md" className="w-10 h-10" />
          <div>
            <h1 className="font-heading font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">
              SI-Acad
            </h1>
            <p className="text-[11px] text-[#627F5C] dark:text-[#93AC91] font-medium">
              Academic Companion
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#7C9A76] text-white shadow-xs font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-[#E6EDE5]/50 dark:hover:bg-[#1C241C]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile & Sign out */}
      <div className="space-y-3 pt-4 border-t border-gray-200/80 dark:border-gray-800">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-9 w-9 rounded-full bg-[#E6EDE5] dark:bg-[#243024] flex items-center justify-center text-[#4D6449] dark:text-[#A8C5A0] font-bold text-sm">
            {profile?.full_name ? profile.full_name[0].toUpperCase() : 'M'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
              {profile?.full_name || 'Mahasiswa'}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {profile?.major && profile.major !== '-'
                ? profile.major
                : profile?.university && profile.university !== '-'
                ? profile.university
                : profile?.student_id && profile.student_id !== '-'
                ? `NIM: ${profile.student_id}`
                : 'SI-Acad Member'}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

