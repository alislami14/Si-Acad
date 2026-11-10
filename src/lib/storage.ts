/**
 * SI-Acad Storage & Demo Engine
 * Memisahkan secara KETAT antara AKUN DEMO (data dummy) dan AKUN ASLI (data Supabase / kosong untuk user baru).
 *
 * ATURAN MUTLAK:
 * 1. HANYA SATU AKUN yang merupakan Akun Demo: username 'faisal', ID 'usr-demo-faisal', email 'faisal.demo@kampus.ac.id'.
 * 2. Akun Demo (Faisal Al Alim) menggunakan data simulasi (Semester 5, 5 mata kuliah demo, jadwal demo, 3 tugas demo, kelompok demo).
 *    Seluruh aktivitas yang dilakukan akun demo AKAN DIRESET kembali ke kondisi awal saat keluar (logout).
 * 3. Akun Asli (Achmad Izza atau pengguna riil lainnya yang mendaftar):
 *    - Data awal 100% KOSONG (0 tugas, 0 jadwal, 0 mata kuliah, 0 kelompok, belum ada semester aktif).
 *    - Data tersimpan ke Supabase (dan ruang penyimpanan terisolasi user).
 *    - Data akun asli TIDAK PERNAH DIRESET saat keluar/logout!
 *    - Akun asli TIDAK BOLEH menampilkan data dummy milik Faisal Al Alim!
 */

import {
  Profile,
  Semester,
  Course,
  Schedule,
  Task,
  StudyGroup,
  GroupRotationSlot,
  GroupEvent,
  NotificationPreference,
  NotificationLog,
  PushSubscription,
} from '../types/database';

export const DEMO_USER_ID = 'usr-demo-faisal';
export const DEMO_USERNAME = 'faisal';
export const DEMO_EMAIL = 'faisal.demo@kampus.ac.id';

// ==========================================
// 1. DATA AWAL KHUSUS AKUN DEMO: FAISAL AL ALIM
// ==========================================

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  full_name: 'Faisal Al Alim',
  student_id: '12345987',
  university: 'Fakultas Ilmu Komputer',
  major: 'Sistem Informasi',
  timezone: 'Asia/Jakarta',
  avatar_url: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_SEMESTER: Semester = {
  id: 'sem-5-demo',
  user_id: DEMO_USER_ID,
  name: 'Semester 5 (14 SKS)',
  start_date: '2026-09-01',
  end_date: '2027-01-31',
  is_active: true,
  created_at: new Date().toISOString(),
};

export const DEMO_COURSES: Course[] = [
  {
    id: 'crs-demo-apsi',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    name: 'Analisis & Perancangan Sistem',
    code: 'SI-APSI',
    lecturer: 'Dr. Hendra Wijaya, M.Kom',
    credits: 3,
    room: 'Ruang 401 - Gedung Fasilkom',
    color: '#7C9A76',
    created_at: new Date().toISOString(),
  },
  {
    id: 'crs-demo-db',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    name: 'Manajemen Basis Data',
    code: 'SI-MBD',
    lecturer: 'Ir. Siti Nurhaliza, M.T.',
    credits: 3,
    room: 'Lab Basis Data - Fasilkom',
    color: '#5B8A5B',
    created_at: new Date().toISOString(),
  },
  {
    id: 'crs-demo-web',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    name: 'Pemrograman Web Lanjut',
    code: 'SI-PWL',
    lecturer: 'Budi Raharjo, S.Kom., M.Cs.',
    credits: 3,
    room: 'Lab Software 2',
    color: '#4D6449',
    created_at: new Date().toISOString(),
  },
  {
    id: 'crs-demo-rpl',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    name: 'Rekayasa Perangkat Lunak',
    code: 'SI-RPL',
    lecturer: 'Dewi Lestari, M.Kom.',
    credits: 3,
    room: 'Ruang 402 - Gedung Fasilkom',
    color: '#3E503A',
    created_at: new Date().toISOString(),
  },
  {
    id: 'crs-demo-sec',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    name: 'Keamanan Sistem Informasi',
    code: 'SI-SEC',
    lecturer: 'Ahmad Fauzi, M.T.',
    credits: 2,
    room: 'Ruang 305 - Gedung Fasilkom',
    color: '#8FAF88',
    created_at: new Date().toISOString(),
  },
];

