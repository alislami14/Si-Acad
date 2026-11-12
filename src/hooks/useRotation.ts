import { useState, useEffect, useCallback } from 'react';
import {
  GroupRotationSlot,
  GroupEvent,
  Course,
} from '../types/database';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LocalStore } from '../lib/storage';

export const useRotation = (groupId: string) => {
  const { user, isDemo } = useAuth();
  const [slots, setSlots] = useState<GroupRotationSlot[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRotationData = useCallback(async () => {
    if (isDemo) {
      setLoading(true);
      const s = LocalStore.getRotationSlots(groupId);
      const e = LocalStore.getGroupEvents(groupId);
      const c = LocalStore.getCourses('usr-demo-faisal');
      setSlots(s);
      setEvents(e);
      setCourses(c);
      setLoading(false);
      return;
    }

    if (!groupId || !isSupabaseConfigured) {
      setSlots([]);
      setEvents([]);
      setCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sRes, eRes, cRes] = await Promise.all([
        supabase
          .from('group_rotation_slots')
          .select('*, member:study_group_members(*, profile:profiles(*))')
          .eq('group_id', groupId)
          .order('slot_order', { ascending: true }),
        supabase
          .from('group_events')
          .select('*')
          .eq('group_id', groupId)
          .order('event_date', { ascending: true }),
        user
          ? supabase.from('courses').select('*').eq('user_id', user.id).order('name')
          : Promise.resolve({ data: [] }),
      ]);

      if (sRes.data) setSlots(sRes.data);
      if (eRes.data) setEvents(eRes.data);
      if (cRes.data) setCourses(cRes.data);
    } catch (err) {
      console.warn('Gagal memuat rotasi dari Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId, user]);

  useEffect(() => {
    fetchRotationData();
  }, [fetchRotationData]);

  // Generate automatic rotation slots directly in Supabase or LocalStore
  const generateAutoRotation = async ({
    startDate,
    totalSlots,
    intervalDays = 7,
    notes = '',
  }: {
    startDate: string;
    totalSlots: number;
    intervalDays?: number;
    notes?: string;
  }) => {
    if (isDemo) {
      const generated = LocalStore.generateAutoRotation({
        groupId,
        startDate,
        totalSlots,
        intervalDays,
        notes,
      });
      setSlots(generated);
      return { data: generated, error: null };
    }

    if (!groupId || !isSupabaseConfigured) return { data: [], error: null };

    try {
      // Hapus slot rotasi lama
      await supabase.from('group_rotation_slots').delete().eq('group_id', groupId);

      const newSlots = [];
      let currentDate = parseISO(startDate);

      for (let i = 0; i < totalSlots; i++) {
        const slotStart = new Date(currentDate);
        const slotEnd = new Date(currentDate);
        slotEnd.setDate(slotEnd.getDate() + intervalDays - 1);

        newSlots.push({
          group_id: groupId,
          slot_order: i + 1,
          start_date: slotStart.toISOString().split('T')[0],
          end_date: slotEnd.toISOString().split('T')[0],
          notes: notes || `Giliran Presentasi / Tugas #${i + 1}`,
        });

        currentDate.setDate(currentDate.getDate() + intervalDays);
      }

      const { data, error } = await supabase
        .from('group_rotation_slots')
        .insert(newSlots)
        .select();

      if (!error && data) {
        setSlots(data);
        return { data, error: null };
      }
      return { data: [], error };
    } catch (err) {
      console.error('Gagal generate rotasi otomatis di Supabase:', err);
      return { data: [], error: err };
    }
  };

  // Add or update rotation slot
  const saveSlot = async (slot: Partial<GroupRotationSlot>) => {
    if (isDemo) {
      const saved = LocalStore.saveRotationSlot({ ...slot, group_id: groupId });
      fetchRotationData();
      return { data: saved, error: null };
    }

    if (!groupId || !isSupabaseConfigured) return { data: null, error: null };

    try {
      if (slot.id) {
        const { data, error } = await supabase
          .from('group_rotation_slots')
          .update(slot)
          .eq('id', slot.id)
          .select()
          .single();
        fetchRotationData();
        return { data, error };
      } else {
        const { data, error } = await supabase
          .from('group_rotation_slots')
          .insert([{ ...slot, group_id: groupId }])
          .select()
          .single();
        fetchRotationData();
        return { data, error };
      }
    } catch (err) {
      console.error('Gagal menyimpan slot di Supabase:', err);
      return { data: null, error: err };
    }
  };

  // Delete slot
  const deleteSlot = async (slotId: string) => {
    if (isDemo) {
      LocalStore.deleteRotationSlot(slotId, groupId);
      fetchRotationData();
      return { error: null };
    }

    if (!isSupabaseConfigured) return { error: null };
    try {
      await supabase.from('group_rotation_slots').delete().eq('id', slotId);
      fetchRotationData();
      return { error: null };
    } catch (err) {
      console.error('Gagal menghapus slot di Supabase:', err);
      return { error: err };
    }
  };

  // Create or update group event
  const saveEvent = async (eventData: Partial<GroupEvent>) => {
    if (isDemo) {
      const saved = LocalStore.saveGroupEvent({ ...eventData, group_id: groupId });
      fetchRotationData();
      return { data: saved, error: null };
    }

    if (!groupId || !isSupabaseConfigured) return { data: null, error: null };

    try {
      if (eventData.id) {
        const { data, error } = await supabase
          .from('group_events')
          .update(eventData)
          .eq('id', eventData.id)
          .select()
          .single();
        fetchRotationData();
        return { data, error };
      } else {
        const { data, error } = await supabase
          .from('group_events')
          .insert([{ ...eventData, group_id: groupId }])
          .select()
          .single();
        fetchRotationData();
        return { data, error };
      }
    } catch (err) {
      console.error('Gagal menyimpan agenda di Supabase:', err);
      return { data: null, error: err };
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    if (isDemo) {
      LocalStore.deleteGroupEvent(eventId);
      fetchRotationData();
      return { error: null };
    }

    if (!isSupabaseConfigured) return { error: null };
    try {
      await supabase.from('group_events').delete().eq('id', eventId);
      fetchRotationData();
      return { error: null };
    } catch (err) {
      console.error('Gagal menghapus agenda di Supabase:', err);
      return { error: err };
    }
  };

  // Calculate current slot (this week)
  const today = new Date();
  const currentSlot = slots.find((s) => {
    try {
      const start = startOfDay(parseISO(s.start_date));
      const end = endOfDay(parseISO(s.end_date));
      return isWithinInterval(today, { start, end });
    } catch {
      return false;
    }
  });

  // Calculate next slot (next week)
  const nextSlot = slots.find((s) => {
    try {
      const start = parseISO(s.start_date);
      return start > today;
    } catch {
      return false;
    }
  });

  return {
    slots,
    events,
    courses,
    loading,
    currentSlot,
    nextSlot,
    generateAutoRotation,
    saveSlot,
    deleteSlot,
    saveEvent,
    deleteEvent,
    refresh: fetchRotationData,
  };
};

export default useRotation;
