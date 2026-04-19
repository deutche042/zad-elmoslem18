'use client';

import { motion } from 'framer-motion';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { PRAYER_META } from '@/lib/constants';
import { Clock, MapPin } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { CountdownTimer } from './CountdownTimer';
import { formatTime12Hour } from '@/lib/time';

export function PrayerTimes() {
  const { timings, nextPrayer, isLoading } = usePrayerTimes();
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];

  if (isLoading) {
    return (
      <div className="space-y-3 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-zad-surface" />
        ))}
      </div>
    );
  }

  if (!timings) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zad-border bg-zad-surface p-8 text-center"
      >
        <MapPin className="mx-auto mb-3 h-8 w-8 text-text-muted" />
        <p className="text-sm text-text-muted">
          {language === 'ar' ? 'تعذر تحميل مواقيت الصلاة' : 'Failed to load prayer times'}
        </p>
      </motion.div>
    );
  }

  // Calculate which prayers are past
  const now = new Date();
  const isPast = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const pt = new Date();
    pt.setHours(h, m, 0, 0);
    return pt <= now;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Next Prayer Countdown */}
      {nextPrayer && <CountdownTimer nextPrayer={nextPrayer} />}

      {/* 5 Prayer Cards */}
      <div className="space-y-2">
        {PRAYER_META.map(({ key, nameAr, icon }, index) => {
          const time = timings[key];
          if (!time) return null;
          const isNext = nextPrayer?.name === key;
          const past = !isNext && isPast(time);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: language === 'ar' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                isNext
                  ? 'border-zad-gold/50 bg-zad-gold-muted prayer-glow'
                  : 'border-zad-border bg-zad-surface/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg" role="img" aria-label={nameAr}>
                  {icon}
                </span>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      past ? 'text-text-muted/40' : isNext ? 'text-zad-gold' : 'text-text-primary'
                    }`}
                  >
                    {nameAr}
                  </p>
                  {isNext && (
                    <p className="text-[10px] text-zad-gold/70">{t.nextPrayer}</p>
                  )}
                </div>
              </div>
              <div className={`flex items-center gap-1.5 text-sm ${past ? 'text-text-muted/30' : 'text-text-secondary'}`}>
                <Clock size={14} />
                <span className="font-mono tabular-nums">{formatTime12Hour(time)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
