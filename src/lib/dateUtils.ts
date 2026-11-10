/**
 * SI-Acad Date Utilities
 * Indonesian locale date formatting and deadline status helpers
 */

import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isThisWeek,
  isPast,
  addDays,
  startOfWeek,
  endOfWeek,
  differenceInHours,
  differenceInMinutes,
  parseISO,
} from 'date-fns';
import { id } from 'date-fns/locale';

/** Format a date as "d MMMM yyyy" in Indonesian locale */
export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy', { locale: id });
};

/** Format a date as "d MMMM yyyy, HH:mm" in Indonesian locale */
export const formatDateTime = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'd MMMM yyyy, HH:mm', { locale: id });
};

/** Format a time string (HH:mm:ss) to HH:mm */
export const formatTime = (time: string) => {
  return time.substring(0, 5);
};

/** Format a date relative to now in Indonesian locale (e.g., "2 hari yang lalu") */
export const formatRelative = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
};

/** Determine deadline urgency status */
export const getDeadlineStatus = (
  deadline: string | null
): 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'upcoming' | null => {
  if (!deadline) return null;
  const d = parseISO(deadline);
  if (isPast(d)) return 'overdue';
  if (isToday(d)) return 'today';
  if (isTomorrow(d)) return 'tomorrow';
  if (isThisWeek(d)) return 'this_week';
  return 'upcoming';
};

/** Get text color class based on deadline urgency */
export const getDeadlineColor = (status: ReturnType<typeof getDeadlineStatus>): string => {
  switch (status) {
    case 'overdue':
      return 'text-red-600 dark:text-red-400';
    case 'today':
      return 'text-amber-600 dark:text-amber-400';
    case 'tomorrow':
      return 'text-orange-500 dark:text-orange-400';
    case 'this_week':
      return 'text-sage-600 dark:text-sage-400';
    case 'upcoming':
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-gray-500';
  }
};

/** Get background color class based on deadline urgency */
export const getDeadlineBgColor = (status: ReturnType<typeof getDeadlineStatus>): string => {
  switch (status) {
    case 'overdue':
      return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800';
    case 'today':
      return 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800';
    case 'tomorrow':
      return 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800';
    default:
      return 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';
  }
};

/** Indonesian day names (Sunday = 0) */
export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** Get the start and end of the current week (Monday start) */
export const getWeekRange = (date: Date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

// Re-export commonly used date-fns functions for convenience
export {
  isToday,
  isTomorrow,
  isThisWeek,
  isPast,
  addDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
  format,
};