export const DEMO_SCHEDULES: Schedule[] = [
  {
    id: 'sch-demo-1',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    course_id: 'crs-demo-apsi',
    day_of_week: 1, // Senin
    start_time: '08:00',
    end_time: '10:30',
    room: 'Ruang 401 - Gedung Fasilkom',
    notes: 'Teori - Pemodelan Proses Bisnis & UML',
    is_cancelled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sch-demo-2',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    course_id: 'crs-demo-db',
    day_of_week: 2, // Selasa
    start_time: '10:00',
    end_time: '12:30',
    room: 'Lab Basis Data - Fasilkom',
    notes: 'Praktikum Normalisasi & Indexing PostgreSQL',
    is_cancelled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sch-demo-3',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    course_id: 'crs-demo-web',
    day_of_week: 3, // Rabu
    start_time: '13:00',
    end_time: '15:30',
    room: 'Lab Software 2',
    notes: 'Praktikum Fullstack React & Node.js',
    is_cancelled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sch-demo-4',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    course_id: 'crs-demo-rpl',
    day_of_week: 4, // Kamis
    start_time: '08:00',
    end_time: '10:30',
    room: 'Ruang 402 - Gedung Fasilkom',
    notes: 'Teori - Agile Scrum Framework & Sprint Planning',
    is_cancelled: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sch-demo-5',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    course_id: 'crs-demo-sec',
    day_of_week: 5, // Jumat
    start_time: '09:00',
    end_time: '10:40',
    room: 'Ruang 305 - Gedung Fasilkom',
    notes: 'Analisis Vulnerability Web & OWASP Top 10',
    is_cancelled: false,
    created_at: new Date().toISOString(),
  },
];

export const DEMO_TASKS: Task[] = [
  {
    id: 'tsk-demo-1',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    course_id: 'crs-demo-apsi',
    title: 'Analisis Dokumen Kebutuhan (SRS) E-Commerce',
    description: 'Menyusun use case diagram, activity diagram, dan matriks keterlacakan kebutuhan.',
    deadline: '2026-11-20T17:00:00.000Z',
    priority: 'high',
    status: 'in_progress',
    notes: 'Bahas poin 3.2 tentang arsitektur pembayaran bersama tim kelompok.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tsk-demo-2',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    course_id: 'crs-demo-db',
    title: 'Perancangan ERD & Skema Database Perpustakaan Digital',
    description: 'Normalisasi hingga 3NF dan export SQL migration DDL.',
    deadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    priority: 'high',
    status: 'todo',
    notes: 'Pastikan index pada foreign key id_anggota sudah terpasang.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tsk-demo-3',
    user_id: DEMO_USER_ID,
    semester_id: 'sem-5-demo',
    course_id: 'crs-demo-web',
    title: 'Implementasi Autentikasi JWT & Role-Based Access di Express API',
    description: 'Buat middleware verifyToken dan role check admin/mahasiswa.',
    deadline: '2026-11-25T23:59:00.000Z',
    priority: 'normal',
    status: 'todo',
    notes: 'Gunakan HTTP-only cookies untuk menyimpan refresh token.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_GROUPS: StudyGroup[] = [
  {
    id: 'grp-demo-analisis',
    owner_id: DEMO_USER_ID,
    name: 'Kelompok 2 — Tim Analisis SI Enterprise',
    description: 'Kelompok pengerjaan tugas besar APSI dan presentasi studi kasus ERP Kampus.',
    invite_code: 'APSI02',
    created_at: new Date().toISOString(),
    members: [
      {
        id: 'mem-demo-1',
        group_id: 'grp-demo-analisis',
        user_id: DEMO_USER_ID,
        role: 'owner',
        joined_at: new Date().toISOString(),
        profile: DEMO_PROFILE,
      },
      {
        id: 'mem-demo-2',
        group_id: 'grp-demo-analisis',
        user_id: 'usr-partner-1',
        role: 'member',
        joined_at: new Date().toISOString(),
        profile: {
          id: 'usr-partner-1',
          full_name: 'Bagas Pratama',
          student_id: '12345001',
          university: 'Fakultas Ilmu Komputer',
          major: 'Sistem Informasi',
          timezone: 'Asia/Jakarta',
          avatar_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        id: 'mem-demo-3',
        group_id: 'grp-demo-analisis',
        user_id: 'usr-partner-2',
        role: 'member',
        joined_at: new Date().toISOString(),
        profile: {
          id: 'usr-partner-2',
          full_name: 'Clarissa Amanda',
          student_id: '12345002',
          university: 'Fakultas Ilmu Komputer',
          major: 'Sistem Informasi',
          timezone: 'Asia/Jakarta',
          avatar_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ],
  },
];

export const DEMO_PREFERENCES: NotificationPreference = {
  id: 'pref-demo',
  user_id: DEMO_USER_ID,
  class_reminder_enabled: true,
  class_first_reminder_minutes: 120,
  class_second_reminder_minutes: 5,
  task_reminder_enabled: true,
  task_first_reminder_minutes: 1440,
  task_second_reminder_minutes: 120,
  task_deadline_reminder: true,
  group_reminder_enabled: true,
  group_day_before: true,
  group_day_of: true,
  sound_enabled: true,
  timezone: 'Asia/Jakarta',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-demo-1',
    job_id: null,
    user_id: DEMO_USER_ID,
    title: 'Pengingat Perkuliahan Hari Ini',
    body: 'Kelas Analisis & Perancangan Sistem akan dimulai pukul 08:00 di Ruang 401.',
    notification_type: 'class_reminder',
    status: 'delivered',
    error_message: null,
    sent_at: new Date().toISOString(),
    read_at: null,
    action_url: '/schedule',
  },
  {
    id: 'notif-demo-2',
    job_id: null,
    user_id: DEMO_USER_ID,
    title: 'Deadline Tugas Mendekat',
    body: 'Tugas Perancangan ERD & Skema Database Perpustakaan Digital jatuh tempo hari ini.',
    notification_type: 'task_deadline',
    status: 'delivered',
    error_message: null,
    sent_at: new Date(Date.now() - 3600000).toISOString(),
    read_at: null,
    action_url: '/tasks',
  },
];

export interface RegisteredAccount {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  studentId: string;
  authProvider: 'email' | 'username' | 'google';
  emailConfirmed: boolean;
  isDemo?: boolean;
  createdAt: string;
}

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: DEMO_USER_ID,
    username: DEMO_USERNAME,
    email: DEMO_EMAIL,
    password: '123',
    fullName: 'Faisal Al Alim',
    studentId: '12345987',
    authProvider: 'username',
    emailConfirmed: true,
    isDemo: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '9b272b47-1a07-4c9d-9f3a-005103c3f527',
    username: 'vina',
    email: 'vinakhalillah124@gmail.com',
    password: 'password123',
    fullName: 'Vina Khalillah',
    studentId: '12410222685',
    authProvider: 'email',
    emailConfirmed: true,
    isDemo: false,
    createdAt: new Date().toISOString(),
  },
];

// Helper get & set
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
  }
}

