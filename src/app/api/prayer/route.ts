import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

const BASE = 'https://api.aladhan.com/v1';

function normalizeTimings(data: Record<string, unknown>) {
  const map: Record<string, string> = {};
  for (const [key, val] of Object.entries(data)) {
    // AlAdhan returns some extra fields, filter to the 5 prayers + sunrise
    if (['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha', 'Midnight'].includes(key)) {
      // API may return either a plain string "05:38" or an object { time: "05:38" }
      let timeStr = '';
      if (typeof val === 'string') {
        timeStr = val;
      } else if (val && typeof val === 'object' && 'time' in val) {
        timeStr = String((val as { time: string }).time);
      }
      // Strip timezone abbreviation like " (EET)" or " (EEST)"
      const cleaned = timeStr.replace(/\s*\(.*?\)\s*$/, '').trim();
      // Validate HH:MM format
      if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
        map[key] = cleaned;
      }
    }
  }
  return map;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const method = searchParams.get('method') || '4';
  const school = Number(searchParams.get('school')) || 0;
  const monthly = searchParams.get('monthly');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  try {
    if (monthly && year && month) {
      const cacheKey = `prayer-calendar-${lat}-${lng}-${method}-${school}-${year}-${month}`;
      const cached = getCached<unknown>(cacheKey, 24 * 60 * 60 * 1000);
      if (cached) return NextResponse.json(cached);

      const res = await fetch(
        `${BASE}/calendarByCity/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`,
        { next: { revalidate: 86400 } }
      );
      const data = await res.json();
      setCache(cacheKey, data, 24 * 60 * 60 * 1000);
      return NextResponse.json(data);
    }

    const ts = Math.floor(Date.now() / 1000);
    const cacheKey = `prayer-today-${lat}-${lng}-${method}-${school}`;
    const cached = getCached<unknown>(cacheKey, 30 * 60 * 1000);
    if (cached) return NextResponse.json(cached);

    const res = await fetch(
      `${BASE}/timings/${ts}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`,
      { next: { revalidate: 1800 } }
    );

    if (!res.ok) throw new Error(`AlAdhan API error: ${res.status}`);

    const data = await res.json();
    const timings = normalizeTimings(data.data.timings);
    const hijri = data.data.date.hijri;
    const gregorian = data.data.date.gregorian;

    const result = {
      timings,
      date: {
        gregorian: `${gregorian.day} ${gregorian.month.en} ${gregorian.year}`,
        hijri: {
          day: hijri.day,
          month: String(hijri.month.number),
          monthAr: hijri.month.ar,
          monthEn: hijri.month.en,
          year: hijri.year,
          designation: hijri.designation,
          weekday: hijri.weekday,
        },
      },
      meta: data.data.meta,
    };

    setCache(cacheKey, result, 30 * 60 * 1000);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Prayer API error:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer times' }, { status: 500 });
  }
}
