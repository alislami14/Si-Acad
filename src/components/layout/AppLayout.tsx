import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useSemester } from '../../contexts/SemesterContext';

export const AppLayout = () => {
  const { createSemester } = useSemester();
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [semesterName, setSemesterName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semesterName.trim()) return;

    setLoading(true);
    try {
      await createSemester(semesterName, startDate, endDate);
      setIsSemesterModalOpen(false);
      setSemesterName('');
      setStartDate('');
      setEndDate('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAF7] dark:bg-[#141814] text-[#2D3B2D] dark:text-[#E8EDE8]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <Header onOpenCreateSemester={() => setIsSemesterModalOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Modal Buat Semester Baru */}
      <Modal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
        title="Buat Semester Baru"
      >
        <form onSubmit={handleCreateSemester} className="space-y-4">
          <Input
            label="Nama Semester"
            placeholder="Contoh: Semester Ganjil 2026/2027"
            value={semesterName}
            onChange={(e) => setSemesterName(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Tanggal Selesai"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsSemesterModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" loading={loading} disabled={!semesterName.trim()}>
              Simpan Semester
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppLayout;

