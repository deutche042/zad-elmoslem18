'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Volume2, X } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { useSalawatTimer } from '@/hooks/useSalawatTimer';

export function SalawatBanner() {
  const { salawatEnabled, language, updateSettings } = useSettingsStore();
  const { playSalawat, playCount } = useSalawatTimer();
  const [showBanner, setShowBanner] = useState(false);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAr = language === 'ar';

  const dismissBanner = useCallback(() => {
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
    setShowBanner(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (!salawatEnabled) {
      // 1) الصوت الأول — متزامن مع الضغطة
      playSalawat();
      // 2) فعّل التايمر
      updateSettings({ salawatEnabled: true });
      // 3) إذن الإشعارات (مش هنتظر)
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } else {
      updateSettings({ salawatEnabled: false });
    }
    setShowBanner(true);
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
    }
    bannerTimerRef.current = setTimeout(() => {
      setShowBanner(false);
    }, 3000);
  }, [salawatEnabled, updateSettings, playSalawat]);

  return (
    <>
      {/* Floating Quick Toggle Button */}
      <motion.button
        onClick={handleToggle}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-20 right-4 z-50 flex items-center gap-1.5 rounded-full px-3 py-2 shadow-lg transition-all sm:bottom-6 ${
          salawatEnabled
            ? 'bg-emerald-600/90 text-white shadow-emerald-600/30'
            : 'bg-zad-surface/90 text-text-secondary border border-zad-border shadow-black/20'
        }`}
      >
        {salawatEnabled ? (
          <>
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-medium">{isAr ? 'صلى على محمد' : 'Salawat'}</span>
          </>
        ) : (
          <BellOff className="w-4 h-4" />
        )}
      </motion.button>

      {/* Status Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-32 right-4 z-50 rounded-xl border px-4 py-3 shadow-xl sm:bottom-16 max-w-[280px] ${
              salawatEnabled
                ? 'border-emerald-500/30 bg-emerald-950/95 text-emerald-100'
                : 'border-zad-border bg-zad-navy/95 text-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              {salawatEnabled ? (
                <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <BellOff className="w-4 h-4 text-text-muted shrink-0" />
              )}
              <p className="text-xs font-medium">
                {salawatEnabled
                  ? (isAr ? 'تم تشغيل تذكير الصلاة على النبي ﷺ' : 'Salawat reminder enabled')
                  : (isAr ? 'تم إيقاف التذكير' : 'Reminder disabled')
                }
              </p>
              <button onClick={dismissBanner} className="mr-auto shrink-0 text-text-muted hover:text-text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {salawatEnabled && (
              <p className="text-[10px] text-emerald-300/60 mt-1">تشغيل #{playCount}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
