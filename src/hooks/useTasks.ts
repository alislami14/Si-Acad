import { useState, useEffect, useCallback } from 'react';
import { Task, Course } from '../types/database';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface TaskFiltersState {
  courseId: string;
  status: string;
  priority: string;
  search: string;
  timeframe: 'all' | 'today' | 'week' | 'upcoming' | 'overdue' | 'done';
}

export const useTasks = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil daftar mata kuliah langsung dari Supabase
  const fetchCourses = useCallback(async () => {
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
  }, [user]);

  // Ambil daftar tugas langsung dari Supabase
  const fetchTasks = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchTasks();
    fetchCourses();

    // Supabase Real-Time Listener
    if (user && isSupabaseConfigured) {
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
  }, [fetchTasks, fetchCourses, user]);

  // Tambah tugas baru ke Supabase
  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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

  // Update tugas di Supabase
  const updateTask = async (id: string, updates: Partial<Task>) => {
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

  // Hapus tugas dari Supabase
  const deleteTask = async (id: string) => {
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
