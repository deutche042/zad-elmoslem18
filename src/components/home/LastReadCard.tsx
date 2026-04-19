import { motion } from 'framer-motion';
import { useQuranStore } from '@/store/quran-store';
import { useSettingsStore } from '@/store/settings-store';
import { useAppStore } from '@/store/app-store';

export function LastReadCard() {
  const { lastReadSurah, lastReadPage } = useQuranStore();
  const language = useSettingsStore((s) => s.language);

  if (!lastReadSurah && !lastReadPage) return null;

  const handleContinue = () => {
    if (lastReadPage) {
      useQuranStore.getState().setPage(lastReadPage);
    }
    useAppStore.getState().setActiveTab('quran');
  };

  return (
    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      onClick={handleContinue}
      className="flex w-full items-center gap-4 rounded-2xl border border-zad-gold/15 bg-gradient-to-l from-zad-gold/5 via-zad-surface/50 to-transparent p-4 transition-all hover:border-zad-gold/30 active:scale-[0.98]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zad-gold/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-zad-gold">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-1 text-right">
        <p className="text-sm font-medium text-text-primary">{language === 'ar' ? 'تابع القراءة' : 'Continue Reading'}</p>
        <p className="text-xs text-text-muted">
          {lastReadPage
            ? `${language === 'ar' ? 'صفحة' : 'Page'} ${lastReadPage} ${language === 'ar' ? 'من 604' : 'of 604'}`
            : `${language === 'ar' ? 'سورة' : 'Surah'} ${lastReadSurah}`}
        </p>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-text-muted">
        {language === 'ar'
          ? <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </motion.button>
  );
}
