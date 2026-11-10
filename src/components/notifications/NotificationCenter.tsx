import { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  CheckSquare,
  Users,
  Calendar,
} from 'lucide-react';
import { NotificationLog } from '../../types/database';
import NotificationItem from './NotificationItem';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

interface NotificationCenterProps {
  logs: NotificationLog[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationCenter = ({
  logs,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}: NotificationCenterProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'task' | 'group' | 'class'>('all');

  const counts = useMemo(() => {
    let unread = 0;
    let task = 0;
    let group = 0;
    let classCount = 0;

    logs.forEach((l) => {
      if (!l.read_at) unread++;
      if (l.notification_type.startsWith('task')) task++;
      if (l.notification_type.startsWith('group')) group++;
      if (l.notification_type.startsWith('class')) classCount++;
    });

    return { all: logs.length, unread, task, group, class: classCount };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (activeTab === 'unread') return !l.read_at;
      if (activeTab === 'task') return l.notification_type.startsWith('task');
      if (activeTab === 'group') return l.notification_type.startsWith('group');
      if (activeTab === 'class') return l.notification_type.startsWith('class');
      return true;
    });
  }, [logs, activeTab]);

  const tabs = [
    { id: 'all', label: 'Semua', count: counts.all },
    { id: 'unread', label: 'Belum Dibaca', count: counts.unread },
    { id: 'task', label: 'Tugas', icon: <CheckSquare className="w-3.5 h-3.5" />, count: counts.task },
    { id: 'group', label: 'Kelompok', icon: <Users className="w-3.5 h-3.5" />, count: counts.group },
    { id: 'class', label: 'Kuliah', icon: <Calendar className="w-3.5 h-3.5" />, count: counts.class },
  ];

  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          {counts.unread > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E251E] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-[#7C9A76] transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#7C9A76]" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          {logs.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Hapus seluruh riwayat notifikasi?')) {
                  onClearAll();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="Tidak Ada Notifikasi"
          description={
            logs.length === 0
              ? 'Belum ada notifikasi yang masuk. Pengingat jadwal kuliah, deadline tugas, dan giliran kelompok akan muncul di sini.'
              : 'Tidak ada notifikasi dalam kategori ini.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <NotificationItem
              key={log.id}
              log={log}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

