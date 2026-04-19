'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';

// ─── Kaaba Coordinates ────────────────────────────────────────────
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const EARTH_RADIUS_KM = 6371;

// ─── Qibla Direction Calculation ──────────────────────────────────
function calculateQibla(lat: number, lng: number): number {
  const kaabaLat = (KAABA_LAT * Math.PI) / 180;
  const kaabaLng = (KAABA_LNG * Math.PI) / 180;
  const userLat = (lat * Math.PI) / 180;
  const userLng = (lng * Math.PI) / 180;

  const dLng = kaabaLng - userLng;
  const x = Math.sin(dLng);
  const y =
    Math.cos(userLat) * Math.tan(kaabaLat) -
    Math.sin(userLat) * Math.cos(dLng);

  let qibla = (Math.atan2(x, y) * 180) / Math.PI;
  return ((qibla + 360) % 360);
}

// ─── Haversine Distance Calculation ───────────────────────────────
function calculateDistance(lat: number, lng: number): number {
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// ─── Format distance for display ──────────────────────────────────
function formatDistance(km: number): string {
  if (km >= 1000) {
    return `${(km / 1000).toFixed(1)} ألف كم`;
  }
  return `${Math.round(km)} كم`;
}

// ─── Kaaba SVG Icon (simple silhouette) ──────────────────────────
function KaabaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Kaaba cube */}
      <path
        d="M20 4L34 11V29L20 36L6 29V11L20 4Z"
        fill="url(#kaaba-gradient)"
        stroke="#D4A017"
        strokeWidth="1.2"
      />
      {/* Top-left fold */}
      <path
        d="M20 4L10 9.5V25.5L6 29V11L20 4Z"
        fill="rgba(212,160,23,0.3)"
        stroke="#D4A017"
        strokeWidth="0.8"
      />
      {/* Kiswa pattern - horizontal band */}
      <path
        d="M8 18H32"
        stroke="#D4A017"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <path
        d="M8 21H32"
        stroke="#D4A017"
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Door */}
      <rect x="16" y="22" width="8" height="10" rx="4" fill="#0B0F1A" stroke="#D4A017" strokeWidth="0.8" opacity="0.8" />
      {/* Gold belt on the top half */}
      <path
        d="M8.5 14.5C12 16 16 17 20 17C24 17 28 16 31.5 14.5"
        stroke="#F5C842"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      <defs>
        <linearGradient id="kaaba-gradient" x1="6" y1="4" x2="34" y2="36">
          <stop offset="0%" stopColor="#1A2332" />
          <stop offset="50%" stopColor="#111827" />
          <stop offset="100%" stopColor="#0B0F1A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Compass Icon for header ──────────────────────────────────────
function CompassHeaderIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="#D4A017" strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="12" r="7" stroke="#D4A017" strokeWidth="0.8" opacity="0.3" />
      {/* North arrow */}
      <path d="M12 3L14 10L12 9L10 10Z" fill="#D4A017" />
      {/* South arrow */}
      <path d="M12 21L10 14L12 15L14 14Z" fill="#5A6478" opacity="0.5" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1.5" fill="#D4A017" />
    </svg>
  );
}

// ─── Location Icon ────────────────────────────────────────────────
function LocationIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

// ─── Distance Icon ────────────────────────────────────────────────
function DistanceIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

// ─── Degree Icon ──────────────────────────────────────────────────
function DegreeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 12l3 2" />
    </svg>
  );
}

// ─── Sensor Icon ──────────────────────────────────────────────────
function SensorIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? 'text-zad-green' : 'text-text-muted'}
    >
      <circle cx="12" cy="12" r="3" fill={active ? 'currentColor' : 'none'} />
      <path d="M12 1v2" />
      <path d="M12 21v2" />
      <path d="M4.22 4.22l1.42 1.42" />
      <path d="M18.36 18.36l1.42 1.42" />
      <path d="M1 12h2" />
      <path d="M21 12h2" />
      <path d="M4.22 19.78l1.42-1.42" />
      <path d="M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

// ─── Device Orientation Hook ─────────────────────────────────────
interface DeviceOrientationState {
  heading: number | null;
  hasGyroscope: boolean;
  permissionStatus: 'idle' | 'requesting' | 'granted' | 'denied';
}

