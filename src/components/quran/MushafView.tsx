'use client';

import { Fragment, useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Headphones,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  X,
  Home,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useQuranStore } from '@/store/quran-store';
import { useSettingsStore } from '@/store/settings-store';
import { useAppStore } from '@/store/app-store';
import { useQuranAudio } from './useQuranAudio';
import { ReciterSelector } from './ReciterSelector';
import { TRANSLATIONS, RECITERS } from '@/lib/constants';
import { useQuranCache } from '@/store/quran-cache-store';

interface PageAyahData {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface SurahStart {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface PageData {
  number: number;
  ayahs: PageAyahData[];
  surahStarts: SurahStart[];
}

// Juz numbers and their starting page numbers
const JUZ_START_PAGES: Record<number, number> = {
  1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 121, 8: 142, 9: 162, 10: 182,
  11: 202, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
  21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582,
};

// Surah numbers and their starting page numbers (standard King Fahd complex Mushaf)
const SURAH_START_PAGES: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 349, 25: 357, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 505, 47: 511, 48: 515, 49: 519, 50: 521,
  51: 523, 52: 526, 53: 528, 54: 531, 55: 534, 56: 537, 57: 541, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 556, 64: 558, 65: 560, 66: 562, 67: 564, 68: 567, 69: 568, 70: 570,
  71: 572, 72: 574, 73: 577, 74: 580, 75: 582, 76: 584, 77: 586, 78: 588, 79: 591, 80: 593,
  81: 595, 82: 597, 83: 599, 84: 601, 85: 602, 86: 604, 87: 604, 88: 604, 89: 604, 90: 604,
  91: 604, 92: 604, 93: 604, 94: 604, 95: 604, 96: 604, 97: 604, 98: 604, 99: 604, 100: 604,
  101: 604, 102: 604, 103: 604, 104: 604, 105: 604, 106: 604, 107: 604, 108: 604, 109: 604, 110: 604,
  111: 604, 112: 604, 113: 604, 114: 604,
};

// Page flip animation variants
const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.5,
    rotateY: direction > 0 ? -15 : 15,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0.5,
    rotateY: direction > 0 ? 15 : -15,
    scale: 0.95,
  }),
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 35,
  mass: 0.8,
};

