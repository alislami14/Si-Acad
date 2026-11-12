/**
 * SI-Acad Security & Privacy Utilities
 * Berisi helper keamanan, sanitasi input pengguna, dan perlindungan privasi data pribadi
 */

/**
 * Sanitasi string teks umum (judul tugas, catatan, nama kelompok)
 * Menghapus tag script berbahaya & karakter kontrol tak kasat mata
 */
export const sanitizeText = (input: string | null | undefined): string => {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '')
    .trim();
};

/**
 * Sanitasi username pendaftaran (hanya karakter aman: huruf kecil, angka, titik, strip, underscore)
 */
export const sanitizeUsername = (username: string): string => {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 30);
};

/**
 * Sensor/Masking email untuk perlindungan privasi data pribadi di tampilan publik/kelompok
 * Contoh: vinakhalillah124@gmail.com -> vi***@gmail.com
 */
export const maskEmail = (email?: string | null): string => {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`;
  }
  return `${local.slice(0, 2)}***@${domain}`;
};

/**
 * Validasi kekuatan password
 */
export const checkPasswordStrength = (
  password: string
): { isStrong: boolean; message: string; score: number } => {
  if (!password || password.length < 6) {
    return {
      isStrong: false,
      message: 'Password minimal 6 karakter.',
      score: 1,
    };
  }

  let score = 2;
  if (password.length >= 8) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 4) {
    return { isStrong: true, message: 'Password sangat kuat dan aman.', score };
  }
  return {
    isStrong: true,
    message: 'Password cukup baik (disarankan gabungan huruf & angka).',
    score,
  };
};

