import { useState, useMemo } from 'react';
import {
  Plus,
  Calendar,
  ListFilter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';
import { Task } from '../types/database';
import useTasks, { TaskFiltersState } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskCalendar from '../components/tasks/TaskCalendar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { isToday, isThisWeek, isPast, parseISO } from '../lib/dateUtils';

export const TasksPage = () => {
  const {
    tasks,
    courses,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useTasks();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'week' | 'upcoming' | 'overdue' | 'done'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [filters, setFilters] = useState<TaskFiltersState>({
    courseId: '',
    status: '',
    priority: '',
    search: '',
    timeframe: 'all',
  });

  // Calculate categorized counts
  const counts = useMemo(() => {
    let today = 0;
    let week = 0;
    let upcoming = 0;
    let overdue = 0;
    let done = 0;

    tasks.forEach((t) => {
      if (t.status === 'done') {
        done++;
      } else if (t.deadline) {
        const d = parseISO(t.deadline);
        if (isPast(d) && !isToday(d)) {
          overdue++;
        } else if (isToday(d)) {
          today++;
        } else if (isThisWeek(d)) {
          week++;
        } else {
          upcoming++;
        }
      } else {
        upcoming++;
      }
    });

    return { all: tasks.length, today, week, upcoming, overdue, done };
  }, [tasks]);

  // Filter tasks based on activeTab and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Tab filter
      if (activeTab === 'today') {
        if (!t.deadline || t.status === 'done' || !isToday(parseISO(t.deadline))) return false;
      } else if (activeTab === 'week') {
        if (!t.deadline || t.status === 'done' || !isThisWeek(parseISO(t.deadline))) return false;
      } else if (activeTab === 'upcoming') {
        if (t.status === 'done') return false;
        if (t.deadline && (isPast(parseISO(t.deadline)) || isToday(parseISO(t.deadline)))) return false;
      } else if (activeTab === 'overdue') {
        if (!t.deadline || t.status === 'done' || !isPast(parseISO(t.deadline)) || isToday(parseISO(t.deadline))) return false;
      } else if (activeTab === 'done') {
        if (t.status !== 'done') return false;
      }

      // 2. Course filter
      if (filters.courseId && t.course_id !== filters.courseId) return false;

      // 3. Priority filter
      if (filters.priority && t.priority !== filters.priority) return false;

      // 4. Status filter
      if (filters.status && t.status !== filters.status) return false;

      // 5. Timeframe dropdown filter
      if (filters.timeframe !== 'all') {
        if (filters.timeframe === 'done' && t.status !== 'done') return false;
        if (filters.timeframe === 'today' && (!t.deadline || !isToday(parseISO(t.deadline)))) return false;
        if (filters.timeframe === 'week' && (!t.deadline || !isThisWeek(parseISO(t.deadline)))) return false;
        if (filters.timeframe === 'overdue' && (!t.deadline || !isPast(parseISO(t.deadline)) || isToday(parseISO(t.deadline)))) return false;
        if (filters.timeframe === 'upcoming' && (!t.deadline || isPast(parseISO(t.deadline)))) return false;
      }

      // 6. Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query) || false;
        const matchesNotes = t.notes?.toLowerCase().includes(query) || false;
        const matchesCourse = t.course?.name.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc && !matchesNotes && !matchesCourse) return false;
      }

      return true;
    });
  }, [tasks, activeTab, filters]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(data);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus tugas ini?')) {
      await deleteTask(id);
    }
  };

  const tabs = [
    { id: 'all', label: 'Semua', count: counts.all },
    { id: 'today', label: 'Hari Ini', count: counts.today, icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'week', label: 'Minggu Ini', count: counts.week },
    { id: 'upcoming', label: 'Mendatang', count: counts.upcoming },
    { id: 'overdue', label: 'Lewat Deadline', count: counts.overdue, icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'done', label: 'Selesai', count: counts.done, icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#7C9A76]" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Tugas & Catatan
          </h1>
          <p className="text-xs sm:text-sm text-[#627F5C] dark:text-[#93AC91] mt-0.5">
            Pusat manajemen deadline tugas, prioritas, dan catatan perkuliahan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle list vs calendar */}
          <div className="flex items-center bg-[#E6EDE5]/80 dark:bg-[#1E251E] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#253023] text-[#334230] dark:text-[#E6EDE5] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Daftar</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-[#253023] text-[#334230] dark:text-[#E6EDE5] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Kalender</span>
            </button>
          </div>

          <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            Tugas Baru
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        <TaskCalendar tasks={tasks} onSelectTask={handleOpenEdit} />
      ) : (
        <div className="space-y-4">
          {/* Categorized Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as typeof activeTab)} />

          {/* Filter Bar */}
          <TaskFilters filters={filters} onChange={setFilters} courses={courses} />

          {/* Task List */}
          {loading ? (
            <LoadingSpinner text="Memuat daftar tugas..." />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-8 h-8" />}
              title="Tidak ada tugas ditemukan"
              description={
                tasks.length === 0
                  ? 'Belum ada tugas perkuliahan yang ditambahkan. Mulai buat tugas pertamamu agar tidak terlewat deadline!'
                  : 'Tidak ada tugas yang sesuai dengan kriteria filter saat ini.'
              }
              action={
                <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
                  Tambah Tugas Sekarang
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteTask}
                  onToggleStatus={toggleTaskStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Tugas Perkuliahan' : 'Buat Tugas Baru'}
        size="lg"
      >
        <TaskForm
          initialTask={editingTask}
          courses={courses}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default TasksPage;

