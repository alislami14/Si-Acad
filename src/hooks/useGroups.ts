import { useState, useEffect, useCallback } from 'react';
import { StudyGroup } from '../types/database';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil daftar kelompok langsung dari Supabase
  const fetchGroups = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*, members:study_group_members(*, profile:profiles(*))')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const myGroups = data.filter(
          (g) => g.owner_id === user.id || g.members?.some((m: any) => m.user_id === user.id)
        );
        setGroups(myGroups);
      } else if (error) {
        console.error('Error fetching groups from Supabase:', error);
      }
    } catch (err) {
      console.error('Exception fetching groups from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Buat kelompok baru langsung di Supabase
  const createGroup = async (name: string, description: string) => {
    if (!user || !isSupabaseConfigured) {
      return { data: null, error: new Error('User belum login.') };
    }

    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: newGroup, error: groupErr } = await supabase
        .from('study_groups')
        .insert([
          {
            owner_id: user.id,
            name,
            description: description || '',
            invite_code: inviteCode,
          },
        ])
        .select()
        .single();

      if (!groupErr && newGroup) {
        await supabase.from('study_group_members').insert([
          {
            group_id: newGroup.id,
            user_id: user.id,
            role: 'owner',
          },
        ]);

        await fetchGroups();
        return { data: newGroup, error: null };
      }
      return { data: null, error: groupErr };
    } catch (err) {
      console.error('Gagal membuat kelompok di Supabase:', err);
      return { data: null, error: err instanceof Error ? err : new Error('Gagal buat kelompok') };
    }
  };

  // Gabung kelompok via kode undangan langsung di Supabase
  const joinGroupByCode = async (inviteCode: string) => {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!user || !isSupabaseConfigured) {
      return { data: null, error: { message: 'User belum login.' } };
    }

    try {
      const { data: group, error: findErr } = await supabase
        .from('study_groups')
        .select('*')
        .ilike('invite_code', cleanCode)
        .single();

      if (findErr || !group) {
        return { data: null, error: { message: 'Kode undangan tidak valid atau kelompok tidak ditemukan.' } };
      }

      const { error: joinErr } = await supabase.from('study_group_members').insert([
        {
          group_id: group.id,
          user_id: user.id,
          role: 'member',
        },
      ]);

      if (joinErr) {
        if (joinErr.message.includes('unique') || joinErr.message.includes('duplicate')) {
          return { data: null, error: { message: 'Anda sudah bergabung dalam kelompok ini.' } };
        }
        throw joinErr;
      }

      await fetchGroups();
      return { data: group, error: null };
    } catch (err) {
      console.error('Gagal bergabung via Supabase:', err);
      return { data: null, error: { message: 'Gagal bergabung ke kelompok.' } };
    }
  };

  // Regenerasi kode undangan kelompok di Supabase
  const regenerateCode = async (groupId: string): Promise<{ data?: string | null; error?: unknown }> => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!user || !isSupabaseConfigured) return { data: newCode, error: null };

    try {
      const { error } = await supabase
        .from('study_groups')
        .update({ invite_code: newCode })
        .eq('id', groupId)
        .eq('owner_id', user.id);
      if (error) throw error;
      await fetchGroups();
      return { data: newCode, error: null };
    } catch (err) {
      console.error('Gagal regenerate code di Supabase:', err);
      return { data: null, error: err };
    }
  };

  // Keluar dari kelompok di Supabase
  const leaveGroup = async (groupId: string) => {
    if (!user || !isSupabaseConfigured) return;

    try {
      await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
      await fetchGroups();
    } catch (err) {
      console.error('Gagal keluar dari kelompok di Supabase:', err);
    }
  };

  // Hapus kelompok di Supabase
  const deleteGroup = async (groupId: string) => {
    if (!user || !isSupabaseConfigured) return;

    try {
      await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId)
        .eq('owner_id', user.id);
      await fetchGroups();
    } catch (err) {
      console.error('Gagal delete group di Supabase:', err);
    }
  };

  return {
    groups,
    loading,
    createGroup,
    joinGroupByCode,
    regenerateCode,
    leaveGroup,
    deleteGroup,
    refreshGroups: fetchGroups,
  };
};

export default useGroups;
