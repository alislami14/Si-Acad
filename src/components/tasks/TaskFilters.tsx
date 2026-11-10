import { Search, Filter, X } from 'lucide-react';
import { Course } from '../../types/database';
import { TaskFiltersState } from '../../hooks/useTasks';

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
  courses: Course[];
}

export const TaskFilters = ({ filters, onChange, courses }: TaskFiltersProps) => {
  const updateFilter = (key: keyof TaskFiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      courseId: '',
      status: '',
      priority: '',
      search: '',
      timeframe: 'all',
    });
  };

  const hasActiveFilters =
    filters.courseId || filters.status || filters.priority || filters.search || filters.timeframe !== 'all';

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#1E251E] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul tugas, deskripsi, atau catatan..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FAFAF7] dark:bg-[#151915] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C9A76]"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Reset Filter
          </button>
        )}
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-gray-100 dark:border-gray-800 text-xs">
        {/* Course Filter */}
        <select
          value={filters.courseId}
          onChange={(e) => updateFilter('courseId', e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181F18] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#7C9A76]"
        >
          <option value="">Semua Mata Kuliah</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181F18] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#7C9A76]"
        >
          <option value="">Semua Prioritas</option>
          <option value="high">Tinggi</option>
          <option value="normal">Normal</option>
          <option value="low">Rendah</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181F18] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#7C9A76]"
        >
          <option value="">Semua Status</option>
          <option value="todo">Belum Dikerjakan</option>
          <option value="in_progress">Sedang Dikerjakan</option>
          <option value="done">Selesai</option>
        </select>

        {/* Timeframe Filter */}
        <select
          value={filters.timeframe}
          onChange={(e) => updateFilter('timeframe', e.target.value as TaskFiltersState['timeframe'])}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181F18] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#7C9A76]"
        >
          <option value="all">Semua Waktu</option>
          <option value="today">Hari Ini</option>
          <option value="week">Minggu Ini</option>
          <option value="upcoming">Mendatang</option>
          <option value="overdue">Lewat Deadline</option>
          <option value="done">Sudah Selesai</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;