function useDeviceOrientation() {
  // Detect iOS 13+ as a derived constant (doesn't change)
  const isIOS13 = useMemo(() => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    return typeof DOE.requestPermission === 'function';
  }, []);

  const [state, setState] = useState<DeviceOrientationState>({
    heading: null,
    hasGyroscope: false,
    permissionStatus: 'idle',
  });

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // webkitCompassHeading is iOS-specific and more accurate
    // alpha is the general compass heading (0-360)
    let heading: number | null = null;

    if ((event as any).webkitCompassHeading !== undefined && (event as any).webkitCompassHeading !== null) {
      // iOS: webkitCompassHeading gives heading relative to north (0=N, 90=E)
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null && event.absolute) {
      // Android with absolute orientation
      heading = event.alpha;
    }

    if (heading !== null) {
      setState((prev) => ({
        ...prev,
        heading: (heading + 360) % 360,
        hasGyroscope: true,
      }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DOE.requestPermission === 'function') {
      try {
        setState((prev) => ({ ...prev, permissionStatus: 'requesting' }));
        const response = await DOE.requestPermission();
        if (response === 'granted') {
          setState((prev) => ({ ...prev, permissionStatus: 'granted' }));
          window.addEventListener('deviceorientation', handleOrientation as EventListener);
        } else {
          setState((prev) => ({ ...prev, permissionStatus: 'denied' }));
        }
      } catch {
        setState((prev) => ({ ...prev, permissionStatus: 'denied' }));
      }
    } else {
      window.addEventListener('deviceorientation', handleOrientation as EventListener);
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (isIOS13) {
      return;
    }

    window.addEventListener('deviceorientation', handleOrientation as EventListener);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    };
  }, [handleOrientation, isIOS13]);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    };
  }, [handleOrientation]);

  return { ...state, isIOS13, requestPermission };
}

