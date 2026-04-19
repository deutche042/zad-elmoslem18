import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import webpush from 'web-push';

// Configure VAPID
const privateKey = process.env.VAPID_PRIVATE_KEY;
if (privateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:zad-muslim@app.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey
  );
}

interface PrayerTimes {
  Fajr?: string;
  Dhuhr?: string;
  Asr?: string;
  Maghrib?: string;
  Isha?: string;
}

const PRAYER_AR: Record<string, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

async function fetchPrayerTimes(lat: number, lng: number, method: number, school: number): Promise<PrayerTimes> {
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AlAdhan API error: ${res.status}`);
  const json = await res.json();
  return json.data?.timings || {};
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

async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: object) {
  await webpush.sendNotification(
    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
    JSON.stringify(payload),
    { TTL: 60 }
  );
}

export async function GET() {
  if (!privateKey) {
    console.log('[Push Cron] VAPID not configured, skipping');
    return NextResponse.json({ status: 'skipped', reason: 'no_vapid' });
  }

  try {
    console.log('[Push Cron] Starting check...');

    if (!db) {
      console.error('[Push Cron] db is null or undefined');
      return NextResponse.json({ error: 'DB not initialized' }, { status: 500 });
    }

    const dbClient = db;
    const subscriptions = await dbClient.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      console.log('[Push Cron] No subscriptions found');
      return NextResponse.json({ status: 'ok', sent: 0, reason: 'no_subscribers' });
    }

    const now = new Date();
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const currentDateStr = now.toISOString().slice(0, 10);
    const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

    let totalSent = 0;
    let totalFailed = 0;

    for (const sub of subscriptions) {
      try {
        let timings: PrayerTimes = {};

        // Fetch prayer times if adhan or reminder is enabled
        if (sub.adhanEnabled || sub.reminderEnabled) {
          timings = await fetchPrayerTimes(sub.lat, sub.lng, sub.method, sub.madhab);
        }

        // ─── 1) Adhan: at exact prayer time ───
        if (sub.adhanEnabled && timings) {
          for (const prayer of prayerKeys) {
            const parsed = parseTime(timings[prayer] || '');
            if (!parsed) continue;

            const prayerMinutes = parsed.h * 60 + parsed.m;
            const diff = Math.abs(currentMinutes - prayerMinutes);

            if (diff <= 1) {
              await sendPush(sub, {
                title: 'حان وقت الصلاة',
                body: `حان وقت صلاة ${PRAYER_AR[prayer]} — الله أكبر`,
                icon: '/icon.png',
                prayer,
                type: 'adhan',
              });
              console.log(`[Push Cron] ✅ Adhan ${PRAYER_AR[prayer]} → ${sub.endpoint.slice(0, 40)}...`);
              totalSent++;
            }
          }
        }

        // ─── 2) Prayer Reminder: X minutes before prayer ───
        if (sub.reminderEnabled && timings) {
          for (const prayer of prayerKeys) {
            const parsed = parseTime(timings[prayer] || '');
            if (!parsed) continue;

            const prayerMinutes = parsed.h * 60 + parsed.m;
            const reminderMinutes = prayerMinutes - sub.reminderMinutes;
            const diff = Math.abs(currentMinutes - reminderMinutes);

            if (diff <= 1 && reminderMinutes > 0) {
              await sendPush(sub, {
                title: 'تذكير بالصلاة',
                body: `باقي ${sub.reminderMinutes} دقيقة على صلاة ${PRAYER_AR[prayer]}`,
                icon: '/icon.png',
                prayer,
                type: 'reminder',
              });
              console.log(`[Push Cron] ✅ Reminder ${PRAYER_AR[prayer]} (-${sub.reminderMinutes}m) → ${sub.endpoint.slice(0, 40)}...`);
              totalSent++;
            }
          }
        }

        // ─── 3) Salawat: every X minutes ───
        if (sub.salawatEnabled && sub.salawatInterval > 0) {
          // Check if we should send salawat now
          // Use minute-of-day modulo to determine salawat timing
          const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
          if (minuteOfDay % sub.salawatInterval === 0) {
            // Prevent duplicate: check lastSalawatSent
            const salawatSlot = `${currentDateStr}-${currentMinutes}`;
            if (sub.lastSalawatSent !== salawatSlot) {
              await sendPush(sub, {
                title: 'اللهم صلِّ على محمد ﷺ',
                body: 'لا تنسَ الصلاة على النبي ﷺ',
                icon: '/icon.png',
                type: 'salawat',
              });
              // Update lastSalawatSent to prevent duplicate
              await dbClient.pushSubscription.update({
                where: { endpoint: sub.endpoint },
                data: { lastSalawatSent: salawatSlot },
              });
              console.log(`[Push Cron] ✅ Salawat → ${sub.endpoint.slice(0, 40)}...`);
              totalSent++;
            }
          }
        }
      } catch (error: unknown) {
        const err = error as Error & { statusCode?: number };
        totalFailed++;
        console.error(`[Push Cron] ✗ Failed for ${sub.endpoint.slice(0, 40)}...:`, err.message);

        // If subscription is no longer valid, delete it
        if (err.statusCode === 404 || err.statusCode === 410) {
          await dbClient.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
          console.log(`[Push Cron] 🗑 Deleted stale subscription`);
        }
      }
    }

    console.log(`[Push Cron] Done — sent: ${totalSent}, failed: ${totalFailed}`);
    return NextResponse.json({
      status: 'ok',
      sent: totalSent,
      failed: totalFailed,
      subscribers: subscriptions.length,
    });
  } catch (error) {
    console.error('[Push Cron] Error:', error);
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
