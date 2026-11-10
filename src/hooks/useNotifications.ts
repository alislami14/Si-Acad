import { useState, useEffect, useCallback } from 'react';
import { NotificationPreference, NotificationLog } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const DEFAULT_PREFS: NotificationPreference = {
  id: 'pref-default',
  user_id: '',
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

export const useNotifications = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setPreferences(DEFAULT_PREFS);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setPreferences(data);
      } else {
        // Buat record baru jika belum ada
        const newPref = { ...DEFAULT_PREFS, user_id: user.id };
        await supabase.from('notification_preferences').upsert(newPref);
        setPreferences(newPref);
      }
    } catch (err) {
      console.warn('Gagal memuat preferensi notifikasi dari Supabase:', err);
      setPreferences(DEFAULT_PREFS);
    }
  }, [user]);

  const fetchLogs = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLogs(data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn('Gagal memuat log notifikasi dari Supabase:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
    fetchLogs();
  }, [fetchPreferences, fetchLogs]);

  const updatePreferences = async (updates: Partial<NotificationPreference>) => {
    if (!user || !isSupabaseConfigured) return { data: null, error: null };

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (!error && data) {
        setPreferences(data);
        return { data, error: null };
      }
      return { data: null, error };
    } catch (err) {
      console.error('Gagal update preferensi di Supabase:', err);
      return { data: null, error: err };
    }
  };

  const markAsRead = async (logId: string) => {
    if (!user || !isSupabaseConfigured) return;
    try {
      await supabase
        .from('notification_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('id', logId)
        .eq('user_id', user.id);
      fetchLogs();
    } catch (err) {
      console.warn('Gagal tandai dibaca di Supabase:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user || !isSupabaseConfigured) return;
    try {
      await supabase
        .from('notification_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);
      fetchLogs();
    } catch (err) {
      console.warn('Gagal tandai semua dibaca di Supabase:', err);
    }
  };

  const deleteLog = async (logId: string) => {
    if (!user || !isSupabaseConfigured) return;
    try {
      await supabase
        .from('notification_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id);
      fetchLogs();
    } catch (err) {
      console.warn('Gagal hapus log di Supabase:', err);
    }
  };

  const clearAllLogs = async () => {
    if (!user || !isSupabaseConfigured) return;
    try {
      await supabase
        .from('notification_logs')
        .delete()
        .eq('user_id', user.id);
      fetchLogs();
    } catch (err) {
      console.warn('Gagal bersihkan log di Supabase:', err);
    }
  };

  return {
    preferences,
    logs,
    loading,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    deleteLog,
    clearAllLogs,
    refresh: fetchLogs,
  };
};

export default useNotifications;
