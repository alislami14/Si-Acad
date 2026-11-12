/**
/**
 * SI-Acad Theme Context
 * Mendukung mode:
 * 1. 'light' (Sage Green Daylight - Icon: Sun)
 * 2. 'dark' (Sage Green Dark Forest - Icon: Moon)
 * 3. 'flamingo' (Pink Flamingo Floral - Icon: Flower2)
 *
 * Pengguna dapat memilih TEPAT 2 mode prioritas yang akan bergantian
 * saat tombol toggle di bar atas (header) diklik.
 * Pengguna baru secara default selalu mendapatkan kombinasi ['light', 'dark'].
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'flamingo';

export interface ThemeOption {
  id: Theme;
  name: string;
  subtitle: string;
  iconName: 'Sun' | 'Moon' | 'Flower2';
  accentColor: string;
  bgPreview: string;
  badgeText: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    name: 'Sage Light',
    subtitle: 'Mode terang klasik bernuansa hijau sage yang menenangkan dan jernih',
    iconName: 'Sun',
    accentColor: '#7C9A76',
    bgPreview: '#FAFAF7',
    badgeText: 'Klasik',
  },
  {
    id: 'dark',
    name: 'Sage Dark',
    subtitle: 'Mode gelap akademik untuk kenyamanan membaca di malam hari tanpa silau',
    iconName: 'Moon',
    accentColor: '#A8C5A0',
    bgPreview: '#141814',
    badgeText: 'Malam',
  },
  {
    id: 'flamingo',
    name: 'Pink Flamingo',
    subtitle: 'Nuansa floral pink flamingo yang ceria, anggun, dengan aksen ikon bunga',
    iconName: 'Flower2',
    accentColor: '#E05A7B',
    bgPreview: '#FFF5F7',
    badgeText: 'Floral',
  },
];

interface ThemeContextType {
  theme: Theme;
  themePair: [Theme, Theme];
  setTheme: (theme: Theme) => void;
  setThemePair: (pair: [Theme, Theme]) => void;
  toggleTheme: () => void;
  isPairSelected: (t: Theme) => boolean;
  togglePairSelection: (t: Theme) => { success: boolean; message: string };
  getNextTheme: () => Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themePair: ['light', 'dark'],
  setTheme: () => {},
  setThemePair: () => {},
  toggleTheme: () => {},
  isPairSelected: () => false,
  togglePairSelection: () => ({ success: true, message: '' }),
  getNextTheme: () => 'dark',
});

export const useTheme = () => useContext(ThemeContext);

const PAIR_STORAGE_KEY = 'si-acad-theme-pair';
const ACTIVE_STORAGE_KEY = 'si-acad-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Inisialisasi 2 mode prioritas: default ['light', 'dark'] untuk pengguna baru
  const [themePair, setInternalThemePair] = useState<[Theme, Theme]>(() => {
    try {
      const savedPair = localStorage.getItem(PAIR_STORAGE_KEY);
      if (savedPair) {
        const parsed = JSON.parse(savedPair);
        if (
          Array.isArray(parsed) &&
          parsed.length === 2 &&
          ['light', 'dark', 'flamingo'].includes(parsed[0]) &&
          ['light', 'dark', 'flamingo'].includes(parsed[1]) &&
          parsed[0] !== parsed[1]
        ) {
          return [parsed[0] as Theme, parsed[1] as Theme];
        }
      }
    } catch (e) {
      console.warn('Gagal membaca theme pair dari localStorage, gunakan default:', e);
    }
    // Default wajib: ['light', 'dark']
    return ['light', 'dark'];
  });

  // Inisialisasi tema aktif: default 'light' jika belum ada pilihan tersimpan
  const [theme, setInternalTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem(ACTIVE_STORAGE_KEY) as Theme;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'flamingo') {
        return savedTheme;
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  // Terapkan class ke <html class="light|dark|flamingo">
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'flamingo');
    root.classList.add(theme);

    // Di tailwind, dark mode varian memerlukan class 'dark'
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(ACTIVE_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Gagal simpan theme ke localStorage:', e);
    }
  }, [theme]);

  // Simpan pair ke localStorage saat berubah
  useEffect(() => {
    try {
      localStorage.setItem(PAIR_STORAGE_KEY, JSON.stringify(themePair));
    } catch (e) {
      console.warn('Gagal simpan theme pair ke localStorage:', e);
    }
  }, [themePair]);

  // Fungsi mengubah tema aktif langsung
  const setTheme = (newTheme: Theme) => {
    setInternalTheme(newTheme);
  };

  // Fungsi mengganti 2 mode prioritas (harus tepat 2)
  const setThemePair = (newPair: [Theme, Theme]) => {
    if (newPair.length === 2 && newPair[0] !== newPair[1]) {
      setInternalThemePair(newPair);
      // Jika mode aktif saat ini tidak ada di pair yang baru, otomatis alihkan ke mode pertama di pair
      if (!newPair.includes(theme)) {
        setInternalTheme(newPair[0]);
      }
    }
  };

  // Cek apakah suatu tema ada di 2 mode prioritas
  const isPairSelected = (t: Theme) => {
    return themePair.includes(t);
  };

  // Helper cerdas untuk toggle pilihan mode di halaman Settings
  // Memastikan HANYA BISA MEMILIH TEPAT 2 MODE SAJA
  const togglePairSelection = (t: Theme): { success: boolean; message: string } => {
    if (themePair.includes(t)) {
      // Jika sudah terpilih dan user mencoba uncheck:
      // Karena harus ada 2 mode, user harus memilih mode pengganti
      return {
        success: false,
        message: 'Minimal harus ada 2 mode prioritas untuk tombol bilah atas. Silakan klik mode lain yang ingin Anda gunakan.',
      };
    }

    // Jika belum terpilih, masukkan t dan ganti mode yang kedua (atau yang sedang tidak aktif)
    // Supaya pengguna selalu memiliki tepat 2 mode
    const [mode1, mode2] = themePair;
    let nextPair: [Theme, Theme];

    // Pertahankan mode yang sedang aktif saat ini jika memungkinkan
    if (theme === mode1) {
      nextPair = [mode1, t];
    } else if (theme === mode2) {
      nextPair = [mode2, t];
    } else {
      nextPair = [mode1, t];
    }

    setThemePair(nextPair);
    return {
      success: true,
      message: `2 Mode Prioritas berhasil diatur: ${THEME_OPTIONS.find(o => o.id === nextPair[0])?.name} & ${THEME_OPTIONS.find(o => o.id === nextPair[1])?.name}.`,
    };
  };

  // Tentukan tema berikutnya saat tombol toggle di bar atas diklik
  const getNextTheme = (): Theme => {
    if (theme === themePair[0]) {
      return themePair[1];
    }
    return themePair[0];
  };

  // Toggle tema di bar atas (bergantian antara 2 mode prioritas yang dipilih pengguna)
  const toggleTheme = () => {
    const next = getNextTheme();
    setInternalTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themePair,
        setTheme,
        setThemePair,
        toggleTheme,
        isPairSelected,
        togglePairSelection,
        getNextTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
