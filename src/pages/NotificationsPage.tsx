import useNotifications from '../hooks/useNotifications';
import NotificationCenter from '../components/notifications/NotificationCenter';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export const NotificationsPage = () => {
  const {
    logs,
    loading,
    markAsRead,
    markAllAsRead,
    deleteLog,
    clearAllLogs,
  } = useNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">
          Pusat Notifikasi
        </h1>
        <p className="text-xs sm:text-sm text-[#627F5C] dark:text-[#93AC91] mt-0.5">
          Semua pengingat tugas, perkuliahan, dan agenda rotasi kelompokmu
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Memuat notifikasi..." />
      ) : (
        <NotificationCenter
          logs={logs}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteLog}
          onClearAll={clearAllLogs}
        />
      )}
    </div>
  );
};

export default NotificationsPage;

