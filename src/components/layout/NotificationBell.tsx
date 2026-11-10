import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import useNotifications from '../../hooks/useNotifications';

export const NotificationBell = () => {
  const { logs } = useNotifications();
  const unreadCount = logs.filter((n) => !n.read_at).length;

  return (
    <Link
      to="/notifications"
      aria-label="Lihat notifikasi"
      className="relative p-2 rounded-xl text-[#4D6449] dark:text-[#B2C5B0] hover:bg-[#E6EDE5]/60 dark:hover:bg-[#1E271D] transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
