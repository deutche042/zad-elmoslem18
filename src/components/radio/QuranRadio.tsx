'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';

// ═══════════════════════════════════════════════════════════════
//  RADIO STATION DATA (24 live streaming stations)
// ═══════════════════════════════════════════════════════════════

interface RadioStation {
  id: number;
  name: string;
  url: string;
  category: 'reciter' | 'official' | 'misc';
}

const RADIO_STATIONS: RadioStation[] = [
  { id: 1, name: 'إذاعة أبو بكر الشاطري', url: 'https://backup.qurango.net/radio/shaik_abu_bakr_al_shatri', category: 'reciter' },
  { id: 2, name: 'إذاعة أحمد خضر الطرابلسي', url: 'https://backup.qurango.net/radio/ahmad_khader_altarabulsi', category: 'reciter' },
  { id: 3, name: 'إذاعة إبراهيم الأخضر', url: 'https://backup.qurango.net/radio/ibrahim_alakdar', category: 'reciter' },
  { id: 4, name: 'إذاعة خالد الجليل', url: 'https://backup.qurango.net/radio/khalid_aljileel', category: 'reciter' },
  { id: 5, name: 'إذاعة صلاح الهاشم', url: 'https://backup.qurango.net/radio/salah_alhashim', category: 'reciter' },
  { id: 6, name: 'إذاعة صلاح بو خاطر', url: 'https://backup.qurango.net/radio/slaah_bukhatir', category: 'reciter' },
  { id: 7, name: 'إذاعة عبدالباسط عبدالصمد', url: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad', category: 'reciter' },
  { id: 8, name: 'إذاعة عبد العزيز سحيم', url: 'https://backup.qurango.net/radio/a_sheim', category: 'reciter' },
  { id: 9, name: 'إذاعة فارس عباد', url: 'https://backup.qurango.net/radio/fares_abbad', category: 'reciter' },
  { id: 10, name: 'إذاعة ماهر المعيقلي', url: 'https://backup.qurango.net/radio/maher', category: 'reciter' },
  { id: 11, name: 'إذاعة محمد صديق المنشاوي', url: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi_mojawwad', category: 'reciter' },
  { id: 12, name: 'إذاعة محمود خليل الحصري', url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary_mojawwad', category: 'reciter' },
  { id: 13, name: 'إذاعة محمود علي البنا', url: 'https://backup.qurango.net/radio/mahmoud_ali__albanna_mojawwad', category: 'reciter' },
  { id: 14, name: 'إذاعة مشاري العفاسي', url: 'https://backup.qurango.net/radio/mishary_alafasi', category: 'reciter' },
  { id: 15, name: 'إذاعة ناصر القطامي', url: 'https://backup.qurango.net/radio/nasser_alqatami', category: 'reciter' },
  { id: 16, name: 'إذاعة نبيل الرفاعي', url: 'https://backup.qurango.net/radio/nabil_al_rifay', category: 'reciter' },
  { id: 17, name: 'إذاعة هيثم الجدعاني', url: 'https://backup.qurango.net/radio/hitham_aljadani', category: 'reciter' },
  { id: 18, name: 'إذاعة ياسر الدوسري', url: 'https://backup.qurango.net/radio/yasser_aldosari', category: 'reciter' },
  { id: 19, name: 'إذاعة القرآن الكريم من القاهرة', url: 'https://n0e.radiojar.com/8s5u5tpdtwzuv', category: 'official' },
  { id: 20, name: 'إذاعة السنة النبوية', url: 'https://n01.radiojar.com/x0vs2vzy6k0uv', category: 'official' },
  { id: 21, name: 'إذاعة تلاوات خاشعة', url: 'https://backup.qurango.net/radio/salma', category: 'official' },
  { id: 22, name: 'إذاعة الرقية الشرعية', url: 'https://backup.qurango.net/radio/roqiah', category: 'misc' },
  { id: 23, name: 'إذاعة تكبيرات العيد', url: 'https://backup.qurango.net/radio/eid', category: 'misc' },
  { id: 24, name: 'المختصر في تفسير القرآن الكريم', url: 'https://backup.qurango.net/radio/mukhtasartafsir', category: 'official' },
];

type CategoryFilter = 'all' | 'reciter' | 'official' | 'misc';

const CATEGORY_CONFIG: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'reciter', label: 'قراء' },
  { key: 'official', label: 'رسمية' },
  { key: 'misc', label: 'متنوعة' },
];

const CATEGORY_BADGE: Record<string, { label: string; color: string }> = {
  reciter: { label: 'قارئ', color: 'bg-zad-gold/15 text-zad-gold' },
  official: { label: 'رسمية', color: 'bg-zad-green/15 text-zad-green' },
  misc: { label: 'متنوعة', color: 'bg-zad-teal/15 text-zad-teal' },
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const VOLUME_STORAGE_KEY = 'zad-radio-volume';

// ═══════════════════════════════════════════════════════════════
//  SVG ICONS (all inline, no external libs)
// ═══════════════════════════════════════════════════════════════

function RadioTowerIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1.7 15.9 1.7 10.7 4.9 7.5" stroke="currentColor" opacity="0.4" />
      <path d="M7.8 16.2C5.6 14 5.6 10.3 7.8 8.1" stroke="currentColor" opacity="0.6" />
      <path d="M10.7 13.3C9.7 12.3 9.7 10.7 10.7 9.7" stroke="currentColor" opacity="0.8" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M19.1 7.5C22.3 10.7 22.3 15.9 19.1 19.1" stroke="currentColor" opacity="0.4" />
      <path d="M16.2 8.1C18.4 10.3 18.4 14 16.2 16.2" stroke="currentColor" opacity="0.6" />
      <path d="M13.3 9.7C14.3 10.7 14.3 12.3 13.3 13.3" stroke="currentColor" opacity="0.8" />
      <line x1="12" y1="13" x2="12" y2="21" stroke="currentColor" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" />
    </svg>
  );
}

function PlayIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function StopIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function SkipNextIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

function SkipPrevIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
    </svg>
  );
}

function VolumeHighIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function VolumeLowIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function VolumeMuteIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function SignalIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1C6.5 1 2 5.5 2 11h2c0-4.4 3.6-8 8-8V1z" opacity="0.6" />
      <path d="M12 5c-3.9 0-7 3.1-7 7h2c0-2.8 2.2-5 5-5V5z" opacity="0.8" />
    </svg>
  );
}

function RetryIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SOUND WAVE VISUALIZER
// ═══════════════════════════════════════════════════════════════

function SoundWave({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-zad-gold"
          animate={
            isPlaying
              ? {
                  height: [8, 24, 12, 28, 8],
                  opacity: [0.4, 1, 0.6, 1, 0.4],
                }
              : {
                  height: [4, 4, 4, 4, 4],
                  opacity: [0.3, 0.3, 0.3, 0.3, 0.3],
                }
          }
          transition={
            isPlaying
              ? {
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }
              : {
                  duration: 0.3,
                }
          }
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LIVE INDICATOR
// ═══════════════════════════════════════════════════════════════

function LiveIndicator({ isLive, isBuffering }: { isLive: boolean; isBuffering: boolean }) {
  const dotColor = isBuffering ? '#F59E0B' : isLive ? '#22C55E' : '#5A6478';
  const labelText = isBuffering
    ? 'جاري التحميل'
    : isLive
      ? 'مباشر'
      : 'متوقف';
  const textColor = isBuffering
    ? 'text-amber-400'
    : isLive
      ? 'text-green-400'
      : 'text-text-muted';

  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="h-2.5 w-2.5 rounded-full"
        animate={
          isLive || isBuffering
            ? { opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }
            : { opacity: 0.3 }
        }
        transition={
          isLive || isBuffering
            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
        style={{ backgroundColor: dotColor }}
      />
      <span className={`text-[11px] font-bold ${textColor}`}>
        {labelText}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VOLUME CONTROL
// ═══════════════════════════════════════════════════════════════

function VolumeControl({
  volume,
  onVolumeChange,
}: {
  volume: number;
  onVolumeChange: (v: number) => void;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSliderClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      // RTL: right side = 0, left side = 100
      const x = rect.right - e.clientX;
      const pct = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
      onVolumeChange(pct);
    },
    [onVolumeChange],
  );

  const toggleMute = useCallback(() => {
    onVolumeChange(volume > 0 ? 0 : 80);
  }, [volume, onVolumeChange]);

  return (
    <div className="flex items-center gap-3 w-full max-w-[200px]">
      <button
        onClick={toggleMute}
        className="flex items-center justify-center flex-shrink-0"
        aria-label="Toggle mute"
      >
        {volume === 0 ? (
          <VolumeMuteIcon className="h-5 w-5 text-text-muted" />
        ) : volume < 50 ? (
          <VolumeLowIcon className="h-5 w-5 text-text-secondary" />
        ) : (
          <VolumeHighIcon className="h-5 w-5 text-text-secondary" />
        )}
      </button>
      <div
        ref={sliderRef}
        className="relative h-2 w-full cursor-pointer rounded-full bg-zad-surface overflow-hidden"
        onClick={handleSliderClick}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
        aria-label="Volume"
      >
        <motion.div
          className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-zad-gold to-zad-gold/60"
          style={{ width: `${volume}%` }}
          transition={{ duration: 0.15 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-zad-gold border-2 border-zad-midnight shadow-lg"
          style={{ right: `calc(${volume}% - 8px)` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-text-muted w-8 text-center flex-shrink-0">
        {volume}%
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STATION CARD
// ═══════════════════════════════════════════════════════════════

function StationCard({
  station,
  isActive,
  isPlaying,
  onClick,
}: {
  station: RadioStation;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
}) {
  const badge = CATEGORY_BADGE[station.category];

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`relative w-full overflow-hidden rounded-xl border p-4 text-right transition-all ${
        isActive
          ? 'border-zad-gold/40 bg-zad-gold/10 shadow-lg shadow-zad-gold/10'
          : 'border-zad-border bg-zad-surface hover:border-zad-gold/20'
      }`}
    >
      {/* Active glow effect */}
      {isActive && isPlaying && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-zad-gold/5 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex flex-col items-end gap-1.5 min-w-0 flex-1">
          {/* Station name */}
          <p
            className={`arabic-display text-sm font-bold leading-snug line-clamp-2 ${
              isActive ? 'text-zad-gold' : 'text-text-primary'
            }`}
          >
            {station.name}
          </p>

          {/* Category badge */}
          <span
            className={`inline-flex items-center self-end rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex-shrink-0 mt-0.5">
          {isActive && isPlaying ? (
            <motion.div
              className="flex items-center justify-center h-8 w-8 rounded-full bg-zad-green/15"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <SignalIcon className="h-4 w-4 text-zad-green" />
            </motion.div>
          ) : isActive ? (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zad-gold/15">
              <SignalIcon className="h-4 w-4 text-zad-gold" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zad-surface">
              <SignalIcon className="h-4 w-4 text-text-muted" />
            </div>
          )}
        </div>
      </div>

      {/* Live indicator on active */}
      {isActive && isPlaying && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[9px] font-bold text-green-400">LIVE</span>
        </div>
      )}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function QuranRadio() {
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';

  // Audio ref (never in state)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          return parsed;
        }
      }
    }
    return 80;
  });
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Save volume to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Monitor online status
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  // Filtered stations
  const filteredStations = categoryFilter === 'all'
    ? RADIO_STATIONS
    : RADIO_STATIONS.filter((s) => s.category === categoryFilter);

  // Navigation helpers
  const navigateStation = useCallback(
    (direction: 'next' | 'prev') => {
      if (!activeStation) return;
      const list = filteredStations;
      const currentIdx = list.findIndex((s) => s.id === activeStation.id);
      if (currentIdx === -1) return;
      let nextIdx: number;
      if (direction === 'next') {
        nextIdx = (currentIdx + 1) % list.length;
      } else {
        nextIdx = (currentIdx - 1 + list.length) % list.length;
      }
      return list[nextIdx];
    },
    [activeStation, filteredStations],
  );

  // Core play function
  const playStation = useCallback(
    (station: RadioStation) => {
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('playing', handlePlaying);
        audioRef.current.removeEventListener('waiting', handleWaiting);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.src = '';
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      setRetryCount(0);
      setHasError(false);
      setIsBuffering(true);

      const audio = new Audio(station.url);
      audio.crossOrigin = 'anonymous';
      audio.volume = volume / 100;
      audioRef.current = audio;

      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('error', handleError);

      audio.play().catch(() => {
        setHasError(true);
        setIsBuffering(false);
      });

      setActiveStation(station);
      setIsPlaying(true);

      function handlePlaying() {
        setIsPlaying(true);
        setIsBuffering(false);
        setHasError(false);
        setRetryCount(0);
      }

      function handleWaiting() {
        setIsBuffering(true);
      }

      function handleError() {
        setIsPlaying(false);
        setIsBuffering(false);
        setHasError(true);
        setRetryCount((prev) => {
          const next = prev + 1;
          if (next < MAX_RETRIES) {
            retryTimerRef.current = setTimeout(() => {
              const currentAudio = audioRef.current;
              if (currentAudio) {
                currentAudio.src = '';
                currentAudio.src = station.url;
                currentAudio.load();
                currentAudio.play().catch(() => {
                  setHasError(true);
                });
              }
            }, RETRY_DELAY * next);
          }
          return next;
        });
      }
    },
    [volume],
  );

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('playing', handlePlaying);
      audioRef.current.removeEventListener('waiting', handleWaiting);
      audioRef.current.removeEventListener('error', handleError);
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setRetryCount(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setHasError(false);

    function handlePlaying() {}
    function handleWaiting() {}
    function handleError() {}
  }, []);

  // Handle station card click
  const handleStationClick = useCallback(
    (station: RadioStation) => {
      if (activeStation && station.id === activeStation.id) {
        // Toggle play/stop on same station
        if (isPlaying) {
          stopPlayback();
        } else {
          playStation(station);
        }
      } else {
        playStation(station);
      }
    },
    [activeStation, isPlaying, playStation, stopPlayback],
  );

  // Next/Previous station
  const goNext = useCallback(() => {
    const next = navigateStation('next');
    if (next) playStation(next);
  }, [navigateStation, playStation]);

  const goPrev = useCallback(() => {
    const prev = navigateStation('prev');
    if (prev) playStation(prev);
  }, [navigateStation, playStation]);

  // Retry current station
  const retryStation = useCallback(() => {
    if (activeStation) {
      setRetryCount(0);
      playStation(activeStation);
    }
  }, [activeStation, playStation]);

  // Volume change handler
  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
  }, []);

  return (
    <div className="custom-scrollbar flex min-h-full flex-col overflow-y-auto" dir="rtl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zad-border bg-zad-midnight/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zad-gold/10">
            <RadioTowerIcon className="h-5 w-5 text-zad-gold" />
          </div>
          <div>
            <h2 className="arabic-display text-lg font-bold text-text-primary">
              {isAr ? 'إذاعة القرآن الكريم' : 'Quran Radio'}
            </h2>
            <p className="text-xs text-text-muted">
              {isAr ? 'محطات إذاعية بث مباشر' : 'Live streaming radio stations'}
            </p>
          </div>
        </div>
        <LiveIndicator isLive={isPlaying} isBuffering={isBuffering} />
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="border-b border-zad-border bg-zad-surface/50 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORY_CONFIG.map((cat) => {
            const isActive = categoryFilter === cat.key;
            const count =
              cat.key === 'all'
                ? RADIO_STATIONS.length
                : RADIO_STATIONS.filter((s) => s.category === cat.key).length;
            return (
              <motion.button
                key={cat.key}
                onClick={() => setCategoryFilter(cat.key)}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-1.5 flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-zad-gold/40 bg-zad-gold/10 text-zad-gold'
                    : 'border-zad-border bg-zad-surface text-text-secondary hover:border-zad-gold/20 hover:text-text-primary'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-60">{count}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Now Playing Card ── */}
      <div className="px-4 pt-4">
        <div className="overflow-hidden rounded-2xl border border-zad-border bg-zad-surface">
          {/* Visualizer area */}
          <div className="relative flex flex-col items-center py-8 px-4">
            {/* Spinning concentric rings */}
            <div className="relative flex items-center justify-center mb-5">
              {/* Outer ring */}
              <motion.div
                className="absolute h-40 w-40 sm:h-48 sm:w-48 rounded-full border border-zad-gold/15"
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={isPlaying ? { duration: 10, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              />
              {/* Middle ring */}
              <motion.div
                className="absolute h-32 w-32 sm:h-40 sm:w-40 rounded-full border border-zad-gold/25"
                animate={isPlaying ? { rotate: -360 } : { rotate: 0 }}
                transition={isPlaying ? { duration: 7, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              />
              {/* Inner ring */}
              <motion.div
                className="absolute h-24 w-24 sm:h-32 sm:w-32 rounded-full border border-zad-gold/35"
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              />

              {/* Center circle with radio icon */}
              <div className="relative z-10 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-zad-gold/20 to-zad-surface border-2 border-zad-gold/30">
                {/* Pulsing glow when playing */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-zad-gold/10"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                {/* Buffering spinner */}
                {isBuffering && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-zad-gold border-r-zad-gold/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                )}

                {/* Radio tower icon */}
                <RadioTowerIcon className={`h-8 w-8 sm:h-10 sm:w-10 ${isPlaying ? 'text-zad-gold' : 'text-text-muted'}`} />
              </div>
            </div>

            {/* Station name */}
            <AnimatePresence mode="wait">
              {activeStation ? (
                <motion.div
                  key={activeStation.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  <h3 className="arabic-display text-xl sm:text-2xl font-bold text-text-primary gold-text text-center leading-snug">
                    {activeStation.name}
                  </h3>
                  <SoundWave isPlaying={isPlaying} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <p className="text-text-secondary text-sm">
                    {isAr ? 'اختر محطة للاستماع' : 'Choose a station to listen'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error state */}
            <AnimatePresence>
              {hasError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center gap-2 mt-3"
                >
                  <p className="text-sm text-red-400 text-center">
                    {isAr
                      ? isOnline
                        ? 'تعذر تشغيل هذه المحطة'
                        : 'لا يوجد اتصال بالإنترنت'
                      : isOnline
                        ? 'Failed to play this station'
                        : 'No internet connection'}
                  </p>
                  {isOnline && retryCount < MAX_RETRIES && (
                    <p className="text-xs text-text-muted">
                      {isAr
                        ? `إعادة المحاولة ${retryCount} من ${MAX_RETRIES}`
                        : `Retrying ${retryCount} of ${MAX_RETRIES}`}
                    </p>
                  )}
                  <button
                    onClick={retryStation}
                    className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <RetryIcon className="h-3.5 w-3.5" />
                    {isAr ? 'إعادة المحاولة' : 'Retry'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-zad-border" />

          {/* Volume + Controls */}
          <div className="px-4 py-5 flex flex-col items-center gap-5">
            {/* Volume */}
            <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />

            {/* Player Controls */}
            <div className="flex items-center gap-5">
              {/* Previous */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goPrev}
                disabled={!activeStation}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zad-midnight text-text-secondary transition-colors hover:bg-zad-border hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipPrevIcon className="h-5 w-5" />
              </motion.button>

              {/* Play/Stop */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  if (isPlaying) {
                    stopPlayback();
                  } else if (activeStation) {
                    playStation(activeStation);
                  }
                }}
                disabled={!activeStation && !isPlaying}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zad-gold to-amber-600 text-zad-midnight shadow-lg shadow-zad-gold/25 transition-shadow hover:shadow-xl hover:shadow-zad-gold/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isBuffering ? (
                  <motion.div
                    className="h-6 w-6 rounded-full border-2 border-zad-midnight border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                ) : isPlaying ? (
                  <StopIcon className="h-7 w-7" />
                ) : (
                  <div className="h-7 w-7" style={{ marginRight: '2px' }}><PlayIcon className="h-7 w-7" /></div>
                )}
              </motion.button>

              {/* Next */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goNext}
                disabled={!activeStation}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-zad-midnight text-text-secondary transition-colors hover:bg-zad-border hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipNextIcon className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Station Grid ── */}
      <div className="px-4 pt-5 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-text-secondary">
            {isAr ? 'المحطات المتاحة' : 'Available Stations'}
          </h4>
          <span className="text-xs text-text-muted">
            {filteredStations.length} {isAr ? 'محطة' : 'stations'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
          <AnimatePresence mode="popLayout">
            {filteredStations.map((station) => (
              <motion.div
                key={station.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <StationCard
                  station={station}
                  isActive={activeStation?.id === station.id}
                  isPlaying={isPlaying && activeStation?.id === station.id}
                  onClick={() => handleStationClick(station)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="pb-4" />
    </div>
  );
}
