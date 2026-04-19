'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useSettingsStore } from '@/store/settings-store';
import { useGeolocation } from '@/hooks/useGeolocation';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { IslamicPattern } from '@/components/layout/IslamicPattern';
import { LocationPermissionOverlay } from '@/components/prayer/LocationPermissionOverlay';
import { PrayerTimes } from '@/components/prayer/PrayerTimes';
import { MushafView } from '@/components/quran/MushafView';
import { AzkarCategories } from '@/components/azkar/AzkarCategories';
import { HadithView } from '@/components/hadith/HadithView';
import { SalawatCounter } from '@/components/salawat/SalawatCounter';
import { NamesOfAllah } from '@/components/names/NamesOfAllah';
import { QiblaCompass } from '@/components/qibla/QiblaCompass';
import { HijriCalendar } from '@/components/calendar/HijriCalendar';
import { QuranRadio } from '@/components/radio/QuranRadio';
import { DailyGoals } from '@/components/goals/DailyGoals';
import { SalawatBanner } from '@/components/salawat/SalawatBanner';
import { PrayerReminderToast } from '@/components/prayer/PrayerReminderToast';
import { AdhanToast } from '@/components/prayer/AdhanToast';
import { usePrayerReminder } from '@/hooks/usePrayerReminder';
import { useAdhanPlayer } from '@/hooks/useAdhanPlayer';
import { SplashScreen } from '@/components/ui/SplashScreen';
import SettingsPage from '@/components/settings/SettingsPage';

// Refactored Home Components
import { 
  HeroSection, 
  NextPrayerCard, 
  QuickActionsGrid, 
  HomeHadithCard, 
  LastReadCard 
} from '@/components/home';

function SubViewWrapper({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  const language = useSettingsStore((s) => s.language);
  const isRtl = language === 'ar';

  return (
    <div className="custom-scrollbar overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-zad-border bg-zad-midnight/95 px-4 py-2 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          {isRtl ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          )}
          {language === 'ar' ? 'رجوع' : 'Back'}
        </button>
      </div>
      {children}
    </div>
  );
}

function HomeDashboard() {
  const { hijriDate, nextPrayer, timings, isLoading: prayerLoading, error: prayerError, refetch: refetchPrayer } = usePrayerTimes();
  const locationName = useSettingsStore((s) => s.locationName);

  return (
    <div className="custom-scrollbar flex flex-col gap-5 overflow-y-auto p-4 pb-6">
      <HeroSection hijriDate={hijriDate} locationName={locationName} />
      <NextPrayerCard nextPrayer={nextPrayer} timings={timings} isLoading={prayerLoading} error={prayerError} onRetry={refetchPrayer} />
      <QuickActionsGrid />
      <HomeHadithCard />
      <LastReadCard />
    </div>
  );
}

function MoreMenu() {
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';
  const setMoreView = useAppStore((s) => s.setMoreView);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  const menuItems = [
    {
      view: 'qibla' as const,
      label: 'القبلة', labelEn: 'Qibla',
      description: isAr ? 'اتجاه القبلة' : 'Qibla Direction',
      iconBg: 'bg-sky-500/15', iconColor: 'text-sky-400',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><circle cx="12" cy="12" r="10" /><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" opacity="0.3" /><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" strokeLinejoin="round" /></svg>,
    },
    {
      view: 'calendar' as const,
      label: 'التقويم الهجري', labelEn: 'Hijri Calendar',
      description: isAr ? 'التقويم الهجري' : 'Hijri Calendar',
      iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
      view: 'radio' as const,
      label: 'الراديو القرآني', labelEn: 'Quran Radio',
      description: isAr ? 'إذاعة قرآنية' : 'Quran Radio',
      iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
      view: 'settings' as const,
      label: 'الإعدادات', labelEn: 'Settings',
      description: isAr ? 'تخصيص التطبيق' : 'App Customization',
      iconBg: 'bg-slate-500/15', iconColor: 'text-slate-400',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.8 l.01.01a.75.75 0 0 1-0.89.44l-1.18-.18a1.65 1.65 0 0 0-1-1.72l.01-.01" strokeLinecap="round" /><path d="M4.6 15a1.65 1.65 0 0 0-0.33 1.8 l-.01.01a.75.75 0 0 1-0.89.44l-1.18-.18a1.65 1.65 0 0 0-1-1.72l.01-.01" strokeLinecap="round" /><path d="M12 12V3" strokeLinecap="round" /><path d="M12 12a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z" strokeLinecap="round" /></svg>,
    },
    {
      view: 'names' as const,
      label: 'أسماء الله الحسنى', labelEn: 'Names of Allah',
      description: isAr ? 'معاني الأسماء الحسنى' : 'Meanings of the Beautiful Names',
      iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path d="M12 21C7 21 3 17 3 12S7 3 12 3 21 7 21 12 17 21 12 21z" /><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
      view: 'goals' as const,
      label: 'الأهداف اليومية', labelEn: 'Daily Goals',
      description: isAr ? 'تتبع أهدافك الروحية' : 'Track your spiritual goals',
      iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 p-4">
      {menuItems.map((item) => (
        <motion.button
          key={item.view}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setMoreView(item.view); }}
          className="flex items-center gap-4 rounded-2xl border border-zad-border bg-zad-surface p-4 text-right transition-all hover:border-zad-gold/50"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}>
            {item.icon}
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-text-primary">{isAr ? item.label : item.labelEn}</p>
            <p className="text-xs text-text-muted">{item.description}</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-text-muted">
            {isAr ? <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
        </motion.button>
      ))}
    </div>
  );
}

