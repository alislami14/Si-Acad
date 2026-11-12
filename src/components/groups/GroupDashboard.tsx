import {
  Users,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Shield,
  Crown,
} from 'lucide-react';
import {
  StudyGroup,
  GroupRotationSlot,
  GroupEvent,
  Course,
} from '../../types/database';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDate, formatDateTime } from '../../lib/dateUtils';
import { useAuth } from '../../contexts/AuthContext';

interface GroupDashboardProps {
  group: StudyGroup;
  slots: GroupRotationSlot[];
  events: GroupEvent[];
  courses: Course[];
  currentSlot?: GroupRotationSlot;
  nextSlot?: GroupRotationSlot;
}

export const GroupDashboard = ({
  group,
  slots,
  events,
  courses,
  currentSlot,
  nextSlot,
}: GroupDashboardProps) => {
  const { user } = useAuth();

  const members = group.members || [];
  const isMyGroup = members.some((m) => m.user_id === user?.id);

  // Check if current active slot belongs to this group
  // When currentSlot is active, it IS this group's turn!
  const isMyGroupTurnThisWeek = Boolean(currentSlot);

  // Upcoming presentations / events
  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date());
  const nextEvent = upcomingEvents[0];

  return (
    <div className="space-y-6">
      {/* 1. "Giliran Kelompokmu" Banner if active */}
      {isMyGroupTurnThisWeek && (
        <div className="hero-banner relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-[#7C9A76] to-[#627F5C] text-white shadow-lg shadow-[#7C9A76]/25 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                Giliran Kelompokmu Pekan Ini!
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold">
                {group.name} bertugas di Minggu ke-{currentSlot?.rotation_order}
              </h2>
              <p className="text-xs sm:text-sm text-white/90">
                Periode: {formatDate(currentSlot!.start_date)} sampai {formatDate(currentSlot!.end_date)}.
                {currentSlot?.notes && ` (${currentSlot.notes})`}
              </p>
            </div>

            {nextEvent && (
              <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs shrink-0 max-w-xs">
                <p className="font-semibold text-amber-200 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Agenda Terdekat
                </p>
                <p className="font-bold text-sm truncate">{nextEvent.title}</p>
                <p className="text-white/80 text-[11px] mt-0.5">
                  {formatDateTime(nextEvent.event_date)}
                </p>
              </div>
            )}
          </div>

          {/* Background decorative leaf shape */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>
      )}

      {/* 2. Key Metrics Grid: Minggu Ini, Minggu Depan, Next Event */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Minggu Ini */}
        <Card padding="md" className="border-t-4 border-t-[#7C9A76]">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[#627F5C] dark:text-[#93AC91]">
              Status Pekan Ini
            </span>
            <Clock className="w-4 h-4 text-[#7C9A76]" />
          </div>
          {currentSlot ? (
            <div>
              <h4 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100">
                Minggu ke-{currentSlot.rotation_order}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {formatDate(currentSlot.start_date)} — {formatDate(currentSlot.end_date)}
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E6EDE5] dark:bg-[#202C20] text-[#334230] dark:text-[#A8C5A0] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7C9A76]" />
                Sedang Berlangsung
              </div>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-gray-400 dark:text-gray-500">
                Tidak ada giliran pekan ini
              </p>
              <p className="text-xs text-gray-400 mt-1">Kelompok sedang dalam masa jeda</p>
            </div>
          )}
        </Card>

        {/* Minggu Berikutnya */}
        <Card padding="md" className="border-t-4 border-t-[#B2C5B0]">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[#627F5C] dark:text-[#93AC91]">
              Giliran Berikutnya
            </span>
            <Calendar className="w-4 h-4 text-[#7C9A76]" />
          </div>
          {nextSlot ? (
            <div>
              <h4 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100">
                Minggu ke-{nextSlot.rotation_order}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Mulai: {formatDate(nextSlot.start_date)}
              </p>
              <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">
                {nextSlot.notes || 'Persiapkan materi presentasi'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-gray-400 dark:text-gray-500">
                Belum dijadwalkan
              </p>
              <p className="text-xs text-gray-400 mt-1">Belum ada rotasi mendatang</p>
            </div>
          )}
        </Card>

        {/* Agenda Terdekat */}
        <Card padding="md" className="border-t-4 border-t-[#5B8A5B]">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[#627F5C] dark:text-[#93AC91]">
              Tanggal Presentasi / Agenda
            </span>
            <BookOpen className="w-4 h-4 text-[#7C9A76]" />
          </div>
          {nextEvent ? (
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                {nextEvent.title}
              </h4>
              <p className="text-xs text-[#7C9A76] font-semibold mt-0.5">
                {formatDateTime(nextEvent.event_date)}
              </p>
              {nextEvent.course && (
                <div className="mt-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                    style={{
                      backgroundColor: `${nextEvent.course.color || '#7C9A76'}20`,
                      color: nextEvent.course.color || '#7C9A76',
                    }}
                  >
                    {nextEvent.course.name}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-gray-400 dark:text-gray-500">
                Tidak ada agenda terdekat
              </p>
              <p className="text-xs text-gray-400 mt-1">Tambahkan di menu Jadwal Rotasi</p>
            </div>
          )}
        </Card>
      </div>

      {/* 3. Members List & Preparation Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <Card padding="md" className="lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7C9A76]" />
              <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100">
                Anggota Kelompok ({members.length})
              </h3>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-xl bg-[#FAFAF7] dark:bg-[#181F18] border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#E6EDE5] dark:bg-[#253023] flex items-center justify-center text-[#4D6449] dark:text-[#A8C5A0] text-xs font-bold shrink-0">
                    {m.profile?.full_name ? m.profile.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {m.profile?.full_name || 'Anggota Kelompok'}
                      {m.user_id === user?.id && ' (Kamu)'}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {m.profile?.student_id || m.profile?.major || 'Mahasiswa'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {m.role === 'owner' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      <Crown className="w-3 h-3" /> Ketua
                    </span>
                  )}
                  {m.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7C9A76] bg-[#E6EDE5] dark:bg-[#202C20] px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                  {m.role === 'member' && (
                    <span className="text-[10px] text-gray-400">Anggota</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Preparation Notes & Description */}
        <Card padding="md" className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#7C9A76]" />
              Catatan Persiapan & Pembagian Tugas
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Catatan bersama untuk koordinasi presentasi, pembagian slide, materi makalah, dan riset kelompok.
            </p>

            {nextEvent?.description ? (
              <div className="p-4 rounded-2xl bg-[#F4F7F4] dark:bg-[#1C251C] border border-[#D0DDD0] dark:border-[#2D3B2D] text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                <p className="font-bold text-[#4D6449] dark:text-[#A8C5A0] mb-1">
                  Agenda: {nextEvent.title}
                </p>
                <p className="whitespace-pre-line">{nextEvent.description}</p>
              </div>
            ) : group.description ? (
              <div className="p-4 rounded-2xl bg-[#F4F7F4] dark:bg-[#1C251C] border border-[#D0DDD0] dark:border-[#2D3B2D] text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                <p className="font-bold text-[#4D6449] dark:text-[#A8C5A0] mb-1">
                  Deskripsi Kelompok:
                </p>
                <p className="whitespace-pre-line">{group.description}</p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                Belum ada catatan persiapan. Tambahkan deskripsi kelompok atau agenda presentasi untuk mendokumentasikan pembagian tugas.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GroupDashboard;

