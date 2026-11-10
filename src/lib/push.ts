/**
 * SI-Acad Web Push Utilities
 * Handles VAPID key conversion, Service Worker registration, and push subscriptions
 */

import { supabase } from '../config/supabase';

// Convert base64 VAPID public key to Uint8Array for PushManager
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Detect device/browser name
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'Android Device';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS Device';
  if (/windows/i.test(ua)) return 'Windows PC';
  if (/macintosh/i.test(ua)) return 'Mac OS';
  if (/linux/i.test(ua)) return 'Linux Device';
  return 'Web Browser';
}

// Register Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker tidak didukung di browser ini.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (error) {
    console.error('Gagal mendaftarkan Service Worker:', error);
    return null;
  }
}

// Subscribe to Web Push
export async function subscribeToWebPush(
  userId: string,
  vapidPublicKey: string
): Promise<{ success: boolean; subscription?: PushSubscription; error?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Browser Anda tidak mendukung Web Push Notification.' };
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, error: 'Gagal mengaktifkan Service Worker.' };
    }

    // Wait until service worker is active
    await navigator.serviceWorker.ready;

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });

    const subscriptionJson = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const p256dh = subscriptionJson.keys?.p256dh || '';
    const auth = subscriptionJson.keys?.auth || '';

    // Save to Supabase push_subscriptions table
    const { error: dbError } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
        device_name: getDeviceName(),
        last_used_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, endpoint' }
    );

    if (dbError) {
      console.error('Gagal menyimpan subscription ke database:', dbError);
    }

    return { success: true, subscription };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal berlangganan push notification.';
    return { success: false, error: message };
  }
}

// Unsubscribe from Web Push
export async function unsubscribeFromWebPush(userId: string): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Remove from database
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint);
    }

    return true;
  } catch (error) {
    console.error('Gagal unsubscribe push notification:', error);
    return false;
  }
}

