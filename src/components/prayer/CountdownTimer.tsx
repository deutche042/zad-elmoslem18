'use client';

import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import type { NextPrayer } from '@/types';

interface CountdownTimerProps {
  nextPrayer: NextPrayer;
}

export function CountdownTimer({ nextPrayer }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];

  // Store the absolute target time to avoid drift
  const targetTimeRef = useRef<number>(0);

  useEffect(() => {
    // Set target time = now + remaining (remaining was computed at calculation moment)
    targetTimeRef.current = Date.now() + nextPrayer.remaining;
  }, [nextPrayer.remaining, nextPrayer.name]);

  useEffect(() => {
    const update = () => {
      const msLeft = Math.max(0, targetTimeRef.current - Date.now());

      // Progress bar: assume max 6 hours between prayers
      const totalMs = 6 * 60 * 60 * 1000;
      const elapsed = totalMs - msLeft;
      setProgress(Math.min(100, Math.max(0, (elapsed / totalMs) * 100)));

      const hours = Math.floor(msLeft / 3600000);
      const minutes = Math.floor((msLeft % 3600000) / 60000);
      const seconds = Math.floor((msLeft % 60000) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-zad-gold/30 bg-zad-surface p-4 text-center">
      <p className="mb-1 text-xs text-text-muted">{t.nextPrayer}</p>
      <p className="arabic-display gold-text text-lg font-bold">{nextPrayer.nameAr}</p>
      <p className="my-2 font-mono text-3xl font-medium tabular-nums tracking-wider text-text-primary" aria-live="polite" aria-atomic="true">
        {timeLeft}
      </p>
      <div className="mx-auto h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-zad-midnight">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #D4A017, #F5C842)',
          }}
        />
      </div>
    </div>
  );
}
