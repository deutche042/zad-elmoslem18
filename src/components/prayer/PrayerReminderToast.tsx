'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';

interface ReminderData {
  prayerName: string;
  prayerNameAr: string;
  minutesLeft: number;
}

export function PrayerReminderToast() {
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';

  useEffect(() => {
    const handler = (e: Event) => {
      const data = (e as CustomEvent<ReminderData>).detail;
      setReminder(data);

      // Auto dismiss after 8 seconds
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      dismissTimerRef.current = setTimeout(() => setReminder(null), 8000);
    };

    window.addEventListener('prayer-reminder', handler);
    return () => {
      window.removeEventListener('prayer-reminder', handler);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    setReminder(null);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
  };

  // Determine if this is an enable feedback (minutesLeft === 0) or actual prayer reminder
  const isEnableFeedback = reminder && reminder.minutesLeft === 0 && !reminder.prayerName;

  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[100] p-3"
        >
          <div className="mx-auto max-w-md rounded-xl border border-zad-gold/30 bg-gradient-to-r from-zad-navy to-zad-navy/95 p-4 shadow-2xl shadow-zad-gold/10 backdrop-blur-sm">
            {/* Decorative top border */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-zad-gold/50 to-transparent" />

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zad-gold/20">
                {isEnableFeedback ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-zad-gold">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-zad-gold">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {isEnableFeedback ? (
                  <>
                    <p className="text-sm font-bold text-zad-gold arabic-display">{reminder.prayerNameAr}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-zad-gold arabic-display">{reminder.prayerNameAr}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-zad-gold/70">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-xs text-text-secondary">
                        {isAr
                          ? `${reminder.minutesLeft} دقيقة متبقية`
                          : `${reminder.minutesLeft} min remaining`
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-full p-1 text-text-muted transition-colors hover:bg-zad-surface/50 hover:text-text-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
