'use client';

import { memo, useCallback } from 'react';
import { Settings, ArrowRight, ArrowLeft, Moon } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import type { HijriDate } from '@/types';

interface HeaderProps {
  hijriDate?: HijriDate | null;
  showBack?: boolean;
  title?: string;
}

export const Header = memo(function Header({ hijriDate, showBack, title }: HeaderProps) {
  const { goBack } = useAppStore();
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const handleSettingsClick = useCallback(() => {
    useAppStore.getState().setActiveTab('more');
    useAppStore.getState().setMoreView('settings');
  }, []);

  return (
    <header className="relative overflow-hidden border-b border-zad-border bg-zad-navy/50 backdrop-blur-sm">
      {/* Subtle Islamic pattern background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex items-center justify-between px-4 py-3">
        {/* Right side: Back button or Logo */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={goBack}
              className="rounded-full p-2 transition-colors hover:bg-zad-surface"
              aria-label="Go back"
            >
              {isRtl ? (
                <ArrowRight size={20} className="text-text-secondary" aria-hidden="true" />
              ) : (
                <ArrowLeft size={20} className="text-text-secondary" aria-hidden="true" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Moon size={20} className="text-zad-gold moon-glow rounded-full" aria-hidden="true" />
              <span className="gold-text font-branding text-sm font-semibold tracking-wide">
                {t.appName}
              </span>
            </div>
          )}
        </div>

        {/* Center: Title or Greeting */}
        <div className="text-center">
          {title ? (
            <h1 className="text-sm font-medium text-text-primary">{title}</h1>
          ) : (
            <>
              <p className="text-sm text-text-secondary">{t.greeting}</p>
              {hijriDate && (
                <p className="arabic-display text-xs text-text-muted">
                  {hijriDate.weekday?.ar}، {hijriDate.day} {hijriDate.monthAr} {hijriDate.year}
                </p>
              )}
            </>
          )}
        </div>

        {/* Left side: Settings */}
        <button
          onClick={handleSettingsClick}
          className="rounded-full p-2 transition-colors hover:bg-zad-surface"
          aria-label={t.settings}
        >
          <Settings size={20} className="text-text-secondary" />
        </button>
      </div>
    </header>
  );
});
