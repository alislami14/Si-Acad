import { useState, useEffect, useCallback } from 'react';
import { Task, Course } from '../types/database';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LocalStore } from '../lib/storage';

export interface TaskFiltersState {
  courseId: string;
  status: string;
  priority: string;
  search: string;
  timeframe: 'all' | 'today' | 'week' | 'upcoming' | 'overdue' | 'done';
}

export const useTasks = () => {
  const { user, isDemo } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil daftar mata kuliah langsung dari Supabase atau LocalStore
  const fetchCourses = useCallback(async () => {
    if (isDemo) {
      const demoCourses = LocalStore.getCourses('usr-demo-faisal');
      setCourses(demoCourses);
      return;
    }

    if (!user || !isSupabaseConfigured) {
      setCourses([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (!error && data) {
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses from Supabase:', err);
    }
  }, [user, isDemo]);

  // Ambil daftar tugas langsung dari Supabase atau LocalStore
  const fetchTasks = useCallback(async () => {
    if (isDemo) {
      setLoading(true);
      const demoTasks = LocalStore.getTasks('usr-demo-faisal');
      const demoCourses = LocalStore.getCourses('usr-demo-faisal');
      const courseMap = new Map(demoCourses.map((c) => [c.id, c]));
      const enriched = demoTasks.map((t) => ({
        ...t,
        course: t.course_id ? courseMap.get(t.course_id) : undefined,
      }));
      setTasks(enriched);
      setLoading(false);
      return;
    }

    if (!user || !isSupabaseConfigured) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, course:courses(*)')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });

      if (!error && data) {
        setTasks(data);
      } else if (error) {
        console.error('Error fetching tasks from Supabase:', error);
      }
    } catch (err) {
      console.error('Exception fetching tasks from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isDemo]);

  useEffect(() => {
    fetchTasks();
    fetchCourses();

    // Supabase Real-Time Listener (Hanya untuk pengguna non-demo dengan Supabase aktif)
    if (user && isSupabaseConfigured && !isDemo) {
      const channel = supabase
        .channel(`tasks-realtime-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
          () => {
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchTasks, fetchCourses, user, isDemo]);

  // Tambah tugas baru
  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (isDemo) {
      const created = LocalStore.saveTask(taskData, 'usr-demo-faisal');
      await fetchTasks();
      return { data: created, error: null };
    }

    if (!user || !isSupabaseConfigured) {
      return { data: null, error: new Error('User belum login ke Supabase.') };
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...taskData,
            user_id: user.id,
          },
        ])
        .select('*, course:courses(*)')
        .single();

      if (!error && data) {
        await fetchTasks();
        return { data, error: null };
      }
      return { data: null, error };
    } catch (err) {
      console.error('Gagal insert task ke Supabase:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Gagal simpan tugas') };
    }
  };

  // Update tugas
  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (isDemo) {
      const updated = LocalStore.saveTask({ ...updates, id }, 'usr-demo-faisal');
      await fetchTasks();
      return { data: updated, error: null };
    }

    if (!user || !isSupabaseConfigured) {
      return { data: null, error: new Error('User belum login ke Supabase.') };
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*, course:courses(*)')
        .single();

      if (!error && data) {
        await fetchTasks();
        return { data, error: null };
      }
      return { data: null, error };
    } catch (err) {
      console.error('Gagal update task di Supabase:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Gagal update tugas') };
    }
  };

  // Hapus tugas
  const deleteTask = async (id: string) => {
    if (isDemo) {
      LocalStore.deleteTask(id, 'usr-demo-faisal');
      await fetchTasks();
      return { error: null };
    }

    if (!user || !isSupabaseConfigured) {
      return { error: new Error('User belum login ke Supabase.') };
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (!error) {
        await fetchTasks();
        return { error: null };
      }
      return { error };
    } catch (err) {
      console.error('Gagal delete task di Supabase:', err);
      return { error: err instanceof Error ? err : new Error('Gagal hapus tugas') };
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    if (isDemo) {
      LocalStore.toggleTask(task.id, 'usr-demo-faisal');
      await fetchTasks();
      return { data: null, error: null };
    }
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    return updateTask(task.id, { status: nextStatus });
  };

  return {
    tasks,
    courses,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    refreshTasks: fetchTasks,
  };
};

export default useTasks;
