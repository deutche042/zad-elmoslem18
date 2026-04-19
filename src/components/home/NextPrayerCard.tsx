import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { parseTimeString, formatTime12Hour } from '@/lib/time';

interface NextPrayerCardProps {
  nextPrayer: { name: string; nameAr: string; time: string; remaining: number } | null;
  timings: Record<string, string> | null;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function NextPrayerCard({ nextPrayer, timings, isLoading, error, onRetry }: NextPrayerCardProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  useEffect(() => {
    const update = () => {
      if (!nextPrayer) { setTimeLeft(''); return; }
      const parts = parseTimeString(nextPrayer.time);
      if (!parts) { setTimeLeft(''); return; }
      
      const target = new Date();
      target.setHours(parts.hours, parts.minutes, 0, 0);
      if (target <= new Date()) target.setDate(target.getDate() + 1);
      
      const ms = target.getTime() - Date.now();
      if (ms <= 0) { setTimeLeft(''); return; }
      
      const hrs = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      
      setTimeLeft(hrs > 0
        ? `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${mins}:${String(secs).padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextPrayer]);

  const hasTimings = timings && Object.keys(timings).length > 0;

  const remainingInfo = (() => {
    if (!timings || !nextPrayer) return null;
    const keys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
    let found = false;
    let count = 0;
    for (const key of keys) {
      if (!found && nextPrayer.name === key) { found = true; }
      if (found) count++;
    }
    if (!found) count = 5;
    return count;
  })();

  const sunrise = timings?.Sunrise || null;

  if (error && !nextPrayer && !hasTimings && !isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-zad-border bg-zad-surface p-6 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-text-muted">
          <path d="M12 9v4M12 17h.01M12 2a10 10 0 100 20 10 10 0 000-20z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-text-muted">{isAr ? 'تعذر تحميل مواقيت الصلاة' : 'Failed to load'}</p>
        <button onClick={onRetry} className="rounded-lg bg-zad-gold/10 px-4 py-2 text-xs text-zad-gold transition-colors hover:bg-zad-gold/20">
          {isAr ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </motion.div>
    );
  }

  if (isLoading || (!nextPrayer && !hasTimings)) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        className="animate-pulse rounded-2xl border border-zad-border bg-zad-surface p-5">
        <div className="mb-4 h-5 w-24 rounded bg-zad-gold/15" />
        <div className="flex gap-2">
          <div className="h-16 flex-1 rounded-xl bg-zad-midnight/50" />
          <div className="h-16 flex-1 rounded-xl bg-zad-midnight/50" />
          <div className="h-16 flex-1 rounded-xl bg-zad-midnight/50" />
        </div>
      </motion.div>
    );
  }

  const prayerMeta: Record<string, { icon: React.ReactNode; color: string }> = {
    Fajr: {
      icon: <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="18" cy="5" r="1" fill="currentColor" opacity="0.6" stroke="none" /><circle cx="20" cy="9" r="0.7" fill="currentColor" opacity="0.4" stroke="none" /></svg>,
      color: 'from-sky-500/20 to-slate-900/10',
    },
    Dhuhr: {
      icon: <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" strokeLinecap="round" /></svg>,
      color: 'from-amber-500/20 to-orange-900/10',
    },
    Asr: {
      icon: <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" strokeLinecap="round" /><path d="M15 15l5 5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="20" cy="20" r="2" opacity="0.4" /></svg>,
      color: 'from-orange-500/20 to-red-900/10',
    },
    Maghrib: {
      icon: <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M12 10a5 5 0 0 1 5 5" strokeLinecap="round" /><circle cx="12" cy="17" r="1" fill="currentColor" opacity="0.5" stroke="none" /><path d="M3 17h18" strokeLinecap="round" opacity="0.4" /><path d="M5 20h14" strokeLinecap="round" opacity="0.2" /></svg>,
      color: 'from-rose-500/20 to-pink-900/10',
    },
    Isha: {
      icon: <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="5" cy="5" r="0.8" fill="currentColor" opacity="0.5" stroke="none" /><circle cx="3" cy="9" r="0.6" fill="currentColor" opacity="0.4" stroke="none" /><circle cx="7" cy="3" r="0.5" fill="currentColor" opacity="0.3" stroke="none" /></svg>,
      color: 'from-violet-500/20 to-indigo-900/10',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="rounded-2xl border border-zad-border bg-zad-surface overflow-hidden"
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {nextPrayer && (
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${prayerMeta[nextPrayer.name]?.color || 'from-zad-gold/20 to-zad-gold/5'} text-zad-gold`}>
                {prayerMeta[nextPrayer.name]?.icon || <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>}
              </div>
            )}
            <div>
              <p className="text-[11px] text-text-muted">{t.nextPrayer}</p>
              <p className="arabic-display text-xl font-bold text-zad-gold">{nextPrayer?.nameAr || '—'}</p>
              {nextPrayer?.time && (
                <p className="text-xs text-text-secondary font-mono tabular-nums mt-0.5">
                  {formatTime12Hour(...Object.values(parseTimeString(nextPrayer.time) || { hours: 0, minutes: 0 }) as [number, number])}
                </p>
              )}
            </div>
          </div>
          {timeLeft && (
            <div className="text-left">
              <p className="text-[10px] text-text-muted" id="remaining-label">{t.remaining}</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-text-primary" aria-live="polite" aria-atomic="true" aria-labelledby="remaining-label">{timeLeft}</p>
            </div>
          )}
        </div>
      </div>

      {hasTimings && (
        <div className="flex gap-2 px-4 pb-4">
          {sunrise && (
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-zad-midnight/40 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-amber-400">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2m-8-3l1.41-1.41m13.18 0L19.59 19M4.22 4.22l1.42 1.42m12.72 0l1.42-1.42" strokeLinecap="round" />
                  <path d="M5 16h14" strokeLinecap="round" opacity="0.3" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">{isAr ? 'الشروق' : 'Sunrise'}</p>
                <p className="text-xs font-mono font-semibold tabular-nums text-amber-300">
                  {formatTime12Hour(...Object.values(parseTimeString(sunrise) || { hours: 0, minutes: 0 }) as [number, number])}
                </p>
              </div>
            </div>
          )}
          {remainingInfo !== null && (
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-zad-midnight/40 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zad-gold/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-zad-gold">
                  <path d="M12 8v4l3 3h-6l3-3" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.12 5.12a10 10 0 1014.07 14.07" strokeLinecap="round"/><circle cx="12" cy="12" r="1.5"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">{isAr ? 'الصلوات الباقية' : 'Remaining'}</p>
                <p className="text-xs font-semibold text-text-primary">{remainingInfo} {isAr ? 'صلوات' : 'prayers'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
