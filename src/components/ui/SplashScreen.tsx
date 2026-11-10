import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // default 2000ms (2 detik)
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 2000,
}) => {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Mulai animasi fade-out 350ms sebelum durasi total selesai
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, Math.max(500, duration - 350));

    // Hapus total dari DOM tepat di akhir durasi (2000ms)
    const endTimer = setTimeout(() => {
      setMounted(false);
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [duration, onComplete]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFAF7] dark:bg-[#141814] select-none transition-opacity duration-300 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {/* Background Ambient Glow */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#7C9A76]/10 dark:bg-[#7C9A76]/15 blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Container */}
      <div className="flex flex-col items-center justify-center px-4 text-center">
        {/* Logo SI-Acad (Tanpa Latar Putih / Transparan, otomatis menyesuaikan Light & Dark Mode) */}
        <div className="transform transition-all duration-700 ease-out animate-in fade-in zoom-in-90">
          <Logo variant="full" size="xl" className="w-56 h-auto sm:w-64" alt="SI-Acad Logo" />
        </div>

        {/* Minimal Progress Bar (Indikator 2 Detik yang Halus) */}
        <div className="mt-8 w-36 h-1 bg-gray-200 dark:bg-[#252E25] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7C9A76] rounded-full transition-all duration-2000 ease-linear"
            style={{
              width: '100%',
              animation: `progress-fill ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            }}
          />
        </div>

        {/* Tagline */}
        <p className="mt-3 text-xs tracking-wider uppercase font-medium text-[#627F5C] dark:text-[#93AC91] opacity-80">
          Academic Companion
        </p>
      </div>

      <style>{`
        @keyframes progress-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

