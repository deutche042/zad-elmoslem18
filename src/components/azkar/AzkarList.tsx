'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dhikr } from '@/types';
import azkarData from '@/data/azkar.json';

interface AzkarListProps {
  category: string;
  onBack: () => void;
}

export function AzkarList({ category, onBack }: AzkarListProps) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const { data, isLoading } = useQuery<Dhikr[]>({
    queryKey: ['azkar'],
    queryFn: () => fetch('/api/azkar').then((r) => r.json()),
    staleTime: 7 * 24 * 60 * 60 * 1000,
  });

  // Filter by category
  const items = data?.filter((d) => d.category === category) || [];

  const toggleComplete = (id: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const total = items.length;
  const done = completed.size;

  if (isLoading) {
    return (
      <div className="custom-scrollbar space-y-4 p-4">
        <Skeleton className="mx-auto h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-24 w-full max-w-lg rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="custom-scrollbar flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-zad-border bg-zad-midnight/90 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="rounded-full p-2 hover:bg-zad-surface">
            {isRtl ? <ArrowRight size={20} className="text-text-secondary" /> : <ArrowLeft size={20} className="text-text-secondary" />}
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">{category}</p>
            <p className="text-xs text-text-muted">{done}/{total}</p>
          </div>
          <div className="w-8" />
        </div>
        {/* Progress bar */}
        <div className="mx-auto mt-2 h-1 max-w-xs overflow-hidden rounded-full bg-zad-surface">
          <motion.div
            className="h-full rounded-full bg-zad-gold"
            animate={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Azkar Cards */}
      <div className="mx-auto w-full max-w-lg space-y-3 p-4 pb-8">
        {items.map((item, i) => {
          const isCompleted = completed.has(item.id);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              onClick={() => toggleComplete(item.id)}
              className={`relative w-full rounded-xl border p-4 text-right transition-all ${
                isCompleted
                  ? 'border-zad-green/40 bg-zad-green-glow'
                  : 'border-zad-border bg-zad-surface/50 hover:border-zad-gold/30'
              }`}
            >
              {/* Dhikr text */}
              <p className={`arabic-display text-lg leading-relaxed ${isCompleted ? 'text-text-muted line-through' : 'text-text-arabic'}`}>
                {item.content}
              </p>

              {/* Count badge + reference */}
              <div className="mt-2 flex items-center justify-between">
                <span className="rounded-full bg-zad-gold/10 px-2 py-0.5 text-[10px] font-medium text-zad-gold">
                  {item.count}x
                </span>
                {item.reference && (
                  <span className="text-[10px] text-text-muted">{item.reference}</span>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">{item.description}</p>
              )}

              {/* Check icon */}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute left-3 top-3 rounded-full bg-zad-green/20 p-1"
                >
                  <Check size={14} className="text-zad-green" />
                </motion.div>
              )}
            </motion.button>
          );
        })}

        {items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-text-muted">{t.noResults}</p>
          </div>
        )}
      </div>
    </div>
  );
}
