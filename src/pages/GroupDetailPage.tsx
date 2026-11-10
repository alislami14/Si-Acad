import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  LayoutDashboard,
  Share2,
  Trash2,
  LogOut,
  Shield,
  Crown,
  UserX,
  User,
} from 'lucide-react';
import useGroups from '../hooks/useGroups';
import useRotation from '../hooks/useRotation';
import GroupDashboard from '../components/groups/GroupDashboard';
import RotationSchedule from '../components/groups/RotationSchedule';
import InviteModal from '../components/groups/InviteModal';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export const GroupDetailPage = () => {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, deleteGroup, leaveGroup, regenerateCode } = useGroups();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'rotation' | 'members'>('dashboard');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Get current group
  const group = groups.find((g) => g.id === groupId);

  // Rotation data
  const {
    slots,
    events,
    courses,
    loading: rotLoading,
    currentSlot,
    nextSlot,
    generateAutoRotation,
    saveSlot,
    deleteSlot,
    saveEvent,
    deleteEvent,
  } = useRotation(groupId || '');

  if (!group && !rotLoading) {
    return (
      <div className="text-center py-16 space-y-3">
        <h2 className="text-lg font-bold">Kelompok tidak ditemukan</h2>
        <p className="text-xs text-gray-500">Kelompok ini mungkin telah dihapus atau Anda bukan anggotanya.</p>
        <Button onClick={() => navigate('/groups')}>Kembali ke Daftar Kelompok</Button>
      </div>
    );
  }

  if (!group) {
    return <LoadingSpinner text="Memuat detail kelompok..." />;
  }

  const members = group.members || [];
  const myMember = members.find((m) => m.user_id === user?.id);
  const isOwner = group.owner_id === user?.id || myMember?.role === 'owner';
  const isAdmin = isOwner || myMember?.role === 'admin';

  // Handle kick member
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (window.confirm(`Keluarkan ${memberName} dari kelompok?`)) {
      await supabase.from('study_group_members').delete().eq('id', memberId);
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dasbor Giliran', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'rotation', label: 'Jadwal Rotasi', icon: <Calendar className="w-4 h-4" />, count: slots.length },
    { id: 'members', label: 'Daftar Anggota', icon: <Users className="w-4 h-4" />, count: members.length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/groups"
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
                {group.name}
              </h1>
              {isOwner && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Ketua
                </span>
              )}
            </div>
            <p className="text-xs text-[#627F5C] dark:text-[#93AC91] mt-0.5">
              Kode Undangan: <span className="font-mono font-bold select-all">{group.invite_code}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            icon={<Share2 className="w-3.5 h-3.5" />}
          >
            Undang Anggota
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t as typeof activeTab)} />

      {/* Tab Panels */}
      {activeTab === 'dashboard' && (
        <GroupDashboard
          group={group}
          slots={slots}
          events={events}
          courses={courses}
          currentSlot={currentSlot}
          nextSlot={nextSlot}
        />
      )}

      {activeTab === 'rotation' && (
        <RotationSchedule
          slots={slots}
          events={events}
          courses={courses}
          onGenerateAuto={generateAutoRotation}
          onSaveSlot={saveSlot}
          onDeleteSlot={deleteSlot}
          onSaveEvent={saveEvent}
          onDeleteEvent={deleteEvent}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === 'members' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
                Semua Anggota Kelompok
              </h3>
              <p className="text-xs text-gray-500">
                Kelola hak akses dan peran anggota dalam kelompok perkuliahan ini
              </p>
            </div>
            <Button size="sm" onClick={() => setIsInviteOpen(true)} icon={<Share2 className="w-3.5 h-3.5" />}>
              Undang Teman
            </Button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6EDE5] dark:bg-[#202C20] flex items-center justify-center text-[#4D6449] dark:text-[#A8C5A0] font-bold">
                    {m.profile?.full_name ? m.profile.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {m.profile?.full_name || 'Mahasiswa'}
                      </p>
                      {m.user_id === user?.id && (
                        <span className="text-[10px] text-gray-400">(Anda)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {m.profile?.major || m.profile?.university || 'Mahasiswa'} &bull; Bergabung sejak{' '}
                      {new Date(m.joined_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {m.role === 'owner' ? (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Ketua Kelompok
                    </span>
                  ) : m.role === 'admin' ? (
                    <span className="text-xs font-bold text-[#7C9A76] bg-[#E6EDE5] dark:bg-[#202C20] px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 px-2 py-1">Anggota</span>
                  )}

                  {/* Remove button if admin/owner and not removing self */}
                  {isAdmin && m.user_id !== user?.id && m.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(m.id, m.profile?.full_name || 'anggota ini')}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Keluarkan dari kelompok"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Invite Modal */}
      <InviteModal
        group={group}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onRegenerateCode={regenerateCode}
        isOwner={isOwner}
      />
    </div>
  );
};

export default GroupDetailPage;