export function MushafView() {
  const currentPage = useQuranStore((s) => s.currentPage);
  const setPage = useQuranStore((s) => s.setPage);
  const setLastRead = useQuranStore((s) => s.setLastRead);
  const { isPlaying, currentAyah } = useQuranStore();
  const isBookmarked = useQuranStore((s) => s.isBookmarked);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const reciterId = useSettingsStore((s) => s.reciterId);
  const language = useSettingsStore((s) => s.language);
  const quranFontSize = useSettingsStore((s) => s.quranFontSize);
  const t = TRANSLATIONS[language];

  // Compute dynamic font size from settings (slider: 18–48)
  // Map slider value → rem: 18→0.95, 28→1.4, 48→2.4
  const fontSizeRem = quranFontSize / 20;
  const lineHeight = 2.2 + (quranFontSize - 18) / 30 * 1.2; // 2.2–3.4

  const [showReciters, setShowReciters] = useState(false);
  const [showPageJump, setShowPageJump] = useState(false);
  const [showJuzPicker, setShowJuzPicker] = useState(false);
  const [showSurahIndex, setShowSurahIndex] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [jumpPage, setJumpPage] = useState('');
  const [surahSearch, setSurahSearch] = useState('');
  const [flipDirection, setFlipDirection] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const surahListRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false);
  const toolbarTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playAyah, pause, resume, stop } = useQuranAudio(reciterId);
  const cacheGetPage = useQuranCache((s) => s.getPage);
  const cacheSetPage = useQuranCache((s) => s.setPage);

  // Fetch current page — cache-first strategy
  const { data, isLoading } = useQuery<PageData>({
    queryKey: ['quran-page', currentPage],
    queryFn: async () => {
      const res = await fetch(`/api/quran?action=page&pageNumber=${currentPage}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch page ${currentPage}: ${res.status}`);
      }
      const json = await res.json();
      if (!json.ayahs || !Array.isArray(json.ayahs)) {
        throw new Error('Invalid response: missing ayahs array');
      }
      const ayahs: PageAyahData[] = json.ayahs.map((a: unknown) => {
        const ayah = a as Record<string, unknown>;
        return {
          number: Number(ayah.number) || 0,
          text: String(ayah.text || ''),
          numberInSurah: Number(ayah.numberInSurah) || 0,
          juz: Number(ayah.juz) || 0,
          hizbQuarter: Number(ayah.hizbQuarter) || 0,
          sajda: Boolean(ayah.sajda),
        };
      });
      const surahStarts: SurahStart[] = (json.surahStarts || []).map((s: unknown) => {
        const surah = s as Record<string, unknown>;
        return {
          number: Number(surah.number) || 0,
          name: String(surah.name || ''),
          englishName: String(surah.englishName || ''),
          englishNameTranslation: String(surah.englishNameTranslation || ''),
          numberOfAyahs: Number(surah.numberOfAyahs) || 0,
          revelationType: String(surah.revelationType || ''),
        };
      });
      const pageData: PageData = {
        number: json.number,
        ayahs,
        surahStarts,
      };
      cacheSetPage({
        number: pageData.number,
        ayahs: pageData.ayahs,
        surahStarts: pageData.surahStarts,
        timestamp: Date.now(),
      });
      return pageData;
    },
    // If we have cached data, use it as initial data
    initialData: () => {
      const cached = cacheGetPage(currentPage);
      if (cached) return cached as PageData;
      return undefined;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24h — data doesn't change
    gcTime: Infinity, // Never garbage collect
    retry: 1,
  });

  // Fetch surah list for index — cached
  const { data: surahsData } = useQuery<{ surahs: SurahStart[] }>({
    queryKey: ['quran-surahs'],
    queryFn: () => fetch('/api/quran?action=surahs').then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: Infinity,
    retry: 1,
  });

  // Prefetch adjacent pages and cache them
  const prefetchPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= 604 && !cacheGetPage(page)) {
        fetch(`/api/quran?action=page&pageNumber=${page}`)
          .then((res) => res.json())
          .then((json) => {
            cacheSetPage({
              number: json.number,
              ayahs: json.ayahs as PageAyahData[],
              surahStarts: json.surahStarts as unknown as SurahStart[],
              timestamp: Date.now(),
            });
          })
          .catch(() => { /* ignore prefetch errors */ });
      }
    },
    [cacheGetPage, cacheSetPage]
  );

  useEffect(() => {
    prefetchPage(currentPage - 1);
    prefetchPage(currentPage + 1);
  }, [currentPage, prefetchPage]);

  // Scroll to top on page change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  // Track last read
  useEffect(() => {
    if (data) {
      const firstAyah = data.ayahs[0];
      if (firstAyah) {
        const surahStart = data.surahStarts?.[0];
        if (surahStart) {
          setLastRead(surahStart.number, firstAyah.numberInSurah, currentPage);
        } else {
          setLastRead(1, firstAyah.number, currentPage);
        }
      }
    }
  }, [data, currentPage, setLastRead]);

  // Auto-flip mushaf page when audio advances past the current page's last ayah
  useEffect(() => {
    if (!isPlaying || !data || !currentAyah || data.ayahs.length === 0) return;
    const lastAyahOnPage = data.ayahs[data.ayahs.length - 1];
    if (!lastAyahOnPage) return;
    if (currentAyah > lastAyahOnPage.number && currentPage < 604) {
      const nextPage = currentPage + 1;
      setTimeout(() => {
        setFlipDirection(1);
        setPage(nextPage);
      }, 0);
    }
  }, [currentAyah, isPlaying, data, currentPage, setPage, setFlipDirection]);

  // Auto-hide toolbar after inactivity
  const startHideTimer = useCallback(() => {
    if (toolbarTimeout.current) clearTimeout(toolbarTimeout.current);
    toolbarTimeout.current = setTimeout(() => {
      setShowToolbar(false);
    }, 5000);
  }, []);

  // Show toolbar and restart hide timer
  const resetToolbarTimer = useCallback(() => {
    setShowToolbar(true);
    startHideTimer();
  }, [startHideTimer]);

  // Initial mount: start auto-hide timer only
  useEffect(() => {
    startHideTimer();
    return () => {
      if (toolbarTimeout.current) clearTimeout(toolbarTimeout.current);
    };
  }, [startHideTimer]);

  const goNextPage = useCallback(() => {
    stop();
    if (currentPage < 604) {
      setFlipDirection(1);
      setPage(currentPage + 1);
      resetToolbarTimer();
    }
  }, [currentPage, setPage, stop, resetToolbarTimer]);

  const goPrevPage = useCallback(() => {
    stop();
    if (currentPage > 1) {
      setFlipDirection(-1);
      setPage(currentPage - 1);
      resetToolbarTimer();
    }
  }, [currentPage, setPage, stop, resetToolbarTimer]);

  // Touch / Swipe handling with LOW sensitivity
  // Only trigger on horizontal swipe that exceeds threshold AND is mostly horizontal (not vertical scroll)
  const SWIPE_THRESHOLD = 80; // Min horizontal distance to trigger flip
  const MAX_VERTICAL_RATIO = 0.35; // If vertical movement > 35% of horizontal, ignore (it's a scroll)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Don't prevent default to allow normal scrolling
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Check if this is a horizontal swipe (not vertical scroll)
    if (absDx > 20 && absDy < absDx * MAX_VERTICAL_RATIO) {
      isSwiping.current = true;
    } else {
      isSwiping.current = false;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    const elapsed = Date.now() - touchStartTime.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Only trigger if:
    // 1. Horizontal distance exceeds threshold
    // 2. Mostly horizontal movement (not vertical scroll)
    // 3. Reasonably fast gesture (under 800ms)
    if (absDx >= SWIPE_THRESHOLD && absDy < absDx * MAX_VERTICAL_RATIO && elapsed < 800) {
      if (dx < 0) {
        // Swiped left → next page (RTL: visual left = next)
        goNextPage();
      } else {
        // Swiped right → prev page (RTL: visual right = prev)
        goPrevPage();
      }
    }

    isSwiping.current = false;
  }, [goNextPage, goPrevPage]);

  const handlePageJump = useCallback(() => {
    const num = parseInt(jumpPage, 10);
    if (num >= 1 && num <= 604) {
      stop();
      setFlipDirection(num > currentPage ? 1 : -1);
      setPage(num);
      setShowPageJump(false);
      setJumpPage('');
    }
  }, [jumpPage, currentPage, setPage, stop]);

  const handlePlayToggle = useCallback(() => {
    if (!data) return;
    if (isPlaying) {
      pause();
    } else if (currentAyah) {
      resume();
    } else {
      const firstAyah = data.ayahs[0];
      if (firstAyah) playAyah(1, firstAyah.number);
    }
  }, [data, isPlaying, currentAyah, pause, resume, playAyah]);

  const handleAyahClick = useCallback(
    (ayahData: PageAyahData) => {
      if (isPlaying && currentAyah === ayahData.number) {
        pause();
      } else {
        stop();
        playAyah(1, ayahData.number);
      }
    },
    [isPlaying, currentAyah, pause, stop, playAyah]
  );

  // Get current juz for display
  const currentJuz = data
    ? Object.entries(JUZ_START_PAGES).find(
        ([, startPage]) => currentPage >= startPage
      )?.[0]
    : null;

  // Determine which surah starts on this page
  const pageSurahStart = data?.surahStarts?.[0];

  // Check for mid-page surah starts
  const midPageStarts: { index: number; surah: SurahStart }[] = [];
  if (data && data.surahStarts && data.surahStarts.length > 1) {
    for (let i = 1; i < data.surahStarts.length; i++) {
      const surah = data.surahStarts[i];
      const idx = data.ayahs.findIndex(
        (a) => a.numberInSurah === 1
      );
      if (idx > 0) {
        midPageStarts.push({ index: idx, surah });
      }
    }
  }

  // Check for bismillah needed
  const needsBismillah =
    !!pageSurahStart && pageSurahStart.number !== 9 && pageSurahStart.number !== 1;

  // Filter surahs for search - partial match on any characters
  const filteredSurahs = surahsData?.surahs.filter((s) => {
    if (!surahSearch.trim()) return true;
    const q = surahSearch.trim();
    return (
      s.name.includes(q) ||
      s.englishName.toLowerCase().includes(q.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(q.toLowerCase()) ||
      String(s.number).includes(q)
    );
  });

  // Navigate to surah
  const handleSurahSelect = useCallback(
    (surahNumber: number) => {
      const startPage = SURAH_START_PAGES[surahNumber] || 1;
      stop();
      setFlipDirection(startPage > currentPage ? 1 : -1);
      setPage(startPage);
      setShowSurahIndex(false);
      setSurahSearch('');
    },
    [currentPage, setPage, stop]
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#FBF4E4]">
      {/* ─── Floating Toolbar (auto-hides) ─── */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 top-0 z-30 p-2 pt-3 sm:p-3 sm:pt-4"
          >
            <div className="mx-auto flex max-w-4xl items-center justify-between rounded-2xl border border-amber-900/30 bg-black/60 px-3 py-2.5 shadow-xl backdrop-blur-xl sm:px-4">
              {/* Left: Home button + Surah Index */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { stop(); useAppStore.getState().setActiveTab('home'); }}
                  className="flex items-center justify-center rounded-xl p-2 text-amber-200/70 transition-colors hover:bg-amber-900/30 hover:text-amber-200"
                  title={language === 'ar' ? 'الرئيسية' : 'Home'}
                >
                  <Home size={16} />
                </button>
                <button
                  onClick={() => setShowSurahIndex(true)}
                  className="flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs text-amber-200/70 transition-colors hover:bg-amber-900/30 hover:text-amber-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="7" x2="16" y2="7" strokeLinecap="round" />
                    <line x1="8" y1="11" x2="14" y2="11" strokeLinecap="round" />
                  </svg>
                  <span className="hidden sm:inline">{language === 'ar' ? 'السور' : 'Surahs'}</span>
                </button>
              </div>

              {/* Center: Page indicator */}
              <button
                onClick={() => setShowPageJump(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-amber-900/30"
              >
                <BookOpen size={14} className="text-amber-400" />
                <span className="text-amber-100">
                  {t.page} {currentPage} {t.of} 604
                </span>
                {currentJuz && (
                  <span className="rounded-lg bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-400">
                    {t.juz} {currentJuz}
                  </span>
                )}
              </button>

              {/* Right: Juz + Audio */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setShowJuzPicker(true)}
                  className="flex items-center gap-1 rounded-xl px-2 py-2 text-xs text-amber-200/70 transition-colors hover:bg-amber-900/30 hover:text-amber-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span className="hidden sm:inline">{language === 'ar' ? 'الأجزاء' : 'Juz'}</span>
                </button>
                <button
                  onClick={() => setShowReciters(!showReciters)}
                  className="rounded-xl p-2 text-amber-200/70 transition-colors hover:bg-amber-900/30 hover:text-amber-200"
                >
                  <Headphones size={14} />
                </button>
                <button
                  onClick={handlePlayToggle}
                  className={`rounded-xl p-2 transition-colors ${
                    isPlaying
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-amber-200/70 hover:bg-amber-900/30 hover:text-amber-200'
                  }`}
                >
                  {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Reciter name display ─── */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-14 z-30 sm:top-16"
          >
            <ReciterNameDisplay reciterId={reciterId} language={language} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Page Content - scrollable area with touch support ─── */}
      <div
        ref={scrollContainerRef}
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto"
        dir="rtl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          // Tap to toggle toolbar
          resetToolbarTimer();
        }}
      >
        <div className="flex min-h-full flex-col justify-center p-1.5 sm:p-2 md:p-3">
          {isLoading ? (
            <MushafPageSkeleton />
          ) : data ? (
            <AnimatePresence mode="wait" custom={flipDirection}>
              <motion.div
                key={currentPage}
                custom={flipDirection}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
                className="mushaf-page flex min-h-[100dvh] w-full flex-col"
              >
                <MushafPage
                  data={data}
                  currentPage={currentPage}
                  needsBismillah={needsBismillah}
                  midPageStarts={midPageStarts}
                  isPlaying={isPlaying}
                  currentAyah={currentAyah}
                  onAyahClick={handleAyahClick}
                  onBookmark={() => {
                    if (pageSurahStart) {
                      toggleBookmark(pageSurahStart.number, data.ayahs[0]?.number, currentPage);
                    }
                  }}
                  isBookmarked={pageSurahStart ? isBookmarked(pageSurahStart.number, data.ayahs[0]?.number) : false}
                  onPageNumberClick={() => setShowPageJump(true)}
                  fontSizeRem={fontSizeRem}
                  lineHeight={lineHeight}
                />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>

      {/* ─── Overlay Navigation Controls (on top of page, floating) ─── */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-3 pb-4 sm:p-4 sm:pb-5"
          >
            {/* Previous Page - RIGHT side (RTL) */}
            <button
              onClick={goPrevPage}
              disabled={currentPage <= 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-900/30 bg-black/60 shadow-lg backdrop-blur-xl transition-all hover:bg-black/80 disabled:opacity-20 sm:h-12 sm:w-12"
            >
              <ChevronRight size={20} className="text-amber-200" />
            </button>

            {/* Center: Progress */}
            <div className="flex items-center gap-1 rounded-full border border-amber-900/30 bg-black/60 px-3 py-2 shadow-lg backdrop-blur-xl">
              {Array.from({ length: 7 }).map((_, i) => {
                const pageMark = Math.round((currentPage / 604) * 7);
                return (
                  <div
                    key={i}
                    className={`h-1 w-4 rounded-full transition-colors sm:w-5 ${
                      i < pageMark ? 'bg-amber-400' : 'bg-amber-900/30'
                    }`}
                  />
                );
              })}
              <span className="mr-1 text-[10px] text-amber-200/50 sm:text-xs">
                {Math.round((currentPage / 604) * 100)}%
              </span>
            </div>

            {/* Next Page - LEFT side (RTL) */}
            <button
              onClick={goNextPage}
              disabled={currentPage >= 604}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-900/30 bg-black/60 shadow-lg backdrop-blur-xl transition-all hover:bg-black/80 disabled:opacity-20 sm:h-12 sm:w-12"
            >
              <ChevronLeft size={20} className="text-amber-200" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modals ─── */}

      {/* Reciter Selector Modal */}
      <AnimatePresence>
        {showReciters && (
          <ReciterSelector onClose={() => setShowReciters(false)} />
        )}
      </AnimatePresence>

      {/* Page Jump Modal */}
      <AnimatePresence>
        {showPageJump && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowPageJump(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm sm:max-w-md rounded-2xl border border-amber-900/40 bg-[#1a1510] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="arabic-display text-lg text-amber-100">
                  {t.goToPage}
                </h3>
                <button
                  onClick={() => setShowPageJump(false)}
                  className="rounded-full p-1 text-amber-200/50 transition-colors hover:text-amber-200"
                >
                  <X size={18} />
                </button>
              </div>
              <Input
                type="number"
                min={1}
                max={604}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePageJump()}
                placeholder="1 - 604"
                className="mb-4 border-amber-900/40 bg-black/30 text-center text-lg text-amber-100"
                autoFocus
              />
              <div className="grid grid-cols-6 gap-2">
                {[1, 100, 200, 300, 400, 500].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setFlipDirection(p > currentPage ? 1 : -1);
                      setPage(p);
                      setShowPageJump(false);
                    }}
                    className="rounded-xl bg-amber-500/10 py-2.5 text-xs text-amber-400 transition-colors hover:bg-amber-500/20"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Juz Picker Modal */}
      <AnimatePresence>
        {showJuzPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowJuzPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm sm:max-w-md rounded-2xl border border-amber-900/40 bg-[#1a1510] p-5 shadow-2xl"
            >
              <h3 className="arabic-display mb-4 text-center text-lg text-amber-100">
                {language === 'ar' ? 'اختر الجزء' : 'Select Juz'}
              </h3>
              <div className="custom-scrollbar max-h-[60vh] grid grid-cols-5 gap-2 overflow-y-auto pb-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const juzNum = i + 1;
                  const startPage = JUZ_START_PAGES[juzNum];
                  const isCurrentJuz = currentPage >= startPage && currentPage < (JUZ_START_PAGES[juzNum + 1] || 605);
                  return (
                    <button
                      key={juzNum}
                      onClick={() => {
                        setFlipDirection(startPage > currentPage ? 1 : -1);
                        setPage(startPage);
                        setShowJuzPicker(false);
                      }}
                      className={`flex flex-col items-center rounded-xl py-2.5 text-xs transition-colors ${
                        isCurrentJuz
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                          : 'bg-black/30 text-amber-200/60 hover:bg-amber-500/10 hover:text-amber-300'
                      }`}
                    >
                      <span className="arabic-display text-sm font-bold">{juzNum}</span>
                      <span className="text-[9px] opacity-60">{startPage}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Surah Index Modal */}
      <AnimatePresence>
        {showSurahIndex && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => {
              setShowSurahIndex(false);
              setSurahSearch('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-md sm:max-w-lg flex-col rounded-2xl border border-amber-900/40 bg-[#1a1510] shadow-2xl"
            >
              {/* Header */}
              <div className="border-b border-amber-900/30 p-4 pb-3">
                <h3 className="arabic-display mb-3 text-center text-lg text-amber-100">
                  {language === 'ar' ? 'فهرس السور' : 'Surah Index'}
                </h3>
                {/* Search input */}
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-200/40">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
                  </svg>
                  <Input
                    type="text"
                    value={surahSearch}
                    onChange={(e) => {
                      setSurahSearch(e.target.value);
                    }}
                    placeholder={language === 'ar' ? 'ابحث عن سورة...' : 'Search surah...'}
                    className="border-amber-900/40 bg-black/30 pr-10 text-sm text-amber-100 placeholder:text-amber-200/30"
                    autoFocus
                  />
                  {surahSearch && (
                    <button
                      onClick={() => setSurahSearch('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/40 hover:text-amber-200"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Surah list */}
              <div
                ref={surahListRef}
                className="custom-scrollbar max-h-[60vh] overflow-y-auto"
              >
                {filteredSurahs && filteredSurahs.length > 0 ? (
                  <div className="divide-y divide-amber-900/20">
                    {filteredSurahs.map((surah) => {
                      const startPage = SURAH_START_PAGES[surah.number] || 1;
                      return (
                        <button
                          key={surah.number}
                          onClick={() => handleSurahSelect(surah.number)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-amber-500/5"
                        >
                          {/* Surah number circle */}
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                            <span className="text-xs font-bold text-amber-400">{surah.number}</span>
                          </div>

                          {/* Surah info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="arabic-display text-sm font-bold text-amber-100">
                                {surah.name}
                              </span>
                              <span className="truncate text-xs text-amber-200/50">
                                {surah.englishNameTranslation}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-amber-200/40">
                              <span>{surah.numberOfAyahs} {language === 'ar' ? 'آية' : 'ayahs'}</span>
                              <span className="text-amber-900/30">|</span>
                              <span>{startPage}</span>
                            </div>
                          </div>

                          {/* Revelation type badge */}
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                            surah.revelationType === 'Meccan'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-amber-200/40">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 h-10 w-10 opacity-40">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm">{language === 'ar' ? 'لم يتم العثور على سورة' : 'No surah found'}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mushaf Single Page ─────────────────────────────────────── */

function MushafPage({
  data,
  currentPage,
  needsBismillah,
  midPageStarts,
  isPlaying,
  currentAyah,
  onAyahClick,
  onBookmark,
  isBookmarked,
  onPageNumberClick,
  fontSizeRem,
  lineHeight,
}: {
  data: PageData;
  currentPage: number;
  needsBismillah: boolean;
  midPageStarts: { index: number; surah: SurahStart }[];
  isPlaying: boolean;
  currentAyah: number | null;
  onAyahClick: (ayah: PageAyahData) => void;
  onBookmark: () => void;
  isBookmarked: boolean;
  onPageNumberClick: () => void;
  fontSizeRem: number;
  lineHeight: number;
}) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden rounded-lg border border-amber-200/20 bg-[#FBF4E4] shadow-2xl shadow-amber-900/10">
      {/* Decorative frame border */}
      <div className="pointer-events-none absolute inset-1.5 z-[1] rounded-md border border-amber-300/30" />

      {/* Ornamental corners */}
      <CornerOrnament position="top-right" />
      <CornerOrnament position="top-left" />
      <CornerOrnament position="bottom-right" />
      <CornerOrnament position="bottom-left" />

      {/* Page content */}
      <div className="relative z-[2] flex flex-1 flex-col p-4 pt-6 sm:p-6 sm:pt-8 md:p-8 md:pt-10 lg:p-10 lg:pt-12">
        {/* Surah header */}
        {data.surahStarts?.[0] && (
          <SurahHeader surah={data.surahStarts[0]} />
        )}

        {/* Bismillah */}
        {needsBismillah && (
          <div className="my-4 text-center sm:my-5">
            <p className="bismillah-text text-xl text-amber-900/80 sm:text-2xl">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* ─── Ayahs ─── */}
        <div
          className="mushaf-text flex-1 text-[#2C1810]"
          style={{ fontSize: `${fontSizeRem}rem`, lineHeight }}
        >
          {data.ayahs.map((ayah, i) => {
            const isActive = isPlaying && currentAyah === ayah.number;
            const midStart = midPageStarts.find((m) => m.index === i);

            return (
              <Fragment key={ayah.number}>
                {midStart && (
                  <MidPageSurahHeader surah={midStart.surah} />
                )}

                {ayah.sajda && (
                  <span className="sajdah-marker">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
                      <path d="M10 7v4M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                )}

                <span
                  onClick={() => onAyahClick(ayah)}
                  className={`cursor-pointer rounded-sm px-0.5 transition-colors ${
                    isActive
                      ? 'bg-amber-400/30 rounded'
                      : 'hover:bg-amber-200/40'
                  }`}
                >
                  {ayah.text}
                </span>

                <AyahNumberMarker number={ayah.numberInSurah} />
              </Fragment>
            );
          })}
        </div>

        {/* Page number + Bookmark */}
        {/* Page footer — always at bottom of paper */}
        <div className="mt-auto flex items-center justify-between px-2 pt-6 sm:pt-8">
          <button
            onClick={onPageNumberClick}
            className="rounded px-1.5 py-0.5 text-xs text-amber-700/40 transition-colors hover:text-amber-700/70"
          >
            {currentPage}
          </button>

          <button
            onClick={onBookmark}
            className={`rounded-full p-1.5 transition-colors ${
              isBookmarked
                ? 'text-amber-600'
                : 'text-amber-700/30 hover:text-amber-600/60'
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>

          <button
            onClick={onPageNumberClick}
            className="rounded px-1.5 py-0.5 text-xs text-amber-700/40 transition-colors hover:text-amber-700/70"
          >
            {currentPage}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mid-Page Surah Header ─── */

function MidPageSurahHeader({ surah }: { surah: SurahStart }) {
  return (
    <>
      <div className="mb-3 mt-2 flex items-center gap-3 sm:mb-4">
        <div className="h-px flex-1 bg-amber-300/40" />
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-400/60" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
        </svg>
        <div className="h-px flex-1 bg-amber-300/40" />
      </div>

      <div className="mb-3 text-center sm:mb-4">
        <div className="inline-block rounded-lg border border-amber-300/40 bg-amber-100/50 px-4 py-2">
          <p className="arabic-display text-lg font-bold text-amber-900">
            {surah.name}
          </p>
          <p className="text-xs text-amber-700/60">
            {surah.englishNameTranslation}
          </p>
        </div>
      </div>

      {surah.number !== 9 && (
        <div className="mb-3 text-center sm:mb-4">
          <p className="bismillah-text text-lg text-amber-900/70 sm:text-xl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}
    </>
  );
}

/* ─── Ayah Number Marker ─── */

function AyahNumberMarker({ number }: { number: number }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center align-middle text-[10px] leading-none text-amber-700/70">
      <svg viewBox="0 0 20 20" className="h-5 w-5">
        <circle cx="10" cy="10" r="8" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.4" />
        <text x="10" y="14" textAnchor="middle" fontSize="8" fill="#8B6914" fontFamily="'Amiri Quran', serif">
          {number}
        </text>
      </svg>
    </span>
  );
}

/* ─── Surah Header Component ──────────────────────────────────── */

function SurahHeader({ surah }: { surah: SurahStart }) {
  return (
    <div className="mb-4 mt-2 text-center sm:mb-6">
      <div className="relative mx-auto max-w-xs">
        <div className="rounded-xl border border-amber-300/50 bg-gradient-to-b from-amber-100/80 to-amber-50/60 px-6 py-4 shadow-sm">
          <h2 className="arabic-display text-2xl font-bold text-amber-900 sm:text-3xl">
            {surah.name}
          </h2>
          <div className="my-2 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-amber-300/60" />
            <span className="text-amber-600/60">﷽</span>
            <div className="h-px w-8 bg-amber-300/60" />
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-amber-700/60">
            <span>{surah.englishNameTranslation}</span>
            <span>•</span>
            <span>{surah.numberOfAyahs} آية</span>
            <span>•</span>
            <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Corner Ornament ────────────────────────────────────────── */

function CornerOrnament({ position }: { position: string }) {
  const isTop = position.includes('top');
  const isRight = position.includes('right');

  return (
    <div
      className={`pointer-events-none absolute z-[1] h-8 w-8 ${
        isTop ? 'top-0.5' : 'bottom-0.5'
      } ${isRight ? 'right-0.5' : 'left-0.5'}`}
    >
      <svg viewBox="0 0 32 32" className="h-full w-full text-amber-400/40">
        <path
          d={
            isRight && isTop
              ? 'M32,0 L32,12 Q32,32 12,32 L0,32 L0,24 L8,24 Q24,24 24,8 L24,0 Z'
              : !isRight && isTop
                ? 'M0,0 L0,12 Q0,32 20,32 L32,32 L32,24 L24,24 Q8,24 8,8 L8,0 Z'
                : isRight && !isTop
                  ? 'M32,32 L32,20 Q32,0 12,0 L0,0 L0,8 L8,8 Q24,8 24,24 L24,32 Z'
                  : 'M0,32 L0,20 Q0,0 20,0 L32,0 L32,8 L24,8 Q8,8 8,24 L8,32 Z'
          }
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/* ─── Loading Skeleton ───────────────────────────────────────── */

function MushafPageSkeleton() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-amber-200/20 bg-[#FBF4E4] shadow-2xl shadow-amber-900/10 p-6 sm:p-8">
        <div className="mb-6 flex justify-center">
          <Skeleton className="h-20 w-52 rounded-xl bg-amber-200/40" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="mx-auto h-7 w-full bg-amber-200/30" />
          <Skeleton className="mx-auto h-7 w-[95%] bg-amber-200/30" />
          <Skeleton className="mx-auto h-7 w-full bg-amber-200/30" />
          <Skeleton className="mx-auto h-7 w-[90%] bg-amber-200/30" />
          <Skeleton className="mx-auto h-7 w-full bg-amber-200/30" />
          <Skeleton className="mx-auto h-7 w-[80%] bg-amber-200/30" />
          <Skeleton className="mx-auto h-6 w-full bg-amber-200/30" />
          <Skeleton className="mx-auto h-6 w-[92%] bg-amber-200/30" />
          <Skeleton className="mx-auto h-6 w-full bg-amber-200/30" />
          <Skeleton className="mx-auto h-6 w-[85%] bg-amber-200/30" />
        </div>
      </div>
    </div>
  );
}

/* ─── Reciter Name Display ───────────────────────────────────── */

function ReciterNameDisplay({ reciterId, language }: { reciterId: string; language: 'ar' | 'en' }) {
  const reciter = RECITERS.find((r) => r.id === reciterId);
  const name = reciter ? (language === 'ar' ? reciter.nameAr : reciter.name) : '—';

  return (
    <div className="flex justify-center">
      <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-amber-200/40 backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round" />
          <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round" />
        </svg>
        {name}
      </span>
    </div>
  );
}
