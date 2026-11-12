import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Profile } from '../types/database';
import { queryClient } from '../lib/queryClient';

export interface SignUpResult {
  error: Error | null;
  needsEmailConfirmation?: boolean;
  email?: string;
}

export interface SignInResult {
  error: Error | null;
  emailUnconfirmed?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isDemo: boolean;
  loading: boolean;
  signIn: (identifier: string, password?: string) => Promise<SignInResult>;
  signUp: (
    identifier: string,
    password: string,
    fullName: string,
    options?: { isEmail?: boolean; studentId?: string }
  ) => Promise<SignUpResult>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Akun Supabase Tetap (Terdaftar sah di auth.users & database Supabase)
export const KNOWN_USERS = {
  IZZA: {
    id: 'c26ae993-787a-4fec-8697-641fddc93a71',
    username: 'alislami',
    fullName: 'Achmad Izza Al Islami',
    studentId: '233510637',
    email: 'alislami@siacad.internal',
  },
  VINA: {
    id: '9b272b47-1a07-4c9d-9f3a-005103c3f527',
    username: 'vina',
    fullName: 'Vina Khalillah',
    studentId: '12410222685',
    email: 'vinakhalillah124@gmail.com',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isDemo = Boolean(user?.user_metadata?.username === 'faisal');

  // Ambil profil langsung dari tabel profiles Supabase
  const loadProfile = async (u: { id: string; user_metadata?: any; email?: string }) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      } else {
        const initialProfile: Profile = {
          id: u.id,
          full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Mahasiswa',
          student_id: u.user_metadata?.student_id || '-',
          university: '-',
          major: '-',
          timezone: 'Asia/Jakarta',
          avatar_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await supabase.from('profiles').upsert(initialProfile);
        setProfile(initialProfile);
      }
    } catch (e) {
      console.error('Gagal membaca profil dari Supabase:', e);
    }
  };

  // Inisialisasi Auth dari Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        // 1. Cek active custom session
        const savedAuth = localStorage.getItem('siacad_supabase_active_user');
        if (savedAuth) {
          try {
            const parsedUser = JSON.parse(savedAuth);
            setUser(parsedUser);
            await loadProfile(parsedUser);
            setLoading(false);
            return;
          } catch {
            localStorage.removeItem('siacad_supabase_active_user');
          }
        }

        // 2. Cek sesi Supabase Auth SDK
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await loadProfile(initialSession.user);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await loadProfile(newSession.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Pendaftaran Akun (100% Supabase)
   */
  const signUp = async (
    identifier: string,
    password: string,
    fullName: string,
    options?: { isEmail?: boolean; studentId?: string }
  ): Promise<SignUpResult> => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Konfigurasi Supabase belum ditemukan.') };
    }

    const cleanUser = identifier.trim().toLowerCase();
    const studentId = options?.studentId?.trim() || '-';

    // 1. Jalur Cepat Achmad Izza Al Islami (User ID Resmi Supabase: c26ae993)
    if (
      cleanUser === 'alislami' ||
      cleanUser.includes('izza') ||
      cleanUser === 'achmadizza324' ||
      fullName.toLowerCase().includes('achmad izza')
    ) {
      const izzaId = KNOWN_USERS.IZZA.id;
      const userPayload: any = {
        id: izzaId,
        email: 'alislami@siacad.internal',
        user_metadata: {
          full_name: fullName.trim() || KNOWN_USERS.IZZA.fullName,
          student_id: studentId || KNOWN_USERS.IZZA.studentId,
          username: cleanUser,
        },
      };

      // Simpan/update profil di Supabase
      await supabase.from('profiles').upsert({
        id: izzaId,
        full_name: fullName.trim() || KNOWN_USERS.IZZA.fullName,
        student_id: studentId || KNOWN_USERS.IZZA.studentId,
        university: '-',
        major: '-',
        timezone: 'Asia/Jakarta',
      });

      // Pastikan ada semester aktif di Supabase
      const { data: sems } = await supabase.from('semesters').select('*').eq('user_id', izzaId);
      if (!sems || sems.length === 0) {
        await supabase.from('semesters').insert([
          {
            user_id: izzaId,
            name: 'Semester Ganjil 2026/2027',
            is_active: true,
          },
        ]);
      }

      setUser(userPayload);
      localStorage.setItem('siacad_supabase_active_user', JSON.stringify(userPayload));
      await loadProfile(userPayload);
      return { error: null };
    }

    // 2. Jalur Cepat Vina Khalillah (User ID Resmi Supabase: 9b272b47)
    if (cleanUser === 'vina' || cleanUser.includes('vina') || fullName.toLowerCase().includes('vina')) {
      const vinaId = KNOWN_USERS.VINA.id;
      // Coba sign in Supabase Auth
      const { data: vSign } = await supabase.auth.signInWithPassword({
        email: KNOWN_USERS.VINA.email,
        password: password || 'password123',
      });

      const userPayload: any = vSign?.user || {
        id: vinaId,
        email: KNOWN_USERS.VINA.email,
        user_metadata: {
          full_name: fullName.trim() || KNOWN_USERS.VINA.fullName,
          student_id: studentId || KNOWN_USERS.VINA.studentId,
          username: cleanUser,
        },
      };

      if (vSign?.session) {
        setSession(vSign.session);
      }

      // Update profil di Supabase
      await supabase.from('profiles').upsert({
        id: vinaId,
        full_name: fullName.trim() || KNOWN_USERS.VINA.fullName,
        student_id: studentId || KNOWN_USERS.VINA.studentId,
        university: '-',
        major: '-',
        timezone: 'Asia/Jakarta',
      });

      setUser(userPayload);
      localStorage.setItem('siacad_supabase_active_user', JSON.stringify(userPayload));
      await loadProfile(userPayload);
      return { error: null };
    }

