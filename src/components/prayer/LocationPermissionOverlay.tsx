'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { useGeolocation, type PermissionState } from '@/hooks/useGeolocation';
import { LocationPrompt } from './LocationPrompt';

interface LocationPermissionOverlayProps {
  permissionState: PermissionState;
  isLoading: boolean;
  onAllow: () => void;
  onDismiss: () => void;
  error?: string | null;
}

export function LocationPermissionOverlay({
  permissionState,
  isLoading,
  onAllow,
  onDismiss,
  error,
}: LocationPermissionOverlayProps) {
  const language = useSettingsStore((s) => s.language);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const isAr = language === 'ar';

  // Don't show overlay if permission granted or checking
  if (permissionState === 'granted' || permissionState === 'checking') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-zad-midnight/90 backdrop-blur-md"
          onClick={onDismiss}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
          className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-zad-gold/20 bg-zad-surface shadow-2xl"
        >
          {/* Decorative top glow */}
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-zad-gold/10 blur-3xl" />

          <div className="relative p-6 text-center">
            {/* Animated Mosque / Location Icon */}
            <motion.div
              className="mx-auto mb-4 flex h-24 w-24 items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
            >
              <div className="relative">
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-zad-gold/30"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Inner glow ring */}
                <motion.div
                  className="absolute -inset-2 rounded-full border border-zad-gold/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                {/* Icon container */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-zad-gold/20 to-zad-gold/5">
                  {/* Mosque SVG */}
                  <motion.svg
                    viewBox="0 0 64 64"
                    className="h-14 w-14 text-zad-gold"
                    fill="none"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {/* Dome */}
                    <path
                      d="M32 8C22 8 16 18 16 24h32C48 18 42 8 32 8z"
                      fill="currentColor"
                      opacity="0.3"
                    />
                    {/* Minaret */}
                    <rect x="12" y="10" width="4" height="30" rx="2" fill="currentColor" opacity="0.5" />
                    <rect x="48" y="10" width="4" height="30" rx="2" fill="currentColor" opacity="0.5" />
                    {/* Minaret tops */}
                    <circle cx="14" cy="10" r="3" fill="currentColor" opacity="0.7" />
                    <circle cx="50" cy="10" r="3" fill="currentColor" opacity="0.7" />
                    {/* Crescent */}
                    <path d="M14 6a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" fill="currentColor" />
                    <path d="M50 6a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" fill="currentColor" />
                    {/* Dome top crescent */}
                    <path d="M32 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" fill="currentColor" />
                    {/* Body */}
                    <rect x="16" y="24" width="32" height="20" rx="2" fill="currentColor" opacity="0.2" />
                    {/* Door */}
                    <path d="M28 44v-8a4 4 0 0 1 8 0v8" fill="currentColor" opacity="0.5" />
                    {/* Base */}
                    <rect x="10" y="40" width="44" height="4" rx="1" fill="currentColor" opacity="0.3" />
                    {/* Location pin overlay */}
                    <g>
                      <motion.path
                        d="M32 52a6 6 0 0 1-6-8c0-4 6-10 6-10s6 6 6 10a6 6 0 0 1-6 8z"
                        fill="currentColor"
                        opacity="0.8"
                        initial={{ scale: 0, originX: '32px', originY: '48px' }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring', damping: 12 }}
                      />
                      <motion.circle
                        cx="32"
                        cy="45"
                        r="2"
                        fill="#0B0F1A"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, type: 'spring', damping: 12 }}
                      />
                    </g>
                  </motion.svg>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="arabic-display mb-2 text-xl text-text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isAr ? 'تحديد موقعك' : 'Detect Your Location'}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="mx-auto mb-6 max-w-[260px] text-sm leading-relaxed text-text-secondary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isAr
                ? 'اسمح لنا بالوصول إلى موقعك لعرض مواقيت الصلاة بدقة حسب مدينتك 🕌'
                : 'Allow location access to show accurate prayer times for your city 🕌'}
            </motion.p>

            {/* Show instructions if denied */}
            {showInstructions && permissionState === 'denied' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-2xl border border-zad-border bg-zad-midnight/50 p-4 text-right"
              >
                <p className="mb-3 text-xs font-medium text-zad-gold">
                  {isAr ? 'كيفية تفعيل الموقع:' : 'How to enable location:'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zad-gold/15 text-[10px] text-zad-gold font-bold">1</span>
                    <p className="text-xs text-text-secondary">
                      {isAr
                        ? 'اضغط على أيقونة القفل 🔒 في شريط العنوان'
                        : 'Click the lock icon 🔒 in the address bar'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zad-gold/15 text-[10px] text-zad-gold font-bold">2</span>
                    <p className="text-xs text-text-secondary">
                      {isAr
                        ? 'اختر "إعدادات الموقع" أو "إذونات"'
                        : 'Select "Site settings" or "Permissions"'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zad-gold/15 text-[10px] text-zad-gold font-bold">3</span>
                    <p className="text-xs text-text-secondary">
                      {isAr
                        ? 'غيّر إذن الموقع إلى "سماح"'
                        : 'Change location permission to "Allow"'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zad-gold/15 text-[10px] text-zad-gold font-bold">4</span>
                    <p className="text-xs text-text-secondary">
                      {isAr
                        ? 'أعد تحميل الصفحة'
                        : 'Reload the page'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : showManualSearch ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <LocationPrompt error={error} onRetry={onAllow} />
              </motion.div>
            ) : null}

            {/* Action buttons */}
            {!showManualSearch && !showInstructions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3"
              >
                {/* Primary: Allow Location */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onAllow}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-zad-gold to-amber-600 px-6 py-3.5 text-sm font-bold text-zad-midnight transition-all hover:from-zad-gold-light hover:to-amber-500 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-zad-midnight/30 border-t-zad-midnight"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <span>{isAr ? 'جاري التحديد...' : 'Detecting...'}</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{isAr ? 'السماح بالموقع' : 'Allow Location'}</span>
                    </>
                  )}
                </motion.button>

                {/* Secondary: Manual Search */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowManualSearch(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zad-border bg-zad-midnight/50 px-6 py-3 text-sm text-text-secondary transition-all hover:border-zad-gold/30 hover:text-text-primary"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{isAr ? 'اختيار المدينة يدوياً' : 'Choose City Manually'}</span>
                </motion.button>

                {/* Dismiss */}
                <button
                  onClick={onDismiss}
                  className="mt-1 text-xs text-text-muted transition-colors hover:text-text-secondary"
                >
                  {isAr ? 'لاحقاً' : 'Later'}
                </button>
              </motion.div>
            )}

            {/* Back buttons for sub-views */}
            {(showManualSearch || showInstructions) && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  setShowManualSearch(false);
                  setShowInstructions(false);
                }}
                className="mt-3 text-xs text-text-muted transition-colors hover:text-text-secondary"
              >
                ← {isAr ? 'رجوع' : 'Back'}
              </motion.button>
            )}

            {/* Denied state with instructions button */}
            {!showManualSearch && !showInstructions && permissionState === 'denied' && !isLoading && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={() => setShowInstructions(true)}
                className="mt-2 text-xs text-zad-gold/70 transition-colors hover:text-zad-gold"
              >
                {isAr ? '💡 تم رفض الإذن مسبقاً — كيف أفعّله؟' : '💡 Permission was denied — how to enable?'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
