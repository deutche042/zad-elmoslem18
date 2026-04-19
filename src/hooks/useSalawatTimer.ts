'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';

export function useSalawatTimer() {
  const { salawatEnabled, salawatInterval, isLoaded } = useSettingsStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playCount, setPlayCount] = useState(0);

  // Create ONE audio element, load it once
  useEffect(() => {
    const audio = new Audio('/audio/salawat.mp3');
    audio.volume = 0.8;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Log for debugging
    audio.addEventListener('canplaythrough', () => {
      console.log('[SalawatTimer] Audio loaded and ready');
    });
    audio.addEventListener('error', (e) => {
      console.error('[SalawatTimer] Audio error:', e);
    });
    audio.addEventListener('playing', () => {
      console.log('[SalawatTimer] ▶ Playing salawat');
    });

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Play function
  const playSalawat = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn('[SalawatTimer] No audio element');
      return;
    }

    console.log('[SalawatTimer] playSalawat() called, currentSrc:', audio.currentSrc);
    audio.currentTime = 0;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        console.log('[SalawatTimer] ✓ play() succeeded');
        setPlayCount(c => c + 1);
      }).catch((err) => {
        console.warn('[SalawatTimer] ✗ play() rejected:', err.message);
      });
    }
  }, []);

  // Interval timer
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (salawatEnabled && isLoaded) {
      console.log(`[SalawatTimer] Starting interval: every ${salawatInterval} min`);

      // Request notification permission in background
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
          .then((permission) => {
            console.log('[SalawatTimer] Notification permission:', permission);
          })
          .catch(() => {
            // Silently ignored - user denied or not supported
          });
      }

      timerRef.current = setInterval(playSalawat, salawatInterval * 60 * 1000);
    } else {
      console.log(`[SalawatTimer] Timer off (enabled=${salawatEnabled}, loaded=${isLoaded})`);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [salawatEnabled, salawatInterval, isLoaded, playSalawat]);

  return { playSalawat, playCount };
}
