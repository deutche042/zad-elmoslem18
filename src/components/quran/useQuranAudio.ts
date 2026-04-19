'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useQuranStore } from '@/store/quran-store';

const TOTAL_AYAHS = 6236;
const MAX_ERRORS = 3;

export function useQuranAudio(reciterId: string) {
  const autoPlayRef = useRef(false);
  const errorCountRef = useRef(0);
  const currentAyahRef = useRef<number | null>(null);
  const reciterIdRef = useRef(reciterId);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const generationRef = useRef(0);
  const playAyahRef = useRef<(surah: number, ayah: number) => void>(() => {});

  // Keep reciter ref in sync
  useEffect(() => {
    reciterIdRef.current = reciterId;
  }, [reciterId]);

  const stopCurrentAudio = useCallback(() => {
    generationRef.current++;
    const audio = currentAudioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      try { audio.pause(); } catch { /* ignore */ }
      try { audio.src = ''; } catch { /* ignore */ }
      currentAudioRef.current = null;
    }
    autoPlayRef.current = false;
    errorCountRef.current = 0;
    useQuranStore.getState().setPlaying(false);
  }, []);

  // Stop and reset ayah when reciter changes
  useEffect(() => {
    stopCurrentAudio();
    currentAyahRef.current = null;
    useQuranStore.getState().setAyah(null);
  }, [reciterId, stopCurrentAudio]);

  // Build the core play logic
  useEffect(() => {
    playAyahRef.current = (surahNum: number, globalAyahNum: number) => {
      if (globalAyahNum < 1 || globalAyahNum > TOTAL_AYAHS) {
        useQuranStore.getState().setPlaying(false);
        useQuranStore.getState().setAyah(null);
        return;
      }

      if (errorCountRef.current >= MAX_ERRORS) {
        useQuranStore.getState().setPlaying(false);
        return;
      }

      // Kill previous audio and invalidate old callbacks
      generationRef.current++;
      const gen = generationRef.current;
      const audio = currentAudioRef.current;
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        try { audio.pause(); } catch { /* ignore */ }
        try { audio.src = ''; } catch { /* ignore */ }
      }

      const newAudio = new Audio();
      currentAudioRef.current = newAudio;
      currentAyahRef.current = globalAyahNum;
      autoPlayRef.current = true;
      errorCountRef.current = 0;

      const rid = reciterIdRef.current;
      const url = `https://cdn.islamic.network/quran/audio/128/${rid}/${globalAyahNum}.mp3`;

      useQuranStore.getState().setAyah(globalAyahNum);
      useQuranStore.getState().setPlaying(true);

      newAudio.onended = () => {
        if (gen !== generationRef.current) return;
        if (!autoPlayRef.current) return;
        errorCountRef.current = 0;
        playAyahRef.current(surahNum, globalAyahNum + 1);
      };

      newAudio.onerror = () => {
        if (gen !== generationRef.current) return;
        if (!autoPlayRef.current) return;
        errorCountRef.current += 1;
        if (errorCountRef.current >= MAX_ERRORS) {
          useQuranStore.getState().setPlaying(false);
          return;
        }
        setTimeout(() => {
          if (gen !== generationRef.current) return;
          if (!autoPlayRef.current) return;
          playAyahRef.current(surahNum, globalAyahNum + 1);
        }, 300);
      };

      newAudio.src = url;
      newAudio.play().catch(() => {
        if (gen !== generationRef.current) return;
        useQuranStore.getState().setPlaying(false);
      });
    };
  }, [stopCurrentAudio]);

  const playAyah = useCallback((surahNum: number, globalAyahNum: number) => {
    autoPlayRef.current = true;
    errorCountRef.current = 0;
    playAyahRef.current(surahNum, globalAyahNum);
  }, []);

  const pause = useCallback(() => {
    autoPlayRef.current = false;
    const audio = currentAudioRef.current;
    if (audio) {
      try { audio.pause(); } catch { /* ignore */ }
    }
    useQuranStore.getState().setPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const audio = currentAudioRef.current;
    if (!audio || !audio.src || currentAyahRef.current === null) return;
    autoPlayRef.current = true;
    if (audio.readyState >= 2) {
      audio.play().then(() => {
        useQuranStore.getState().setPlaying(true);
      }).catch(() => {});
    } else {
      playAyahRef.current(1, currentAyahRef.current);
    }
  }, []);

  const stop = useCallback(() => {
    stopCurrentAudio();
    currentAyahRef.current = null;
    useQuranStore.getState().setAyah(null);
  }, [stopCurrentAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      generationRef.current++;
      autoPlayRef.current = false;
      const audio = currentAudioRef.current;
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        try { audio.pause(); } catch { /* ignore */ }
        try { audio.src = ''; } catch { /* ignore */ }
      }
    };
  }, []);

  return { playAyah, pause, resume, stop };
}