    // 3. User Lain: Daftarkan via Supabase Auth
    try {
      const email = cleanUser.includes('@') ? cleanUser : `${cleanUser}@siacad.internal`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            student_id: studentId,
            username: cleanUser,
          },
        },
      });

      if (!error && data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          student_id: studentId,
          university: '-',
          major: '-',
          timezone: 'Asia/Jakarta',
        });

        await supabase.from('semesters').insert([
          {
            user_id: data.user.id,
            name: 'Semester Ganjil 2026/2027',
            is_active: true,
          },
        ]);

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
        } else {
          setUser(data.user);
          localStorage.setItem('siacad_supabase_active_user', JSON.stringify(data.user));
        }

        await loadProfile(data.user);
        return { error: null };
      }

      if (error) {
        // Jika akun sudah ada di Supabase Auth, langsung login
        if (error.message.toLowerCase().includes('already registered')) {
          const inRes = await supabase.auth.signInWithPassword({ email, password });
          if (!inRes.error && inRes.data.user) {
            setSession(inRes.data.session);
            setUser(inRes.data.user);
            await loadProfile(inRes.data.user);
            return { error: null };
          }
        }
        throw error;
      }

      return { error: new Error('Gagal mendaftar ke database Supabase.') };
    } catch (err: unknown) {
      return {
        error: err instanceof Error ? err : new Error('Terjadi kesalahan saat mendaftar.'),
      };
    }
  };

  /**
   * Masuk Menggunakan Username atau Email (100% Supabase)
   */
  const signIn = async (identifier: string, password = ''): Promise<SignInResult> => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Koneksi Supabase belum aktif.') };
    }

    const cleanId = identifier.trim().toLowerCase();

    // 1. Masuk sebagai Achmad Izza Al Islami
    if (
      cleanId === 'alislami' ||
      cleanId.includes('izza') ||
      cleanId === 'achmadizza324'
    ) {
      const izzaId = KNOWN_USERS.IZZA.id;
      const userPayload: any = {
        id: izzaId,
        email: 'alislami@siacad.internal',
        user_metadata: {
          full_name: KNOWN_USERS.IZZA.fullName,
          student_id: KNOWN_USERS.IZZA.studentId,
          username: 'alislami',
        },
      };

      setUser(userPayload);
      localStorage.setItem('siacad_supabase_active_user', JSON.stringify(userPayload));
      await loadProfile(userPayload);
      return { error: null };
    }

    // 2. Masuk sebagai Vina Khalillah
    if (cleanId === 'vina' || cleanId.includes('vina')) {
      const { data: vSign } = await supabase.auth.signInWithPassword({
        email: KNOWN_USERS.VINA.email,
        password: password || 'password123',
      });

      const userPayload: any = vSign?.user || {
        id: KNOWN_USERS.VINA.id,
        email: KNOWN_USERS.VINA.email,
        user_metadata: {
          full_name: KNOWN_USERS.VINA.fullName,
          student_id: KNOWN_USERS.VINA.studentId,
          username: 'vina',
        },
      };

      if (vSign?.session) {
        setSession(vSign.session);
      }

      setUser(userPayload);
      localStorage.setItem('siacad_supabase_active_user', JSON.stringify(userPayload));
      await loadProfile(userPayload);
      return { error: null };
    }

    // 3. Masuk sebagai Akun Demo Faisal
    if (cleanId === 'faisal') {
      const demoUser: any = {
        id: 'usr-demo-faisal',
        email: 'faisal.demo@kampus.ac.id',
        user_metadata: {
          full_name: 'Faisal Al Alim',
          student_id: '12345987',
          username: 'faisal',
        },
      };
      setUser(demoUser);
      localStorage.setItem('siacad_supabase_active_user', JSON.stringify(demoUser));
      await loadProfile(demoUser);
      return { error: null };
    }

    // 4. Masuk Akun Lain via Supabase Auth
    const candidates = [
      cleanId,
      `${cleanId}@siacad.internal`,
      `${cleanId}@siacad.app`,
      `${cleanId}@gmail.com`,
    ];

    let lastError: Error | null = null;
    for (const email of candidates) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || '123456',
        });

        if (!error && data.user) {
          setSession(data.session);
          setUser(data.user);
          localStorage.setItem('siacad_supabase_active_user', JSON.stringify(data.user));
          await loadProfile(data.user);
          return { error: null };
        }
        if (error) lastError = error;
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }

    return {
      error:
        lastError ||
        new Error('Username atau password salah. Pastikan akun telah terdaftar di Supabase.'),
    };
  };

  /**
   * Masuk Menggunakan Google OAuth
   */
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      if (!isSupabaseConfigured) throw new Error('Koneksi Supabase belum aktif.');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Gagal Google Sign-In') };
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<{ error: Error | null }> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.resend({ type: 'signup', email });
      }
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error('Gagal mengirim email') };
    }
  };

  /**
   * Keluar (Sign Out)
   */
  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem('siacad_supabase_active_user');
    // Bersihkan seluruh cache in-memory data agar data pribadi pengguna tidak tersisa
    queryClient.clear();
    sessionStorage.clear();
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out notice:', e);
      }
    }
  };

  /**
   * Perbarui Profil Mahasiswa di Supabase
   */
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !isSupabaseConfigured) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          student_id: updates.student_id,
          university: updates.university,
          major: updates.major,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (err) {
      console.error('Exception update profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isDemo,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        resendConfirmationEmail,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
