import { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckSquare,
  Users,
  Volume2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { NotificationPreference } from '../../types/database';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Toggle from '../ui/Toggle';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import { usePushSubscription } from '../../hooks/usePushSubscription';

interface NotificationSettingsProps {
  preferences: NotificationPreference | null;
  onUpdatePreferences: (updates: Partial<NotificationPreference>) => Promise<unknown>;
}

export const NotificationSettings = ({
  preferences,
  onUpdatePreferences,
}: NotificationSettingsProps) => {
  const {
    isSupported,
    permission,
    isSubscribed,
    devices,
    loading: pushLoading,
    requestPermissionAndSubscribe,
    unsubscribeCurrentDevice,
    removeDevice,
  } = usePushSubscription();

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const handleToggle = async (key: keyof NotificationPreference, value: boolean | number | string) => {
    setSaving(true);
    try {
      await onUpdatePreferences({ [key]: value });
      setSuccessMessage('Pengaturan berhasil disimpan');
      setTimeout(() => setSuccessMessage(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribeClick = async () => {
    const res = await requestPermissionAndSubscribe();
    if (res.success) {
      setSuccessMessage('Notifikasi browser berhasil diaktifkan!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else if (res.error) {
      // Jika izin ditolak, buka panduan
      setIsHelpModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Push Notification Permission Card */}
      <Card padding="lg" className="border-2 border-[#7C9A76]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6EDE5] dark:bg-[#202C20] flex items-center justify-center text-[#4D6449] dark:text-[#A8C5A0] shrink-0 mt-0.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100">
                Web Push & Notifikasi HP
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-md leading-relaxed">
                Terima pengingat jadwal kuliah dan tugas tepat waktu di HP Anda bahkan saat aplikasi sedang ditutup (PWA Background Push).
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {!isSupported ? (
              <span className="text-xs text-gray-400">Browser tidak mendukung Push API</span>
            ) : permission === 'denied' ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
                  title="Klik untuk melihat cara mengizinkan notifikasi di browser"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span className="font-medium">Izin Ditolak Browser</span>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="text-xs"
                >
                  Cara Aktifkan
                </Button>
              </div>
            ) : isSubscribed ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> Aktif di Perangkat Ini
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unsubscribeCurrentDevice}
                  loading={pushLoading}
                >
                  Matikan
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSubscribeClick}
                loading={pushLoading}
                icon={<Bell className="w-4 h-4" />}
              >
                Aktifkan Notifikasi HP
              </Button>
            )}
          </div>
        </div>

        {/* Petunjuk Interaktif jika Izin Sedang Ditolak oleh Browser */}
        {permission === 'denied' && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Mengapa Izin Ditolak dan Bagaimana Mengaktifkannya?</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
              Sesuai standar keamanan resmi semua browser (Chrome, Edge, Safari), sebuah situs web <strong>tidak dapat memunculkan kotak dialog izin lagi secara paksa</strong> jika sebelumnya pernah ditolak atau diblokir.
            </p>
            <div className="p-3 bg-white dark:bg-[#1A221A] rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-1.5 text-[11px] text-gray-700 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                👉 Cara Buka Blokir Izin (Cukup 2 Langkah):
              </p>
              <p>
                1. Klik ikon <strong>Gembok 🔒 atau Setelan Situs</strong> di bilah alamat URL (di bagian paling atas browser).
              </p>
              <p>
                2. Ubah izin <strong>Notifikasi</strong> menjadi <strong>Izinkan (Allow)</strong>, lalu muat ulang halaman.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsHelpModalOpen(true)}
                icon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Lihat Panduan Lengkap untuk HP & Laptop
              </Button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 2. Pengingat Jadwal Kuliah */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <Calendar className="w-4 h-4 text-[#7C9A76]" />
          <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
            Pengingat Jadwal Kuliah
          </h3>
        </div>

        <Toggle
          label="Aktifkan Pengingat Kuliah"
          description="Kirim notifikasi otomatis sebelum kelas dimulai"
          enabled={preferences?.class_reminder_enabled ?? true}
          onChange={(val) => handleToggle('class_reminder_enabled', val)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Select
            label="Pengingat Pertama"
            value={String(preferences?.class_first_reminder_minutes ?? 120)}
            onChange={(e) => handleToggle('class_first_reminder_minutes', parseInt(e.target.value))}
            options={[
              { value: '15', label: '15 menit sebelum kelas' },
              { value: '30', label: '30 menit sebelum kelas' },
              { value: '60', label: '1 jam sebelum kelas' },
              { value: '120', label: '2 jam sebelum kelas (Rekomendasi)' },
            ]}
          />

          <Select
            label="Pengingat Kedua"
            value={String(preferences?.class_second_reminder_minutes ?? 5)}
            onChange={(e) => handleToggle('class_second_reminder_minutes', parseInt(e.target.value))}
            options={[
              { value: '5', label: '5 menit sebelum kelas (Siap-siap)' },
              { value: '10', label: '10 menit sebelum kelas' },
              { value: '15', label: '15 menit sebelum kelas' },
            ]}
          />
        </div>
      </Card>

      {/* 3. Pengingat Tugas & Deadline */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <CheckSquare className="w-4 h-4 text-[#7C9A76]" />
          <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
            Pengingat Tugas Kuliah
          </h3>
        </div>

        <Toggle
          label="Pengingat Deadline Tugas"
          description="Kirim notifikasi otomatis sebelum batas waktu tugas berakhir"
          enabled={preferences?.task_reminder_enabled ?? true}
          onChange={(val) => handleToggle('task_reminder_enabled', val)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Select
            label="Peringatan Awal Deadline"
            value={String(preferences?.task_first_reminder_minutes ?? 1440)}
            onChange={(e) => handleToggle('task_first_reminder_minutes', parseInt(e.target.value))}
            options={[
              { value: '1440', label: 'H-1 (24 jam sebelum deadline)' },
              { value: '2880', label: 'H-2 (48 jam sebelum deadline)' },
              { value: '4320', label: 'H-3 (3 hari sebelum deadline)' },
            ]}
          />

          <Select
            label="Peringatan Darurat Deadline"
            value={String(preferences?.task_second_reminder_minutes ?? 120)}
            onChange={(e) => handleToggle('task_second_reminder_minutes', parseInt(e.target.value))}
            options={[
              { value: '60', label: '1 jam sebelum deadline' },
              { value: '120', label: '2 jam sebelum deadline' },
              { value: '180', label: '3 jam sebelum deadline' },
            ]}
          />
        </div>
      </Card>

      {/* 4. Pengingat Rotasi Kelompok */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <Users className="w-4 h-4 text-[#7C9A76]" />
          <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
            Pengingat Rotasi & Kelompok Belajar
          </h3>
        </div>

        <Toggle
          label="Pengingat Giliran Kelompok"
          description="Beri tahu saat giliran presentasi atau tugas kelompok Anda tiba"
          enabled={preferences?.group_reminder_enabled ?? true}
          onChange={(val) => handleToggle('group_reminder_enabled', val)}
        />

        <div className="space-y-3 pt-2">
          <Toggle
            label="Notifikasi H-1 Giliran Kelompok"
            description="Kirim pengingat persiapan 1 hari sebelum jadwal rotasi"
            enabled={preferences?.group_day_before ?? true}
            onChange={(val) => handleToggle('group_day_before', val)}
          />

          <Toggle
            label="Notifikasi Hari-H Giliran Kelompok"
            description="Kirim pengingat pagi hari pada hari giliran kelompok Anda"
            enabled={preferences?.group_day_of ?? true}
            onChange={(val) => handleToggle('group_day_of', val)}
          />
        </div>
      </Card>

      {/* 5. Suara & Nada Pengingat */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <Volume2 className="w-4 h-4 text-[#7C9A76]" />
          <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
            Suara & Zona Waktu
          </h3>
        </div>

        <Toggle
          label="Efek Suara Notifikasi"
          description="Bunyikan nada saat notifikasi muncul di browser jika didukung"
          enabled={preferences?.sound_enabled ?? true}
          onChange={(val) => handleToggle('sound_enabled', val)}
        />

        <Select
          label="Zona Waktu Perhitungan Reminder"
          value={preferences?.timezone || 'Asia/Jakarta'}
          onChange={(e) => handleToggle('timezone', e.target.value)}
          options={[
            { value: 'Asia/Jakarta', label: 'WIB — Asia/Jakarta (Indonesia Bagian Barat)' },
            { value: 'Asia/Makassar', label: 'WITA — Asia/Makassar (Indonesia Bagian Tengah)' },
            { value: 'Asia/Jayapura', label: 'WIT — Asia/Jayapura (Indonesia Bagian Timur)' },
          ]}
        />
      </Card>

      {/* 6. Perangkat Terdaftar */}
      <Card padding="md">
        <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100 mb-2">
          Daftar Perangkat Penerima Web Push ({devices.length})
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Perangkat berikut akan menerima notifikasi otomatis ketika jadwal tiba:
        </p>

        {devices.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Belum ada perangkat terdaftar.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {devices.map((d) => (
              <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{d.device_name}</p>
                  <p className="text-[10px] text-gray-400">
                    Terdaftar sejak {new Date(d.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={() => removeDevice(d.id)}
                  className="text-rose-500 hover:text-rose-700 text-xs font-medium cursor-pointer"
                >
                  Hapus Perangkat
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Panduan Buka Blokir Izin Browser */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Panduan Mengaktifkan Izin Notifikasi"
        size="md"
      >
        <div className="space-y-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p>
              Karena izin notifikasi sebelumnya pernah ditolak atau diblokir di browser Anda, browser <strong>mengunci tombol izin otomatis</strong> demi alasan keamanan. Anda hanya perlu mengubah setelan izin situs di browser Anda:
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#181F18] space-y-1.5">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                💻 Di Google Chrome / Microsoft Edge (Laptop / PC):
              </h4>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Lihat bagian paling atas browser pada bilah alamat URL (di sebelah kiri <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">http://...</code>).</li>
                <li>Klik ikon <strong>Gembok 🔒 atau Ikon Setelan / Tune</strong>.</li>
                <li>Pada baris <strong>Notifikasi (Notifications)</strong>, ubah dari <em>Blokir</em> ke <strong>Izinkan (Allow)</strong>.</li>
                <li>Klik tombol <strong>Muat Ulang</strong> atau tekan <code>F5</code>.</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#181F18] space-y-1.5">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                📱 Di HP Android (Google Chrome):
              </h4>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Tap ikon <strong>Gembok 🔒 atau Setelan Situs</strong> di samping kiri URL.</li>
                <li>Pilih <strong>Izin (Permissions)</strong> ➔ tap <strong>Notifikasi</strong>.</li>
                <li>Aktifkan saklar menjadi <strong>Izinkan (Allow)</strong>.</li>
                <li>Kembali ke web dan refresh halaman.</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#181F18] space-y-1.5">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                🍎 Di iPhone / iPad (Safari):
              </h4>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Pastikan aplikasi telah ditambahkan ke Layar Utama (*Add to Home Screen*).</li>
                <li>Buka menu <strong>Pengaturan HP (Settings)</strong> ➔ pilih <strong>Notifikasi</strong>.</li>
                <li>Cari aplikasi <strong>SI-Acad</strong> atau <strong>Safari</strong> ➔ Aktifkan <strong>Izinkan Pemberitahuan</strong>.</li>
              </ol>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              onClick={() => setIsHelpModalOpen(false)}
            >
              Tutup
            </Button>
            <Button
              onClick={() => {
                setIsHelpModalOpen(false);
                window.location.reload();
              }}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Muat Ulang Halaman
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationSettings;
