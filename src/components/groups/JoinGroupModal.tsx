import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { UserCheck, AlertCircle } from 'lucide-react';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
}

export const JoinGroupModal = ({ isOpen, onClose, onJoin }: JoinGroupModalProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await onJoin(code.trim());
      if (res.error) {
        setError(res.error.message || 'Kode undangan tidak valid atau kamu sudah bergabung.');
      } else {
        setCode('');
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal bergabung dengan kelompok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gabung ke Kelompok Belajar" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Masukkan 6-12 digit kode undangan yang diberikan oleh ketua atau anggota kelompokmu.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Kode Undangan"
          placeholder="Contoh: a8f9c1"
          value={code}
          onChange={(e) => setCode(e.target.value.toLowerCase())}
          required
          autoFocus
          className="font-mono text-center tracking-wider text-base uppercase"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!code.trim()}
            icon={<UserCheck className="w-4 h-4" />}
          >
            Gabung Sekarang
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinGroupModal;