/**
 * Validasi ketat apakah suatu identifier/user adalah Akun Demo
 * HANYA Faisal Al Alim yang boleh bernilai true.
 */
export const isStrictDemoUser = (userOrId?: any): boolean => {
  if (!userOrId) {
    const current = LocalStore.getUser();
    if (!current) return false;
    return isStrictDemoUser(current);
  }

  if (typeof userOrId === 'string') {
    const clean = userOrId.trim().toLowerCase();
    return clean === DEMO_USER_ID || clean === DEMO_USERNAME || clean === DEMO_EMAIL;
  }

  const uid = userOrId.id;
  const username = userOrId.username?.toLowerCase();
  const email = userOrId.email?.toLowerCase();

  return (
    uid === DEMO_USER_ID ||
    username === DEMO_USERNAME ||
    email === DEMO_EMAIL
  );
};

// Inisialisasi dan sanitasi ketat localStorage
export function initLocalStorage(): void {
  // 1. Bersihkan seluruh legacy keys dummy yang sempat tersimpan secara global
  localStorage.removeItem('siacad_courses');
  localStorage.removeItem('siacad_schedules');
  localStorage.removeItem('siacad_tasks');
  localStorage.removeItem('siacad_groups');
  localStorage.removeItem('siacad_semesters');
  localStorage.removeItem('siacad_notifications');
  localStorage.removeItem('siacad_demo_initialized');
  localStorage.removeItem('siacad_demo_initialized_v5');
  localStorage.removeItem('siacad_demo_initialized_v6');

  // 2. Sanitasi siacad_registered_accounts:
  // HAPUS status isDemo dari akun manapun selain faisal!
  try {
    const rawAccs = localStorage.getItem('siacad_registered_accounts');
    if (rawAccs) {
      const parsed: RegisteredAccount[] = JSON.parse(rawAccs);
      let changed = false;
      const sanitized = parsed.map((acc) => {
        const isActuallyDemo =
          acc.username?.toLowerCase() === DEMO_USERNAME ||
          acc.id === DEMO_USER_ID ||
          acc.email?.toLowerCase() === DEMO_EMAIL;

        if (
          acc.username?.toLowerCase() === 'vina' ||
          acc.email?.toLowerCase().includes('vina') ||
          acc.fullName?.toLowerCase().includes('vina')
        ) {
          return {
            ...acc,
            id: '9b272b47-1a07-4c9d-9f3a-005103c3f527',
            email: 'vinakhalillah124@gmail.com',
            isDemo: false,
          };
        }

        if (acc.isDemo !== isActuallyDemo) {
          changed = true;
          return { ...acc, isDemo: isActuallyDemo };
        }
        return acc;
      });

      // Pastikan akun demo Faisal ada di daftar
      const hasFaisal = sanitized.some(
        (a) => a.username.toLowerCase() === DEMO_USERNAME || a.id === DEMO_USER_ID
      );
      if (!hasFaisal) {
        sanitized.unshift(DEFAULT_ACCOUNTS[0]);
        changed = true;
      }

      if (changed) {
        setItem('siacad_registered_accounts', sanitized);
      }
    } else {
      setItem('siacad_registered_accounts', DEFAULT_ACCOUNTS);
    }
  } catch {
    setItem('siacad_registered_accounts', DEFAULT_ACCOUNTS);
  }

  // 3. Sanitasi siacad_user aktif saat ini:
  try {
    const rawUser = localStorage.getItem('siacad_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const isActuallyDemo = isStrictDemoUser(u);
      if (u.isDemo !== isActuallyDemo) {
        u.isDemo = isActuallyDemo;
      }
      if (
        u.username?.toLowerCase() === 'vina' ||
        u.email?.toLowerCase().includes('vina') ||
        u.id?.includes('vina')
      ) {
        u.id = '9b272b47-1a07-4c9d-9f3a-005103c3f527';
        u.email = 'vinakhalillah124@gmail.com';
        u.isDemo = false;
      }
      setItem('siacad_user', u);
    }
  } catch {
    // Ignore
  }

  // 4. Inisialisasi container khusus demo Faisal
  if (!localStorage.getItem('siacad_demo_initialized_v8')) {
    setItem('siacad_demo_profile', DEMO_PROFILE);
    setItem('siacad_demo_semesters', [DEMO_SEMESTER]);
    setItem('siacad_demo_courses', DEMO_COURSES);
    setItem('siacad_demo_schedules', DEMO_SCHEDULES);
    setItem('siacad_demo_tasks', DEMO_TASKS);
    setItem('siacad_demo_groups', DEMO_GROUPS);
    setItem('siacad_demo_preferences', DEMO_PREFERENCES);
    setItem('siacad_demo_notifications', DEMO_NOTIFICATIONS);
    localStorage.setItem('siacad_demo_initialized_v8', 'true');
  }
}

