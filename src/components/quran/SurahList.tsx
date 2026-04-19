'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsStore } from '@/store/settings-store';
import { useAppStore } from '@/store/app-store';
import { TRANSLATIONS } from '@/lib/constants';
import type { SurahInfo } from '@/types';

export function SurahList() {
  const [search, setSearch] = useState('');
  const language = useSettingsStore((s) => s.language);
  const setQuranView = useAppStore((s) => s.setQuranView);
  const t = TRANSLATIONS[language];

  const { data, isLoading } = useQuery<{ surahs: SurahInfo[] }>({
    queryKey: ['quran-surahs'],
    queryFn: () => fetch('/api/quran?action=surahs').then((r) => r.json()),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const surahs = data?.surahs || [];
  const filtered = search
    ? surahs.filter(
        (s) =>
          s.name.includes(search) ||
          s.englishName.toLowerCase().includes(search.toLowerCase()) ||
          s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
          String(s.number).includes(search)
      )
    : surahs;

  if (isLoading) {
    return (
      <div className="custom-scrollbar space-y-3 overflow-y-auto p-4">
        <Skeleton className="mx-auto h-10 w-full max-w-md rounded-lg" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar space-y-4 overflow-y-auto p-4">
      {/* Search */}
      <div className="relative mx-auto max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.quranSearch}
          className="border-zad-border bg-zad-surface pr-10 text-text-primary placeholder:text-text-muted"
        />
      </div>

      {/* Surah Grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((surah, index) => (
          <motion.button
            key={surah.number}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.02, 0.5) }}
            onClick={() =>
              setQuranView({ type: 'reader', surahNumber: surah.number })
            }
            className="flex items-center gap-3 rounded-xl border border-zad-border bg-zad-surface/50 p-3 text-right transition-all hover:border-zad-gold/30 hover:bg-zad-gold-muted"
          >
            {/* Surah number */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zad-gold/10 text-xs font-bold text-zad-gold">
              {surah.number}
            </div>

            {/* Surah info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="arabic-display text-sm font-bold text-text-primary">
                  {surah.name}
                </p>
                <span className="rounded-full bg-zad-gold/10 px-2 py-0.5 text-[10px] text-zad-gold">
                  {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="truncate text-xs text-text-secondary">
                  {surah.englishNameTranslation}
                </p>
                <p className="flex items-center gap-1 text-xs text-text-muted">
                  <BookOpen size={10} />
                  {surah.numberOfAyahs}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-text-muted" />
          <p className="text-sm text-text-muted">{t.noResults}</p>
        </div>
      )}
    </div>
  );
}
