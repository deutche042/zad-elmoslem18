import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitKey = getRateLimitKey(request, '/api/push/subscribe');
  if (!rateLimit(rateLimitKey, 5, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const {
      subscription,
      lat, lng, method, madhab,
      adhanEnabled, reminderEnabled, reminderMinutes,
      salawatEnabled, salawatInterval,
    } = body;

    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    await db.pushSubscription.deleteMany({ where: { endpoint: subscription.endpoint } });
    await db.pushSubscription.create({
      data: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        lat: lat ?? 30.0444,
        lng: lng ?? 31.2357,
        method: method ?? 5,
        madhab: madhab ?? 0,
        adhanEnabled: adhanEnabled ?? true,
        reminderEnabled: reminderEnabled ?? false,
        reminderMinutes: reminderMinutes ?? 10,
        salawatEnabled: salawatEnabled ?? false,
        salawatInterval: salawatInterval ?? 5,
      },
    });

    console.log(`[Push] Subscribed: ${subscription.endpoint.slice(0, 60)}...`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Push] Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}