import { useState, useEffect } from 'react';
import { User, Bell, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useNotifications from '../hooks/useNotifications';
import NotificationSettings from '../components/notifications/NotificationSettings';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export const SettingsPage = () => {
  const { profile, updateProfile } = useAuth();
  const { preferences, updatePreferences } = useNotifications();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('notifications');

  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [university, setUniversity] = useState(profile?.university || '-');
  const [major, setMajor] = useState(profile?.major || '-');
  const [studentId, setStudentId] = useState(profile?.student_id || '-');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sinkronkan state saat profile terload
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUniversity(profile.university || '-');
      setMajor(profile.major || '-');
      setStudentId(profile.student_id || '-');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || '-',
        university: university.trim() || '-',
        major: major.trim() || '-',
        student_id: studentId.trim() || '-',
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifikasi & Pengingat', icon: <Bell className="w-4 h-4" /> },
    { id: 'profile', label: 'Profil Mahasiswa', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">
          Pengaturan Aplikasi
        </h1>
        <p className="text-xs sm:text-sm text-[#627F5C] dark:text-[#93AC91] mt-0.5">
          Atur preferensi pengingat Web Push dan biodata profil akademik
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t as typeof activeTab)} />

      {activeTab === 'notifications' && (
        <NotificationSettings
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
        />
      )}

      {activeTab === 'profile' && (
        <Card padding="lg">
          {profileSuccess && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profil berhasil diperbarui.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Nama Lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nomor Induk Mahasiswa (NIM)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Contoh: 2110511001"
              />
              <Input
                label="Program Studi / Jurusan"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Contoh: Teknik Informatika"
              />
            </div>

            <Input
              label="Perguruan Tinggi / Universitas"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Contoh: Universitas Pembangunan Nasional"
            />

            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button type="submit" loading={savingProfile} icon={<Save className="w-4 h-4" />}>
                Simpan Profil
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;