function MoreTab() {
  const activeView = useAppStore((s) => s.activeView);
  const setMoreView = useAppStore((s) => s.setMoreView);

  const renderView = () => {
    switch (activeView) {
      case 'qibla': return <SubViewWrapper onBack={() => setMoreView('menu')}><QiblaCompass /></SubViewWrapper>;
      case 'calendar': return <SubViewWrapper onBack={() => setMoreView('menu')}><HijriCalendar /></SubViewWrapper>;
      case 'radio': return <SubViewWrapper onBack={() => setMoreView('menu')}><QuranRadio /></SubViewWrapper>;
      case 'settings': return <SubViewWrapper onBack={() => setMoreView('menu')}><SettingsPage /></SubViewWrapper>;
      case 'names': return <SubViewWrapper onBack={() => setMoreView('menu')}><NamesOfAllah /></SubViewWrapper>;
      case 'goals': return <SubViewWrapper onBack={() => setMoreView('menu')}><DailyGoals /></SubViewWrapper>;
      case 'salawat': return <SubViewWrapper onBack={() => setMoreView('menu')}><SalawatCounter /></SubViewWrapper>;
      case 'hadith': return <SubViewWrapper onBack={() => setMoreView('menu')}><HadithView /></SubViewWrapper>;
      default: return <MoreMenu />;
    }
  };

  return <div className="h-full">{renderView()}</div>;
}

function QuranTab() {
  return <MushafView />;
}

function PrayerTab() {
  return <PrayerTimes />;
}

function AzkarTab() {
  return <AzkarCategories />;
}

export default function Page() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const language = useSettingsStore((s) => s.language);
  const isSplashComplete = useAppStore((s) => s.isSplashComplete);
  const setSplashComplete = useAppStore((s) => s.setSplashComplete);
  const isAppReady = useAppStore((s) => s.isAppReady);
  const setAppReady = useAppStore((s) => s.setAppReady);
  const { locationLat, locationLng, locationName } = useSettingsStore();
  const { permissionState, isLoading, requestLocation, error } = useGeolocation();

  const __getHijriDate = usePrayerTimes();
  const headerHijri = __getHijriDate.hijriDate;

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setAppReady(true);
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(initTimer);
  }, [setAppReady]);

  const pageTransition = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: 'easeOut' },
  };

  const getActiveView = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="h-full"
        >
          {activeTab === 'home' && <HomeDashboard />}
          {activeTab === 'quran' && <QuranTab />}
          {activeTab === 'prayer' && <PrayerTab />}
          {activeTab === 'azkar' && <AzkarTab />}
          {activeTab === 'more' && <MoreTab />}
        </motion.div>
      </AnimatePresence>
    );
  };

  const isQuranActive = activeTab === 'quran';

  const handleSplashComplete = () => {
    setSplashComplete(true);
  };

  return (
    <>
      <SplashScreen isLoading={initialLoading} onComplete={handleSplashComplete} />
      <div
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        className={`relative flex min-h-screen w-full flex-col bg-zad-midnight ${!isSplashComplete ? 'invisible' : ''}`}
        style={{ fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif" }}
      >
        <IslamicPattern opacity={0.02} />
        {!isQuranActive && <Header hijriDate={headerHijri} />}
        <main className="custom-scrollbar relative z-10 flex-1 overflow-y-auto">
          {getActiveView()}
        </main>
        {!isQuranActive && (
          <div className="mt-auto">
            <BottomNav />
          </div>
        )}

        <AnimatePresence>
          {permissionState !== 'granted' && (
            <LocationPermissionOverlay
              permissionState={permissionState}
              isLoading={isLoading}
              onAllow={requestLocation}
              onDismiss={() => {}}
              error={error}
            />
          )}
        </AnimatePresence>

        <SalawatBanner />
        <PrayerReminderToast />
        <AdhanToast />
      </div>
    </>
  );
}
