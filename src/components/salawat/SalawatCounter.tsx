'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Flame, Target, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { useSalawatStore } from '@/store/salawat-store';
import { TRANSLATIONS } from '@/lib/constants';

const TARGET_PRESETS = [33, 100, 333, 1000];

export function SalawatCounter() {
  const { count, target, todayCount, streak, increment, decrement, reset, setTarget } =
    useSalawatStore();
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];

  const [showCustomTarget, setShowCustomTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState('');
  const [rippleKey, setRippleKey] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Progress calculations
  const progress = useMemo(() => Math.min((count / target) * 100, 100), [count, target]);
  const isNearTarget = progress >= 80;
  const isComplete = count >= target;

  // SVG progress ring parameters
  const radius = 120;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleTap = useCallback(() => {
    increment();
    setRippleKey((k) => k + 1);

    if (count + 1 >= target && !isComplete) {
      setShowCompletion(true);
      setTimeout(() => setShowCompletion(false), 2500);
    }
  }, [increment, count, target, isComplete]);

  const handleCustomTarget = useCallback(() => {
    const val = parseInt(customTargetInput, 10);
    if (val > 0 && val <= 10000) {
      setTarget(val);
      setShowCustomTarget(false);
      setCustomTargetInput('');
    }
  }, [customTargetInput, setTarget]);

  const handlePresetTarget = useCallback(
    (val: number) => {
      setTarget(val);
      setShowCustomTarget(false);
    },
    [setTarget]
  );

  return (
    <div dir="rtl" className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8">
      {/* Radial gradient background aura */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 420,
          height: 420,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(212,160,23,0.08) 0%, rgba(26,155,95,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Header: Salawat title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <h2 className="gold-text arabic-display text-xl font-bold">{t.salawat}</h2>
        <p className="mt-1 text-xs text-text-muted">{t.salawatCount}</p>
      </motion.div>

      {/* Supplication text above the counter */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="arabic-display relative z-10 text-center text-lg leading-relaxed text-text-secondary"
      >
        اللهم صلِّ على محمد
      </motion.p>

      {/* Main circular counter - tappable */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative z-10"
      >
        <motion.button
          onClick={handleTap}
          whileTap={{ scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className={`relative flex items-center justify-center rounded-full bg-transparent outline-none focus:outline-none ${
            isNearTarget ? 'moon-glow' : ''
          }`}
          style={{
            width: 280,
            height: 280,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
          aria-label={t.tapToCount}
        >
          {/* SVG progress ring */}
          <svg width="280" height="280" className="absolute inset-0 -rotate-90">
            <defs>
              {/* Gold-to-green gradient for progress */}
              <linearGradient id="salawat-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4A017" />
                <stop offset="60%" stopColor="#F5C842" />
                <stop offset="100%" stopColor="#1A9B5F" />
              </linearGradient>
              {/* Glow filter */}
              <filter id="progress-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background track */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="var(--color-zad-surface)"
              strokeWidth={strokeWidth}
            />

            {/* Decorative inner circle */}
            <circle
              cx="140"
              cy="140"
              r={radius - 16}
              fill="none"
              stroke="var(--color-zad-border)"
              strokeWidth={1}
              strokeDasharray="4 8"
              opacity={0.4}
            />

            {/* Progress arc */}
            <motion.circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="url(#salawat-gradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              filter={isNearTarget ? 'url(#progress-glow)' : undefined}
              initial={false}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />

            {/* Completion indicator dot at the end of arc */}
            {count > 0 && (
              <motion.circle
                cx="140"
                cy="140"
                r={6}
                fill="#F5C842"
                filter="url(#progress-glow)"
                initial={false}
                animate={{
                  cx: 140 + radius * Math.cos(((progress / 100) * 360 - 90) * (Math.PI / 180)),
                  cy: 140 + radius * Math.sin(((progress / 100) * 360 - 90) * (Math.PI / 180)),
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            )}
          </svg>

          {/* Inner radial gradient fill */}
          <div
            className="absolute inset-8 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 40% 35%, rgba(212,160,23,0.06) 0%, rgba(26,155,95,0.03) 50%, transparent 80%)',
            }}
          />

          {/* Tap ripple effect */}
          <AnimatePresence>
            <motion.div
              key={rippleKey}
              initial={{ scale: 0, opacity: 0.35 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="pointer-events-none absolute h-24 w-24 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212,160,23,0.5) 0%, transparent 70%)',
              }}
            />
          </AnimatePresence>

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-1">
            {/* ﷺ symbol */}
            <span className="arabic-display text-2xl text-text-secondary" style={{ lineHeight: 1.4 }}>
              ﷺ
            </span>

            {/* Main count */}
            <motion.span
              key={count}
              initial={{ scale: 1.15, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="font-mono text-5xl font-bold tabular-nums text-text-primary"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              aria-live="polite"
              aria-atomic="true"
            >
              {count}
            </motion.span>

            {/* Target fraction */}
            <span className="text-sm text-text-muted">
              / {target.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
            </span>

            {/* Progress percentage */}
            <span className="text-xs font-medium text-zad-gold">
              {Math.round(progress)}%
            </span>
          </div>
        </motion.button>
      </motion.div>

      {/* Completion celebration overlay */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-zad-gold/30 bg-zad-navy/95 px-8 py-6 shadow-2xl shadow-zad-gold/20 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-zad-gold" />
              <p className="gold-text arabic-display text-xl">ما شاء الله</p>
              <p className="text-sm text-text-secondary">
                {language === 'ar' ? 'أتممت الهدف اليومي' : 'Daily target completed!'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls section below counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="relative z-10 flex w-full max-w-sm flex-col gap-4"
      >
        {/* Stats row: today's count + streak + progress */}
        <div className="flex items-center justify-center gap-6 rounded-xl border border-zad-border/50 bg-zad-surface/60 px-4 py-3 backdrop-blur-sm">
          {/* Today's count */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 text-text-muted">
              <Target className="h-3.5 w-3.5" />
              <span className="text-[10px]">{t.dailyTarget}</span>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-text-primary">
              {todayCount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-zad-border/50" />

          {/* Streak */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 text-text-muted">
              <Flame className="h-3.5 w-3.5" />
              <span className="text-[10px]">{language === 'ar' ? 'السلسلة' : 'Streak'}</span>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-text-primary">
              {streak}
              <span className="text-text-muted"> {language === 'ar' ? 'يوم' : 'd'}</span>
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-zad-border/50" />

          {/* Total count */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 text-text-muted">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px]">{language === 'ar' ? 'المجموع' : 'Total'}</span>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-text-primary">
              {count.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
            </span>
          </div>
        </div>

        {/* Target selector */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-text-muted">{t.target}</span>
          <div className="flex items-center gap-2">
            {TARGET_PRESETS.map((preset) => (
              <motion.button
                key={preset}
                onClick={() => handlePresetTarget(preset)}
                whileTap={{ scale: 0.92 }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  target === preset
                    ? 'bg-zad-gold/20 text-zad-gold shadow-sm shadow-zad-gold/10'
                    : 'bg-zad-surface/80 text-text-muted hover:bg-zad-surface hover:text-text-secondary'
                }`}
              >
                {preset.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </motion.button>
            ))}

            {/* Custom target button */}
            <motion.button
              onClick={() => setShowCustomTarget(!showCustomTarget)}
              whileTap={{ scale: 0.92 }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                !TARGET_PRESETS.includes(target)
                  ? 'bg-zad-green/20 text-zad-green shadow-sm shadow-zad-green/10'
                  : 'bg-zad-surface/80 text-text-muted hover:bg-zad-surface hover:text-text-secondary'
              }`}
            >
              {language === 'ar' ? 'مخصص' : 'Custom'}
            </motion.button>

            {/* Reset button */}
            <motion.button
              onClick={reset}
              whileTap={{ scale: 0.88 }}
              className="rounded-lg bg-zad-surface/80 p-1.5 text-text-muted transition-all hover:bg-red-500/10 hover:text-red-400"
              aria-label={t.reset}
            >
              <RotateCcw className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Custom target input */}
        <AnimatePresence>
          {showCustomTarget && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2 rounded-xl border border-zad-border/50 bg-zad-surface/60 px-4 py-3">
                <input
                  type="number"
                  value={customTargetInput}
                  onChange={(e) => setCustomTargetInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomTarget()}
                  placeholder={language === 'ar' ? 'أدخل العدد...' : 'Enter number...'}
                  min={1}
                  max={10000}
                  dir="ltr"
                  className="w-28 rounded-lg border border-zad-border/50 bg-zad-midnight px-3 py-1.5 text-center text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-zad-gold/50"
                />
                <motion.button
                  onClick={handleCustomTarget}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-zad-gold/20 px-3 py-1.5 text-sm font-medium text-zad-gold transition-colors hover:bg-zad-gold/30"
                >
                  {t.save}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Long-press hint */}
        <p className="text-center text-[11px] text-text-muted/60">
          {language === 'ar' ? 'اضغط على الدائرة للعد' : 'Tap the circle to count'}
        </p>
      </motion.div>
    </div>
  );
}
