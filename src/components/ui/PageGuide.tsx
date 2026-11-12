import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Info } from 'lucide-react';

export interface GuideStep {
  title: string;
  description: string;
}

export interface PageGuideProps {
  id: string; // ID unik untuk menyimpan status buka/tutup di localStorage
  title: string;
  description: string;
  steps: GuideStep[];
  tip?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export const PageGuide = ({
  id,
  title,
  description,
  steps = [],
  tip,
  defaultExpanded = false,
  className = '',
}: PageGuideProps) => {
  const storageKey = `siacad_guide_expanded_${id}`;
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
    return defaultExpanded;
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // Abaikan
      }
      return next;
    });
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden
        bg-white dark:bg-[#1A221A]
        border-gray-200/90 dark:border-gray-800
        shadow-xs ${className}`}
    >
      {/* Header Bar / Toggle Button */}
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50/80 dark:hover:bg-[#202920] transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#EBF3E8] dark:bg-[#253625] text-[#7C9A76] dark:text-[#A8CEA0] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-heading font-bold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h4>
            {!isExpanded && (
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-[#7C9A76] dark:text-[#A8CEA0]">
          <span className="hidden sm:inline text-[11px]">
            {isExpanded ? 'Tutup Panduan' : 'Petunjuk Fitur'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded Content Panel */}
      {isExpanded && (
        <div className="px-3.5 sm:px-5 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800/80 space-y-3.5 animate-in fade-in duration-200">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>

          {/* Steps / Features Grid */}
          {steps.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-3 rounded-xl bg-gray-50/80 dark:bg-[#151C15] border border-gray-100 dark:border-gray-800/60 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-lg bg-[#7C9A76] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-heading font-bold text-gray-900 dark:text-gray-100">
                      {step.title}
                    </h5>
                    <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Optional Tip Box */}
          {tip && (
            <div className="p-2.5 rounded-xl bg-[#EBF3E8]/60 dark:bg-[#1E281E]/60 border border-[#B2C5B0]/40 dark:border-[#7C9A76]/20 flex items-start gap-2 text-xs text-[#2C4927] dark:text-[#A8CEA0]">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#7C9A76]" />
              <div className="min-w-0 flex-1 leading-relaxed">
                <span className="font-bold">Tips Penggunaan: </span>
                <span>{tip}</span>
              </div>
            </div>
          )}

          {/* Quick Footer */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={toggleExpand}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              Tutup Petunjuk ▲
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageGuide;

