// Zad Muslim - Service Worker for Push Notifications + Background Sync
// Handles:
// 1. Push notifications from Vercel server (when online)
// 2. Periodic Background Sync (when offline — no server needed!)

const PRAYER_AR = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

// ═══════════════════════════════════════════════════════════════
//  LOCAL STORAGE HELPERS (for offline prayer times cache)
// ═══════════════════════════════════════════════════════════════

async function getCachedPrayerTimes() {
  const data = await caches.match('/api/prayer-cache');
  if (!data) return null;
  try {
    return await data.json();
  } catch {
    return null;
  }
}

async function cachePrayerTimes(timings: object) {
  const response = new Response(JSON.stringify(timings), {
    headers: { 'Content-Type': 'application/json' },
  });
  await caches.open('zad-muslim-cache').then((cache) => {
    cache.put('/api/prayer-cache', response);
  });
}

async function getSettings() {
  const data = await caches.match('/api/settings-cache');
  if (!data) return {
    adhanEnabled: true,
    reminderEnabled: false,
    reminderMinutes: 10,
    salawatEnabled: false,
    salawatInterval: 5,
    lastSalawatSent: '',
  };
  try {
    return await data.json();
  } catch {
    return {
      adhanEnabled: true,
      reminderEnabled: false,
      reminderMinutes: 10,
      salawatEnabled: false,
      salawatInterval: 5,
      lastSalawatSent: '',
    };
  }
}

async function saveSettings(settings: object) {
  const response = new Response(JSON.stringify(settings), {
    headers: { 'Content-Type': 'application/json' },
  });
  await caches.open('zad-muslim-cache').then((cache) => {
    cache.put('/api/settings-cache', response);
  });
}

function parseTime(timeStr: string): { h: number; m: number } | null {
  if (!timeStr) return null;
  const cleaned = timeStr.replace(/\s*\(.*?\)/, '').trim();
  const parts = cleaned.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return { h, m };
}

function showNotif(title: string, body: string, tag: string, requireInteraction: boolean = false, vibrate: number[] = [200, 100, 200]) {
  self.registration.showNotification(title, {
    body,
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate,
    tag,
    renotify: true,
    requireInteraction,
    actions: [{ action: 'dismiss', title: 'إغلاق' }],
    data: { url: '/', type: tag.split('-')[0] },
  });
}

// ═══════════════════════════════════════════════════════════════
//  INSTALL & ACTIVATE
// ═══════════════════════════════════════════════════════════════

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(clients.claim());

  // Register periodic background sync for offline notifications
  if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('prayer-check', {
      minInterval: 60 * 1000, // every minute
    }).then(() => {
      console.log('[SW] Periodic Background Sync registered ✅');
    }).catch((err: Error) => {
      console.log('[SW] Periodic Background Sync not available:', err.message);
    });
  } else {
    console.log('[SW] Periodic Background Sync API not supported in this browser');
  }

  // Also register salawat sync if enabled
  if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('salawat-check', {
      minInterval: 5 * 60 * 1000, // every 5 minutes (minimum allowed)
    }).then(() => {
      console.log('[SW] Salawat Periodic Sync registered ✅');
    }).catch((err: Error) => {
      console.log('[SW] Salawat Periodic Sync not available:', err.message);
    });
  }
});

// ═══════════════════════════════════════════════════════════════
//  PERIODIC BACKGROUND SYNC — Works WITHOUT internet!
// ═══════════════════════════════════════════════════════════════

self.addEventListener('periodicsync', async (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'prayer-check') {
    event.waitUntil(checkPrayerTimesOffline());
  } else if (event.tag === 'salawat-check') {
    event.waitUntil(checkSalawatOffline());
  }
});

