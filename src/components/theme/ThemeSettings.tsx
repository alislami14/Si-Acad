import { useState } from 'react';
import { Sun, Moon, Flower2, Check, ArrowLeftRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme, THEME_OPTIONS, Theme } from '../../contexts/ThemeContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const ThemeSettings = () => {
  const {
    theme,
    themePair,
    setTheme,
    togglePairSelection,
    setThemePair,
  } = useTheme();

  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  const getThemeIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Moon':
        return <Moon className={className} />;
      case 'Flower2':
        return <Flower2 className={className} />;
      case 'Sun':
      default:
        return <Sun className={className} />;
    }
  };

  const handleSelectPair = (selectedTheme: Theme) => {
    // Jika tema sudah ada di dalam pair
    if (themePair.includes(selectedTheme)) {
      setFeedback({
        type: 'warning',
        text: `Mode ${THEME_OPTIONS.find(o => o.id === selectedTheme)?.name} sudah terdaftar dalam 2 Mode Prioritas bar atas.`,
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    // Jika belum ada di pair, ganti mode yang sedang tidak aktif di pair
    const [mode1, mode2] = themePair;
    let newPair: [Theme, Theme];

    if (theme === mode1) {
      newPair = [mode1, selectedTheme];
    } else if (theme === mode2) {
      newPair = [mode2, selectedTheme];
    } else {
      newPair = [mode1, selectedTheme];
    }

    setThemePair(newPair);
    setFeedback({
      type: 'success',
      text: `2 Mode Prioritas berhasil diperbarui: ${THEME_OPTIONS.find(o => o.id === newPair[0])?.name} & ${THEME_OPTIONS.find(o => o.id === newPair[1])?.name}.`,
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDirectApply = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    setFeedback({
      type: 'success',
      text: `Tampilan web berhasil diubah ke mode ${THEME_OPTIONS.find(o => o.id === selectedTheme)?.name}.`,
    });
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Alert Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 transition-all animate-in fade-in duration-300 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          )}
          <span className="font-medium">{feedback.text}</span>
        </div>
      )}

      {/* Info Status Prioritas Bar Atas */}
      <Card padding="md" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C9A76]" />
              Pengaturan 2 Mode Prioritas Bar Atas
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tombol cepat di bilah navigasi atas (semua halaman) akan beralih hanya di antara 2 mode pilihan Anda.
            </p>
          </div>

          {/* Current Pair Display */}
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#1A221A] border border-gray-200 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Bilah Atas:</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
              <span className="flex items-center gap-1 text-[#7C9A76]">
                {getThemeIcon(THEME_OPTIONS.find(o => o.id === themePair[0])?.iconName || 'Sun', 'w-3.5 h-3.5')}
                {THEME_OPTIONS.find(o => o.id === themePair[0])?.name}
              </span>
              <ArrowLeftRight className="w-3 h-3 text-gray-400" />
              <span className="flex items-center gap-1 text-[#E05A7B]">
                {getThemeIcon(THEME_OPTIONS.find(o => o.id === themePair[1])?.iconName || 'Flower2', 'w-3.5 h-3.5')}
                {THEME_OPTIONS.find(o => o.id === themePair[1])?.name}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#627F5C] dark:text-[#93AC91] leading-relaxed">
          &bull; <strong>Aturan 2 Mode:</strong> Anda hanya dapat menentukan <strong>tepat 2 mode</strong> untuk tombol bilah atas agar navigasi tetap cepat dan praktis. Pilihan Anda disimpan secara permanen di browser dan tidak akan hilang saat logout atau refresh.
        </p>
      </Card>

      {/* Grid 3 Pilihan Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {THEME_OPTIONS.map((opt) => {
          const isSelectedInPair = themePair.includes(opt.id);
          const isCurrentlyActive = theme === opt.id;

          return (
            <div
              key={opt.id}
              className={`relative rounded-2xl border p-4.5 flex flex-col justify-between transition-all duration-200 ${
                isSelectedInPair
                  ? 'bg-white dark:bg-[#182018] border-[#7C9A76] shadow-sm ring-1 ring-[#7C9A76]/30'
                  : 'bg-white/60 dark:bg-[#151A15] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header Card: Icon, Name & Badges */}
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: opt.accentColor }}
                  >
                    {getThemeIcon(opt.iconName, 'w-5 h-5')}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isCurrentlyActive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif
                      </span>
                    )}
                    {isSelectedInPair && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#7C9A76]/15 text-[#4D6449] dark:text-[#A8C5A0] border border-[#7C9A76]/30">
                        <Check className="w-3 h-3 text-[#7C9A76]" />
                        Prioritas ({themePair.indexOf(opt.id) + 1}/2)
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & Subtitle */}
                <div>
                  <h4 className="font-heading font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    {opt.name}
                    {opt.id === 'flamingo' && <span className="text-sm">🌸</span>}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {opt.subtitle}
                  </p>
                </div>

                {/* Color Palette Preview Strip */}
                <div className="pt-2 flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-md border border-gray-200 dark:border-gray-700 shadow-2xs"
                    style={{ backgroundColor: opt.bgPreview }}
                    title={`Background: ${opt.bgPreview}`}
                  />
                  <div
                    className="w-5 h-5 rounded-md shadow-2xs"
                    style={{ backgroundColor: opt.accentColor }}
                    title={`Aksen: ${opt.accentColor}`}
                  />
                  <span className="text-[10px] font-mono text-gray-400 ml-1">
                    {opt.accentColor}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPair(opt.id)}
                  disabled={isSelectedInPair}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                    isSelectedInPair
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default'
                      : 'bg-[#7C9A76] hover:bg-[#627F5C] text-white shadow-2xs active:scale-95'
                  }`}
                >
                  {isSelectedInPair ? '✓ Sudah Terpilih' : 'Jadikan 2 Prioritas'}
                </button>

                {!isCurrentlyActive && (
                  <button
                    type="button"
                    onClick={() => handleDirectApply(opt.id)}
                    title="Ubah tampilan ke mode ini sekarang"
                    className="py-1.5 px-2.5 rounded-xl text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                  >
                    Terapkan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSettings;

