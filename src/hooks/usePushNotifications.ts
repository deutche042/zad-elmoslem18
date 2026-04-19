'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';

interface PushState {
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  loading: boolean;
}

export function usePushNotifications() {
  const {
    locationLat, locationLng, prayerMethod, madhab,
    adhanEnabled, prayerReminderEnabled, prayerReminderMinutes,
    salawatEnabled, salawatInterval,
  } = useSettingsStore();

  const [state, setState] = useState<PushState>({
    supported: false,
    permission: 'default',
    subscribed: false,
    loading: false,
  });
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  // Check if push is supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setState((prev) => ({
      ...prev,
      supported,
      permission: supported && 'Notification' in window ? Notification.permission : 'denied',
    }));
  }, []);

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        console.log('[Push] Service Worker registered:', reg.scope);
        swRef.current = reg;

        // Cache settings for offline use by Service Worker
        cacheSettingsForSW();

        checkSubscription(reg);
      })
      .catch((err) => {
        console.log('[Push] SW registration failed:', err.message);
      });
  }, []);

  // Cache settings in SW cache so it can use them offline
  const cacheSettingsForSW = useCallback(async () => {
    try {
      if (!('caches' in window)) return;
      const settings = useSettingsStore.getState();
      const cache = await caches.open('zad-muslim-cache');
      const settingsData = {
        adhanEnabled: settings.adhanEnabled,
        reminderEnabled: settings.prayerReminderEnabled,
        reminderMinutes: settings.prayerReminderMinutes,
        salawatEnabled: settings.salawatEnabled,
        salawatInterval: settings.salawatInterval,
        lastSalawatSent: '',
      };
      await cache.put(
        '/api/settings-cache',
        new Response(JSON.stringify(settingsData), {
          headers: { 'Content-Type': 'application/json' },
        })
      );
      console.log('[Push] Settings cached for SW offline use');
    } catch {
      // Caches not available
    }
  }, []);

  // Check current subscription status
  const checkSubscription = useCallback(async (reg: ServiceWorkerRegistration) => {
    try {
      const sub = await reg.pushManager.getSubscription();
      setState((prev) => ({ ...prev, subscribed: !!sub }));
    } catch {}
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!swRef.current || state.loading) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      // 1) Get VAPID public key
      const vapidRes = await fetch('/api/push/vapid');
      const { publicKey } = await vapidRes.json();
      if (!publicKey) throw new Error('No VAPID key');

      // 2) Request notification permission
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));
      if (permission !== 'granted') {
        setState((prev) => ({ ...prev, loading: false }));
        return false;
      }

      // 3) Create push subscription
      const subscription = await swRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 4) Send subscription + all notification settings to server
      const subJson = subscription.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subJson,
          lat: locationLat || 30.0444,
          lng: locationLng || 31.2357,
          method: prayerMethod || 5,
          madhab: madhab || 0,
          adhanEnabled,
          reminderEnabled: prayerReminderEnabled,
          reminderMinutes: prayerReminderMinutes,
          salawatEnabled,
          salawatInterval,
        }),
      });

      setState((prev) => ({ ...prev, subscribed: true, loading: false }));
      console.log('[Push] ✅ Subscribed successfully');
      return true;
    } catch (error) {
      console.error('[Push] Subscribe error:', error);
      setState((prev) => ({ ...prev, loading: false }));
      return false;
    }
  }, [state.loading, locationLat, locationLng, prayerMethod, madhab, adhanEnabled, prayerReminderEnabled, prayerReminderMinutes, salawatEnabled, salawatInterval]);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    if (!swRef.current || state.loading) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const sub = await swRef.current.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }

      setState((prev) => ({ ...prev, subscribed: false, loading: false }));
      console.log('[Push] Unsubscribed');
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe error:', error);
      setState((prev) => ({ ...prev, loading: false }));
      return false;
    }
  }, [state.loading]);

  // Update subscription (when settings change)
  const updateSubscription = useCallback(async () => {
    if (!swRef.current || !state.subscribed) return;

    try {
      const sub = await swRef.current.pushManager.getSubscription();
      if (!sub) return;

      const subJson = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subJson,
          lat: locationLat || 30.0444,
          lng: locationLng || 31.2357,
          method: prayerMethod || 5,
          madhab: madhab || 0,
          adhanEnabled,
          reminderEnabled: prayerReminderEnabled,
          reminderMinutes: prayerReminderMinutes,
          salawatEnabled,
          salawatInterval,
        }),
      });
      console.log('[Push] Subscription updated with new settings');
      // Also update SW cache for offline use
      cacheSettingsForSW();
    } catch {}
  }, [state.subscribed, locationLat, locationLng, prayerMethod, madhab, adhanEnabled, prayerReminderEnabled, prayerReminderMinutes, salawatEnabled, salawatInterval]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    updateSubscription,
  };
}

// Utility: Convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
