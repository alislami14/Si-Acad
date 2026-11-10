import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Task } from '../../types/database';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { DAY_NAMES, formatTime, getDeadlineStatus } from '../../lib/dateUtils';

interface TaskCalendarProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const TaskCalendar = ({ tasks, onSelectTask }: TaskCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Get tasks that have deadlines
  const tasksWithDeadline = tasks.filter((t) => t.deadline);

  // Tasks on selected date
  const selectedDateTasks = tasksWithDeadline.filter((t) => {
    if (!t.deadline) return false;
    return isSameDay(parseISO(t.deadline), selectedDate);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <Card className="lg:col-span-2" padding="md">
        {/* Month Header & Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#7C9A76]" />
            <h2 className="text-base sm:text-lg font-heading font-bold text-gray-900 dark:text-gray-100 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#E6EDE5] dark:bg-[#202C20] text-[#4D6449] dark:text-[#A8C5A0] hover:bg-[#D0DDD0] transition-colors cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              onClick={prevMonth}
              aria-label="Bulan sebelumnya"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              aria-label="Bulan berikutnya"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isCurrentDay = isToday(day);

            // Tasks on this day
            const dayTasks = tasksWithDeadline.filter((t) => isSameDay(parseISO(t.deadline!), day));
            const hasOverdue = dayTasks.some(
              (t) => t.status !== 'done' && getDeadlineStatus(t.deadline) === 'overdue'
            );
            const hasPending = dayTasks.some((t) => t.status !== 'done');

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`relative min-h-[52px] sm:min-h-[64px] p-1.5 rounded-xl flex flex-col items-center justify-start transition-all cursor-pointer ${
                  !isCurrentMonth ? 'opacity-30' : ''
                } ${
                  isSelected
                    ? 'bg-[#7C9A76] text-white shadow-sm font-bold'
                    : isCurrentDay
                    ? 'bg-[#E6EDE5]/80 dark:bg-[#202C20] text-[#334230] dark:text-[#E6EDE5] font-semibold border border-[#7C9A76]'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}
              >
                <span className="text-xs">{format(day, 'd')}</span>

                {/* Task Indicators */}
                {dayTasks.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5 justify-center max-w-full">
                    {dayTasks.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className={`h-1.5 w-1.5 rounded-full ${
                          isSelected
                            ? 'bg-white'
                            : t.status === 'done'
                            ? 'bg-gray-300 dark:bg-gray-600'
                            : hasOverdue
                            ? 'bg-rose-500'
                            : 'bg-[#7C9A76]'
                        }`}
                        title={t.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[8px] font-bold leading-none">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected Date Task List */}
      <Card padding="md" className="flex flex-col h-full">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#627F5C] dark:text-[#93AC91]">
              Deadline Pada
            </p>
            <h3 className="text-sm sm:text-base font-heading font-bold text-gray-900 dark:text-gray-100 capitalize">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id })}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E6EDE5] dark:bg-[#202C20] text-[#334230] dark:text-[#D0DDD0]">
            {selectedDateTasks.length} Tugas
          </span>
        </div>

        <div className="mt-3 space-y-2 flex-1 overflow-y-auto max-h-[350px]">
          {selectedDateTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Tidak ada tugas dengan deadline pada tanggal ini.
            </div>
          ) : (
            selectedDateTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-[#FAFAF7]/70 dark:bg-[#181F18]/70 hover:border-[#7C9A76] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  {task.course && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${task.course.color || '#7C9A76'}20`,
                        color: task.course.color || '#7C9A76',
                      }}
                    >
                      {task.course.name}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.deadline ? formatTime(task.deadline.split('T')[1]) : ''}
                  </span>
                </div>
                <h4
                  className={`text-xs sm:text-sm font-semibold ${
                    task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {task.title}
                </h4>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default TaskCalendar;

