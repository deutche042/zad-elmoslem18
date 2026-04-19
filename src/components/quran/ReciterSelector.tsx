'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Headphones } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { RECITERS } from '@/lib/constants';
import { useQuranStore } from '@/store/quran-store';
import { useQuranAudio } from './useQuranAudio';
import { TRANSLATIONS } from '@/lib/constants';

interface ReciterSelectorProps {
  onClose: () => void;
}

export function ReciterSelector({ onClose }: ReciterSelectorProps) {
  const reciterId = useSettingsStore((s) => s.reciterId);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const { stop } = useQuranAudio(reciterId);
  const [filter, setFilter] = useState<'all' | string>('all');

  const filteredReciters =
    filter === 'all'
      ? RECITERS
      : RECITERS.filter((r) => r.style === filter);

  const handleSelect = (id: string) => {
    stop();
    updateSettings({ reciterId: id });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-2xl border border-zad-border bg-zad-surface"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zad-border p-4">
          <div className="flex items-center gap-2">
            <Headphones size={20} className="text-zad-gold" />
            <h3 className="arabic-display text-lg font-bold text-text-primary">
              {t.selectReciter}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-zad-surface/80"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-zad-border p-3">
          {[
            { key: 'all' as const, label: language === 'ar' ? 'الكل' : 'All' },
            {
              key: 'مجود' as const,
              label: language === 'ar' ? 'مجود' : 'Mujawwad',
            },
            {
              key: 'مرتل' as const,
              label: language === 'ar' ? 'مرتل' : 'Murattal',
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                filter === tab.key
                  ? 'bg-zad-gold/20 text-zad-gold'
                  : 'text-text-muted hover:bg-zad-surface/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reciters list */}
        <div className="custom-scrollbar max-h-80 overflow-y-auto p-3">
          <div className="space-y-1">
            {filteredReciters.map((reciter) => {
              const isSelected = reciterId === reciter.id;
              return (
                <button
                  key={reciter.id}
                  onClick={() => handleSelect(reciter.id)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-right transition-all ${
                    isSelected
                      ? 'border border-zad-gold/30 bg-zad-gold-muted'
                      : 'border border-transparent hover:bg-zad-surface/60'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      isSelected
                        ? 'bg-zad-gold text-zad-midnight'
                        : 'bg-zad-surface text-text-muted'
                    }`}
                  >
                    {reciter.nameAr.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isSelected ? 'text-zad-gold' : 'text-text-primary'
                      }`}
                    >
                      {reciter.nameAr}
                    </p>
                    <p className="text-xs text-text-muted">{reciter.name}</p>
                  </div>

                  {/* Style badge + check */}
                  <div className="flex items-center gap-2">
                    {reciter.style && (
                      <span className="rounded-full bg-zad-teal/10 px-2 py-0.5 text-[10px] text-zad-teal">
                        {reciter.style}
                      </span>
                    )}
                    {isSelected && <Check size={16} className="text-zad-gold" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}