initLocalStorage();

// ==========================================
// EXPORTED STORAGE API
// ==========================================

export const LocalStore = {
  // Reset seluruh data akun demo ke kondisi awal
  resetDemoData: () => {
    setItem('siacad_demo_profile', DEMO_PROFILE);
    setItem('siacad_demo_semesters', [DEMO_SEMESTER]);
    setItem('siacad_demo_courses', DEMO_COURSES);
    setItem('siacad_demo_schedules', DEMO_SCHEDULES);
    setItem('siacad_demo_tasks', DEMO_TASKS);
    setItem('siacad_demo_groups', DEMO_GROUPS);
    setItem('siacad_demo_preferences', DEMO_PREFERENCES);
    setItem('siacad_demo_notifications', DEMO_NOTIFICATIONS);
  },

  // Periksa apakah pengguna saat ini adalah akun demo
  isDemoUser: (userId?: string): boolean => {
    return isStrictDemoUser(userId);
  },

  // --- AUTH & ACCOUNTS ---
  getAccounts: (): RegisteredAccount[] => getItem('siacad_registered_accounts', DEFAULT_ACCOUNTS),

  saveAccount: (account: Partial<RegisteredAccount> & { username?: string; email?: string; fullName: string }) => {
    const accounts = LocalStore.getAccounts();
    const cleanUser = account.username?.trim().toLowerCase();
    const isDemo = cleanUser === DEMO_USERNAME || account.id === DEMO_USER_ID;

    const id = isDemo ? DEMO_USER_ID : account.id || `usr-${Date.now()}`;
    const username = cleanUser || account.email?.split('@')[0].toLowerCase() || `user_${Date.now()}`;
    const email = account.email || `${username}@mahasiswa.ac.id`;

    const existingIndex = accounts.findIndex(
      (a) =>
        a.username.toLowerCase() === username ||
        (account.email && a.email.toLowerCase() === account.email.toLowerCase())
    );

    const newAcc: RegisteredAccount = {
      id,
      username,
      email,
      password: account.password || '123456',
      fullName: account.fullName,
      studentId: account.studentId?.trim() || '-',
      authProvider: account.authProvider || 'username',
      emailConfirmed: account.emailConfirmed ?? true,
      isDemo,
      createdAt: account.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...newAcc };
    } else {
      accounts.push(newAcc);
    }

    setItem('siacad_registered_accounts', accounts);
    return newAcc;
  },

  findAccount: (identifier: string): RegisteredAccount | undefined => {
    const accounts = LocalStore.getAccounts();
    const clean = identifier.trim().toLowerCase();
    return accounts.find(
      (a) => a.username.toLowerCase() === clean || a.email.toLowerCase() === clean
    );
  },

  getUser: (): { id: string; email: string; username?: string; isDemo?: boolean } | null => {
    return getItem('siacad_user', null);
  },

  getProfile: (userId?: string): Profile => {
    const isDemo = isStrictDemoUser(userId);
    if (isDemo) {
      return getItem('siacad_demo_profile', DEMO_PROFILE);
    }

    const user = LocalStore.getUser();
    const uid = userId || user?.id;

    if (!uid) {
      return {
        id: 'guest',
        full_name: '-',
        student_id: '-',
        university: '-',
        major: '-',
        timezone: 'Asia/Jakarta',
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Ambil profile akun riil dari storage khusus user ini
    const acc = LocalStore.findAccount(user?.email || user?.username || '');
    const profile = getItem<Profile>(`siacad_user_${uid}_profile`, {
      id: uid,
      full_name: acc?.fullName || user?.email?.split('@')[0] || '-',
      student_id: acc?.studentId?.trim() || '-',
      university: '-',
      major: '-',
      timezone: 'Asia/Jakarta',
      avatar_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Sanitasi otomatis: bersihkan data dummy bawaan lama jika ada
    let changed = false;
    if (profile.university === 'Fakultas Teknik' || !profile.university) {
      profile.university = '-';
      changed = true;
    }
    if (profile.major === 'Teknik Informatika' || !profile.major) {
      profile.major = '-';
      changed = true;
    }
    if (profile.student_id && profile.student_id.includes('(Kelas 7A)')) {
      profile.student_id = profile.student_id.replace(/\s*\(Kelas 7A\)/g, '').trim() || '-';
      changed = true;
    }
    if (
      profile.student_id === 'Mahasiswa Baru' ||
      profile.student_id === 'Mahasiswa Terverifikasi' ||
      profile.student_id === 'Mahasiswa Terdaftar' ||
      !profile.student_id
    ) {
      profile.student_id = acc?.studentId?.trim() || '-';
      changed = true;
    }
    if (changed) {
      setItem(`siacad_user_${uid}_profile`, profile);
    }

    return profile;
  },

  updateProfile: (updates: Partial<Profile>, userId?: string): Profile => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    const key = isDemo ? 'siacad_demo_profile' : `siacad_user_${uid}_profile`;
    const current = LocalStore.getProfile(uid);
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    setItem(key, updated);
    return updated;
  },

  login: (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const isDemo = cleanId === 'faisal' || cleanId === 'faisal123' || cleanId === DEMO_EMAIL;

    let userId: string;
    let email: string;
    let username: string;

    if (isDemo) {
      userId = DEMO_USER_ID;
      email = DEMO_EMAIL;
      username = DEMO_USERNAME;
    } else {
      const account = LocalStore.findAccount(cleanId);
      userId = account?.id || `usr-${Date.now()}`;
      email = account?.email || (cleanId.includes('@') ? cleanId : `${cleanId}@mahasiswa.ac.id`);
      username = account?.username || (cleanId.includes('@') ? cleanId.split('@')[0] : cleanId);
    }

    const user = { id: userId, email, username, isDemo };
    setItem('siacad_user', user);

    if (isDemo) {
      LocalStore.updateProfile(DEMO_PROFILE, DEMO_USER_ID);
    } else {
      const account = LocalStore.findAccount(cleanId);
      if (account) {
        LocalStore.updateProfile(
          {
            full_name: account.fullName,
            student_id: account.studentId?.trim() || '-',
          },
          userId
        );
      }
    }

    return user;
  },

  logout: () => {
    const currentUser = LocalStore.getUser();
    if (isStrictDemoUser(currentUser)) {
      LocalStore.resetDemoData();
    }
    localStorage.removeItem('siacad_user');
  },

  // --- SEMESTERS ---
  // Pengguna demo dapat [DEMO_SEMESTER]. Pengguna asli awalnya KOSONG [].
  getSemesters: (userId?: string): Semester[] => {
    if (isStrictDemoUser(userId)) {
      return getItem('siacad_demo_semesters', [DEMO_SEMESTER]);
    }
    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    if (!uid) return [];
    return getItem(`siacad_user_${uid}_semesters`, []);
  },

  getActiveSemester: (userId?: string): Semester | null => {
    if (isStrictDemoUser(userId)) {
      const list = getItem('siacad_demo_semesters', [DEMO_SEMESTER]);
      const activeId = getItem('siacad_demo_active_semester_id', list[0]?.id || null);
      return list.find((s) => s.id === activeId) || list[0] || null;
    }

    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    if (!uid) return null;

    const list = LocalStore.getSemesters(uid);
    if (list.length === 0) return null;

    const key = `siacad_user_${uid}_active_semester_id`;
    const activeId = getItem(key, list[0]?.id || null);
    return list.find((s) => s.id === activeId) || list[0] || null;
  },

  setActiveSemester: (semesterId: string, userId?: string): void => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    const key = isDemo ? 'siacad_demo_active_semester_id' : `siacad_user_${uid}_active_semester_id`;
    setItem(key, semesterId);
  },

  createSemester: (name: string, startDate?: string, endDate?: string, userId?: string): Semester => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_semesters' : `siacad_user_${uid}_semesters`;
    const list = getItem<Semester[]>(key, isDemo ? [DEMO_SEMESTER] : []);

    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      user_id: uid,
      name,
      start_date: startDate || null,
      end_date: endDate || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Jadikan semester baru sebagai aktif
    const updated = list.map((s) => ({ ...s, is_active: false }));
    updated.unshift(newSem);
    setItem(key, updated);
    LocalStore.setActiveSemester(newSem.id, uid);
    return newSem;
  },

  // --- COURSES ---
  // Pengguna demo dapat DEMO_COURSES. Pengguna riil awalnya KOSONG []!
  getCourses: (userId?: string): Course[] => {
    if (isStrictDemoUser(userId)) {
      return getItem('siacad_demo_courses', DEMO_COURSES);
    }
    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    if (!uid) return [];
    return getItem(`siacad_user_${uid}_courses`, []);
  },

  saveCourse: (course: Partial<Course> & { name: string }, userId?: string): Course => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_courses' : `siacad_user_${uid}_courses`;
    const list = getItem<Course[]>(key, isDemo ? DEMO_COURSES : []);

    if (course.id) {
      const idx = list.findIndex((c) => c.id === course.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...course };
        setItem(key, list);
        return list[idx];
      }
    }
    const newCourse: Course = {
      id: course.id || `crs-${Date.now()}`,
      user_id: uid,
      semester_id: course.semester_id || 'sem-active',
      name: course.name,
      code: course.code || '',
      lecturer: course.lecturer || '',
      credits: course.credits || 3,
      room: course.room || '',
      color: course.color || '#7C9A76',
      created_at: new Date().toISOString(),
    };
    list.unshift(newCourse);
    setItem(key, list);
    return newCourse;
  },

  deleteCourse: (id: string, userId?: string): void => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_courses' : `siacad_user_${uid}_courses`;
    const list = getItem<Course[]>(key, []).filter((c) => c.id !== id);
    setItem(key, list);
  },

  // --- SCHEDULES ---
  // Pengguna demo dapat DEMO_SCHEDULES. Pengguna riil awalnya KOSONG []!
  getSchedules: (userId?: string): Schedule[] => {
    if (isStrictDemoUser(userId)) {
      return getItem('siacad_demo_schedules', DEMO_SCHEDULES);
    }
    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    if (!uid) return [];
    return getItem(`siacad_user_${uid}_schedules`, []);
  },

  saveSchedule: (schedule: Partial<Schedule> & { course_id: string }, userId?: string): Schedule => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_schedules' : `siacad_user_${uid}_schedules`;
    const list = getItem<Schedule[]>(key, isDemo ? DEMO_SCHEDULES : []);

    if (schedule.id) {
      const idx = list.findIndex((s) => s.id === schedule.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...schedule };
        setItem(key, list);
        return list[idx];
      }
    }
    const newSchedule: Schedule = {
      id: schedule.id || `sch-${Date.now()}`,
      user_id: uid,
      semester_id: schedule.semester_id || 'sem-active',
      course_id: schedule.course_id,
      day_of_week: schedule.day_of_week ?? 1,
      start_time: schedule.start_time || '08:00',
      end_time: schedule.end_time || '09:40',
      room: schedule.room || '',
      notes: schedule.notes || '',
      is_cancelled: schedule.is_cancelled || false,
      created_at: new Date().toISOString(),
    };
    list.push(newSchedule);
    setItem(key, list);
    return newSchedule;
  },

  deleteSchedule: (id: string, userId?: string): void => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_schedules' : `siacad_user_${uid}_schedules`;
    const list = getItem<Schedule[]>(key, []).filter((s) => s.id !== id);
    setItem(key, list);
  },

  // --- TASKS ---
  // Pengguna demo dapat DEMO_TASKS. Pengguna riil awalnya KOSONG []!
  getTasks: (userId?: string): Task[] => {
    if (isStrictDemoUser(userId)) {
      return getItem('siacad_demo_tasks', DEMO_TASKS);
    }
    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    if (!uid) return [];
    return getItem(`siacad_user_${uid}_tasks`, []);
  },

  saveTask: (taskData: Partial<Task> & { title: string }, userId?: string): Task => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_tasks' : `siacad_user_${uid}_tasks`;
    const list = getItem<Task[]>(key, isDemo ? DEMO_TASKS : []);
    const now = new Date().toISOString();

    if (taskData.id) {
      const idx = list.findIndex((t) => t.id === taskData.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...taskData, updated_at: now };
        setItem(key, list);
        return list[idx];
      }
    }
    const newTask: Task = {
      id: taskData.id || `tsk-${Date.now()}`,
      user_id: uid,
      semester_id: taskData.semester_id || null,
      course_id: taskData.course_id || null,
      title: taskData.title,
      description: taskData.description || '',
      deadline: taskData.deadline || null,
      priority: taskData.priority || 'normal',
      status: taskData.status || 'todo',
      notes: taskData.notes || '',
      created_at: now,
      updated_at: now,
    };
    list.unshift(newTask);
    setItem(key, list);
    return newTask;
  },

  deleteTask: (id: string, userId?: string): void => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_tasks' : `siacad_user_${uid}_tasks`;
    const list = getItem<Task[]>(key, []).filter((t) => t.id !== id);
    setItem(key, list);
  },

  toggleTask: (id: string, userId?: string): Task | null => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_tasks' : `siacad_user_${uid}_tasks`;
    const list = getItem<Task[]>(key, []);
    const task = list.find((t) => t.id === id);
    if (!task) return null;
    task.status = task.status === 'done' ? 'todo' : 'done';
    task.updated_at = new Date().toISOString();
    setItem(key, list);
    return task;
  },

  // --- GROUPS ---
  // Pengguna demo dapat DEMO_GROUPS. Pengguna riil awalnya KOSONG []!
  getGroups: (userId?: string): StudyGroup[] => {
    if (isStrictDemoUser(userId)) {
      return getItem('siacad_demo_groups', DEMO_GROUPS);
    }
    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    if (!uid) return [];
    return getItem(`siacad_user_${uid}_groups`, []);
  },

  createGroup: (name: string, description?: string, userId?: string): StudyGroup => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_groups' : `siacad_user_${uid}_groups`;
    const list = getItem<StudyGroup[]>(key, isDemo ? DEMO_GROUPS : []);

    const newGroup: StudyGroup = {
      id: `grp-${Date.now()}`,
      owner_id: uid,
      name,
      description: description || '',
      invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      members: [
        {
          id: `mem-${Date.now()}`,
          group_id: `grp-${Date.now()}`,
          user_id: uid,
          role: 'owner',
          joined_at: new Date().toISOString(),
          profile: LocalStore.getProfile(uid),
        },
      ],
    };
    list.unshift(newGroup);
    setItem(key, list);
    return newGroup;
  },

  joinGroup: (inviteCode: string, userId?: string): { success: boolean; group?: StudyGroup; error?: string } => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_groups' : `siacad_user_${uid}_groups`;
    const list = getItem<StudyGroup[]>(key, []);
    const group = list.find((g) => g.invite_code.toUpperCase() === inviteCode.trim().toUpperCase());
    if (!group) return { success: false, error: 'Kode undangan tidak ditemukan.' };

    const members = group.members || [];
    if (members.some((m) => m.user_id === uid)) {
      return { success: false, error: 'Anda sudah menjadi anggota kelompok ini.' };
    }

    const newMember = {
      id: `mem-${Date.now()}`,
      group_id: group.id,
      user_id: uid,
      role: 'member' as const,
      joined_at: new Date().toISOString(),
      profile: LocalStore.getProfile(uid),
    };
    group.members = [...members, newMember];
    setItem(key, list);
    return { success: true, group };
  },

  leaveGroup: (groupId: string, userId?: string): void => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_groups' : `siacad_user_${uid}_groups`;
    const list = getItem<StudyGroup[]>(key, []);
    const group = list.find((g) => g.id === groupId);
    if (group && group.members) {
      group.members = group.members.filter((m) => m.user_id !== uid);
      setItem(key, list);
    }
  },

  deleteGroup: (groupId: string, userId?: string): void => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_groups' : `siacad_user_${uid}_groups`;
    const list = getItem<StudyGroup[]>(key, []).filter((g) => g.id !== groupId);
    setItem(key, list);
  },

  regenerateInviteCode: (groupId: string, userId?: string): string => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_groups' : `siacad_user_${uid}_groups`;
    const list = getItem<StudyGroup[]>(key, []);
    const group = list.find((g) => g.id === groupId);
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (group) {
      group.invite_code = newCode;
      setItem(key, list);
    }
    return newCode;
  },

  // --- ROTATION SLOTS ---
  getRotationSlots: (groupId: string): GroupRotationSlot[] => {
    return getItem(`siacad_rotation_slots_${groupId}`, []);
  },

  saveRotationSlot: (slot: Partial<GroupRotationSlot> & { group_id: string }): GroupRotationSlot => {
    const key = `siacad_rotation_slots_${slot.group_id}`;
    const list = getItem<GroupRotationSlot[]>(key, []);
    if (slot.id) {
      const idx = list.findIndex((s) => s.id === slot.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...slot };
        setItem(key, list);
        return list[idx];
      }
    }
    const newSlot: GroupRotationSlot = {
      id: `rot-${Date.now()}`,
      group_id: slot.group_id,
      rotation_order: slot.rotation_order || list.length + 1,
      start_date: slot.start_date || new Date().toISOString().split('T')[0],
      end_date: slot.end_date || new Date().toISOString().split('T')[0],
      notes: slot.notes || '',
    };
    list.push(newSlot);
    setItem(key, list);
    return newSlot;
  },

  deleteRotationSlot: (slotId: string, groupId?: string): void => {
    if (!groupId) return;
    const key = `siacad_rotation_slots_${groupId}`;
    const list = getItem<GroupRotationSlot[]>(key, []).filter((s) => s.id !== slotId);
    setItem(key, list);
  },

  generateAutoRotation: (params: {
    groupId: string;
    startDate: string;
    totalSlots?: number;
    groupCount?: number;
    intervalDays?: number;
    intervalWeeks?: number;
    notes?: string;
  }): GroupRotationSlot[] => {
    const start = new Date(params.startDate);
    const count = params.totalSlots || params.groupCount || 4;
    const intervalDays = params.intervalDays || (params.intervalWeeks ? params.intervalWeeks * 7 : 7);
    const slots: GroupRotationSlot[] = [];
    for (let i = 0; i < count; i++) {
      const sDate = new Date(start);
      sDate.setDate(start.getDate() + i * intervalDays);
      const eDate = new Date(sDate);
      eDate.setDate(sDate.getDate() + intervalDays - 1);

      slots.push({
        id: `rot-${Date.now()}-${i}`,
        group_id: params.groupId,
        rotation_order: i + 1,
        start_date: sDate.toISOString().split('T')[0],
        end_date: eDate.toISOString().split('T')[0],
        notes: params.notes || `Jadwal Rotasi Giliran Kelompok ${i + 1}`,
      });
    }
    setItem(`siacad_rotation_slots_${params.groupId}`, slots);
    return slots;
  },

  getGroupEvents: (_groupId?: string): GroupEvent[] => {
    return [];
  },

  saveGroupEvent: (eventData: Partial<GroupEvent> & { group_id: string; title?: string; event_date?: string }): GroupEvent => {
    return {
      id: `evt-${Date.now()}`,
      group_id: eventData.group_id,
      semester_id: eventData.semester_id || null,
      course_id: eventData.course_id || null,
      rotation_slot_id: eventData.rotation_slot_id || null,
      title: eventData.title || 'Kegiatan Kelompok Baru',
      event_type: eventData.event_type || 'presentation',
      event_date: eventData.event_date || new Date().toISOString(),
      description: eventData.description || '',
      created_at: new Date().toISOString(),
    };
  },

  deleteGroupEvent: (_id: string): void => {},

  // --- NOTIFICATIONS & PREFERENCES ---
  getPreferences: (userId?: string): NotificationPreference => {
    if (isStrictDemoUser(userId)) return DEMO_PREFERENCES;
    const user = LocalStore.getUser();
    const uid = userId || user?.id || 'unknown';
    return {
      id: `pref-${uid}`,
      user_id: uid,
      class_reminder_enabled: true,
      class_first_reminder_minutes: 120,
      class_second_reminder_minutes: 5,
      task_reminder_enabled: true,
      task_first_reminder_minutes: 1440,
      task_second_reminder_minutes: 120,
      task_deadline_reminder: true,
      group_reminder_enabled: true,
      group_day_before: true,
      group_day_of: true,
      sound_enabled: true,
      timezone: 'Asia/Jakarta',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  updatePreferences: (updates: Partial<NotificationPreference>, userId?: string): NotificationPreference => {
    return { ...LocalStore.getPreferences(userId), ...updates };
  },

  getNotifications: (userId?: string): NotificationLog[] => {
    if (isStrictDemoUser(userId)) {
      return getItem('siacad_demo_notifications', DEMO_NOTIFICATIONS);
    }
    const user = LocalStore.getUser();
    const uid = userId || user?.id;
    if (!uid) return [];
    return getItem(`siacad_user_${uid}_notifications`, []);
  },

  addNotification: (log: { title: string; body: string; notification_type: string; action_url?: string }, userId?: string) => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_notifications' : `siacad_user_${uid}_notifications`;
    const list = getItem<NotificationLog[]>(key, isDemo ? DEMO_NOTIFICATIONS : []);

    const newLog: NotificationLog = {
      id: `notif-${Date.now()}`,
      job_id: null,
      user_id: uid,
      title: log.title,
      body: log.body,
      notification_type: log.notification_type,
      status: 'delivered',
      error_message: null,
      sent_at: new Date().toISOString(),
      read_at: null,
      action_url: log.action_url || '/',
    };
    list.unshift(newLog);
    setItem(key, list);
    return newLog;
  },

  markNotificationRead: (_id: string, _userId?: string) => {},
  markAllNotificationsRead: (_userId?: string) => {},
  deleteNotification: (id: string, userId?: string) => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_notifications' : `siacad_user_${uid}_notifications`;
    const list = getItem<NotificationLog[]>(key, []).filter((n) => n.id !== id);
    setItem(key, list);
  },
  clearAllNotifications: (userId?: string) => {
    const isDemo = isStrictDemoUser(userId);
    const user = LocalStore.getUser();
    const uid = isDemo ? DEMO_USER_ID : (userId || user?.id || `usr-${Date.now()}`);
    const key = isDemo ? 'siacad_demo_notifications' : `siacad_user_${uid}_notifications`;
    setItem(key, []);
  },

  // --- DEVICES (WEB PUSH) ---
  getDevices: (): PushSubscription[] => {
    return getItem('siacad_push_devices', []);
  },
  addDevice: (deviceName: string): PushSubscription => {
    const list = getItem<PushSubscription[]>('siacad_push_devices', []);
    const newDevice: PushSubscription = {
      id: `dev-${Date.now()}`,
      user_id: LocalStore.getUser()?.id || DEMO_USER_ID,
      endpoint: `https://fcm.googleapis.com/fcm/send/${Date.now()}`,
      p256dh: 'mock-p256dh-key',
      auth: 'mock-auth-key',
      device_name: deviceName,
      created_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    };
    list.push(newDevice);
    setItem('siacad_push_devices', list);
    return newDevice;
  },
  removeDevice: (deviceId: string): void => {
    const list = getItem<PushSubscription[]>('siacad_push_devices', []).filter((d) => d.id !== deviceId);
    setItem('siacad_push_devices', list);
  },

  // --- WEB PUSH SUBSCRIPTIONS ---
  savePushSubscription: (sub: PushSubscription): void => {
    setItem('siacad_push_subscription', sub);
  },

  getPushSubscription: (): PushSubscription | null => {
    return getItem('siacad_push_subscription', null);
  },

  deletePushSubscription: (): void => {
    localStorage.removeItem('siacad_push_subscription');
  },
};

export default LocalStore;
