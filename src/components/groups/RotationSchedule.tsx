import { useState } from 'react';
import {
  Calendar,
  Clock,
  RotateCw,
  Plus,
  Edit2,
  Trash2,
  CalendarDays,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { GroupRotationSlot, GroupEvent, Course } from '../../types/database';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Textarea from '../ui/Textarea';
import { formatDate, isToday } from '../../lib/dateUtils';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

interface RotationScheduleProps {
  slots: GroupRotationSlot[];
  events: GroupEvent[];
  courses: Course[];
  onGenerateAuto: (params: {
    startDate: string;
    totalSlots: number;
    intervalDays?: number;
    notes?: string;
  }) => Promise<any>;
  onSaveSlot: (slot: Partial<GroupRotationSlot>) => Promise<any>;
  onDeleteSlot: (id: string) => Promise<any>;
  onSaveEvent: (event: Partial<GroupEvent>) => Promise<any>;
  onDeleteEvent: (id: string) => Promise<any>;
  isAdmin?: boolean;
}

export const RotationSchedule = ({
  slots,
  events,
  courses,
  onGenerateAuto,
  onSaveSlot,
  onDeleteSlot,
  onSaveEvent,
  onDeleteEvent,
  isAdmin = true,
}: RotationScheduleProps) => {
  // Auto generator state
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [autoStartDate, setAutoStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [autoTotalWeeks, setAutoTotalWeeks] = useState(8);
  const [autoIntervalDays, setAutoIntervalDays] = useState(7);
  const [autoNotes, setAutoNotes] = useState('Presentasi Topik & Progres');
  const [generating, setGenerating] = useState(false);

  // Manual slot modal
  const [editingSlot, setEditingSlot] = useState<GroupRotationSlot | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotStartDate, setSlotStartDate] = useState('');
  const [slotEndDate, setSlotEndDate] = useState('');
  const [slotOrder, setSlotOrder] = useState(1);
  const [slotNotes, setSlotNotes] = useState('');

  // Manual event modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventCourseId, setEventCourseId] = useState('');
  const [eventSlotId, setEventSlotId] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  const today = new Date();

  // Handle auto generate submit
  const handleAutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await onGenerateAuto({
        startDate: autoStartDate,
        totalSlots: autoTotalWeeks,
        intervalDays: autoIntervalDays,
        notes: autoNotes,
      });
      setIsAutoModalOpen(false);
    } finally {
      setGenerating(false);
    }
  };

  // Open edit slot
  const handleOpenEditSlot = (slot: GroupRotationSlot) => {
    setEditingSlot(slot);
    setSlotOrder(slot.rotation_order);
    setSlotStartDate(slot.start_date);
    setSlotEndDate(slot.end_date);
    setSlotNotes(slot.notes || '');
    setIsSlotModalOpen(true);
  };

  // Handle save slot
  const handleSaveSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSlot({
      id: editingSlot?.id,
      rotation_order: slotOrder,
      start_date: slotStartDate,
      end_date: slotEndDate,
      notes: slotNotes,
    });
    setIsSlotModalOpen(false);
    setEditingSlot(null);
  };

  // Open create event
  const handleOpenCreateEvent = (slotId?: string) => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDate('');
    setEventCourseId('');
    setEventSlotId(slotId || '');
    setEventDesc('');
    setIsEventModalOpen(true);
  };

  // Handle save event
  const handleSaveEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    await onSaveEvent({
      id: editingEvent?.id,
      title: eventTitle.trim(),
      event_date: new Date(eventDate).toISOString(),
      course_id: eventCourseId || null,
      rotation_slot_id: eventSlotId || null,
      description: eventDesc.trim(),
    });
    setIsEventModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1E251E] border border-gray-200/80 dark:border-gray-800">
        <div>
          <h3 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-[#7C9A76]" />
            Alur Jadwal Rotasi Mingguan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sistem rotasi otomatis menentukan giliran kelompok bertugas/presentasi setiap pekannya
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoModalOpen(true)}
              icon={<RotateCw className="w-3.5 h-3.5 text-[#7C9A76]" />}
            >
              Generate Otomatis
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenCreateEvent()}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Tambah Agenda
            </Button>
          </div>
        )}
      </div>

      {/* Rotation Slots Timeline */}
      {slots.length === 0 ? (
        <Card className="text-center py-10" padding="lg">
          <CalendarDays className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Belum ada jadwal rotasi kelompok
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
            Klik tombol "Generate Otomatis" di atas untuk membuat urutan giliran kelompok per minggu secara instan.
          </p>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setIsAutoModalOpen(true)}
              icon={<RotateCw className="w-4 h-4" />}
            >
              Buat Rotasi Sekarang
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => {
            const start = startOfDay(parseISO(slot.start_date));
            const end = endOfDay(parseISO(slot.end_date));
            const isCurrent = isWithinInterval(today, { start, end });
            const isPastSlot = end < today;

            // Events assigned to this slot
            const slotEvents = events.filter((e) => e.rotation_slot_id === slot.id);

            return (
              <Card
                key={slot.id}
                className={`relative transition-all ${
                  isCurrent
                    ? 'border-2 border-[#7C9A76] bg-[#F4F7F4]/40 dark:bg-[#1C251C]'
                    : isPastSlot
                    ? 'opacity-60 bg-gray-50/50 dark:bg-[#151915]'
                    : 'bg-white dark:bg-[#1E251E]'
                }`}
                padding="md"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                        isCurrent
                          ? 'bg-[#7C9A76] text-white'
                          : 'bg-[#E6EDE5] dark:bg-[#253023] text-[#4D6449] dark:text-[#A8C5A0]'
                      }`}
                    >
                      {slot.rotation_order}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Minggu ke-{slot.rotation_order}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {formatDate(slot.start_date)} — {formatDate(slot.end_date)}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7C9A76] text-white shadow-2xs">
                      Aktif Minggu Ini
                    </span>
                  )}
                </div>

                {/* Notes */}
                {slot.notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 bg-white/60 dark:bg-[#181F18]/60 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                    {slot.notes}
                  </p>
                )}

                {/* Events list within this slot */}
                {slotEvents.length > 0 && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Agenda & Kegiatan:
                    </p>
                    {slotEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#FAFAF7] dark:bg-[#151915] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7C9A76]" />
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {ev.title}
                          </span>
                        </div>
                        {ev.course && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{
                              backgroundColor: `${ev.course.color || '#7C9A76'}20`,
                              color: ev.course.color || '#7C9A76',
                            }}
                          >
                            {ev.course.code || ev.course.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin controls */}
                {isAdmin && (
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => handleOpenCreateEvent(slot.id)}
                      className="text-[#7C9A76] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Tambah Agenda
                    </button>
                    <button
                      onClick={() => handleOpenEditSlot(slot)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 cursor-pointer"
                      title="Edit slot tanggal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus giliran Minggu ke-${slot.rotation_order}?`)) {
                          onDeleteSlot(slot.id);
                        }
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      title="Hapus slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Auto Generator Modal */}
      <Modal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
        title="Generate Jadwal Rotasi Otomatis"
        size="md"
      >
        <form onSubmit={handleAutoSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sistem akan menghitung tanggal mulai dan akhir untuk setiap giliran kelompok secara otomatis berdasarkan interval yang ditentukan.
          </p>

          <Input
            label="Tanggal Mulai Rotasi (Minggu ke-1)"
            type="date"
            value={autoStartDate}
            onChange={(e) => setAutoStartDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jumlah Pekan / Giliran"
              type="number"
              min={1}
              max={30}
              value={autoTotalWeeks}
              onChange={(e) => setAutoTotalWeeks(parseInt(e.target.value) || 1)}
              required
            />
            <Input
              label="Interval Rotasi (Hari)"
              type="number"
              min={1}
              max={30}
              value={autoIntervalDays}
              onChange={(e) => setAutoIntervalDays(parseInt(e.target.value) || 7)}
              required
            />
          </div>

          <Input
            label="Catatan Default Tiap Pekan"
            value={autoNotes}
            onChange={(e) => setAutoNotes(e.target.value)}
            placeholder="Contoh: Giliran Presentasi Makalah"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsAutoModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={generating} icon={<RotateCw className="w-4 h-4" />}>
              Generate Jadwal Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={`Edit Slot Minggu ke-${slotOrder}`}
        size="sm"
      >
        <form onSubmit={handleSaveSlotSubmit} className="space-y-4">
          <Input
            label="Urutan Rotasi"
            type="number"
            value={slotOrder}
            onChange={(e) => setSlotOrder(parseInt(e.target.value) || 1)}
            required
          />
          <Input
            label="Tanggal Mulai"
            type="date"
            value={slotStartDate}
            onChange={(e) => setSlotStartDate(e.target.value)}
            required
          />
          <Input
            label="Tanggal Selesai"
            type="date"
            value={slotEndDate}
            onChange={(e) => setSlotEndDate(e.target.value)}
            required
          />
          <Textarea
            label="Catatan Kegiatan"
            value={slotNotes}
            onChange={(e) => setSlotNotes(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsSlotModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEvent ? 'Edit Agenda Kelompok' : 'Tambah Agenda Kelompok'}
        size="md"
      >
        <form onSubmit={handleSaveEventSubmit} className="space-y-4">
          <Input
            label="Judul Agenda / Topik Kegiatan"
            placeholder="Contoh: Presentasi Bab 3 Arsitektur PWA"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tanggal & Jam Kegiatan"
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Mata Kuliah Terkait
              </label>
              <select
                value={eventCourseId}
                onChange={(e) => setEventCourseId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181F18] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7C9A76]"
              >
                <option value="">Pilih Mata Kuliah (Opsional)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Textarea
            label="Catatan Persiapan & Perlengkapan"
            placeholder="Bahan slide, laptop proyektor, pembagian materi antaranggota..."
            value={eventDesc}
            onChange={(e) => setEventDesc(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsEventModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={!eventTitle.trim() || !eventDate}>
              Simpan Agenda
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RotationSchedule;
