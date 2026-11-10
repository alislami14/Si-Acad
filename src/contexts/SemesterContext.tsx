import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Semester } from '../types/database';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from './AuthContext';

interface SemesterContextType {
  semesters: Semester[];
  activeSemester: Semester | null;
  setActiveSemester: (semester: Semester) => Promise<void>;
  loading: boolean;
  createSemester: (name: string, startDate?: string, endDate?: string) => Promise<Semester | null>;
  updateSemester: (id: string, updates: Partial<Semester>) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  refreshSemesters: () => Promise<void>;
}

const SemesterContext = createContext<SemesterContextType | null>(null);

export const useSemester = () => {
  const ctx = useContext(SemesterContext);
  if (!ctx) throw new Error('useSemester must be used within SemesterProvider');
  return ctx;
};

export function SemesterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemesterState] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);

  // Ambil semester langsung dari Supabase
  const fetchSemesters = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setSemesters([]);
      setActiveSemesterState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        if (data.length > 0) {
          setSemesters(data);
          const active = data.find((s) => s.is_active) || data[0];
          setActiveSemesterState(active);
        } else {
          // Buat semester aktif pertama langsung di Supabase jika belum ada
          const { data: newSem } = await supabase
            .from('semesters')
            .insert([
              {
                user_id: user.id,
                name: 'Semester Ganjil 2026/2027',
                is_active: true,
              },
            ])
            .select()
            .single();

          if (newSem) {
            setSemesters([newSem]);
            setActiveSemesterState(newSem);
          }
        }
      }
    } catch (err) {
      console.error('Gagal memuat semester dari Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const setActiveSemester = async (semester: Semester) => {
    setActiveSemesterState(semester);
    if (!user || !isSupabaseConfigured) return;

    try {
      await supabase.from('semesters').update({ is_active: false }).eq('user_id', user.id);
      await supabase.from('semesters').update({ is_active: true }).eq('id', semester.id).eq('user_id', user.id);
    } catch (err) {
      console.error('Gagal update active semester di Supabase:', err);
    }
    await fetchSemesters();
  };

  const createSemester = async (name: string, startDate?: string, endDate?: string) => {
    if (!user || !isSupabaseConfigured) return null;

    try {
      // Set semester lain ke tidak aktif
      await supabase.from('semesters').update({ is_active: false }).eq('user_id', user.id);

      const { data, error } = await supabase
        .from('semesters')
        .insert([
          {
            user_id: user.id,
            name,
            start_date: startDate || null,
            end_date: endDate || null,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        await fetchSemesters();
        return data;
      }
    } catch (err) {
      console.error('Gagal membuat semester di Supabase:', err);
    }
    return null;
  };

  const updateSemester = async (id: string, updates: Partial<Semester>) => {
    if (!user || !isSupabaseConfigured) return;

    try {
      await supabase.from('semesters').update(updates).eq('id', id).eq('user_id', user.id);
    } catch (err) {
      console.error('Gagal update semester di Supabase:', err);
    }
    await fetchSemesters();
  };

  const deleteSemester = async (id: string) => {
    if (!user || !isSupabaseConfigured) return;

    try {
      await supabase.from('semesters').delete().eq('id', id).eq('user_id', user.id);
    } catch (err) {
      console.error('Gagal delete semester di Supabase:', err);
    }
    await fetchSemesters();
  };

  return (
    <SemesterContext.Provider
      value={{
        semesters,
        activeSemester,
        setActiveSemester,
        loading,
        createSemester,
        updateSemester,
        deleteSemester,
        refreshSemesters: fetchSemesters,
      }}
    >
      {children}
    </SemesterContext.Provider>
  );
}

export default SemesterProvider;
