'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSettingsStore } from '@/store/settings-store';
import type { DailyGoal as DailyGoalType } from '@/types';

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateArabic(dateStr: string): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  const d = new Date(dateStr + 'T00:00:00');
  return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateEnglish(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getMotivationalMessage(pct: number, lang: 'ar' | 'en'): string {
  if (pct === 0) return lang === 'ar' ? 'ابدأ يومك مع الله' : 'Start your day with Allah';
  if (pct < 25) return lang === 'ar' ? 'أحسنت، واصل طريقك' : 'Well done, keep going';
  if (pct < 50) return lang === 'ar' ? 'ما شاء الله، واصل' : 'Mashallah, keep going';
  if (pct < 75) return lang === 'ar' ? 'ما شاء الله، نصف الطريق' : 'Mashallah, halfway there';
  if (pct < 100) return lang === 'ar' ? 'قريب من الإكمال' : 'Almost complete';
  return lang === 'ar' ? 'بارك الله فيك، أكملت أهدافك' : 'May Allah bless you, goals completed!';
}

function calculateCompletion(goal: DailyGoalType): number {
  let completed = 0;
  let total = 9;

  if (goal.quranPages >= 1) completed++;
  if (goal.adhkarMorning) completed++;
  if (goal.adhkarEvening) completed++;
  if (goal.adhkarSleep) completed++;
  if (goal.salawatCount >= 10) completed++;
  if (goal.qiyamAlLayl) completed++;
  if (goal.duhaPrayer) completed++;
  if (goal.fasting) completed++;
  if (goal.charity) completed++;

  return Math.round((completed / total) * 100);
}

// ═══════════════════════════════════════════════════════════════
//  SVG ICONS
// ═══════════════════════════════════════════════════════════════

function QuranIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SleepIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 8.5l1-1M17 6l-1 1M19 10l-1 1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

function RoseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MosqueIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 2C8.5 2 6 4.5 6 7v2H4v12h16V9h-2V7c0-2.5-2.5-5-6-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2c-1 0-2 1-2 2v2h4V4c0-1-1-2-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="15" r="2" />
    </svg>
  );
}

function SunriseIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M17 18a5 5 0 0 0-10 0" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="2" strokeLinecap="round" />
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" strokeLinecap="round" />
      <line x1="1" y1="18" x2="3" y2="18" strokeLinecap="round" />
      <line x1="21" y1="18" x2="23" y2="18" strokeLinecap="round" />
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22" strokeLinecap="round" />
      <path d="M8 18h8" strokeLinecap="round" />
    </svg>
  );
}

function PlateIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="1" x2="6" y2="4" strokeLinecap="round" />
      <line x1="10" y1="1" x2="10" y2="4" strokeLinecap="round" />
      <line x1="14" y1="1" x2="14" y2="4" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PROGRESS RING
// ═══════════════════════════════════════════════════════════════

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 44;
  const stroke = 5;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={normalizedRadius}
          fill="none"
          stroke="var(--color-zad-border)"
          strokeWidth={stroke}
          opacity="0.3"
        />
        <circle
          cx="48"
          cy="48"
          r={normalizedRadius}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A017" />
            <stop offset="50%" stopColor="#F5C842" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary">{percentage}%</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  GOAL CARD COMPONENTS
// ═══════════════════════════════════════════════════════════════

function CheckboxGoalCard({
  label,
  labelEn,
  completed,
  onToggle,
  icon,
  iconColor,
  delay,
}: {
  label: string;
  labelEn: string;
  completed: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  iconColor: string;
  delay: number;
}) {
  const language = useSettingsStore((s) => s.language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
        completed
          ? 'border-zad-green/30 bg-zad-green/[0.06]'
          : 'border-zad-border bg-zad-surface/50 hover:border-zad-gold/20'
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        completed ? 'bg-zad-green/15' : 'bg-zad-midnight/50'
      }`}>
        {completed ? (
          <CheckCircleIcon className="h-5 w-5 text-zad-green" />
        ) : (
          <div className={iconColor}>{icon}</div>
        )}
      </div>
      <div className="flex-1 text-right">
        <p className={`text-sm font-medium ${completed ? 'text-zad-green' : 'text-text-primary'}`}>
          {language === 'ar' ? label : labelEn}
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onToggle}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all ${
          completed
            ? 'border-zad-green/40 bg-zad-green'
            : 'border-zad-border bg-zad-midnight hover:border-zad-gold/40'
        }`}
      >
        {completed && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            className="h-4 w-4"
          >
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </motion.button>
    </motion.div>
  );
}

