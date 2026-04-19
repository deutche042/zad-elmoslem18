'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';

function playReminderChime() {
  try {
    const ctx = new AudioContext();
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 523.25; // C5
    gain1.gain.value = 0.3;
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    // Second tone (higher)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 659.25; // E5
    gain2.gain.value = 0.3;
    osc2.start(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.6);

    // Third tone (highest)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.value = 783.99; // G5
    gain3.gain.value = 0.3;
    osc3.start(ctx.currentTime + 0.6);
    osc3.stop(ctx.currentTime + 1.0);

    // Clean up
    setTimeout(() => ctx.close(), 2000);
  } catch {
    // Audio context not available
  }
}

export function usePrayerReminder() {
  const { nextPrayer } = usePrayerTimes();
  const { prayerReminderEnabled, prayerReminderMinutes } = useSettingsStore();
  const notifiedPrayerRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showNotification = useCallback(async (prayerName: string, prayerNameAr: string, minutesLeft: number) => {
    const lang = useSettingsStore.getState().language;
    const t = TRANSLATIONS[lang];

    // Browser notification — properly await permission
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
          const body = t.prayerReminderBody.replace('{prayer}', lang === 'ar' ? prayerNameAr : prayerName);
          new Notification(t.prayerReminder, {
            body,
            icon: '/icon.png',
            tag: `prayer-reminder-${prayerName}`,
          });
        }
      }
    } catch {
      // Notification API not available
    }

    // Play chime
    playReminderChime();

    // Dispatch custom event for toast
    window.dispatchEvent(
      new CustomEvent('prayer-reminder', {
        detail: { prayerName, prayerNameAr, minutesLeft },
      })
    );
  }, []);

  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!prayerReminderEnabled) {
      return undefined;
    }

    const check = () => {
      if (!nextPrayer) return;

      const { name, nameAr, remaining } = nextPrayer;
      const reminderWindow = prayerReminderMinutes * 60 * 1000; // convert to ms

      // If prayer time has passed or prayer changed, reset notified state
      if (remaining <= 0 || name !== notifiedPrayerRef.current) {
        if (remaining <= 0 && notifiedPrayerRef.current === name) {
          notifiedPrayerRef.current = null;
        }
      }

      // Check if we should notify
      if (
        remaining <= reminderWindow &&
        remaining > 0 &&
        notifiedPrayerRef.current !== name
      ) {
        const minutesLeft = Math.ceil(remaining / 60000);
        notifiedPrayerRef.current = name;
        showNotification(name, nameAr, minutesLeft);
      }
    };

    // Check immediately
    check();

    // Then check every 15 seconds
    timerRef.current = setInterval(check, 15 * 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [prayerReminderEnabled, prayerReminderMinutes, nextPrayer, showNotification]);
}
