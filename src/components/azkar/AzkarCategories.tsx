'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { AzkarList } from './AzkarList';
import { TasbeehCounter } from './TasbeehCounter';

/* ─── SVG Icon Components ─────────────────────────────── */
function MorningIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="24" r="14" fill="#F59E0B" opacity="0.15" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="32" cy="24" r="6" fill="#F59E0B" opacity="0.4" />
      <path d="M32 38v6M28 44h8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 52l12-10 12 10" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}

function EveningIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M40 12c-8 0-14 5-16 12 2 7 8 12 16 12s14-5 16-12c-2-7-8-12-16-12z" fill="#8B5CF6" opacity="0.2" stroke="#8B5CF6" strokeWidth="1.5" />
      <circle cx="38" cy="26" r="3" fill="#F5C842" opacity="0.6" />
      <circle cx="34" cy="20" r="1.5" fill="#F5C842" opacity="0.4" />
      <circle cx="42" cy="22" r="1" fill="#F5C842" opacity="0.3" />
      <path d="M22 48l10-8 10 8" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    </svg>
  );
}

function PrayerIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="18" y="18" width="28" height="28" rx="2" stroke="#1A9B5F" strokeWidth="1.5" opacity="0.6" />
      <path d="M18 18h28v8H18z" fill="#1A9B5F" opacity="0.1" />
      <path d="M18 18l5 8h18l5-8" stroke="#1A9B5F" strokeWidth="1.2" opacity="0.5" strokeLinejoin="round" />
      <path d="M28 26h8M30 30h4M29 34h6" stroke="#1A9B5F" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <circle cx="32" cy="12" r="3" fill="none" stroke="#1A9B5F" strokeWidth="1.2" opacity="0.4" />
      <path d="M32 9v-2M29 10l-2-1.5M35 10l2-1.5" stroke="#1A9B5F" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function SleepIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M28 28c-6 0-12 4-14 10s0 12 2 14c2-2 8-4 14-4s10 1 14 2c-2-6 0-12-2-18s-10-6-14-4z" fill="#7C3AED" opacity="0.15" stroke="#7C3AED" strokeWidth="1.5" />
      <circle cx="20" cy="18" r="1" fill="#F5C842" opacity="0.5" />
      <circle cx="14" cy="24" r="0.8" fill="#F5C842" opacity="0.4" />
      <circle cx="24" cy="12" r="0.6" fill="#F5C842" opacity="0.3" />
      <path d="M18 44c0-4 6-6 10-4s4 6 8 4-2-2-10-2-14 0" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <text x="32" y="55" textAnchor="middle" fill="#7C3AED" fontSize="10" opacity="0.4" fontFamily="sans-serif">z</text>
      <text x="40" y="52" textAnchor="middle" fill="#7C3AED" fontSize="7" opacity="0.3" fontFamily="sans-serif">z</text>
      <text x="24" y="52" textAnchor="middle" fill="#7C3AED" fontSize="8" opacity="0.25" fontFamily="sans-serif">z</text>
    </svg>
  );
}

function FoodIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <ellipse cx="32" cy="32" rx="18" ry="6" stroke="#0EA5A0" strokeWidth="1.5" opacity="0.5" />
      <path d="M14 32c0-10 8-18 18-18s18 8 18 18" stroke="#0EA5A0" strokeWidth="1.5" opacity="0.6" />
      <path d="M18 22h28" stroke="#0EA5A0" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <path d="M20 26h24" stroke="#0EA5A0" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <circle cx="28" cy="16" r="1.5" fill="#0EA5A0" opacity="0.3" />
      <circle cx="36" cy="14" r="1" fill="#0EA5A0" opacity="0.25" />
      <path d="M24 46c0 0 4 4 8 4s8-4 8-4" stroke="#0EA5A0" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function TravelIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M8 40h48v4H8z" stroke="#06B6D4" strokeWidth="1.5" opacity="0.4" />
      <path d="M16 40V20l16-10 16 10v20" stroke="#06B6D4" strokeWidth="1.5" opacity="0.6" strokeLinejoin="round" />
      <path d="M28 30h8v10h-8z" stroke="#06B6D4" strokeWidth="1.2" opacity="0.5" />
      <path d="M10 44v8c0 4 8 8 22 8s22-4 22-8v-8" stroke="#06B6D4" strokeWidth="1" opacity="0.3" />
      <circle cx="32" cy="10" r="3" fill="none" stroke="#06B6D4" strokeWidth="1" opacity="0.3" />
      <path d="M32 7v-2M28 8l-1-1.5M36 8l1-1.5" stroke="#06B6D4" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/* ─── Category Data ──────────────────────────────────── */
