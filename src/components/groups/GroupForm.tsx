import { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface GroupFormProps {
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const GroupForm = ({
  initialName = '',
  initialDescription = '',
  onSubmit,
  onCancel,
  loading,
}: GroupFormProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit(name.trim(), description.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nama Kelompok"
        placeholder="Contoh: Kelompok 3 — Pemrograman Web Mobile"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Textarea
        label="Deskripsi & Topik Kelompok"
        placeholder="Tujuan kelompok, judul proyek akhir, topik presentasi, atau ruang lingkup bahasan..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={loading} disabled={!name.trim()}>
          {initialName ? 'Simpan Perubahan' : 'Buat Kelompok'}
        </Button>
      </div>
    </form>
  );
};

export default GroupForm;

