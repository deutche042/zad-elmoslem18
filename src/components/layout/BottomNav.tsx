'use client';

import { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Clock, Sparkles, Menu } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import type { AppTab } from '@/types';

const tabs: { key: AppTab; icon: typeof Home; labelKey: keyof typeof TRANSLATIONS.ar }[] = [
  { key: 'home', icon: Home, labelKey: 'home' },
  { key: 'quran', icon: BookOpen, labelKey: 'quran' },
  { key: 'prayer', icon: Clock, labelKey: 'prayer' },
  { key: 'azkar', icon: Sparkles, labelKey: 'azkar' },
  { key: 'more', icon: Menu, labelKey: 'more' },
];

export const BottomNav = memo(function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];

  const handleTabClick = useCallback((key: AppTab) => {
    setActiveTab(key);
  }, [setActiveTab]);

  return (
    <nav className="sticky bottom-0 z-50 border-t border-zad-border bg-zad-navy/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-safe py-1">
        {tabs.map(({ key, icon: Icon, labelKey }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2 transition-colors"
              aria-label={t[labelKey]}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-1 h-0.5 w-8 rounded-full bg-zad-gold"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={isActive ? 'text-zad-gold' : 'text-text-muted'}
                aria-hidden="true"
              />
              <span
                className={`text-[10px] leading-none ${
                  isActive ? 'font-medium text-zad-gold' : 'text-text-muted'
                }`}
              >
                {t[labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
