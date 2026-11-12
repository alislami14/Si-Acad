import { useState } from 'react';
import { Plus, Users, UserPlus } from 'lucide-react';
import { StudyGroup } from '../types/database';
import useGroups from '../hooks/useGroups';
import GroupCard from '../components/groups/GroupCard';
import GroupForm from '../components/groups/GroupForm';
import InviteModal from '../components/groups/InviteModal';
import JoinGroupModal from '../components/groups/JoinGroupModal';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageGuide from '../components/ui/PageGuide';

export const GroupsPage = () => {
  const {
    groups,
    loading,
    createGroup,
    joinGroupByCode,
    regenerateCode,
    deleteGroup,
    leaveGroup,
  } = useGroups();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectedInviteGroup, setSelectedInviteGroup] = useState<StudyGroup | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const handleCreateSubmit = async (name: string, description: string) => {
    setCreateLoading(true);
    try {
      await createGroup(name, description);
      setIsCreateOpen(false);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Yakin ingin menghapus kelompok ini beserta seluruh jadwal rotasinya?')) {
      await deleteGroup(groupId);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (window.confirm('Yakin ingin keluar dari kelompok ini?')) {
      await leaveGroup(groupId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Group Planner & Rotasi
          </h1>
          <p className="text-xs sm:text-sm text-[#627F5C] dark:text-[#93AC91] mt-0.5">
            Manajemen kelompok perkuliahan, giliran tugas, dan jadwal rotasi mingguan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsJoinOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Gabung Kelompok
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Kelompok Baru
          </Button>
        </div>
      </div>

      {/* Panduan Halaman Kelompok Belajar */}
      <PageGuide
        id="groups"
        title="Panduan Group Planner & Kelompok Belajar"
        description="Kelola kelompok belajar untuk koordinasi tugas kuliah bersama, giliran presentasi, dan jadwal rotasi makalah kelompok."
        steps={[
          {
            title: 'Bentuk Kelompok Baru',
            description: 'Klik "Kelompok Baru" untuk membuat grup belajar untuk mata kuliah tertentu dan berikan nama serta deskripsi tugas.',
          },
          {
            title: 'Undang Rekan Anggota',
            description: 'Buka kartu kelompok dan bagikan kode undangan 6 karakter atau tautan link kepada teman sekelas.',
          },
          {
            title: 'Gabung dengan Kode',
            description: 'Jika rekan Anda sudah membuat kelompok, klik "Gabung Kelompok" dan masukkan kode undangan yang mereka berikan.',
          },
          {
            title: 'Buka Detail Kelompok',
            description: 'Klik kelompok Anda untuk mengatur giliran rotasi mingguan, agenda kerja kelompok, dan catatan perlengkapan.',
          },
        ]}
        tip="Anda dapat membuat beberapa kelompok belajar untuk mata kuliah yang berbeda secara bersamaan."
      />

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Memuat kelompok belajar..." />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="Belum Tergabung dalam Kelompok"
          description="Buat kelompok perkuliahan baru atau gabung ke kelompok temanmu menggunakan kode undangan untuk mengatur giliran tugas dan jadwal rotasi."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsJoinOpen(true)}
                icon={<UserPlus className="w-4 h-4" />}
              >
                Gabung via Kode
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Buat Kelompok Baru
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onInvite={(g) => setSelectedInviteGroup(g)}
              onDelete={handleDeleteGroup}
              onLeave={handleLeaveGroup}
            />
          ))}
        </div>
      )}

      {/* Modal Buat Kelompok */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Kelompok Perkuliahan Baru"
        size="md"
      >
        <GroupForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          loading={createLoading}
        />
      </Modal>

      {/* Modal Gabung Kelompok */}
      <JoinGroupModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={joinGroupByCode}
      />

      {/* Modal Undang Anggota */}
      <InviteModal
        group={selectedInviteGroup}
        isOpen={Boolean(selectedInviteGroup)}
        onClose={() => setSelectedInviteGroup(null)}
        onRegenerateCode={regenerateCode}
        isOwner={true}
      />
    </div>
  );
};

export default GroupsPage;

