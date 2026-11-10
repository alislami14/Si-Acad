import { useState, useEffect, useCallback } from 'react';
import { PushSubscription as DBSubscription } from '../types/database';
import { getDeviceName } from '../lib/push';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export const usePushSubscription = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [devices, setDevices] = useState<DBSubscription[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      setIsSubscribed(Notification.permission === 'granted');
    }
  }, []);

  const fetchDevices = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setDevices([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDevices(data);
      }
    } catch (err) {
      console.warn('Gagal memuat perangkat dari Supabase:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Request permission & subscribe
  const requestPermissionAndSubscribe = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupported) {
      return { success: false, error: 'Browser Anda tidak mendukung Web Notification API.' };
    }

    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setIsSubscribed(true);
        const deviceName = getDeviceName();

        // Simpan device ke Supabase
        if (user && isSupabaseConfigured) {
          try {
            await supabase.from('push_subscriptions').upsert({
              user_id: user.id,
              device_name: deviceName,
              endpoint: `local-browser-${navigator.userAgent.slice(0, 30)}`,
              p256dh: 'simulated-p256dh',
              auth: 'simulated-auth',
              last_used_at: new Date().toISOString(),
            });

            await supabase.from('notification_logs').insert([
              {
                user_id: user.id,
                title: 'Notifikasi Web Diaktifkan',
                body: `Perangkat "${deviceName}" berhasil didaftarkan untuk menerima pengingat akademik.`,
                type: 'device_registered',
              },
            ]);
          } catch (e) {
            console.warn('Notice push register Supabase:', e);
          }
        }

        fetchDevices();

        // Test in-app and browser notification
        try {
          new Notification('SI-Acad Notifikasi Aktif!', {
            body: 'Kamu sekarang akan menerima pengingat jadwal kuliah dan deadline tugas.',
            icon: '/favicon.svg',
          });
        } catch {
          // ignore
        }

        return { success: true };
      } else {
        return {
          success: false,
          error:
            result === 'denied'
              ? 'Izin notifikasi ditolak oleh browser. Silakan izinkan di setelan situs browser Anda.'
              : 'Izin notifikasi tidak diberikan.',
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal meminta izin notifikasi.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeCurrentDevice = async () => {
    setLoading(true);
    try {
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (user && isSupabaseConfigured) {
      try {
        await supabase.from('push_subscriptions').delete().eq('id', deviceId).eq('user_id', user.id);
      } catch (e) {
        console.warn('Notice remove device Supabase:', e);
      }
    }
    fetchDevices();
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    devices,
    loading,
    requestPermissionAndSubscribe,
    unsubscribeCurrentDevice,
    removeDevice,
    refreshDevices: fetchDevices,
  };
};

export default usePushSubscription;