function CounterGoalCard({
  label,
  labelEn,
  count,
  onIncrement,
  onDecrement,
  icon,
  iconColor,
  target,
  delay,
}: {
  label: string;
  labelEn: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  icon: React.ReactNode;
  iconColor: string;
  target: number;
  delay: number;
}) {
  const language = useSettingsStore((s) => s.language);
  const completed = count >= target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
        completed
          ? 'border-zad-green/30 bg-zad-green/[0.06]'
          : 'border-zad-border bg-zad-surface/50 hover:border-zad-gold/20'
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        completed ? 'bg-zad-green/15' : 'bg-zad-midnight/50'
      }`}>
        {completed ? (
          <CheckCircleIcon className="h-5 w-5 text-zad-green" />
        ) : (
          <div className={iconColor}>{icon}</div>
        )}
      </div>
      <div className="flex-1 text-right">
        <p className={`text-sm font-medium ${completed ? 'text-zad-green' : 'text-text-primary'}`}>
          {language === 'ar' ? label : labelEn}
        </p>
        <p className="mt-0.5 text-[11px] text-text-muted">
          {language === 'ar' ? `الهدف: ${target}` : `Target: ${target}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={onDecrement}
          disabled={count <= 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zad-border bg-zad-midnight text-text-secondary transition-colors hover:border-zad-gold/40 hover:text-text-primary disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M5 12h14" strokeLinecap="round" />
          </svg>
        </motion.button>
        <motion.span
          key={count}
          initial={{ scale: 1.3, color: '#F5C842' }}
          animate={{ scale: 1, color: completed ? '#1A9B5F' : '#F7F3E9' }}
          transition={{ duration: 0.3 }}
          className="w-8 text-center text-lg font-bold tabular-nums"
        >
          {count}
        </motion.span>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={onIncrement}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zad-gold/30 bg-zad-gold/10 text-zad-gold transition-colors hover:bg-zad-gold/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN DAILY GOALS COMPONENT
// ═══════════════════════════════════════════════════════════════

const DEFAULT_GOAL: DailyGoalType = {
  id: '',
  date: '',
  quranPages: 0,
  adhkarMorning: false,
  adhkarEvening: false,
  adhkarSleep: false,
  salawatCount: 0,
  qiyamAlLayl: false,
  duhaPrayer: false,
  fasting: false,
  charity: false,
  notes: '',
  createdAt: '',
  updatedAt: '',
};

export function DailyGoals() {
  const language = useSettingsStore((s) => s.language);
  const queryClient = useQueryClient();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const todayStr = getTodayDateStr();

  // Query: fetch today's goals
  const { data: goalData, isLoading } = useQuery<DailyGoalType>({
    queryKey: ['dailyGoal', todayStr],
    queryFn: () => fetch(`/api/goals?date=${todayStr}`).then((r) => r.json()),
    staleTime: 30_000,
  });

  const goal = goalData || DEFAULT_GOAL;

  // Save goals to server
  const saveGoals = useCallback(
    (updatedGoal: Partial<DailyGoalType>) => {
      const merged = { ...goal, ...updatedGoal };
      fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      })
        .then((r) => r.json())
        .then(() => queryClient.invalidateQueries({ queryKey: ['dailyGoal', todayStr] }))
        .catch(() => { /* ignore */ });
    },
    [goal, todayStr, queryClient]
  );

  // Debounced save
  const debouncedSave = useCallback(
    (updates: Partial<DailyGoalType>) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        saveGoals(updates);
      }, 500);
    },
    [saveGoals]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Computed
  const completionPct = calculateCompletion(goal);
  const completedCount = Object.entries({
    quranPages: goal.quranPages >= 1,
    adhkarMorning: goal.adhkarMorning,
    adhkarEvening: goal.adhkarEvening,
    adhkarSleep: goal.adhkarSleep,
    salawatCount: goal.salawatCount >= 10,
    qiyamAlLayl: goal.qiyamAlLayl,
    duhaPrayer: goal.duhaPrayer,
    fasting: goal.fasting,
    charity: goal.charity,
  }).filter(([, v]) => v).length;

  const motivationalMsg = getMotivationalMessage(completionPct, language);

  // Notes ref for saving on blur
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [hasEditedNotes, setHasEditedNotes] = useState(false);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="animate-pulse rounded-2xl border border-zad-border bg-zad-surface p-6">
          <div className="mx-auto mb-4 h-28 w-28 rounded-full bg-zad-surface/50" />
          <div className="mx-auto h-4 w-32 rounded bg-zad-gold/20" />
          <div className="mx-auto mt-2 h-3 w-48 rounded bg-zad-surface/50" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-zad-border bg-zad-surface p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-zad-surface/50" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded bg-zad-surface/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4" dir="rtl">
      {/* ── Header with Progress Ring ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-zad-gold/20 bg-gradient-to-b from-zad-gold/10 via-zad-surface/80 to-zad-midnight p-6"
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-zad-gold/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center">
          {/* Title */}
          <h2 className="arabic-display gold-text mb-1 text-xl font-bold">
            {language === 'ar' ? 'أهدافي الروحية' : 'My Spiritual Goals'}
          </h2>

          {/* Date */}
          <p className="mb-4 text-xs text-text-secondary">
            {language === 'ar' ? formatDateArabic(todayStr) : formatDateEnglish(todayStr)}
          </p>

          {/* Progress Ring + Stats */}
          <div className="flex items-center gap-6">
            <ProgressRing percentage={completionPct} />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-text-primary">
                {completedCount} {language === 'ar' ? 'من' : 'of'} 9 {language === 'ar' ? 'مكتمل' : 'completed'}
              </p>
              <p className="text-xs text-text-muted">
                {completionPct}% {language === 'ar' ? 'إنجاز' : 'achieved'}
              </p>
            </div>
          </div>

          {/* Motivational message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={completionPct}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="mt-3 rounded-full bg-zad-gold/10 px-4 py-1.5 text-center text-xs font-medium text-zad-gold"
            >
              {motivationalMsg}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Goals List ── */}
      <div className="custom-scrollbar flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
        {/* Quran Pages Counter */}
        <CounterGoalCard
          label="قراءة القرآن"
          labelEn="Quran Reading"
          count={goal.quranPages}
          onIncrement={() => debouncedSave({ quranPages: goal.quranPages + 1 })}
          onDecrement={() => debouncedSave({ quranPages: Math.max(0, goal.quranPages - 1) })}
          icon={<QuranIcon />}
          iconColor="text-amber-400"
          target={1}
          delay={0.05}
        />

        {/* Morning Adhkar */}
        <CheckboxGoalCard
          label="أذكار الصباح"
          labelEn="Morning Adhkar"
          completed={goal.adhkarMorning}
          onToggle={() => debouncedSave({ adhkarMorning: !goal.adhkarMorning })}
          icon={<SunIcon />}
          iconColor="text-yellow-400"
          delay={0.1}
        />

        {/* Evening Adhkar */}
        <CheckboxGoalCard
          label="أذكار المساء"
          labelEn="Evening Adhkar"
          completed={goal.adhkarEvening}
          onToggle={() => debouncedSave({ adhkarEvening: !goal.adhkarEvening })}
          icon={<MoonIcon />}
          iconColor="text-indigo-400"
          delay={0.15}
        />

        {/* Sleep Adhkar */}
        <CheckboxGoalCard
          label="أذكار النوم"
          labelEn="Sleep Adhkar"
          completed={goal.adhkarSleep}
          onToggle={() => debouncedSave({ adhkarSleep: !goal.adhkarSleep })}
          icon={<SleepIcon />}
          iconColor="text-purple-400"
          delay={0.2}
        />

        {/* Salawat Counter */}
        <CounterGoalCard
          label="الصلاة على النبي ﷺ"
          labelEn="Salawat on the Prophet ﷺ"
          count={goal.salawatCount}
          onIncrement={() => debouncedSave({ salawatCount: goal.salawatCount + 1 })}
          onDecrement={() => debouncedSave({ salawatCount: Math.max(0, goal.salawatCount - 1) })}
          icon={<RoseIcon />}
          iconColor="text-rose-400"
          target={10}
          delay={0.25}
        />

        {/* Qiyam Al-Layl */}
        <CheckboxGoalCard
          label="قيام الليل"
          labelEn="Night Prayer"
          completed={goal.qiyamAlLayl}
          onToggle={() => debouncedSave({ qiyamAlLayl: !goal.qiyamAlLayl })}
          icon={<MosqueIcon />}
          iconColor="text-cyan-400"
          delay={0.3}
        />

        {/* Duha Prayer */}
        <CheckboxGoalCard
          label="صلاة الضحى"
          labelEn="Duha Prayer"
          completed={goal.duhaPrayer}
          onToggle={() => debouncedSave({ duhaPrayer: !goal.duhaPrayer })}
          icon={<SunriseIcon />}
          iconColor="text-orange-400"
          delay={0.35}
        />

        {/* Fasting */}
        <CheckboxGoalCard
          label="الصيام"
          labelEn="Fasting"
          completed={goal.fasting}
          onToggle={() => debouncedSave({ fasting: !goal.fasting })}
          icon={<PlateIcon />}
          iconColor="text-emerald-400"
          delay={0.4}
        />

        {/* Charity */}
        <CheckboxGoalCard
          label="الصدقة"
          labelEn="Charity"
          completed={goal.charity}
          onToggle={() => debouncedSave({ charity: !goal.charity })}
          icon={<HeartIcon />}
          iconColor="text-pink-400"
          delay={0.45}
        />
      </div>

      {/* ── Notes Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        className="rounded-2xl border border-zad-border bg-zad-surface/50 p-4"
      >
        <label className="mb-2 block text-xs font-medium text-text-muted">
          {language === 'ar' ? 'ملاحظاتي' : 'My Notes'}
        </label>
        <textarea
          ref={notesRef}
          defaultValue={goal.notes}
          onChange={() => setHasEditedNotes(true)}
          onBlur={() => {
            if (hasEditedNotes && notesRef.current) {
              debouncedSave({ notes: notesRef.current.value });
              setHasEditedNotes(false);
            }
          }}
          rows={3}
          placeholder={language === 'ar' ? 'اكتب ملاحظاتك هنا...' : 'Write your notes here...'}
          className="w-full resize-none rounded-xl border border-zad-border bg-zad-midnight px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-zad-gold/40 focus:outline-none"
          dir="rtl"
        />
      </motion.div>
    </div>
  );
}
