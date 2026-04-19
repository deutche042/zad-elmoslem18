'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAMES_OF_ALLAH } from '@/lib/names-of-allah';
import type { NameOfAllah } from '@/lib/names-of-allah';

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-zad-gold"
    >
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function NamesOfAllah() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);

  const filteredNames = useMemo(() => {
    if (!searchQuery.trim()) return NAMES_OF_ALLAH;
    const query = searchQuery.toLowerCase().trim();
    return NAMES_OF_ALLAH.filter(
      (name) =>
        name.arabic.includes(query) ||
        name.transliteration.toLowerCase().includes(query) ||
        name.meaningEn.toLowerCase().includes(query) ||
        name.meaningAr.includes(query) ||
        String(name.number) === query
    );
  }, [searchQuery]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-zad-gold/10 flex items-center justify-center flex-shrink-0">
            <StarIcon />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary leading-tight">
              أسماء الله الحسنى
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              The Beautiful Names of Allah
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن اسم..."
            className="w-full h-10 pr-10 pl-10 bg-zad-surface border border-zad-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-zad-gold/50 focus:ring-1 focus:ring-zad-gold/20 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-3 flex items-center hover:text-text-secondary transition-colors"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* Count Display */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {filteredNames.length} من {NAMES_OF_ALLAH.length} اسم
          </span>
          {searchQuery && filteredNames.length !== NAMES_OF_ALLAH.length && (
            <span className="text-xs text-zad-gold">
              {filteredNames.length} / {NAMES_OF_ALLAH.length}
            </span>
          )}
        </div>
      </div>

      {/* Names Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        <AnimatePresence mode="wait">
          {filteredNames.length > 0 ? (
            <motion.div
              key={searchQuery || 'all'}
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 sm:grid-cols-4 gap-3"
            >
              {filteredNames.map((name) => (
                <motion.button
                  key={name.number}
                  variants={item}
                  onClick={() => setSelectedName(name)}
                  className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-zad-surface/80 border border-zad-border/50 hover:border-zad-gold/30 hover:bg-zad-surface transition-all duration-200 active:scale-[0.97] cursor-pointer"
                >
                  {/* Subtle gold glow on hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-zad-gold/5 to-transparent pointer-events-none" />

                  {/* Number badge */}
                  <div className="absolute top-2 left-2 text-[10px] text-text-muted font-medium opacity-60">
                    {name.number}
                  </div>

                  {/* Arabic Name */}
                  <span className="arabic-display text-xl sm:text-2xl text-zad-gold leading-relaxed mb-1.5">
                    {name.arabic}
                  </span>

                  {/* Transliteration */}
                  <span className="text-[10px] sm:text-[11px] text-text-secondary font-medium leading-tight text-center">
                    {name.transliteration}
                  </span>

                  {/* Meaning */}
                  <span className="text-[9px] sm:text-[10px] text-text-muted mt-0.5 text-center leading-tight">
                    {name.meaningEn}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-zad-surface flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-text-muted"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="8" x2="14" y2="14" />
                  <line x1="14" y1="8" x2="8" y2="14" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm font-medium">
                لم يتم العثور على نتائج
              </p>
              <p className="text-text-muted text-xs mt-1">
                No names found for &ldquo;{searchQuery}&rdquo;
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name Detail Modal */}
      <AnimatePresence>
        {selectedName && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedName(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-x-4 bottom-4 top-auto sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm z-50"
            >
              <div className="bg-zad-surface border border-zad-border rounded-2xl p-6 relative overflow-hidden">
                {/* Decorative top gradient */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-zad-gold/0 via-zad-gold to-zad-gold/0" />

                {/* Close button */}
                <button
                  onClick={() => setSelectedName(null)}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full bg-zad-midnight/50 flex items-center justify-center hover:bg-zad-midnight transition-colors"
                >
                  <ClearIcon />
                </button>

                {/* Number */}
                <div className="text-center mb-2">
                  <span className="text-xs text-text-muted font-medium">
                    الاسم رقم {selectedName.number}
                  </span>
                </div>

                {/* Arabic Name */}
                <div className="text-center mb-4">
                  <h2 className="arabic-display text-4xl gold-text leading-relaxed">
                    {selectedName.arabic}
                  </h2>
                </div>

                {/* Transliteration */}
                <div className="text-center mb-5">
                  <span className="text-base text-zad-gold-light font-medium tracking-wide">
                    {selectedName.transliteration}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-l from-transparent via-zad-border to-transparent mb-5" />

                {/* Arabic Meaning */}
                <div className="bg-zad-midnight/50 rounded-xl p-4 mb-3">
                  <p className="text-sm text-text-arabic text-center leading-relaxed arabic-display">
                    {selectedName.meaningAr}
                  </p>
                </div>

                {/* English Meaning */}
                <div className="bg-zad-gold/5 rounded-xl p-4">
                  <p className="text-sm text-text-secondary text-center leading-relaxed">
                    {selectedName.meaningEn}
                  </p>
                </div>

                {/* Dhikr suggestion */}
                <div className="mt-5 text-center">
                  <p className="text-xs text-text-muted">
                    قل: يا {selectedName.arabic.replace(/^ال/, '')} ... (١٠٠ مرة)
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">
                    Say: Ya {selectedName.transliteration.replace(/^Al-/, '')} ... (100 times)
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
