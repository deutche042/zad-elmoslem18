'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Globe,
  Moon,
  Sun,
  Compass,
  Scale,
  Headphones,
  Type,
  ChevronDown,
  ChevronUp,
  Info,
  RotateCcw,
  Bell,
  Eye,
  Volume2,
  BellRing,
} from 'lucide-react';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS, RECITERS, PRAYER_METHODS, MADHAB_OPTIONS, ADHAN_SOUNDS, PRAYER_REMINDER_INTERVALS, SALAWAT_INTERVALS } from '@/lib/constants';
import { playAdhanTest } from '@/hooks/useAdhanPlayer';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';

// ─── Animation Variants ────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};

// ─── Sub-components ────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  lang,
}: {
  icon: React.ReactNode;
  title: string;
  lang: 'ar' | 'en';
}) {
  return (
    <div className={`flex items-center gap-2 mb-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
      <span className="text-zad-gold">{icon}</span>
      <h3 className={`text-lg font-semibold gold-text arabic-display ${lang === 'ar' ? 'text-right' : ''}`}>
        {title}
      </h3>
    </div>
  );
}

function SettingCard({
  children,
  index,
  lang,
}: {
  children: React.ReactNode;
  index: number;
  lang: 'ar' | 'en';
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={`border border-zad-border bg-zad-surface/50 rounded-xl px-4 py-3 flex items-center justify-between gap-3 ${
        lang === 'ar' ? 'flex-row-reverse' : ''
      }`}
    >
      {children}
    </motion.div>
  );
}

// ─── Dropdown Component ────────────────────────────────────────────────

function Dropdown({
  label,
  value,
  options,
  lang,
  onSelect,
}: {
  label: string;
  value: string | number;
  options: { value: string | number; name: string; nameAr: string }[];
  lang: 'ar' | 'en';
  onSelect: (value: string | number) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedName = useMemo(() => {
    const opt = options.find((o) => o.value === value);
    return opt ? (lang === 'ar' ? opt.nameAr : opt.name) : '';
  }, [value, options, lang]);

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors min-w-[140px] ${
          lang === 'ar' ? 'flex-row-reverse' : ''
        }`}
      >
        <span className="truncate max-w-[160px]">{selectedName || label}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 shrink-0 text-zad-gold" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0 text-zad-gold" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute z-50 top-full mt-2 bg-zad-navy border border-zad-border rounded-xl shadow-2xl py-1 min-w-[240px] max-h-[260px] overflow-y-auto custom-scrollbar ${
              lang === 'ar' ? 'left-0' : 'right-0'
            }`}
          >
            {options.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-right px-4 py-2.5 text-sm transition-colors hover:bg-zad-surface/80 ${
                  opt.value === value
                    ? 'text-zad-gold font-semibold bg-zad-surface/50'
                    : 'text-text-secondary'
                } ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              >
                {lang === 'ar' ? opt.nameAr : opt.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onToggle,
  activeLabel,
  inactiveLabel,
  dir,
}: {
  enabled: boolean;
  onToggle: () => void;
  activeLabel: string;
  inactiveLabel: string;
  dir?: 'rtl' | 'ltr';
}) {
  return (
    <button
      onClick={onToggle}
      className="relative flex items-center rounded-full bg-zad-border/60 px-1 py-1 gap-0"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`absolute w-[calc(50%-4px)] h-[calc(100%-8px)] rounded-full ${
          enabled ? 'bg-zad-gold/90' : 'bg-zad-green/80'
        }`}
        style={{ left: enabled ? '50%' : '4px' }}
      />
      <span
        className={`relative z-10 text-xs font-semibold px-3 py-1 transition-colors ${
          !enabled ? 'text-white' : 'text-text-muted'
        }`}
      >
        {inactiveLabel}
      </span>
      <span
        className={`relative z-10 text-xs font-semibold px-3 py-1 transition-colors ${
          enabled ? 'text-white' : 'text-text-muted'
        }`}
      >
        {activeLabel}
      </span>
    </button>
  );
}

// ─── Font Size Slider ──────────────────────────────────────────────────

function FontSizeSlider({
  value,
  onChange,
  min = 18,
  max = 48,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3 w-full max-w-[180px]">
      <span className="text-xs text-text-muted">A</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-zad-gold
          [&::-webkit-slider-runnable-track]:bg-zad-border [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-1.5
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zad-gold [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:shadow-lg"
      />
      <span className="text-sm text-text-muted font-medium">A</span>
      <span className="text-xs text-zad-gold font-mono min-w-[28px] text-center">{value}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export default function SettingsPage() {
  const { language, theme, prayerMethod, madhab, reciterId, quranFontSize, eyeComfort, salawatEnabled, salawatInterval, prayerReminderEnabled, prayerReminderMinutes, adhanEnabled, adhanSound, pushEnabled, updateSettings, resetSettings } =
    useSettingsStore();

  const push = usePushNotifications();
  const { nextPrayer } = usePrayerTimes();

  const t = TRANSLATIONS[language];

  // Notification permission status
  const [notifStatus, setNotifStatus] = useState<string>(() => {
    if (typeof Notification !== 'undefined') {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [notifMessage, setNotifMessage] = useState<string>('');
  const notifMsgTimer = useRef<NodeJS.Timeout>();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (notifMsgTimer.current) clearTimeout(notifMsgTimer.current);
    };
  }, []);

  // Auto-update push subscription when notification settings change
  useEffect(() => {
    if (push.subscribed) {
      push.updateSubscription();
    }
    // Always update SW cache so offline notifications use latest settings
    try {
      if ('caches' in window) {
        caches.open('zad-muslim-cache').then((cache) => {
          const settingsData = {
            adhanEnabled,
            reminderEnabled: prayerReminderEnabled,
            reminderMinutes: prayerReminderMinutes,
            salawatEnabled,
            salawatInterval,
            lastSalawatSent: '',
          };
          cache.put('/api/settings-cache', new Response(JSON.stringify(settingsData), {
            headers: { 'Content-Type': 'application/json' },
          }));
        });
      }
    } catch { /* caches not available */ }
  }, [push.subscribed, adhanEnabled, prayerReminderEnabled, prayerReminderMinutes, salawatEnabled, salawatInterval, push]);

  // Play Web Audio chime (C5 → E5 → G5)
  const playChime = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.5);
      });
    } catch {
      // Audio not available
    }
  }, []);

  // Show temporary notif message
  const showNotifMessage = useCallback((msg: string) => {
    setNotifMessage(msg);
    if (notifMsgTimer.current) clearTimeout(notifMsgTimer.current);
    notifMsgTimer.current = setTimeout(() => setNotifMessage(''), 4000);
  }, []);
  const isAr = language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const handleLanguageToggle = useCallback(() => {
    updateSettings({ language: isAr ? 'en' : 'ar' });
  }, [isAr, updateSettings]);

  const handleThemeToggle = useCallback(() => {
    updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' });
  }, [theme, updateSettings]);

  const handleReset = useCallback(() => {
    resetSettings();
  }, [resetSettings]);

  return (
    <div dir={dir} className="h-full flex flex-col">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          className={`flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors ${
            isAr ? 'flex-row-reverse' : ''
          }`}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className={`text-2xl font-bold gold-text arabic-display ${isAr ? 'text-right' : ''}`}>
          {t.settings}
        </h1>
      </motion.div>

      {/* ─── Scrollable Content ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 space-y-6 px-1">
        {/* ════════════ Language & Theme ════════════ */}
        <motion.div initial="hidden" animate="visible">
          <SectionHeader
            icon={<Globe className="w-5 h-5" />}
            title={isAr ? 'اللغة والمظهر' : 'Language & Theme'}
            lang={language}
          />
          <div className="space-y-2">
            {/* Language Toggle */}
            <SettingCard index={0} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><Globe className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium">{t.language}</span>
              </div>
              <ToggleSwitch
                enabled={isAr}
                onToggle={handleLanguageToggle}
                activeLabel="العربية 🇸🇦"
                inactiveLabel="English 🇬🇧"
              />
            </SettingCard>

            {/* Theme Toggle */}
            <SettingCard index={1} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold">{theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</span>
                <span className="text-sm text-text-primary font-medium">{t.theme}</span>
              </div>
              <ToggleSwitch
                enabled={theme === 'dark'}
                onToggle={handleThemeToggle}
                activeLabel={t.dark}
                inactiveLabel={t.light}
              />
            </SettingCard>

            {/* Eye Comfort Toggle */}
            <SettingCard index={2} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><Eye className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium">
                  {isAr ? '\u0631\u0627\u062D\u0629 \u0627\u0644\u0639\u064A\u0646' : 'Eye Comfort'}
                </span>
              </div>
              <ToggleSwitch
                enabled={eyeComfort}
                onToggle={() => updateSettings({ eyeComfort: !eyeComfort })}
                activeLabel={isAr ? '\u062A\u0634\u063A\u064A\u0644' : 'On'}
                inactiveLabel={isAr ? '\u0625\u064A\u0642\u0627\u0641' : 'Off'}
              />
            </SettingCard>
          </div>
        </motion.div>

        {/* ════════════ Notifications & Reminders ════════════ */}
        <motion.div initial="hidden" animate="visible">
          <SectionHeader
            icon={<BellRing className="w-5 h-5" />}
            title={isAr ? '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A' : 'Notifications & Reminders'}
            lang={language}
          />
          <div className="space-y-2">
            {/* Salawat Toggle */}
            <SettingCard index={3} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><Bell className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium">
                  {isAr ? '\u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u0635\u0644\u0648\u0627\u062A' : 'Salawat Reminder'}
                </span>
              </div>
              <ToggleSwitch
                enabled={salawatEnabled}
                onToggle={() => updateSettings({ salawatEnabled: !salawatEnabled })}
                activeLabel={isAr ? '\u062A\u0634\u063A\u064A\u0644' : 'On'}
                inactiveLabel={isAr ? '\u0625\u064A\u0642\u0627\u0641' : 'Off'}
              />
            </SettingCard>

            {/* Salawat Interval */}
            {salawatEnabled && (
              <SettingCard index={4} lang={language}>
                <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-zad-gold"><Bell className="w-4 h-4" /></span>
                  <span className="text-sm text-text-primary font-medium">
                    {isAr ? '\u0641\u062A\u0631\u0629 \u0627\u0644\u0635\u0644\u0648\u0627\u062A' : 'Salawat Interval'}
                  </span>
                </div>
                <Dropdown
                  label={isAr ? '\u0627\u0644\u0641\u062A\u0631\u0629' : 'Interval'}
                  value={salawatInterval}
                  options={SALAWAT_INTERVALS.map((s) => ({ value: s.value, name: s.nameEn, nameAr: s.nameAr }))}
                  lang={language}
                  onSelect={(v) => updateSettings({ salawatInterval: v as number })}
                />
              </SettingCard>
            )}

            {/* Prayer Reminder Toggle */}
            <SettingCard index={5} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><BellRing className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium">
                  {isAr ? '\u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u0635\u0644\u0627\u0629' : 'Prayer Reminder'}
                </span>
              </div>
              <ToggleSwitch
                enabled={prayerReminderEnabled}
                onToggle={async () => {
                  if (!prayerReminderEnabled) {
                    try {
                      if (typeof Notification !== 'undefined') {
                        const perm = await Notification.requestPermission();
                        setNotifStatus(perm);
                        if (perm === 'granted') {
                          new Notification(isAr ? '\u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u0635\u0644\u0627\u0629' : 'Prayer Reminder', {
                            body: isAr
                              ? '\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u0635\u0644\u0627\u0629 \u0628\u0646\u062C\u0627\u062D \u{1F634}'
                              : 'Prayer reminder enabled successfully! \u{1F634}',
                          });
                          playChime();
                          window.dispatchEvent(new CustomEvent('prayer-reminder'));
                          showNotifMessage(isAr ? '\u2705 \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062A\u0630\u0643\u064A\u0631' : '\u2705 Reminder enabled');
                        }
                      }
                    } catch {
                      // Notifications not available
                    }
                    updateSettings({ prayerReminderEnabled: true });
                  } else {
                    updateSettings({ prayerReminderEnabled: false });
                  }
                }}
                activeLabel={isAr ? '\u062A\u0634\u063A\u064A\u0644' : 'On'}
                inactiveLabel={isAr ? '\u0625\u064A\u0642\u0627\u0641' : 'Off'}
              />
            </SettingCard>

            {/* Prayer Reminder Minutes */}
            {prayerReminderEnabled && (
              <SettingCard index={6} lang={language}>
                <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-zad-gold"><BellRing className="w-4 h-4" /></span>
                  <span className="text-sm text-text-primary font-medium">
                    {isAr ? '\u0645\u062F\u0629 \u0627\u0644\u062A\u0630\u0643\u064A\u0631 \u0642\u0628\u0644 \u0627\u0644\u0635\u0644\u0627\u0629' : 'Reminder Before Prayer'}
                  </span>
                </div>
                <Dropdown
                  label={isAr ? '\u0627\u0644\u0645\u062F\u0629' : 'Minutes'}
                  value={prayerReminderMinutes}
                  options={PRAYER_REMINDER_INTERVALS.map((p) => ({ value: p.value, name: p.nameEn, nameAr: p.nameAr }))}
                  lang={language}
                  onSelect={(v) => updateSettings({ prayerReminderMinutes: v as number })}
                />
              </SettingCard>
            )}

            {/* Browser Notification Permission Status */}
            <motion.div
              custom={7}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="border border-zad-border bg-zad-surface/50 rounded-xl px-4 py-3 space-y-2"
            >
              <div className={`flex items-center justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-zad-gold"><Bell className="w-4 h-4" /></span>
                  <span className="text-sm text-text-primary font-medium">
                    {isAr ? '\u062D\u0627\u0644\u0629 \u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0635\u0641\u062D' : 'Browser Notifications'}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  notifStatus === 'granted'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : notifStatus === 'denied'
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}>
                  {notifStatus === 'granted'
                    ? (isAr ? '\u2705 \u0645\u0633\u0645\u0648\u062D' : '\u2705 Granted')
                    : notifStatus === 'denied'
                    ? (isAr ? '\u274C \u0645\u0631\u0641\u0648\u0636' : '\u274C Denied')
                    : notifStatus === 'unsupported'
                    ? (isAr ? '\u274C \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645' : '\u274C Unsupported')
                    : (isAr ? '\u23F3 \u0641\u064A \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631' : '\u23F3 Pending')
                  }
                </span>
              </div>
              {notifMessage && (
                <p className="text-xs text-zad-gold/80 text-center">{notifMessage}</p>
              )}
            </motion.div>

            {/* Test Prayer Reminder Button (standalone, not wrapped in SettingCard) */}
            <motion.div
              custom={8}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <button
                onClick={async () => {
                  try {
                    if (typeof Notification !== 'undefined') {
                      const perm = await Notification.requestPermission();
                      setNotifStatus(perm);
                      if (perm === 'granted') {
                        new Notification(
                          isAr ? '\u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u0635\u0644\u0627\u0629' : 'Prayer Reminder',
                          {
                            body: nextPrayer
                              ? (isAr
                                ? `\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629: ${nextPrayer.nameAr} \u2014 ${nextPrayer.time}`
                                : `Next prayer: ${nextPrayer.name} \u2014 ${nextPrayer.time}`)
                              : (isAr ? '\u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629' : 'Next prayer info'),
                          }
                        );
                        playChime();
                        window.dispatchEvent(new CustomEvent('prayer-reminder'));
                        showNotifMessage(isAr ? '\u{1F514} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0630\u0643\u064A\u0631' : '\u{1F514} Reminder sent');
                      }
                    }
                  } catch {
                    // Notifications not available
                  }
                }}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-zad-border text-sm font-medium text-zad-gold hover:bg-zad-gold/10 transition-all ${
                  isAr ? 'flex-row-reverse' : ''
                }`}
              >
                <span>{'\u{1F514}'}</span>
                {isAr ? '\u0627\u062E\u062A\u0628\u0627\u0631 \u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u0635\u0644\u0627\u0629' : 'Test Prayer Reminder'}
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* ════════════ Adhan Settings ════════════ */}
        <motion.div initial="hidden" animate="visible">
          <SectionHeader
            icon={<Volume2 className="w-5 h-5" />}
            title={isAr ? '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0630\u0627\u0646' : 'Adhan Settings'}
            lang={language}
          />
          <div className="space-y-2">
            {/* Adhan Toggle */}
            <SettingCard index={9} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><Volume2 className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium">
                  {isAr ? '\u0635\u0648\u062A \u0627\u0644\u0623\u0630\u0627\u0646' : 'Adhan Sound'}
                </span>
              </div>
              <ToggleSwitch
                enabled={adhanEnabled}
                onToggle={() => updateSettings({ adhanEnabled: !adhanEnabled })}
                activeLabel={isAr ? '\u062A\u0634\u063A\u064A\u0644' : 'On'}
                inactiveLabel={isAr ? '\u0625\u064A\u0642\u0627\u0641' : 'Off'}
              />
            </SettingCard>

            {/* Adhan Sound Selector */}
            {adhanEnabled && (
              <SettingCard index={10} lang={language}>
                <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-zad-gold"><Volume2 className="w-4 h-4" /></span>
                  <span className="text-sm text-text-primary font-medium">
                    {isAr ? '\u0646\u0648\u0639 \u0627\u0644\u0623\u0630\u0627\u0646' : 'Adhan Type'}
                  </span>
                </div>
                <Dropdown
                  label={isAr ? '\u0627\u0644\u0635\u0648\u062A' : 'Sound'}
                  value={adhanSound}
                  options={ADHAN_SOUNDS.map((a) => ({ value: a.value, name: a.nameEn, nameAr: a.nameAr }))}
                  lang={language}
                  onSelect={(v) => updateSettings({ adhanSound: v as string })}
                />
              </SettingCard>
            )}

            {/* Test Adhan Button */}
            {adhanEnabled && (
              <motion.div
                custom={11}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <button
                  onClick={() => {
                    playAdhanTest(nextPrayer?.nameAr || '\u0627\u0644\u0641\u062C\u0631');
                  }}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-zad-border text-sm font-medium text-zad-gold hover:bg-zad-gold/10 transition-all ${
                    isAr ? 'flex-row-reverse' : ''
                  }`}
                >
                  <span>{'\u{1F50A}'}</span>
                  {isAr ? '\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0623\u0630\u0627\u0646' : 'Test Adhan'}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ════════════ Push Notifications ════════════ */}
        <motion.div initial="hidden" animate="visible">
          <SectionHeader
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" /><path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            title={t.pushNotifications}
            lang={language}
          />
          <div className="space-y-2">
            {/* Push Status */}
            <motion.div
              custom={0}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="border border-zad-border bg-zad-surface/50 rounded-xl px-4 py-3 space-y-2"
            >
              <div className={`flex items-center justify-between gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="text-zad-gold"><Bell className="w-4 h-4" /></span>
                  <span className="text-sm text-text-primary font-medium">
                    {isAr ? 'حالة الإشعارات الفورية' : 'Push Notifications'}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  push.subscribed
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : push.supported
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {push.subscribed
                    ? (isAr ? 'مفعّل' : 'Active')
                    : push.supported
                    ? (isAr ? 'غير مفعّل' : 'Inactive')
                    : (isAr ? 'غير مدعوم' : 'Unsupported')
                  }
                </span>
              </div>
              {push.subscribed && (
                <p className="text-xs text-emerald-400/80 text-center">{t.pushSubscribed}</p>
              )}
              {!push.supported && (
                <p className="text-xs text-red-400/80 text-center">{t.pushNotSupported}</p>
              )}
            </motion.div>

            {/* Push Toggle */}
            <SettingCard index={1} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" /><path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span className="text-sm text-text-primary font-medium">{t.pushNotifications}</span>
              </div>
              <ToggleSwitch
                enabled={push.subscribed}
                onToggle={async () => {
                  if (push.subscribed) {
                    await push.unsubscribe();
                    updateSettings({ pushEnabled: false });
                  } else {
                    const ok = await push.subscribe();
                    if (ok) updateSettings({ pushEnabled: true });
                  }
                }}
                activeLabel={isAr ? 'تشغيل' : 'On'}
                inactiveLabel={isAr ? 'إيقاف' : 'Off'}
                dir={dir}
              />
            </SettingCard>

            {/* Push Info — explains what gets notified */}
            <motion.div
              custom={2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="border border-zad-border bg-zad-surface/50 rounded-xl px-4 py-3"
            >
              <p className={`text-xs text-text-muted text-center leading-relaxed ${isAr ? 'arabic-display' : ''}`}>
                {(t as Record<string, string>).pushDescription || ''}
              </p>
              <div className={`flex justify-center gap-3 mt-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zad-gold/10 text-zad-gold/70">
                  {isAr ? 'الأذان' : 'Adhan'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70">
                  {isAr ? 'تذكير الصلاة' : 'Prayer Reminder'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400/70">
                  {isAr ? 'الصلاة على النبي ﷺ' : 'Salawat'}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ════════════ Prayer Settings ════════════ */}
        <motion.div initial="hidden" animate="visible">
          <SectionHeader
            icon={<Compass className="w-5 h-5" />}
            title={t.prayer}
            lang={language}
          />
          <div className="space-y-2">
            {/* Prayer Method */}
            <SettingCard index={2} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><Compass className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium">{t.method}</span>
              </div>
              <Dropdown
                label={t.method}
                value={prayerMethod}
                options={PRAYER_METHODS.map((m) => ({ value: m.value, name: m.name, nameAr: m.nameAr }))}
                lang={language}
                onSelect={(v) => updateSettings({ prayerMethod: v as number })}
              />
            </SettingCard>

            {/* Madhab */}
            <SettingCard index={3} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><Scale className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium">{t.madhab}</span>
              </div>
              <Dropdown
                label={t.madhab}
                value={madhab}
                options={MADHAB_OPTIONS.map((m) => ({ value: m.value, name: m.name, nameAr: m.nameAr }))}
                lang={language}
                onSelect={(v) => updateSettings({ madhab: v as 0 | 1 })}
              />
            </SettingCard>
          </div>
        </motion.div>

        {/* ════════════ Quran Settings ════════════ */}
        <motion.div initial="hidden" animate="visible">
          <SectionHeader
            icon={<Headphones className="w-5 h-5" />}
            title={t.quran}
            lang={language}
          />
          <div className="space-y-2">
            {/* Reciter */}
            <SettingCard index={4} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><Headphones className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium">{t.reciter}</span>
              </div>
              <Dropdown
                label={t.selectReciter}
                value={reciterId}
                options={RECITERS.map((r) => ({
                  value: r.id,
                  name: `${r.name}${r.style ? ` (${r.style})` : ''}`,
                  nameAr: `${r.nameAr}${r.style ? ` (${r.style})` : ''}`,
                }))}
                lang={language}
                onSelect={(v) => updateSettings({ reciterId: v as string })}
              />
            </SettingCard>

            {/* Font Size */}
            <SettingCard index={5} lang={language}>
              <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="text-zad-gold"><Type className="w-4 h-4" /></span>
                <span className="text-sm text-text-primary font-medium whitespace-nowrap">{t.fontSize}</span>
              </div>
              <FontSizeSlider
                value={quranFontSize}
                onChange={(v) => updateSettings({ quranFontSize: v })}
              />
            </SettingCard>
          </div>
        </motion.div>

        {/* ════════════ About ════════════ */}
        <motion.div initial="hidden" animate="visible">
          <SectionHeader
            icon={<Info className="w-5 h-5" />}
            title={isAr ? 'حول التطبيق' : 'About'}
            lang={language}
          />
          <motion.div
            custom={6}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="border border-zad-border bg-zad-surface/50 rounded-xl p-5 space-y-3"
          >
            {/* App Name */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold gold-text arabic-display">زاد Muslim</h2>
              <p className="text-xs text-text-muted">v1.0.0</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-zad-border" />

            {/* Description */}
            <p className={`text-sm text-text-secondary leading-relaxed text-center ${isAr ? 'arabic-display' : ''}`}>
              {isAr
                ? 'تطبيق إسلامي شامل يشمل مواقيت الصلاة، القرآن الكريم، الأذكار، والمزيد من الميزات الروحانية اليومية.'
                : 'Islamic super-app with prayer times, Quran, azkar, and more daily spiritual features.'}
            </p>

            {/* Divider */}
            <div className="h-px bg-zad-border" />

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-zad-border text-sm text-text-secondary hover:text-red-400 hover:border-red-400/40 transition-all ${
                isAr ? 'flex-row-reverse' : ''
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {t.reset}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
