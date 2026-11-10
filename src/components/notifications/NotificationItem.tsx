import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Users,
  Calendar,
  Bell,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { NotificationLog } from '../../types/database';
import { formatRelative } from '../../lib/dateUtils';

interface NotificationItemProps {
  log: NotificationLog;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem = ({ log, onMarkAsRead, onDelete }: NotificationItemProps) => {
  const navigate = useNavigate();
  const isUnread = !log.read_at;

  const handleClick = () => {
    if (isUnread) onMarkAsRead(log.id);
    if (log.action_url) {
      navigate(log.action_url);
    }
  };

  const getIcon = () => {
    if (log.notification_type.startsWith('task')) {
      return <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (log.notification_type.startsWith('group')) {
      return <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    if (log.notification_type.startsWith('class')) {
      return <Calendar className="w-4 h-4 text-[#7C9A76]" />;
    }
    return <Bell className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer border ${
        isUnread
          ? 'bg-[#F4F7F4]/70 dark:bg-[#1C251C] border-[#B2C5B0] dark:border-[#3E503A] shadow-2xs'
          : 'bg-white dark:bg-[#1E251E] border-gray-100 dark:border-gray-800 hover:border-gray-200'
      }`}
    >
      {/* Icon bubble */}
      <div className="w-9 h-9 rounded-xl bg-[#E6EDE5] dark:bg-[#253023] flex items-center justify-center shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={`text-xs sm:text-sm font-semibold truncate ${
              isUnread ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {log.title}
          </h4>
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Belum dibaca" />
          )}
        </div>

        {log.body && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
            {log.body}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{formatRelative(log.sent_at)}</span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(log.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shrink-0 cursor-pointer"
        title="Hapus notifikasi"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default NotificationItem;

