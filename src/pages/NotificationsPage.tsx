import useNotifications from '../hooks/useNotifications';
import NotificationCenter from '../components/notifications/NotificationCenter';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageGuide from '../components/ui/PageGuide';

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

      {/* Panduan Halaman Notifikasi */}
      <PageGuide
        id="notifications"
        title="Panduan Pusat Notifikasi & Pengingat"
        description="Pantau seluruh riwayat peringatan dini agar Anda selalu siap sebelum perkuliahan dimulai atau batas tugas berakhir."
        steps={[
          {
            title: 'Pengingat Jadwal Kuliah',
            description: 'Menerima pemberitahuan sebelum kelas dimulai lengkap dengan nama dosen dan ruangan kuliah.',
          },
          {
            title: 'Peringatan Deadline Tugas',
            description: 'Mendapatkan peringatan H-1 (24 jam) dan H-2 jam sebelum batas waktu pengumpulan tugas berakhir.',
          },
          {
            title: 'Push Notification Browser',
            description: 'Aktifkan izin notifikasi pada perangkat Anda agar pengingat tetap berbunyi saat browser di latar belakang.',
          },
          {
            title: 'Kelola Riwayat Pesan',
            description: 'Klik "Tandai Semua Dibaca" atau hapus pesan notifikasi yang sudah selesai Anda tindak lanjuti.',
          },
        ]}
        tip="Anda dapat menyesuaikan preferensi waktu pengingat pada tab Pengaturan Notifikasi di dalam pusat notifikasi ini."
      />

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

