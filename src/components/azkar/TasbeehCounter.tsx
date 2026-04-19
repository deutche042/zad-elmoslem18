'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS, TASBIEH_PHRASES } from '@/lib/constants';

interface TasbeehCounterProps {
  onBack: () => void;
}

export function TasbeehCounter({ onBack }: TasbeehCounterProps) {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [showPhrasePicker, setShowPhrasePicker] = useState(false);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const currentPhrase = TASBIEH_PHRASES[phraseIndex];
  const progress = (count / target) * 100;

  const tap = useCallback(() => {
    const newCount = count + 1;
    if (newCount >= target) {
      setRounds((r) => r + 1);
      setCount(0);
    } else {
      setCount(newCount);
    }
  }, [count, target]);

  const reset = () => {
    setCount(0);
    setRounds(0);
  };

  // SVG circular progress parameters
  const radius = 100;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center gap-6 p-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-zad-surface"
      >
        {isRtl ? <ArrowRight size={20} className="text-text-secondary" /> : <ArrowLeft size={20} className="text-text-secondary" />}
      </button>

      {/* Dhikr phrase */}
      <div className="text-center">
        <button
          onClick={() => setShowPhrasePicker(!showPhrasePicker)}
          className="text-text-muted hover:text-text-secondary"
        >
          <p className="gold-text arabic-display text-2xl font-bold">{currentPhrase.text}</p>
          <p className="mt-1 text-xs text-text-muted">{currentPhrase.meaning}</p>
        </button>
      </div>

      {/* Phrase picker dropdown */}
      <AnimatePresence>
        {showPhrasePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-xs overflow-hidden rounded-xl border border-zad-border bg-zad-surface"
          >
            <div className="max-h-40 overflow-y-auto p-2">
              {TASBIEH_PHRASES.map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => { setPhraseIndex(i); setShowPhrasePicker(false); setCount(0); setRounds(0); }}
                  className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                    i === phraseIndex ? 'bg-zad-gold-muted text-zad-gold' : 'text-text-secondary hover:bg-zad-midnight'
                  }`}
                >
                  {phrase.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular progress counter */}
      <div className="relative">
        <svg width="240" height="240" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="var(--color-zad-surface)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="url(#gold-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
          />
          <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4A017" />
              <stop offset="100%" stopColor="#F5C842" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={count}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-mono text-5xl font-bold tabular-nums text-text-primary"
          >
            {count}
          </motion.span>
          <span className="text-xs text-text-muted">
            / {target}
          </span>
        </div>
      </div>

      {/* Tap button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={tap}
        className="h-20 w-20 rounded-full border-2 border-zad-gold/40 bg-zad-gold/10 text-sm font-medium text-zad-gold shadow-lg shadow-zad-gold/10 transition-all hover:border-zad-gold/60 hover:bg-zad-gold/20 active:scale-95"
      >
        {t.tapToCount}
      </motion.button>

      {/* Target selector + rounds */}
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span>{t.rounds}: {rounds}</span>
        <span>|</span>
        <div className="flex items-center gap-1">
          <span>{t.target}:</span>
          {[33, 99, 100].map((targetVal) => (
            <button
              key={targetVal}
              onClick={() => { setTarget(targetVal); setCount(0); setRounds(0); }}
              className={`rounded-full px-2 py-0.5 transition-colors ${
                target === targetVal ? 'bg-zad-gold/20 text-zad-gold' : 'hover:bg-zad-surface'
              }`}
            >
              {targetVal}
            </button>
          ))}
        </div>
        <span>|</span>
        <button onClick={reset} className="text-text-muted hover:text-zad-gold">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
