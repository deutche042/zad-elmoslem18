'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';

interface AdhanData {
  prayerName: string;
  prayerNameAr: string;
}

export function AdhanToast() {
  const [adhan, setAdhan] = useState<AdhanData | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handler = (e: Event) => {
      const data = (e as CustomEvent<AdhanData>).detail;
      setAdhan(data);

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
      // Auto dismiss after 15 seconds
      dismissTimerRef.current = setTimeout(() => setAdhan(null), 15000);
    };

    window.addEventListener('adhan-playing', handler);
    return () => {
      window.removeEventListener('adhan-playing', handler);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    setAdhan(null);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
  };

  return (
    <AnimatePresence>
      {adhan && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[200] p-3"
        >
          <div className="mx-auto max-w-sm rounded-2xl border-2 border-zad-gold/40 bg-gradient-to-b from-zad-midnight via-zad-navy to-zad-midnight p-5 shadow-2xl shadow-zad-gold/15">
            {/* Decorative top */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-zad-gold/60 to-transparent" />

            {/* Kaaba icon */}
            <div className="flex justify-center mb-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-zad-gold/10 border border-zad-gold/30">
                <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
                  <path d="M20 4L34 11V29L20 36L6 29V11L20 4Z" fill="url(#adhan-kaaba-grad)" stroke="#D4A017" strokeWidth="1.2" />
                  <path d="M8 18H32" stroke="#D4A017" strokeWidth="1.5" opacity="0.6" />
                  <path d="M8 21H32" stroke="#D4A017" strokeWidth="1.5" opacity="0.6" />
                  <rect x="16" y="22" width="8" height="10" rx="4" fill="#0B0F1A" stroke="#D4A017" strokeWidth="0.8" opacity="0.8" />
                  <defs>
                    <linearGradient id="adhan-kaaba-grad" x1="6" y1="4" x2="34" y2="36">
                      <stop offset="0%" stopColor="#1A2332" />
                      <stop offset="100%" stopColor="#0B0F1A" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full border-2 border-zad-gold/40 animate-ping" />
              </div>
            </div>

            {/* Title */}
            <h2 className="arabic-display text-center text-xl font-bold text-zad-gold">
              {t.adhanToastTitle}
            </h2>

            {/* Prayer name */}
            <p className="arabic-display text-center text-base font-semibold text-text-primary mt-1">
              {adhan.prayerNameAr}
            </p>

            {/* Subtitle */}
            <p className="text-center text-xs text-text-secondary mt-2">
              {isAr ? 'حان وقت الصلاة' : 'It\'s prayer time'}
            </p>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="mx-auto mt-3 flex items-center gap-1.5 rounded-full bg-zad-gold/10 px-4 py-1.5 text-xs font-medium text-zad-gold transition-all hover:bg-zad-gold/20 active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M20 12H4" strokeLinecap="round" />
              </svg>
              {isAr ? 'إغلاق' : 'Dismiss'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
