import { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  addDays,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import {
  MONTH_NAMES_ID,
  MONTH_SHORT_ID,
  DAY_SHORT_ACADEMIC,
  formatIndonesianDisplay,
} from '../../lib/dateUtils';

export interface DateTimePickerProps {
  label?: string;
  error?: string;
  value?: string | null; // "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD" or ISO string
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  required?: boolean;
  showTime?: boolean; // default: true
}

export const DateTimePicker = ({
  label,
  error,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  id,
  required = false,
  showTime = true,
}: DateTimePickerProps) => {
  const generatedId = useId();
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);

  // Parse initial value safely
  const parseValueToDate = (val?: string | null): Date | null => {
    if (!val) return null;
    try {
      const d = val.length === 10 ? new Date(`${val}T00:00:00`) : new Date(val);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const initialDate = parseValueToDate(value);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [viewMonth, setViewMonth] = useState<Date>(initialDate || new Date());
  const [hours, setHoursVal] = useState<string>(
    initialDate ? String(initialDate.getHours()).padStart(2, '0') : '23'
  );
  const [minutes, setMinutesVal] = useState<string>(
    initialDate ? String(initialDate.getMinutes()).padStart(2, '0') : '59'
  );
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);

  // Responsive and positioning states
  const [isMobile, setIsMobile] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
    placeAbove: boolean;
  } | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync state when external value changes
  useEffect(() => {
    const d = parseValueToDate(value);
    setSelectedDate(d);
    if (d) {
      setViewMonth(d);
      setHoursVal(String(d.getHours()).padStart(2, '0'));
      setMinutesVal(String(d.getMinutes()).padStart(2, '0'));
    }
  }, [value]);

  // Position calculation for desktop popover
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);

    if (mobile) {
      setPopoverPosition(null);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 310;
    const popoverHeight = showTime ? 420 : 330;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    let placeAbove = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

    // Constrain left position so it doesn't overflow the viewport
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - popoverWidth - 16);
    }

    let top = placeAbove ? rect.top - 8 : rect.bottom + 8;
    // Safety check: ensure popover stays within viewport boundaries
    if (!placeAbove && top + popoverHeight > window.innerHeight - 12) {
      if (spaceAbove >= popoverHeight) {
        placeAbove = true;
        top = rect.top - 8;
      } else {
        top = Math.max(12, window.innerHeight - popoverHeight - 12);
      }
    } else if (placeAbove && top - popoverHeight < 12) {
      top = Math.min(window.innerHeight - 12, popoverHeight + 12);
    }

    setPopoverPosition({
      top,
      left,
      placeAbove,
    });
  }, [showTime]);

  // Update position when opened, resized, or scrolled
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleReposition = () => updatePosition();
      window.addEventListener('resize', handleReposition);
      window.addEventListener('scroll', handleReposition, true);
      return () => {
        window.removeEventListener('resize', handleReposition);
        window.removeEventListener('scroll', handleReposition, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsMonthSelectOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Calendar dates computation (Monday start for Indonesian academic calendars)
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Format output string
  const formatOutput = (d: Date, h: string, m: string) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (!showTime) {
      return `${year}-${month}-${day}`;
    }
    return `${year}-${month}-${day}T${h}:${m}`;
  };

  const handleApply = (d?: Date | null, h?: string, m?: string) => {
    const targetDate = d !== undefined ? d : selectedDate;
    const targetHours = h !== undefined ? h : hours;
    const targetMinutes = m !== undefined ? m : minutes;

    if (!targetDate) {
      onChange('');
      setIsOpen(false);
      return;
    }

    const output = formatOutput(targetDate, targetHours, targetMinutes);
    onChange(output);
    setIsOpen(false);
    setIsMonthSelectOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
    setIsMonthSelectOpen(false);
  };

  // Quick Preset Actions
  const handlePreset = (type: 'today' | 'tomorrow' | '3days' | 'nextWeek') => {
    const now = new Date();
    let target = now;
    if (type === 'tomorrow') target = addDays(now, 1);
    if (type === '3days') target = addDays(now, 3);
    if (type === 'nextWeek') target = addDays(now, 7);

    setSelectedDate(target);
    setViewMonth(target);
    setHoursVal('23');
    setMinutesVal('59');
    handleApply(target, '23', '59');
  };

  const currentYear = viewMonth.getFullYear();
  const currentMonthIdx = viewMonth.getMonth();

  const prevMonth = () => {
    setViewMonth(subMonths(viewMonth, 1));
    setIsMonthSelectOpen(false);
  };

  const nextMonth = () => {
    setViewMonth(addMonths(viewMonth, 1));
    setIsMonthSelectOpen(false);
  };

  const displayPlaceholder =
    placeholder || (showTime ? 'Pilih tanggal & jam deadline...' : 'Pilih tanggal...');

  // RENDER POPUP CONTENT
  const calendarContent = (
    <div
      ref={popoverRef}
      className={`bg-white dark:bg-[#1A221A] text-gray-900 dark:text-gray-100
        border border-gray-200/90 dark:border-gray-700/80 shadow-2xl shadow-black/20
        ${
          isMobile
            ? 'w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-3.5 pb-6 space-y-2.5 max-h-[85vh] overflow-y-auto no-scrollbar'
            : 'w-[305px] rounded-2xl p-3 space-y-2.5 max-h-[calc(100vh-24px)] overflow-y-auto no-scrollbar'
        }`}
    >
      {/* Mobile drag handle indicator */}
      {isMobile && (
        <div className="w-9 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-1" />
      )}

      {/* Header bar on mobile */}
      {isMobile && (
        <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            {showTime ? 'Atur Tanggal & Jam Deadline' : 'Pilih Tanggal'}
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Presets Bar (Compact) */}
      {showTime && (
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10.5px]">
          <button
            type="button"
            onClick={() => handlePreset('today')}
            className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-[#EBF3E8] dark:hover:bg-[#253625] hover:text-[#2C4927] dark:hover:text-[#A8CEA0] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap transition-colors"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => handlePreset('tomorrow')}
            className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-[#EBF3E8] dark:hover:bg-[#253625] hover:text-[#2C4927] dark:hover:text-[#A8CEA0] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap transition-colors"
          >
            Besok
          </button>
          <button
            type="button"
            onClick={() => handlePreset('3days')}
            className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-[#EBF3E8] dark:hover:bg-[#253625] hover:text-[#2C4927] dark:hover:text-[#A8CEA0] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap transition-colors"
          >
            3 Hari
          </button>
          <button
            type="button"
            onClick={() => handlePreset('nextWeek')}
            className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-[#EBF3E8] dark:hover:bg-[#253625] hover:text-[#2C4927] dark:hover:text-[#A8CEA0] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap transition-colors"
          >
            Pekan Depan
          </button>
        </div>
      )}

      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
        <button
          type="button"
          onClick={prevMonth}
          title="Bulan sebelumnya"
          className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setIsMonthSelectOpen((prev) => !prev)}
          className="px-2 py-0.5 rounded-lg font-heading font-bold text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
        >
          <span>
            {MONTH_NAMES_ID[currentMonthIdx]} {currentYear}
          </span>
          <span className="text-[9px] text-gray-400">▼</span>
        </button>

        <button
          type="button"
          onClick={nextMonth}
          title="Bulan berikutnya"
          className="p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Month & Year Picker Overlay */}
      {isMonthSelectOpen ? (
        <div className="space-y-2 py-1">
          <div className="flex items-center justify-between text-[11px] px-1 text-gray-500 dark:text-gray-400">
            <span>Pilih Tahun:</span>
            <div className="flex items-center gap-1">
              {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setViewMonth(new Date(yr, currentMonthIdx, 1))}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    yr === currentYear
                      ? 'bg-[#7C9A76] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTH_NAMES_ID.map((mName, idx) => (
              <button
                key={mName}
                type="button"
                onClick={() => {
                  setViewMonth(new Date(currentYear, idx, 1));
                  setIsMonthSelectOpen(false);
                }}
                className={`py-1.5 px-1 text-[11px] rounded-lg font-medium transition-colors ${
                  idx === currentMonthIdx
                    ? 'bg-[#7C9A76] text-white font-bold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {MONTH_SHORT_ID[idx]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Day Headers (Sen, Sel, Rab, Kam, Jum, Sab, Min) */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {DAY_SHORT_ACADEMIC.map((dName, idx) => (
              <div
                key={dName}
                className={`text-[10px] font-semibold py-0.5 ${
                  idx >= 5
                    ? 'text-rose-500 dark:text-rose-400 font-bold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {dName}
              </div>
            ))}
          </div>

          {/* Calendar Days 7x5 Grid - Compact & Perfectly Proportioned */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((dayDate) => {
              const isCurrentMonth = isSameMonth(dayDate, viewMonth);
              const isDaySelected = selectedDate ? isSameDay(dayDate, selectedDate) : false;
              const isDayToday = isToday(dayDate);

              return (
                <button
                  key={dayDate.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(dayDate);
                    if (!isCurrentMonth) {
                      setViewMonth(dayDate);
                    }
                  }}
                  className={`h-7 w-full rounded-lg text-[11px] flex items-center justify-center font-medium transition-all relative
                    ${
                      isDaySelected
                        ? 'bg-[#7C9A76] text-white font-bold shadow-sm shadow-[#7C9A76]/30'
                        : isCurrentMonth
                        ? 'text-gray-800 dark:text-gray-100 hover:bg-[#EBF3E8] dark:hover:bg-[#253625]'
                        : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }
                    ${
                      isDayToday && !isDaySelected
                        ? 'ring-1 ring-[#7C9A76] dark:ring-[#7C9A76] font-bold text-[#7C9A76] dark:text-[#A7C8A0]'
                        : ''
                    }`}
                >
                  {format(dayDate, 'd')}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Time Picker Section (Pengaturan Jam Deadline WIB) - Compact Row */}
      {showTime && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#7C9A76]" />
              Waktu (WIB):
            </span>
            <span className="text-[#7C9A76] dark:text-[#A7C8A0] font-mono font-bold">
              {hours}:{minutes} WIB
            </span>
          </div>

          <div className="flex items-center justify-between gap-1.5 bg-gray-50 dark:bg-[#151C15] p-1.5 rounded-xl">
            {/* Hour & Minute Pickers */}
            <div className="flex items-center gap-1">
              <select
                value={hours}
                onChange={(e) => setHoursVal(e.target.value)}
                className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E271E] text-xs font-mono font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#7C9A76]"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const hStr = String(i).padStart(2, '0');
                  return (
                    <option key={hStr} value={hStr}>
                      {hStr}
                    </option>
                  );
                })}
              </select>

              <span className="text-xs font-bold text-gray-400">:</span>

              <select
                value={minutes}
                onChange={(e) => setMinutesVal(e.target.value)}
                className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E271E] text-xs font-mono font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#7C9A76]"
              >
                {Array.from({ length: 60 }).map((_, i) => {
                  const mStr = String(i).padStart(2, '0');
                  return (
                    <option key={mStr} value={mStr}>
                      {mStr}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Quick time shortcuts */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setHoursVal('23');
                  setMinutesVal('59');
                }}
                title="Batas Tengah Malam"
                className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-[#1E271E] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-[#7C9A76]"
              >
                23:59
              </button>
              <button
                type="button"
                onClick={() => {
                  setHoursVal('18');
                  setMinutesVal('00');
                }}
                title="Batas Sore"
                className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-[#1E271E] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-[#7C9A76]"
              >
                18:00
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-gray-800 text-xs">
        <button
          type="button"
          onClick={handleClear}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-[11px]"
        >
          Kosongkan
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-2.5 py-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[11px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => handleApply()}
            className="px-3 py-1 rounded-lg bg-[#7C9A76] hover:bg-[#627F5C] text-white font-medium shadow-sm transition-colors flex items-center gap-1 text-[11px]"
          >
            <Check className="w-3 h-3" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-1.5 w-full relative ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button Field */}
      <div
        ref={triggerRef}
        id={inputId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2 text-sm rounded-xl border transition-all duration-200 cursor-pointer select-none
          bg-white dark:bg-[#181F18]
          border-gray-200 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          hover:border-[#7C9A76] dark:hover:border-[#7C9A76]
          focus:outline-none focus:ring-2 focus:ring-[#7C9A76]/30 focus:border-[#7C9A76]
          ${isOpen ? 'ring-2 ring-[#7C9A76]/30 border-[#7C9A76]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}
          ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <CalendarIcon className="w-4 h-4 text-[#7C9A76] dark:text-[#A7C8A0] shrink-0" />
          {value ? (
            <span className="truncate font-medium text-gray-900 dark:text-gray-100">
              {formatIndonesianDisplay(value, showTime)}
            </span>
          ) : (
            <span className="truncate text-gray-400 dark:text-gray-500 font-normal">
              {displayPlaceholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Hapus tanggal"
              className="p-1 rounded-md hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {showTime ? (
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          ) : (
            <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>

      {/* PORTAL RENDERING - PREVENTS ANY CONTAINER OVERFLOW / CLIPPING */}
      {isOpen &&
        createPortal(
          isMobile ? (
            /* Mobile Bottom Sheet Modal */
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
              <div
                className="absolute inset-0"
                onClick={() => {
                  setIsOpen(false);
                  setIsMonthSelectOpen(false);
                }}
              />
              <div className="relative z-10 w-full flex justify-center animate-in slide-in-from-bottom duration-200">
                {calendarContent}
              </div>
            </div>
          ) : popoverPosition ? (
            /* Desktop Smart Positioned Popover */
            <div className="fixed inset-0 z-[9999]">
              {/* Invisible full-screen backdrop to handle click-outside */}
              <div
                className="fixed inset-0"
                onClick={() => {
                  setIsOpen(false);
                  setIsMonthSelectOpen(false);
                }}
              />
              <div
                style={{
                  position: 'fixed',
                  top: `${popoverPosition.top}px`,
                  left: `${popoverPosition.left}px`,
                  transform: popoverPosition.placeAbove ? 'translateY(-100%)' : 'none',
                }}
                className="relative z-10 animate-in fade-in zoom-in-95 duration-100"
              >
                {calendarContent}
              </div>
            </div>
          ) : null,
          document.body
        )}

      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default DateTimePicker;