// ─── Main Component ───────────────────────────────────────────────
export function QiblaCompass() {
  const locationLat = useSettingsStore((s) => s.locationLat);
  const locationLng = useSettingsStore((s) => s.locationLng);
  const locationName = useSettingsStore((s) => s.locationName);

  const lat = locationLat ?? 30.0444;
  const lng = locationLng ?? 31.2357;

  const qiblaDirection = useMemo(() => calculateQibla(lat, lng), [lat, lng]);
  const distance = useMemo(() => calculateDistance(lat, lng), [lat, lng]);

  // Device orientation hook
  const {
    heading,
    hasGyroscope,
    isIOS13,
    permissionStatus,
    requestPermission,
  } = useDeviceOrientation();

  // The compass rotates so that Qibla direction is always correctly indicated
  // Static rotation: compassRotation = 360 - qiblaDirection
  // With device heading: total rotation = compassRotation - heading
  // This makes the compass dial rotate WITH the device so the fixed arrow always points to Qibla
  const compassRotation = 360 - qiblaDirection;

  // Calculate final rotation for the dial
  const dialRotation = useMemo(() => {
    if (heading !== null && hasGyroscope) {
      return compassRotation - heading;
    }
    return compassRotation;
  }, [compassRotation, heading, hasGyroscope]);

  // Smooth heading display (rounded)
  const displayHeading = heading !== null ? Math.round(heading) : null;

  const compassSize = 280;
  const center = compassSize / 2;
  const outerRadius = 130;
  const innerRadius = 110;
  const tickOuter = 126;
  const tickInnerMajor = 114;
  const tickInnerMinor = 118;
  const textRadius = 100;

  // Generate tick marks
  const ticks = useMemo(() => {
    const result: { angle: number; major: boolean; degree: number }[] = [];
    for (let i = 0; i < 360; i += 5) {
      result.push({ angle: i, major: i % 30 === 0, degree: i });
    }
    return result;
  }, []);

  // Cardinal directions with Arabic labels
  const cardinals = [
    { label: 'شمال', subLabel: 'N', angle: 0 },
    { label: 'شرق', subLabel: 'E', angle: 90 },
    { label: 'جنوب', subLabel: 'S', angle: 180 },
    { label: 'غرب', subLabel: 'W', angle: 270 },
  ];

  // Determine if we show real-time or static
  const isLiveMode = heading !== null && hasGyroscope;
  const showNoSensorMessage = !hasGyroscope && !isIOS13;

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <motion.div
        className="px-4 pt-4 pb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-zad-gold/10 flex items-center justify-center flex-shrink-0">
            <CompassHeaderIcon />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-text-primary leading-tight">
              القبلة
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              اتجاه الكعبة المشرفة
            </p>
          </div>
          {/* Sensor status badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zad-surface border border-zad-border/60">
            <SensorIcon active={isLiveMode} />
            <span className="text-[10px] text-text-muted">
              {isLiveMode ? 'مباشر' : isIOS13 && permissionStatus !== 'granted' ? 'يحتاج إذن' : 'يدوي'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Compass Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-5">
        {/* iOS Permission Request */}
        <AnimatePresence>
          {isIOS13 && permissionStatus !== 'granted' && permissionStatus !== 'denied' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-xs"
            >
              <div className="bg-zad-gold/10 border border-zad-gold/30 rounded-2xl p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-zad-gold/15 flex items-center justify-center mx-auto mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#D4A017"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a10 10 0 0 1 10 10" />
                    <path d="M12 2a10 10 0 0 0-10 10" />
                    <path d="M12 12l4-4" />
                    <circle cx="12" cy="12" r="1" fill="#D4A017" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text-primary mb-1">
                  تفعيل البوصلة
                </p>
                <p className="text-xs text-text-secondary mb-3">
                  يحتاج التطبيق إلى الوصول إلى مستشعر الاتجاه لتحديد اتجاه القبلة بدقة
                </p>
                <button
                  onClick={requestPermission}
                  disabled={permissionStatus === 'requesting'}
                  className="w-full py-2.5 px-4 rounded-xl bg-zad-gold/20 border border-zad-gold/40 text-zad-gold text-sm font-medium
                    hover:bg-zad-gold/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {permissionStatus === 'requesting' ? 'جارٍ الطلب...' : 'السماح بالوصول للمستشعر'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* iOS Permission Denied */}
        <AnimatePresence>
          {isIOS13 && permissionStatus === 'denied' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-xs"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                <p className="text-sm font-medium text-text-primary mb-1">
                  لم يتم السماح بالوصول
                </p>
                <p className="text-xs text-text-secondary">
                  يمكنك تفعيل المستشعر من إعدادات Safari &gt; الموقع &gt; الاتجاه
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compass SVG */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.15,
          }}
        >
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full opacity-30"
            style={{
              background:
                'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)',
              transform: 'scale(1.3)',
            }}
          />

          <svg
            width={compassSize}
            height={compassSize}
            viewBox={`0 0 ${compassSize} ${compassSize}`}
            className="drop-shadow-lg"
          >
            <defs>
              {/* Gold gradient for Qibla arrow */}
              <linearGradient
                id="arrow-gradient"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#B8860B" />
                <stop offset="40%" stopColor="#D4A017" />
                <stop offset="70%" stopColor="#F5C842" />
                <stop offset="100%" stopColor="#D4A017" />
              </linearGradient>

              {/* Ring gradient */}
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A5F" />
                <stop offset="50%" stopColor="#D4A017" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E3A5F" />
              </linearGradient>

              {/* Kaaba glow filter */}
              <filter id="kaaba-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* North glow */}
              <filter id="north-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                <feFlood floodColor="#D4A017" floodOpacity="0.5" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ─── Outer decorative ring ─── */}
            <circle
              cx={center}
              cy={center}
              r={outerRadius + 4}
              fill="none"
              stroke="url(#ring-gradient)"
              strokeWidth="1.5"
              opacity="0.5"
            />

            {/* ─── Compass background circle ─── */}
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="#0B0F1A"
              stroke="#1E3A5F"
              strokeWidth="1.5"
            />

            {/* Subtle inner pattern circle */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="none"
              stroke="#1E3A5F"
              strokeWidth="0.5"
              opacity="0.4"
            />

            {/* ─── Rotating compass dial (tick marks + directions) ─── */}
            <g
              style={{
                transform: `rotate(${dialRotation}deg)`,
                transformOrigin: `${center}px ${center}px`,
                transition: isLiveMode
                  ? 'transform 0.15s linear'
                  : 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Degree tick marks */}
              {ticks.map((tick) => {
                const rad = ((tick.angle - 90) * Math.PI) / 180;
                const x1 = center + tickInnerMinor * Math.cos(rad);
                const y1 = center + tickInnerMinor * Math.sin(rad);
                const x2 = center + (tick.major ? tickInnerMajor : tickOuter) * Math.cos(rad);
                const y2 = center + (tick.major ? tickInnerMajor : tickOuter) * Math.sin(rad);

                return (
                  <line
                    key={tick.degree}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={tick.major ? '#D4A017' : '#1E3A5F'}
                    strokeWidth={tick.major ? 1.8 : 0.7}
                    opacity={tick.major ? 0.9 : 0.5}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Minor degree labels every 30° */}
              {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                const x = center + (textRadius - 2) * Math.cos(rad);
                const y = center + (textRadius - 2) * Math.sin(rad);
                return (
                  <text
                    key={`deg-${deg}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#5A6478"
                    fontSize="7"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                  >
                    {deg}°
                  </text>
                );
              })}

              {/* Cardinal direction labels */}
              {cardinals.map((cardinal) => {
                const rad = ((cardinal.angle - 90) * Math.PI) / 180;
                const labelR = cardinal.angle === 0 ? textRadius - 8 : textRadius - 2;
                const x = center + labelR * Math.cos(rad);
                const y = center + labelR * Math.sin(rad);
                return (
                  <g key={cardinal.label}>
                    {/* Background circle for cardinal */}
                    <circle
                      cx={x}
                      cy={y}
                      r="13"
                      fill={cardinal.angle === 0 ? 'rgba(212,160,23,0.15)' : 'rgba(11,15,26,0.8)'}
                      stroke={cardinal.angle === 0 ? '#D4A017' : '#1E3A5F'}
                      strokeWidth={cardinal.angle === 0 ? 1 : 0.5}
                    />
                    <text
                      x={x}
                      y={y - 4}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={cardinal.angle === 0 ? '#D4A017' : '#B8A98A'}
                      fontSize="9"
                      fontFamily="Noto Naskh Arabic, Scheherazade New, serif"
                      fontWeight="700"
                      filter={cardinal.angle === 0 ? 'url(#north-glow)' : undefined}
                    >
                      {cardinal.label}
                    </text>
                    <text
                      x={x}
                      y={y + 6}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={cardinal.angle === 0 ? '#D4A017' : '#5A6478'}
                      fontSize="6"
                      fontFamily="Inter, sans-serif"
                      fontWeight="500"
                      opacity="0.7"
                    >
                      {cardinal.subLabel}
                    </text>
                  </g>
                );
              })}

              {/* Qibla direction indicator on the ring (a small gold marker) */}
              {/* This stays at 0° on the dial (top) since the dial itself rotates */}
            </g>

            {/* ─── Fixed Qibla Arrow (always points up) ─── */}
            <g filter="url(#kaaba-glow)">
              {/* Arrow body */}
              <polygon
                points={`
                  ${center}, ${center - 90}
                  ${center - 10}, ${center - 20}
                  ${center - 4}, ${center - 20}
                  ${center - 4}, ${center + 10}
                  ${center + 4}, ${center + 10}
                  ${center + 4}, ${center - 20}
                  ${center + 10}, ${center - 20}
                `}
                fill="url(#arrow-gradient)"
                opacity="0.95"
              />

              {/* Arrow edge highlight */}
              <polygon
                points={`
                  ${center - 1}, ${center - 85}
                  ${center - 8}, ${center - 22}
                  ${center - 4}, ${center - 22}
                  ${center - 4}, ${center - 20}
                  ${center + 4}, ${center - 20}
                  ${center + 4}, ${center - 22}
                  ${center + 8}, ${center - 22}
                  ${center + 1}, ${center - 85}
                `}
                fill="none"
                stroke="#F5C842"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </g>

            {/* Kaaba icon at tip of arrow */}
            <g transform={`translate(${center - 12}, ${center - 100})`}>
              <KaabaIcon size={24} />
            </g>

            {/* ─── Center decoration ─── */}
            {/* Center ring */}
            <circle
              cx={center}
              cy={center}
              r="16"
              fill="#0B0F1A"
              stroke="#1E3A5F"
              strokeWidth="1"
            />
            <circle
              cx={center}
              cy={center}
              r="12"
              fill="rgba(212,160,23,0.08)"
              stroke="#D4A017"
              strokeWidth="0.5"
              opacity="0.6"
            />
            {/* Center dot */}
            <circle
              cx={center}
              cy={center}
              r="3"
              fill="#D4A017"
            />
            <circle
              cx={center}
              cy={center}
              r="1.5"
              fill="#F5C842"
            />

            {/* ─── Inner decorative circles ─── */}
            <circle
              cx={center}
              cy={center}
              r="40"
              fill="none"
              stroke="#1E3A5F"
              strokeWidth="0.3"
              opacity="0.3"
              strokeDasharray="2 4"
            />
            <circle
              cx={center}
              cy={center}
              r="70"
              fill="none"
              stroke="#1E3A5F"
              strokeWidth="0.3"
              opacity="0.3"
              strokeDasharray="2 4"
            />
          </svg>

          {/* Fixed "القبلة" label at top */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-[10px] text-zad-gold font-medium opacity-80">
              القبلة
            </span>
          </div>

          {/* Bottom indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            {isLiveMode && displayHeading !== null ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-zad-green font-medium">
                  ● {displayHeading}°
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-text-muted font-medium">
                {Math.round(qiblaDirection)}°
              </span>
            )}
          </div>
        </motion.div>

        {/* ─── Heading accuracy indicator (live mode) ─── */}
        <AnimatePresence>
          {isLiveMode && displayHeading !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zad-green/10 border border-zad-green/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zad-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zad-green" />
              </span>
              <span className="text-[11px] text-zad-green font-medium">
                اتجاه الجهاز: {displayHeading}° {getCardinalArabic(displayHeading)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── No sensor message (desktop fallback) ─── */}
        <AnimatePresence>
          {showNoSensorMessage && !isIOS13 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-xs text-center"
            >
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zad-surface border border-zad-border/60">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-muted flex-shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <p className="text-xs text-text-secondary leading-relaxed">
                  وجّه أعلى جهازك نحو السهم للاتجاه صوب القبلة
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Info Cards ─── */}
        <motion.div
          className="w-full max-w-xs flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Main Qibla Direction Card */}
          <div className="bg-zad-surface border border-zad-border rounded-2xl p-4 relative overflow-hidden">
            {/* Decorative top gradient */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-zad-gold/0 via-zad-gold to-zad-gold/0" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zad-gold/10 flex items-center justify-center flex-shrink-0">
                  <DegreeIcon />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">اتجاه القبلة</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {Math.round(qiblaDirection)}°
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs text-text-muted">Direction</p>
                <p className="text-sm font-medium text-text-secondary">
                  {getDirectionName(qiblaDirection)}
                </p>
              </div>
            </div>
          </div>

          {/* Distance & Location Cards Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Distance Card */}
            <div className="bg-zad-surface border border-zad-border/60 rounded-xl p-3.5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <DistanceIcon />
                <span className="text-[10px] text-text-muted">المسافة</span>
              </div>
              <p className="text-sm font-semibold text-text-primary leading-tight">
                {formatDistance(distance)}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                إلى الكعبة المشرفة
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-zad-surface border border-zad-border/60 rounded-xl p-3.5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <LocationIcon />
                <span className="text-[10px] text-text-muted">الموقع</span>
              </div>
              <p className="text-sm font-semibold text-text-primary leading-tight">
                {locationName ?? 'القاهرة'}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {lat.toFixed(2)}°, {lng.toFixed(2)}°
              </p>
            </div>
          </div>

          {/* Islamic reminder */}
          <div className="bg-zad-gold/5 border border-zad-gold/15 rounded-xl p-3.5 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-zad-gold/0 via-zad-gold/30 to-zad-gold/0" />
            <p className="arabic-display text-sm text-zad-gold leading-relaxed">
              ﴿ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ﴾
            </p>
            <p className="text-[10px] text-text-muted mt-1.5">
              سورة البقرة - الآية ١٤٤
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Helper: Get direction name in Arabic ─────────────────────────
function getDirectionName(degrees: number): string {
  if (degrees >= 337.5 || degrees < 22.5) return 'شمال';
  if (degrees >= 22.5 && degrees < 67.5) return 'شمال شرق';
  if (degrees >= 67.5 && degrees < 112.5) return 'شرق';
  if (degrees >= 112.5 && degrees < 157.5) return 'جنوب شرق';
  if (degrees >= 157.5 && degrees < 202.5) return 'جنوب';
  if (degrees >= 202.5 && degrees < 247.5) return 'جنوب غرب';
  if (degrees >= 247.5 && degrees < 292.5) return 'غرب';
  return 'شمال غرب';
}

// ─── Helper: Get short cardinal name in Arabic for heading display ──
function getCardinalArabic(degrees: number): string {
  if (degrees >= 337.5 || degrees < 22.5) return 'ش';
  if (degrees >= 22.5 && degrees < 67.5) return 'ش.ر';
  if (degrees >= 67.5 && degrees < 112.5) return 'ر';
  if (degrees >= 112.5 && degrees < 157.5) return 'ج.ر';
  if (degrees >= 157.5 && degrees < 202.5) return 'ج';
  if (degrees >= 202.5 && degrees < 247.5) return 'ج.غ';
  if (degrees >= 247.5 && degrees < 292.5) return 'غ';
  return 'ش.غ';
}