interface Category {
  key: string;
  labelAr: string;
  labelEn: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  borderColor: string;
  iconBg: string;
}

const CATEGORIES: Category[] = [
  { key: 'أذكار الصباح', labelAr: 'أذكار الصباح', labelEn: 'Morning Adhkar', Icon: MorningIcon, color: 'bg-amber-950/40', borderColor: 'border-amber-700/20 hover:border-amber-600/40', iconBg: 'bg-amber-500/10' },
  { key: 'أذكار المساء', labelAr: 'أذكار المساء', labelEn: 'Evening Adhkar', Icon: EveningIcon, color: 'bg-purple-950/40', borderColor: 'border-purple-700/20 hover:border-purple-600/40', iconBg: 'bg-purple-500/10' },
  { key: 'أذكار بعد الصلاة', labelAr: 'أذكار بعد الصلاة', labelEn: 'After Prayer', Icon: PrayerIcon, color: 'bg-emerald-950/40', borderColor: 'border-emerald-700/20 hover:border-emerald-600/40', iconBg: 'bg-emerald-500/10' },
  { key: 'أذكار النوم', labelAr: 'أذكار النوم', labelEn: 'Sleep Adhkar', Icon: SleepIcon, color: 'bg-violet-950/40', borderColor: 'border-violet-700/20 hover:border-violet-600/40', iconBg: 'bg-violet-500/10' },
  { key: 'أذكار الأكل', labelAr: 'أذكار الأكل', labelEn: 'Eating Adhkar', Icon: FoodIcon, color: 'bg-teal-950/40', borderColor: 'border-teal-700/20 hover:border-teal-600/40', iconBg: 'bg-teal-500/10' },
  { key: 'أذكار السفر', labelAr: 'أذكار السفر', labelEn: 'Travel Adhkar', Icon: TravelIcon, color: 'bg-cyan-950/40', borderColor: 'border-cyan-700/20 hover:border-cyan-600/40', iconBg: 'bg-cyan-500/10' },
];

/* ─── Main Component ─────────────────────────────────── */
export function AzkarCategories() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showTasbeeh, setShowTasbeeh] = useState(false);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];

  if (showTasbeeh) {
    return <TasbeehCounter onBack={() => setShowTasbeeh(false)} />;
  }

  if (selectedCategory) {
    return <AzkarList category={selectedCategory} onBack={() => setSelectedCategory(null)} />;
  }

  return (
    <div className="custom-scrollbar space-y-4 overflow-y-auto p-4">
      {/* Tasbeeh Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowTasbeeh(true)}
        className="w-full rounded-xl border border-zad-gold/30 bg-gradient-to-l from-zad-gold/10 to-zad-surface p-4 text-center transition-all hover:border-zad-gold/50"
      >
        <p className="gold-text arabic-display text-lg font-bold">{t.tasbeeh}</p>
        <p className="mt-1 text-xs text-text-muted">{t.tapToCount}</p>
      </motion.button>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedCategory(cat.key)}
            className={`rounded-xl border ${cat.borderColor} ${cat.color} p-4 text-center transition-all`}
          >
            <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${cat.iconBg}`}>
              <cat.Icon className="h-10 w-10" />
            </div>
            <p className="text-sm font-medium text-text-primary">
              {language === 'ar' ? cat.labelAr : cat.labelEn}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
