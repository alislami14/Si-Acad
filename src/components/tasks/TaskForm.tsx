import { useState, useEffect } from 'react';
import { Task, Course } from '../../types/database';
import Input from '../ui/Input';
import Select from '../ui/Select';
import DateTimePicker from '../ui/DateTimePicker';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface TaskFormProps {
  initialTask?: Task | null;
  courses: Course[];
  onSubmit: (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const TaskForm = ({
  initialTask,
  courses,
  onSubmit,
  onCancel,
  loading,
}: TaskFormProps) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [courseId, setCourseId] = useState(initialTask?.course_id || '');
  const [deadline, setDeadline] = useState(
    initialTask?.deadline ? initialTask.deadline.substring(0, 16) : ''
  );
  const [priority, setPriority] = useState<Task['priority']>(initialTask?.priority || 'normal');
  const [status, setStatus] = useState<Task['status']>(initialTask?.status || 'todo');
  const [notes, setNotes] = useState(initialTask?.notes || '');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCourseId(initialTask.course_id || '');
      setDeadline(initialTask.deadline ? initialTask.deadline.substring(0, 16) : '');
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setNotes(initialTask.notes || '');
    }
  }, [initialTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      course_id: courseId || null,
      semester_id: initialTask?.semester_id || null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priority,
      status,
      notes: notes.trim(),
    });
  };

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.lecturer ? `Dosen: ${c.lecturer}` : c.code || undefined,
  }));

  const priorityOptions = [
    { value: 'low', label: 'Rendah (Santai)', badge: 'Santai' },
    { value: 'normal', label: 'Normal (Standar)', badge: 'Standar' },
    { value: 'high', label: 'Tinggi (Penting & Mendesak)', badge: 'Prioritas' },
  ];

  const statusOptions = [
    { value: 'todo', label: 'Belum Dikerjakan', badge: 'To-Do' },
    { value: 'in_progress', label: 'Sedang Dikerjakan', badge: 'Proses' },
    { value: 'done', label: 'Selesai', badge: 'Done' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Judul Tugas"
        placeholder="Contoh: Makalah Analisis Algoritma"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Mata Kuliah Terkait"
          placeholder="Pilih Mata Kuliah (Opsional)"
          options={courseOptions}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        />

        <DateTimePicker
          label="Tanggal & Jam Deadline"
          placeholder="Pilih tanggal & jam deadline..."
          value={deadline}
          onChange={setDeadline}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Prioritas Tugas"
          options={priorityOptions}
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
        />

        <Select
          label="Status Pengerjaan"
          options={statusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value as Task['status'])}
        />
      </div>

      <Textarea
        label="Deskripsi Tugas"
        placeholder="Instruksi pengerjaan, format pengumpulan, link referensi..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <Textarea
        label="Catatan Pribadi (Personal Notes)"
        placeholder="Catatan progres, pembagian peran, atau hal penting yang perlu diingat..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={loading} disabled={!title.trim()}>
          {initialTask ? 'Simpan Perubahan' : 'Buat Tugas'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;

