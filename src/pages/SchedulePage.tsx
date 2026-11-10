import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  MapPin,
  User,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { Course, Schedule } from '../types/database';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ImportScheduleModal from '../components/schedule/ImportScheduleModal';
import { ParsedKrsItem } from '../lib/krsParser';
import { useAuth } from '../contexts/AuthContext';
import { useSemester } from '../contexts/SemesterContext';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const DAYS = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
  { id: 0, name: 'Minggu' },
];

export const SchedulePage = () => {
  const { user, isDemo } = useAuth();
  const { activeSemester, refreshSemesters } = useSemester();

  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs for day view
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday default

  // Helper validasi UUID
  const isUuid = (id?: string) =>
    Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

  // Pastikan selalu ada semester aktif yang sah di Supabase
  const ensureActiveSemesterId = async (): Promise<string> => {
    if (activeSemester?.id && isUuid(activeSemester.id)) {
      return activeSemester.id;
    }

    if (user && isSupabaseConfigured) {
      try {
        const { data: existing } = await supabase
          .from('semesters')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (existing && existing.length > 0) {
          const active = existing.find((s) => s.is_active) || existing[0];
          return active.id;
        }

        const { data: created, error } = await supabase
          .from('semesters')
          .insert([
            {
              user_id: user.id,
              name: 'Semester Ganjil 2026/2027',
              is_active: true,
            },
          ])
          .select()
          .single();

        if (created) return created.id;
        if (error) throw error;
      } catch (e) {
        console.error('Gagal memastikan semester di Supabase:', e);
        throw e;
      }
    }

    throw new Error('Gagal mengidentifikasi semester aktif di Supabase.');
  };

  // Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseLecturer, setCourseLecturer] = useState('');
  const [courseCredits, setCourseCredits] = useState(3);
  const [courseRoom, setCourseRoom] = useState('');
  const [courseColor, setCourseColor] = useState('#7C9A76');

  // Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleCourseId, setScheduleCourseId] = useState('');
  const [scheduleDay, setScheduleDay] = useState(1);
  const [scheduleStartTime, setScheduleStartTime] = useState('08:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('09:40');
  const [scheduleRoom, setScheduleRoom] = useState('');

  // Import KRS / Excel Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch courses & schedules langsung dari Supabase
  const fetchData = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setCourses([]);
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        supabase.from('courses').select('*').eq('user_id', user.id).order('name'),
        supabase
          .from('schedules')
          .select('*, course:courses(*)')
          .eq('user_id', user.id)
          .order('start_time'),
      ]);

      if (cRes.data) {
        setCourses(cRes.data);
      }
      if (sRes.data) {
        setSchedules(sRes.data);
      }
    } catch (err) {
      console.error('Gagal memuat jadwal dari Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Save Course langsung ke Supabase
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !user || !isSupabaseConfigured) return;

    const semesterId = await ensureActiveSemesterId();
    const coursePayload = {
      name: courseName.trim(),
      code: courseCode.trim(),
      lecturer: courseLecturer.trim(),
      credits: courseCredits,
      room: courseRoom.trim(),
      color: courseColor,
      semester_id: semesterId,
      user_id: user.id,
    };

    try {
      if (editingCourse) {
        await supabase
          .from('courses')
          .update(coursePayload)
          .eq('id', editingCourse.id)
          .eq('user_id', user.id);
      } else {
        await supabase.from('courses').insert([coursePayload]);
      }
    } catch (err) {
      console.error('Gagal menyimpan course ke Supabase:', err);
    }

    setIsCourseModalOpen(false);
    setEditingCourse(null);
    await refreshSemesters();
    await fetchData();
  };

  // Handle Save Schedule langsung ke Supabase
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleCourseId || !user || !isSupabaseConfigured) return;

    const semesterId = await ensureActiveSemesterId();
    const schedulePayload = {
      course_id: scheduleCourseId,
      day_of_week: scheduleDay,
      start_time: scheduleStartTime,
      end_time: scheduleEndTime,
      room: scheduleRoom.trim(),
      semester_id: semesterId,
      user_id: user.id,
    };

    try {
      if (editingSchedule) {
        await supabase
          .from('schedules')
          .update(schedulePayload)
          .eq('id', editingSchedule.id)
          .eq('user_id', user.id);
      } else {
        await supabase.from('schedules').insert([schedulePayload]);
      }
    } catch (err) {
      console.error('Gagal menyimpan schedule ke Supabase:', err);
    }

    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
    await fetchData();
  };

  // Handle Delete Schedule langsung di Supabase
  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('Hapus jadwal kuliah ini?') && user && isSupabaseConfigured) {
      try {
        await supabase.from('schedules').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Gagal menghapus schedule di Supabase:', err);
      }
      await fetchData();
    }
  };

  // Handle Import KRS / Excel Success langsung ke Supabase
  const handleImportSuccess = async (items: ParsedKrsItem[]) => {
    if (!user || !isSupabaseConfigured) return;

    // 1. Dapatkan Semester ID yang sah dari Supabase
    const semesterId = await ensureActiveSemesterId();

    const colors = ['#7C9A76', '#5B8A5B', '#4D6449', '#3E503A', '#8FAF88', '#B2C5B0'];
    const courseMap = new Map<string, string>(); // lowercase courseName -> courseId

    // 2. Cek mata kuliah yang sudah ada di Supabase
    courses.forEach((c) => {
      courseMap.set(c.name.toLowerCase().trim(), c.id);
    });

    let colorIdx = courses.length;

    // 3. Buat mata kuliah baru langsung di Supabase
    for (const item of items) {
      const key = item.courseName.toLowerCase().trim();
      if (!courseMap.has(key)) {
        const newCoursePayload = {
          name: item.courseName.trim(),
          code: (item.courseCode || '').trim(),
          lecturer: (item.lecturer || '').trim(),
          credits: item.credits || 3,
          room: (item.room || '').trim(),
          color: colors[colorIdx % colors.length],
          semester_id: semesterId,
          user_id: user.id,
        };

        try {
          const { data, error } = await supabase
            .from('courses')
            .insert([newCoursePayload])
            .select()
            .single();

          if (!error && data) {
            courseMap.set(key, data.id);
          } else if (error) {
            console.error('Supabase error inserting course:', error);
            throw new Error(`Gagal menyimpan mata kuliah ke Supabase: ${error.message}`);
          }
        } catch (err) {
          console.error('Gagal insert course di Supabase:', err);
          throw err;
        }

        colorIdx++;
      }
    }

    // 4. Buat jadwal mingguan langsung di Supabase
    for (const item of items) {
      const key = item.courseName.toLowerCase().trim();
      const courseId = courseMap.get(key);
      if (!courseId) continue;

      const schedulePayload = {
        course_id: courseId,
        day_of_week: item.dayOfWeek,
        start_time: item.startTime,
        end_time: item.endTime,
        room: (item.room || '').trim(),
        semester_id: semesterId,
        user_id: user.id,
      };

      try {
        const { error } = await supabase.from('schedules').insert([schedulePayload]);
        if (error) {
          console.error('Supabase error inserting schedule:', error);
          throw new Error(`Gagal menyimpan jadwal ke Supabase: ${error.message}`);
        }
      } catch (err) {
        console.error('Gagal insert schedule di Supabase:', err);
        throw err;
      }
    }

    // 5. Langsung pindahkan tab ke hari jadwal yang baru diimport agar mata kuliah langsung muncul!
    if (items.length > 0) {
      setSelectedDay(items[0].dayOfWeek);
    }

    // 6. Refresh data tampilan & semester
    await refreshSemesters();
    await fetchData();
  };

  const daySchedules = schedules.filter((s) => s.day_of_week === selectedDay);

  const dayTabs = DAYS.map((d) => ({
    id: String(d.id),
    label: d.name,
    count: schedules.filter((s) => s.day_of_week === d.id).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Jadwal Kuliah Mingguan
          </h1>
          <p className="text-xs sm:text-sm text-[#627F5C] dark:text-[#93AC91] mt-0.5">
            Atur mata kuliah dan jadwal kelas mingguan untuk sistem pengingat otomatis
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            icon={<FileSpreadsheet className="w-4 h-4 text-[#7C9A76]" />}
          >
            Import Excel / KRS
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setEditingCourse(null);
              setCourseName('');
              setCourseCode('');
              setCourseLecturer('');
              setCourseCredits(3);
              setCourseRoom('');
              setCourseColor('#7C9A76');
              setIsCourseModalOpen(true);
            }}
            icon={<BookOpen className="w-4 h-4" />}
          >
            Mata Kuliah ({courses.length})
          </Button>

          <Button
            onClick={() => {
              if (courses.length === 0) {
                alert('Silakan buat mata kuliah terlebih dahulu sebelum menambahkan jadwal.');
                setIsCourseModalOpen(true);
                return;
              }
              setEditingSchedule(null);
              setScheduleCourseId(courses[0]?.id || '');
              setScheduleDay(selectedDay);
              setScheduleStartTime('08:00');
              setScheduleEndTime('09:40');
              setScheduleRoom('');
              setIsScheduleModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Tabs Hari */}
      <div className="overflow-x-auto pb-2">
        <Tabs
          tabs={dayTabs}
          activeTab={String(selectedDay)}
          onChange={(tabId) => setSelectedDay(parseInt(tabId))}
        />
      </div>

      {/* Content Jadwal */}
      {loading ? (
        <LoadingSpinner text="Memuat jadwal kuliah..." />
      ) : daySchedules.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12 text-[#7C9A76]" />}
          title={`Belum ada jadwal kuliah di hari ${DAYS.find((d) => d.id === selectedDay)?.name}`}
          description={
            courses.length === 0
              ? 'Anda belum memiliki mata kuliah. Klik tombol "Mata Kuliah" untuk menambahkan mata kuliah pertama Anda.'
              : 'Klik tombol di bawah untuk menambahkan jadwal kuliah di hari ini.'
          }
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={() => {
                  if (courses.length === 0) {
                    setIsCourseModalOpen(true);
                    return;
                  }
                  setEditingSchedule(null);
                  setScheduleCourseId(courses[0]?.id || '');
                  setScheduleDay(selectedDay);
                  setScheduleStartTime('08:00');
                  setScheduleEndTime('09:40');
                  setScheduleRoom('');
                  setIsScheduleModalOpen(true);
                }}
                icon={<Plus className="w-4 h-4" />}
              >
                {courses.length === 0 ? 'Buat Mata Kuliah Baru' : 'Jadwalkan Kuliah di Hari Ini'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
                icon={<FileSpreadsheet className="w-4 h-4 text-[#7C9A76]" />}
              >
                Import Excel / Foto KRS Cepat
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daySchedules.map((sch) => (
            <Card
              key={sch.id}
              padding="md"
              className="border-l-4"
              style={{ borderLeftColor: sch.course?.color || '#7C9A76' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${sch.course?.color || '#7C9A76'}20`,
                        color: sch.course?.color || '#7C9A76',
                      }}
                    >
                      {sch.course?.code || 'KULIAH'}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}
                    </span>
                  </div>

                  <h3 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100">
                    {sch.course?.name || 'Mata Kuliah'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#7C9A76]" />
                      Ruang: {sch.room || sch.course?.room || 'Daring / Kampus'}
                    </span>
                    {sch.course?.lecturer && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#7C9A76]" />
                        {sch.course.lecturer}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingSchedule(sch);
                      setScheduleCourseId(sch.course_id);
                      setScheduleDay(sch.day_of_week);
                      setScheduleStartTime(sch.start_time.substring(0, 5));
                      setScheduleEndTime(sch.end_time.substring(0, 5));
                      setScheduleRoom(sch.room);
                      setIsScheduleModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(sch.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit Course */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
        size="md"
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <Input
            label="Nama Mata Kuliah"
            placeholder="Contoh: Pengolahan Citra Digital"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kode MK"
              placeholder="Contoh: TIF-301"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
            <Input
              label="Jumlah SKS"
              type="number"
              min={1}
              max={6}
              value={courseCredits}
              onChange={(e) => setCourseCredits(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Dosen Pengampu"
              placeholder="Contoh: Dr. Ir. Budi Santoso"
              value={courseLecturer}
              onChange={(e) => setCourseLecturer(e.target.value)}
            />
            <Input
              label="Ruangan Default"
              placeholder="Contoh: Gedung B Lt. 3"
              value={courseRoom}
              onChange={(e) => setCourseRoom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Label Warna Identitas
            </label>
            <div className="flex items-center gap-3">
              {['#7C9A76', '#5B8A5B', '#4D6449', '#3E503A', '#8FAF88', '#B2C5B0'].map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setCourseColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    courseColor === color ? 'scale-125 ring-2 ring-offset-2 ring-[#7C9A76]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsCourseModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={!courseName.trim()}>
              Simpan Mata Kuliah
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah/Edit Jadwal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={editingSchedule ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
        size="md"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Pilih Mata Kuliah
            </label>
            <select
              value={scheduleCourseId}
              onChange={(e) => setScheduleCourseId(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181F18] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7C9A76]"
            >
              <option value="">Pilih Mata Kuliah...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code || c.lecturer})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Hari
              </label>
              <select
                value={scheduleDay}
                onChange={(e) => setScheduleDay(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181F18] text-gray-900 dark:text-gray-100"
              >
                {DAYS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Jam Mulai"
              type="time"
              value={scheduleStartTime}
              onChange={(e) => setScheduleStartTime(e.target.value)}
              required
            />

            <Input
              label="Jam Selesai"
              type="time"
              value={scheduleEndTime}
              onChange={(e) => setScheduleEndTime(e.target.value)}
              required
            />
          </div>

          <Input
            label="Ruangan Spesifik"
            placeholder="Contoh: Lab Komputer 30.3.15"
            value={scheduleRoom}
            onChange={(e) => setScheduleRoom(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsScheduleModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={!scheduleCourseId}>
              Simpan Jadwal Kuliah
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Import Jadwal dari Excel / Gemini AI KRS */}
      <ImportScheduleModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default SchedulePage;
