import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { useAppStore } from '@/store/app-store';

export function HomeHadithCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['hadith-home'],
    queryFn: () => fetch('/api/hadith').then((r) => r.json()),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const language = useSettingsStore((s) => s.language);
  const setMoreView = useAppStore((s) => s.setMoreView);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-zad-border bg-zad-surface p-5">
        <div className="mx-auto mb-3 h-4 w-20 rounded bg-zad-gold/20" />
        <div className="mb-2 h-14 w-full rounded bg-zad-surface/50" />
        <div className="h-3 w-32 rounded bg-zad-surface/50" />
      </div>
    );
  }

  const daily = data?.daily;
  if (!daily) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4 }}
      onClick={() => { setActiveTab('more'); setMoreView('hadith'); }}
      className="w-full overflow-hidden rounded-2xl border border-zad-green/20 bg-gradient-to-br from-zad-surface to-zad-midnight text-right transition-all hover:border-zad-green/40"
    >
      <div className="flex items-center justify-between border-b border-zad-border/50 px-5 py-2.5">
        <span className="text-xs text-text-muted">{language === 'ar' ? 'حديث اليوم' : 'Hadith of the Day'}</span>
        <span className="rounded-full bg-zad-green/10 px-2.5 py-0.5 text-[10px] text-zad-green">{daily.grade}</span>
      </div>
      <div className="px-5 py-4">
        <p className="arabic-display leading-loose text-text-primary" dir="rtl" style={{ fontSize: '1.05rem' }}>{daily.textAr}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-zad-gold/10 px-2.5 py-1 text-[11px] text-zad-gold">{daily.narrator}</span>
          <span className="text-[11px] text-text-muted">{daily.source}</span>
        </div>
      </div>
    </motion.button>
  );
}
