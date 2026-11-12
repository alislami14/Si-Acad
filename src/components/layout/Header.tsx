import { Sun, Moon, Flower2, CalendarDays, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSemester } from '../../contexts/SemesterContext';
import { NotificationBell } from './NotificationBell';
import { Logo } from '../ui/Logo';

interface HeaderProps {
  onOpenCreateSemester?: () => void;
}

export const Header = ({ onOpenCreateSemester }: HeaderProps) => {
  const { theme, toggleTheme, getNextTheme } = useTheme();
  const { semesters, activeSemester, setActiveSemester } = useSemester();

  const nextTheme = getNextTheme();

  // Helper render ikon sesuai tema aktif saat ini
  const renderThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="w-5 h-5 text-sky-400 dark:text-sky-300 transition-transform duration-300 hover:rotate-12" />;
      case 'flamingo':
        return <Flower2 className="w-5 h-5 text-rose-500 transition-transform duration-300 hover:rotate-45 hover:scale-110" />;
      case 'light':
      default:
        return <Sun className="w-5 h-5 text-amber-500 transition-transform duration-300 hover:rotate-45" />;
    }
  };

  const getThemeLabel = () => {
    const nextName = nextTheme === 'dark' ? 'Sage Dark' : nextTheme === 'flamingo' ? 'Pink Flamingo' : 'Sage Light';
    const currentName = theme === 'dark' ? 'Sage Dark' : theme === 'flamingo' ? 'Pink Flamingo' : 'Sage Light';
    return `Mode aktif: ${currentName}. Klik untuk beralih ke ${nextName}`;
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 w-full items-center justify-between border-b border-gray-200/80 dark:border-gray-800/80 bg-[#FAFAF7]/90 dark:bg-[#141814]/90 backdrop-blur-md px-4 sm:px-6 pt-[env(safe-area-inset-top,0px)]">
      {/* Brand on mobile */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <Logo variant="icon" size="sm" className="w-9 h-9" />
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100 leading-tight">
            SI-Acad
          </h1>
          <p className="text-[10px] text-[#627F5C] dark:text-[#93AC91] font-medium leading-none mt-0.5">
            Academic Companion
          </p>
        </div>
      </div>

      {/* Semester Selector on Desktop/Tablet */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E251E] border border-gray-200 dark:border-gray-800 text-xs shadow-2xs">
          <CalendarDays className="w-3.5 h-3.5 text-[#7C9A76]" />
          <span className="text-gray-500 dark:text-gray-400">Semester:</span>
          {semesters.length > 0 ? (
            <div className="flex items-center gap-2">
              <select
                value={activeSemester?.id || ''}
                onChange={(e) => {
                  const found = semesters.find((s) => s.id === e.target.value);
                  if (found) setActiveSemester(found);
                }}
                className="bg-transparent font-medium text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer"
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id} className="dark:bg-[#1E251E]">
                    {s.name} {s.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onOpenCreateSemester}
                title="Tambah Semester Baru"
                className="text-[#7C9A76] hover:text-[#5B8A5B] p-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenCreateSemester}
              className="text-[#7C9A76] hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Buat Semester
            </button>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle button (bergantian antara 2 mode prioritas) */}
        <button
          onClick={toggleTheme}
          aria-label={getThemeLabel()}
          title={getThemeLabel()}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {renderThemeIcon()}
        </button>

        {/* Notifications */}
        <NotificationBell />
      </div>
    </header>
  );
};

export default Header;
