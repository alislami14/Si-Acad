import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Users,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Plus,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSemester } from '../contexts/SemesterContext';
import useTasks from '../hooks/useTasks';
import useGroups from '../hooks/useGroups';
import useNotifications from '../hooks/useNotifications';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate, formatDateTime, isToday, isPast, parseISO } from '../lib/dateUtils';
import { Schedule } from '../types/database';
import { supabase, isSupabaseConfigured } from '../config/supabase';

export const DashboardPage = () => {
  const { user, profile, isDemo } = useAuth();
  const { activeSemester } = useSemester();
  const { tasks, courses, loading: tasksLoading } = useTasks();
  const { groups, loading: groupsLoading } = useGroups();
  const { logs } = useNotifications();

  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // Fetch today's class schedule directly from Supabase
  useEffect(() => {
    setSchedulesLoading(true);
    const fetchDashboardSchedules = async () => {
      try {
        if (!user || !isSupabaseConfigured) {
          setTodaySchedules([]);
          return;
        }

        const { data, error } = await supabase
          .from('schedules')
          .select('*, course:courses(*)')
          .eq('user_id', user.id)
          .order('start_time');

        if (!error && data) {
          const currentDayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday...
          const filtered = data.filter(
            (s) => s.day_of_week === currentDayOfWeek && !s.is_cancelled
          );
          setTodaySchedules(filtered);
        } else {
          setTodaySchedules([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard schedules from Supabase:', err);
        setTodaySchedules([]);
      } finally {
        setSchedulesLoading(false);
      }
    };

    fetchDashboardSchedules();
  }, [user, activeSemester]);

  // Tasks statistics
  const pendingTasks = tasks.filter((t) => t.status !== 'done');
  const overdueTasks = pendingTasks.filter(
    (t) => t.deadline && isPast(parseISO(t.deadline)) && !isToday(parseISO(t.deadline))
  );

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#7C9A76] via-[#688562] to-[#4D6449] text-white shadow-lg shadow-[#7C9A76]/20">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-white/90" />
            <span>
              {activeSemester?.name ||
                (isDemo ? 'Semester 5 (14 SKS)' : 'Belum Ada Semester Aktif')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-heading font-bold tracking-tight">
            Selamat Datang, {profile?.full_name || (isDemo ? 'Faisal Al Alim' : 'Mahasiswa')}!
          </h1>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Semua rencana kuliah, batas deadline tugas, dan giliran presentasi kelompokmu terkelola rapi di satu tempat.
          </p>
        </div>

        {/* Quick actions row */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-2.5">
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#4D6449] text-xs sm:text-sm font-semibold shadow-xs hover:bg-[#F4F7F4] transition-colors"
          >
            <CheckSquare className="w-4 h-4 text-[#7C9A76]" />
            <span>Lihat Tugas ({pendingTasks.length})</span>
          </Link>
          <Link
            to="/groups"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold hover:bg-white/30 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Group Planner ({groups.length})</span>
          </Link>
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold hover:bg-white/30 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Jadwal Kuliah</span>
          </Link>
        </div>

        {/* Decorative blur */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Informasi Semester untuk Pengguna Asli Baru (jika belum buat semester) */}
      {!isDemo && !activeSemester && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Mulai Semester Pertama Anda:</span> Anda belum memiliki semester aktif.
              Buat semester baru untuk mulai mengatur mata kuliah dan jadwal mingguan.
            </div>
          </div>
          <Link
            to="/schedule"
            className="px-3.5 py-2 rounded-xl bg-[#7C9A76] hover:bg-[#627F5C] text-white font-semibold text-xs shrink-0 inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mulai Atur Jadwal</span>
          </Link>
        </div>
      )}

      {/* 3. Overdue Warning Banner (if any) */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3 text-xs sm:text-sm text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Perhatian:</span> Ada {overdueTasks.length} tugas yang telah melewati deadline!
            </div>
          </div>
          <Link
            to="/tasks"
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs shrink-0 hover:bg-rose-700 transition-colors"
          >
            Cek Sekarang
          </Link>
        </div>
      )}

      {/* 4. Main 3-Column Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom 1: Kuliah Hari Ini */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7C9A76]" />
              <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
                Kuliah Hari Ini
              </h3>
            </div>
            <Link to="/schedule" className="text-xs text-[#7C9A76] hover:underline font-semibold">
              Semua Jadwal
            </Link>
          </div>

          {schedulesLoading ? (
            <LoadingSpinner size="sm" text="Memuat jadwal..." />
          ) : todaySchedules.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 space-y-1">
              <CalendarDays className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="font-medium text-gray-600 dark:text-gray-300">Tidak ada perkuliahan hari ini.</p>
              <p className="text-[11px] text-gray-400">
                {isDemo
                  ? 'Waktunya belajar mandiri atau mengerjakan tugas!'
                  : 'Tambahkan mata kuliah & jadwal di menu Jadwal Kuliah!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-xl bg-[#FAFAF7] dark:bg-[#181F18] border border-gray-100 dark:border-gray-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {sch.course?.name || courses.find((c) => c.id === sch.course_id)?.name || 'Mata Kuliah'}
                    </span>
                    <span className="text-[11px] font-semibold text-[#7C9A76] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {sch.start_time.substring(0, 5)} - {sch.end_time.substring(0, 5)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Ruang: {sch.room || sch.course?.room || 'Kampus'} &bull; Dosen:{' '}
                    {sch.course?.lecturer || courses.find((c) => c.id === sch.course_id)?.lecturer || '-'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Kolom 2: Tugas Deadline Hari Ini / Mendekat */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#7C9A76]" />
              <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
                Deadline Terdekat
              </h3>
            </div>
            <Link to="/tasks" className="text-xs text-[#7C9A76] hover:underline font-semibold">
              Lihat ({pendingTasks.length})
            </Link>
          </div>

          {tasksLoading ? (
            <LoadingSpinner size="sm" text="Memuat tugas..." />
          ) : pendingTasks.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="font-medium text-gray-600 dark:text-gray-300">Semua tugas beres!</p>
              <p className="text-[11px] text-gray-400">
                {isDemo
                  ? 'Tidak ada tugas yang tertunda saat ini.'
                  : 'Belum ada tugas tercatat. Buat tugas baru di menu Tugas & Catatan.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-[#FAFAF7] dark:bg-[#181F18] border border-gray-100 dark:border-gray-800 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {task.title}
                    </span>
                    {task.deadline && isToday(parseISO(task.deadline)) && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded shrink-0">
                        Hari ini!
                      </span>
                    )}
                  </div>
                  {task.deadline && (
                    <p className="text-[11px] text-gray-500">
                      Deadline: {formatDateTime(task.deadline)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Kolom 3: Kelompok & Giliran Rotasi */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7C9A76]" />
              <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
                Kelompok & Rotasi
              </h3>
            </div>
            <Link to="/groups" className="text-xs text-[#7C9A76] hover:underline font-semibold">
              Kelola ({groups.length})
            </Link>
          </div>

          {groupsLoading ? (
            <LoadingSpinner size="sm" text="Memuat kelompok..." />
          ) : groups.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="font-medium text-gray-600 dark:text-gray-300">Belum bergabung dengan kelompok.</p>
              <Link
                to="/groups"
                className="inline-flex items-center gap-1 text-xs text-[#7C9A76] font-bold hover:underline"
              >
                Buat atau Gabung Sekarang <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {groups.slice(0, 3).map((grp) => (
                <Link
                  key={grp.id}
                  to={`/groups/${grp.id}`}
                  className="block p-3 rounded-xl bg-[#FAFAF7] dark:bg-[#181F18] border border-gray-100 dark:border-gray-800 hover:border-[#7C9A76] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {grp.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {grp.members?.length || 0} Anggota
                    </span>
                  </div>
                  <p className="text-[11px] text-[#627F5C] dark:text-[#93AC91] mt-0.5 truncate">
                    Buka dasbor giliran rotasi &rarr;
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 5. Recent Notification Activity */}
      {logs.length > 0 && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
              Notifikasi Pengingat Terbaru
            </h3>
            <Link to="/notifications" className="text-xs text-[#7C9A76] hover:underline font-semibold">
              Pusat Notifikasi
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {logs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#FAFAF7] dark:bg-[#181F18] border border-gray-100 dark:border-gray-800 text-xs space-y-1"
              >
                <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{log.title}</p>
                <p className="text-gray-500 line-clamp-1">{log.body}</p>
                <p className="text-[10px] text-gray-400">{formatDate(log.sent_at)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
