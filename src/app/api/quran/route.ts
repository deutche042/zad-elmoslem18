import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

const QURAN_API = 'https://api.alquran.cloud/v1';

// Cache TTL: 24 hours for surah list, 1 hour for pages/surahs
const SURAH_LIST_TTL = 24 * 60 * 60 * 1000;
const SURAH_DETAIL_TTL = 60 * 60 * 1000;
const PAGE_TTL = 60 * 60 * 1000;

interface AlquranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface AlquranPageAyah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  surah: AlquranSurah;
}

interface AlquranPageResponse {
  code: number;
  status: string;
  data: {
    number: number;
    ayahs: AlquranPageAyah[];
    surahs: Record<string, AlquranSurah>;
  };
}

interface AlquranEditionResponse {
  code: number;
  status: string;
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    ayahs: { number: number; numberInSurah: number; text: string }[];
  };
}

interface AlquranSurahsResponse {
  code: number;
  status: string;
  data: AlquranSurah[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  try {
    if (action === 'surahs') {
      return handleSurahsList();
    }

    if (action === 'surah') {
      const number = searchParams.get('number');
      if (!number || isNaN(Number(number)) || Number(number) < 1 || Number(number) > 114) {
        return NextResponse.json(
          { error: 'Invalid surah number. Must be between 1 and 114.' },
          { status: 400 }
        );
      }
      return handleSurahDetail(Number(number));
    }

    if (action === 'page') {
      const pageNumber = searchParams.get('pageNumber');
      if (!pageNumber || isNaN(Number(pageNumber)) || Number(pageNumber) < 1 || Number(pageNumber) > 604) {
        return NextResponse.json(
          { error: 'Invalid page number. Must be between 1 and 604.' },
          { status: 400 }
        );
      }
      return handlePageDetail(Number(pageNumber));
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "surahs", "surah", or "page".' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Quran API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Quran data. Please try again.' },
      { status: 500 }
    );
  }
}

async function handleSurahsList() {
  const cacheKey = 'quran:all-surahs';
  const cached = getCached<AlquranSurah[]>(cacheKey, SURAH_LIST_TTL);
  if (cached) {
    return NextResponse.json({ surahs: cached });
  }

  const response = await fetch(`${QURAN_API}/surah`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Alquran API error: ${response.status}`);
  }

  const result: AlquranSurahsResponse = await response.json();

  if (result.code !== 200 || result.status !== 'OK') {
    throw new Error('Alquran API returned non-OK status');
  }

  const surahs = result.data;
  setCache(cacheKey, surahs, SURAH_LIST_TTL);

  return NextResponse.json({ surahs });
}

async function handleSurahDetail(surahNumber: number) {
  const cacheKey = `quran:surah:${surahNumber}`;
  const cached = getCached<{
    surah: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      numberOfAyahs: number;
      revelationType: string;
    };
    ayahs: {
      number: number;
      numberInSurah: number;
      text: string;
      translation?: string;
    }[];
  }>(cacheKey, SURAH_DETAIL_TTL);

  if (cached) {
    return NextResponse.json(cached);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let arabicResponse: globalThis.Response | null = null;
  let translationResponse: globalThis.Response | null = null;

  try {
    const [arabic, translation]: [globalThis.Response, globalThis.Response | null] = await Promise.all([
      fetch(`${QURAN_API}/surah/${surahNumber}/quran-uthmani`, {
        next: { revalidate: 86400 },
        signal: controller.signal,
      }),
      fetch(`${QURAN_API}/surah/${surahNumber}/en.asad`, {
        next: { revalidate: 86400 },
        signal: controller.signal,
      }).catch(() => null),
    ]);
    arabicResponse = arabic;
    translationResponse = translation;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!arabicResponse || !arabicResponse.ok) {
    throw new Error(`Alquran API error: ${arabicResponse?.status ?? 'fetch failed'}`);
  }

  const arabicResult: AlquranEditionResponse = await arabicResponse.json();

  if (arabicResult.code !== 200 || arabicResult.status !== 'OK') {
    throw new Error('Alquran API returned non-OK status');
  }

  let translations: Record<number, string> = {};

  if (translationResponse && translationResponse.ok) {
    try {
      const translationResult: AlquranEditionResponse = await translationResponse.json();
      if (translationResult.code === 200) {
        translations = translationResult.data.ayahs.reduce(
          (acc, ayah) => {
            acc[ayah.number] = ayah.text;
            return acc;
          },
          {} as Record<number, string>
        );
      }
    } catch {
      // Translation parse error — continue without translations
    }
  }

  const { ayahs: arabicAyahs, ...surahMeta } = arabicResult.data;

  const ayahs = arabicAyahs.map((ayah) => ({
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    text: ayah.text,
    translation: translations[ayah.number] || undefined,
  }));

  const result = { surah: surahMeta, ayahs };
  setCache(cacheKey, result, SURAH_DETAIL_TTL);

  return NextResponse.json(result);
}

async function handlePageDetail(pageNumber: number) {
  const cacheKey = `quran:page:${pageNumber}`;
  const cached = getCached<{
    number: number;
    ayahs: {
      number: number;
      text: string;
      numberInSurah: number;
      juz: number;
      hizbQuarter: number;
      sajda: boolean;
      surah?: AlquranSurah;
    }[];
    surahStarts: AlquranSurah[];
  }>(cacheKey, PAGE_TTL);

  if (cached) {
    return NextResponse.json(cached);
  }

  const response = await fetch(`${QURAN_API}/page/${pageNumber}/quran-uthmani`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Alquran API error: ${response.status}`);
  }

  const result: AlquranPageResponse = await response.json();

  if (result.code !== 200 || result.status !== 'OK') {
    throw new Error('Alquran API returned non-OK status');
  }

  const { ayahs: pageAyahs } = result.data;

  // Map ayahs with sajda handling
  const ayahs = pageAyahs.map((ayah) => ({
    number: ayah.number,
    text: ayah.text,
    numberInSurah: ayah.numberInSurah,
    juz: ayah.juz,
    hizbQuarter: ayah.hizbQuarter,
    sajda: typeof ayah.sajda === 'object'
      ? (ayah.sajda.obligatory || ayah.sajda.recommended)
      : !!ayah.sajda,
    surah: ayah.surah,
  }));

  // Find which surahs START on this page by checking numberInSurah === 1
  const surahStarts: AlquranSurah[] = [];
  for (const ayah of pageAyahs) {
    if (ayah.numberInSurah === 1 && ayah.surah) {
      // Check if we already added this surah
      if (!surahStarts.find((s) => s.number === ayah.surah.number)) {
        surahStarts.push(ayah.surah);
      }
    }
  }

  const data = {
    number: result.data.number,
    ayahs,
    surahStarts,
  };
  setCache(cacheKey, data, PAGE_TTL);

  return NextResponse.json(data);
}