// Check prayer times from cached data (no internet needed!)
async function checkPrayerTimesOffline() {
  const cached = await getCachedPrayerTimes();
  const settings = await getSettings();

  if (!cached || !cached.timings) {
    console.log('[SW] No cached prayer times, skipping offline check');
    return;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentDateStr = now.toISOString().slice(0, 10);
  const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

  // ─── Adhan: at exact prayer time ───
  if (settings.adhanEnabled) {
    for (const prayer of prayerKeys) {
      const parsed = parseTime(cached.timings[prayer]);
      if (!parsed) continue;

      const prayerMinutes = parsed.h * 60 + parsed.m;
      const diff = Math.abs(currentMinutes - prayerMinutes);

      if (diff <= 1) {
        const adhanTag = `adhan-${prayer}-${currentDateStr}`;
        // Check if we already sent this notification today
        const sentKey = `sent-adhan-${prayer}-${currentDateStr}`;
        const sentData = await caches.match(`/api/${sentKey}`);
        if (sentData) continue; // Already sent

        showNotif(
          'حان وقت الصلاة',
          `حان وقت صلاة ${PRAYER_AR[prayer]} — الله أكبر`,
          adhanTag,
          true,
          [200, 100, 200, 100, 200, 100, 200]
        );

        // Mark as sent
        await caches.open('zad-muslim-cache').then((cache) => {
          cache.put(`/api/${sentKey}`, new Response('sent'));
        });

        console.log(`[SW] ✅ Offline adhan: ${PRAYER_AR[prayer]}`);
      }
    }
  }

  // ─── Prayer Reminder: X minutes before prayer ───
  if (settings.reminderEnabled) {
    for (const prayer of prayerKeys) {
      const parsed = parseTime(cached.timings[prayer]);
      if (!parsed) continue;

      const prayerMinutes = parsed.h * 60 + parsed.m;
      const reminderMinutes = prayerMinutes - settings.reminderMinutes;

      if (reminderMinutes > 0) {
        const diff = Math.abs(currentMinutes - reminderMinutes);
        if (diff <= 1) {
          const reminderTag = `reminder-${prayer}-${currentDateStr}`;
          const sentKey = `sent-reminder-${prayer}-${currentDateStr}`;
          const sentData = await caches.match(`/api/${sentKey}`);
          if (sentData) continue;

          showNotif(
            'تذكير بالصلاة',
            `باقي ${settings.reminderMinutes} دقيقة على صلاة ${PRAYER_AR[prayer]}`,
            reminderTag,
            true,
            [200, 100, 200]
          );

          await caches.open('zad-muslim-cache').then((cache) => {
            cache.put(`/api/${sentKey}`, new Response('sent'));
          });

          console.log(`[SW] ✅ Offline reminder: ${PRAYER_AR[prayer]} (-${settings.reminderMinutes}m)`);
        }
      }
    }
  }
}

// Check salawat from cached settings (no internet needed!)
async function checkSalawatOffline() {
  const settings = await getSettings();

  if (!settings.salawatEnabled || settings.salawatInterval <= 0) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentDateStr = now.toISOString().slice(0, 10);
  const salawatSlot = `${currentDateStr}-${Math.floor(currentMinutes / settings.salawatInterval)}`;

  if (settings.lastSalawatSent === salawatSlot) return; // Already sent

  showNotif(
    'اللهم صلِّ على محمد ﷺ',
    'لا تنسَ الصلاة على النبي ﷺ',
    `salawat-${salawatSlot}`,
    false,
    [200, 100, 200]
  );

  // Update lastSalawatSent
  await saveSettings({ ...settings, lastSalawatSent: salawatSlot });
  console.log('[SW] ✅ Offline salawat notification');
}

// ═══════════════════════════════════════════════════════════════
//  PUSH NOTIFICATIONS — From Vercel server (when online)
// ═══════════════════════════════════════════════════════════════

self.addEventListener('push', (event) => {
  console.log('[SW] Push received from server');

  let data = {};
  try {
    data = event.data?.json() || {};
  } catch {
    data = { title: 'زاد مسلم', body: event.data?.text() || '' };
  }

  const { title, body, icon, prayer, type } = data;

  const notificationTitle = title || 'زاد مسلم';
  const notificationBody = body || '';
  const notificationTag = type === 'adhan'
    ? `adhan-${prayer || 'unknown'}`
    : type === 'reminder'
    ? `reminder-${prayer || 'unknown'}`
    : type === 'salawat'
    ? 'salawat-reminder'
    : 'zad-muslim-notification';

  const requireInteraction = type === 'adhan' || type === 'reminder';
  const vibrate = type === 'adhan'
    ? [200, 100, 200, 100, 200, 100, 200]
    : [200, 100, 200];

  event.waitUntil(
    self.registration.showNotification(notificationTitle, {
      body: notificationBody,
      icon: icon || '/icon.png',
      badge: '/icon.png',
      vibrate,
      tag: notificationTag,
      renotify: true,
      requireInteraction,
      actions: [{ action: 'dismiss', title: 'إغلاق' }],
      data: { url: '/', prayer: prayer || '', type: type || 'general' },
    })
  );
});

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATION CLICK
// ═══════════════════════════════════════════════════════════════

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// ═══════════════════════════════════════════════════════════════
//  FETCH — Cache prayer times + settings for offline use
// ═══════════════════════════════════════════════════════════════

self.addEventListener('fetch', (event) => {
  // Cache prayer times responses for offline use
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/prayer') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).then((response) => {
        // Clone and cache the response
        const cloned = response.clone();
        cloned.json().then((data) => {
          cachePrayerTimes(data);
          console.log('[SW] Cached prayer times for offline use');
        }).catch(() => {});
        return response;
      }).catch(() => {
        // If offline, try to serve cached data
        return caches.match('/api/prayer-cache').then((cached) => {
          if (cached) {
            console.log('[SW] Serving cached prayer times');
            return cached;
          }
          return new Response(JSON.stringify({ error: 'No cached data' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        });
      })
    );
  }
});
