import { useState } from 'react';
import {
  Calendar,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Task } from '../../types/database';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDateTime, getDeadlineStatus, getDeadlineColor, formatRelative } from '../../lib/dateUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const deadlineStatus = getDeadlineStatus(task.deadline);
  const deadlineColor = getDeadlineColor(deadlineStatus);

  const priorityConfig = {
    low: { label: 'Rendah', variant: 'default' as const },
    normal: { label: 'Normal', variant: 'sage' as const },
    high: { label: 'Tinggi', variant: 'danger' as const },
  };

  const statusConfig = {
    todo: {
      label: 'Belum Dikerjakan',
      icon: <Circle className="w-4 h-4 text-gray-400" />,
      badge: 'default' as const,
    },
    in_progress: {
      label: 'Sedang Dikerjakan',
      icon: <Clock3 className="w-4 h-4 text-amber-500" />,
      badge: 'warning' as const,
    },
    done: {
      label: 'Selesai',
      icon: <CheckCircle2 className="w-4 h-4 text-[#7C9A76]" />,
      badge: 'success' as const,
    },
  };

  return (
    <Card
      className={`relative group transition-all duration-200 hover:shadow-md ${
        task.status === 'done'
          ? 'opacity-70 bg-[#FAFAF7]/60 dark:bg-[#151915]/60'
          : deadlineStatus === 'overdue'
          ? 'border-l-4 border-l-rose-500'
          : deadlineStatus === 'today'
          ? 'border-l-4 border-l-amber-500'
          : 'border-l-4 border-l-[#7C9A76]'
      }`}
      padding="md"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox toggle status */}
        <button
          onClick={() => onToggleStatus(task)}
          className="mt-0.5 text-gray-400 hover:text-[#7C9A76] transition-colors cursor-pointer shrink-0"
          title={task.status === 'done' ? 'Tandai belum selesai' : 'Tandai selesai'}
        >
          {statusConfig[task.status].icon}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Course badge */}
            {task.course ? (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{
                  backgroundColor: `${task.course.color || '#7C9A76'}20`,
                  color: task.course.color || '#7C9A76',
                }}
              >
                {task.course.code || task.course.name}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-gray-400">Umum</span>
            )}

            {/* Priority */}
            <Badge variant={priorityConfig[task.priority].variant} size="sm">
              {priorityConfig[task.priority].label}
            </Badge>

            {/* Deadline indicator if overdue/today */}
            {deadlineStatus === 'overdue' && task.status !== 'done' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3 h-3" /> Lewat Deadline
              </span>
            )}
            {deadlineStatus === 'today' && task.status !== 'done' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" /> Hari Ini!
              </span>
            )}
          </div>

          <h3
            className={`text-sm sm:text-base font-semibold leading-snug ${
              task.status === 'done'
                ? 'line-through text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Notes preview */}
          {task.notes && (
            <div className="mt-2 flex items-start gap-1.5 p-2 rounded-xl bg-[#F4F7F4] dark:bg-[#1B231B] text-[11px] text-[#4D6449] dark:text-[#A8C5A0]">
              <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#7C9A76]" />
              <span className="line-clamp-1 italic">{task.notes}</span>
            </div>
          )}

          {/* Footer info: deadline & relative time */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs">
            {task.deadline ? (
              <div className={`flex items-center gap-1.5 font-medium ${deadlineColor}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateTime(task.deadline)}</span>
                <span className="text-[10px] text-gray-400">({formatRelative(task.deadline)})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Tanpa deadline</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#1E251E] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-20 animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#253023] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#7C9A76]" />
                  <span>Edit Tugas</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(task.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Hapus Tugas</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;

