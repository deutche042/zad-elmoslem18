'use client';

import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Type,
  Bookmark,
  BookmarkCheck,
  Plus,
  Minus,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { useQuranStore } from '@/store/quran-store';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { useQuranAudio } from './useQuranAudio';

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface AyahData {
  number: number;
  numberInSurah: number;
  text: string;
  translation?: string;
}

interface SurahDetailResponse {
  surah: SurahMeta;
  ayahs: AyahData[];
}

export function QuranReader() {
  const { quranView, goBack, setQuranView } = useAppStore();
  const {
    currentAyah,
    isPlaying,
    fontSize,
    showTranslation,
    toggleTranslation,
    setFontSize,
    setLastRead,
    setSurah,
  } = useQuranStore();
  const reciterId = useSettingsStore((s) => s.reciterId);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  const surahNumber = quranView.surahNumber ?? null;

  const { playAyah, pause, resume, stop } = useQuranAudio(reciterId);

  const { data, isLoading } = useQuery<SurahDetailResponse>({
    queryKey: ['quran-surah', surahNumber],
    queryFn: () =>
      fetch(`/api/quran?action=surah&number=${surahNumber}`).then((r) =>
        r.json()
      ),
    enabled: !!surahNumber,
    staleTime: 24 * 60 * 60 * 1000,
  });

  // Track last read when surah data loads
  useEffect(() => {
    if (data && surahNumber) {
      setSurah(surahNumber);
      setLastRead(surahNumber, currentAyah || 1);
    }
  }, [data, surahNumber, currentAyah, setSurah, setLastRead]);

  const handlePlayToggle = useCallback(() => {
    if (!data || !surahNumber) return;
    if (isPlaying) {
      pause();
    } else if (currentAyah) {
      resume();
    } else {
      playAyah(surahNumber, data.ayahs[0]?.number ?? 1);
    }
  }, [data, surahNumber, isPlaying, currentAyah, pause, resume, playAyah]);

  const handleAyahClick = useCallback(
    (ayahNum: number, globalNum: number) => {
      if (isPlaying && currentAyah === globalNum) {
        pause();
      } else {
        stop();
        playAyah(surahNumber!, globalNum);
      }
    },
    [isPlaying, currentAyah, pause, stop, playAyah, surahNumber]
  );

  const handleFontSize = useCallback(
    (delta: number) => {
      setFontSize(Math.max(18, Math.min(48, fontSize + delta)));
    },
    [fontSize, setFontSize]
  );

  const handleBack = useCallback(() => {
    stop();
    setQuranView({ type: 'list' });
  }, [stop, setQuranView]);

  if (isLoading) {
    return (
      <div className="custom-scrollbar space-y-6 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-6 w-48" />
            <Skeleton className="mx-auto h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="mx-auto h-8 w-64 rounded-lg" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-16 w-full max-w-lg rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || !surahNumber) return null;

  const { surah, ayahs } = data;

  return (
    <div className="custom-scrollbar flex flex-col overflow-y-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b border-zad-border bg-zad-midnight/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="rounded-full p-2 transition-colors hover:bg-zad-surface"
            aria-label="Go back"
          >
            {isRtl ? (
              <ArrowRight size={20} className="text-text-secondary" />
            ) : (
              <ArrowLeft size={20} className="text-text-secondary" />
            )}
          </button>

          {/* Surah title */}
          <div className="text-center">
            <p className="arabic-display text-sm font-bold text-text-primary">
              {surah.name}
            </p>
            <p className="text-xs text-text-secondary">
              {surah.englishNameTranslation} • {surah.numberOfAyahs} {t.ayah}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-1">
            <button
              onClick={() => handleFontSize(-2)}
              className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-zad-surface"
              aria-label={t.fontSize}
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => handleFontSize(2)}
              className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-zad-surface"
              aria-label={t.fontSize}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            onClick={toggleTranslation}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
              showTranslation
                ? 'bg-zad-gold/20 text-zad-gold'
                : 'text-text-muted hover:bg-zad-surface'
            }`}
          >
            <Type size={14} />
            {language === 'ar' ? 'ترجمة' : 'Translation'}
          </button>
          <button
            onClick={handlePlayToggle}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
              isPlaying
                ? 'bg-zad-green/20 text-zad-green'
                : 'text-text-muted hover:bg-zad-surface'
            }`}
          >
            {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {isPlaying
              ? language === 'ar'
                ? 'إيقاف'
                : 'Stop'
              : language === 'ar'
                ? 'تشغيل'
                : 'Play'}
          </button>
        </div>
      </div>

      {/* Bismillah — except for At-Tawbah (surah 9) and Al-Fatihah (surah 1, included in ayahs) */}
      {surahNumber !== 9 && surahNumber !== 1 && (
        <div className="py-6 text-center">
          <p
            className="gold-text quran-text text-2xl"
            style={{ fontSize: `${Math.max(fontSize - 4, 16)}px` }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="mx-auto w-full max-w-2xl space-y-1 px-4 pb-32">
        {ayahs.map((ayah, i) => {
          const isActive = currentAyah === ayah.number;
          return (
            <motion.div
              key={ayah.number}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.01, 0.5) }}
              className="group"
            >
              <div
                onClick={() => handleAyahClick(ayah.numberInSurah, ayah.number)}
                className={`cursor-pointer rounded-lg p-3 transition-all ${
                  isActive
                    ? 'border border-zad-gold/30 bg-zad-gold-muted'
                    : 'border border-transparent hover:bg-zad-surface/50'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAyahClick(ayah.numberInSurah, ayah.number);
                  }
                }}
              >
                {/* Arabic text */}
                <p
                  className="quran-text leading-[2.8] text-text-arabic"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {ayah.text}{' '}
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zad-gold/10 align-middle text-[11px] font-medium text-zad-gold">
                    {ayah.numberInSurah}
                  </span>
                </p>

                {/* Translation */}
                {showTranslation && ayah.translation && (
                  <p
                    className="mt-2 text-sm leading-relaxed text-text-secondary"
                    dir="ltr"
                    style={{ textAlign: 'left' }}
                  >
                    {ayah.translation}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
