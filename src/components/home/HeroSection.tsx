import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';

export function HeroSection({ hijriDate, locationName }: { hijriDate: Record<string, any> | null; locationName: string | null }) {
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-zad-gold/20 bg-gradient-to-b from-zad-gold/10 via-zad-surface/80 to-zad-midnight p-5 text-center"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-zad-gold/10 blur-3xl" />
      </div>
      <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-zad-gold/5" />
        <svg viewBox="0 0 64 64" className="relative h-12 w-12 text-zad-gold" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" transform="translate(10, 10) scale(2)" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" transform="translate(10, 10) scale(2)" fill="currentColor" opacity="0.15" stroke="none" />
          <circle cx="54" cy="18" r="2.5" fill="currentColor" opacity="0.5" stroke="none" />
          <circle cx="58" cy="26" r="1.8" fill="currentColor" opacity="0.35" stroke="none" />
          <circle cx="50" cy="14" r="1.2" fill="currentColor" opacity="0.25" stroke="none" />
        </svg>
      </div>
      <h1 className="arabic-display relative text-2xl text-text-primary" style={{ lineHeight: 1.6 }}>{t.greeting}</h1>
      <p className="relative mt-1 text-sm text-text-secondary">{t.tagline}</p>
      <div className="relative mt-3 flex flex-col items-center gap-2">
        {hijriDate && (
          <div className="inline-flex items-center gap-2 rounded-full border border-zad-gold/15 bg-zad-gold/5 px-4 py-1.5">
            <span className="text-xs text-zad-gold">
              <svg viewBox="0 0 24 24" className="inline h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-xs text-text-secondary">
              {String((hijriDate as any).weekday?.ar || '')}، {String(hijriDate.day)} {String(hijriDate.monthAr)} {String(hijriDate.year)} هـ
            </span>
          </div>
        )}
        {locationName && (
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {locationName}
          </div>
        )}
      </div>
    </motion.div>
  );
}
