'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSettingsStore } from '@/store/settings-store';

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════

interface CalendarDay {
  gregorian: Date;
  gregorianDay: number;
  gregorianMonth: number;
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  dayOfWeek: number; // 0=Sun, 5=Fri, 6=Sat
  isCurrentMonth: boolean;
  isToday: boolean;
  isFriday: boolean;
  event?: { name: string; color: string };
}

interface HijriParts {
  day: number;
  month: number;
  year: number;
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════

const HIJRI_MONTHS_AR: Record<number, string> = {
  1: 'محرم',
  2: 'صفر',
  3: 'ربيع الأول',
  4: 'ربيع الآخر',
  5: 'جمادى الأولى',
  6: 'جمادى الآخرة',
  7: 'رجب',
  8: 'شعبان',
  9: 'رمضان',
  10: 'شوال',
  11: 'ذو القعدة',
  12: 'ذو الحجة',
};

const HIJRI_MONTHS_EN: Record<number, string> = {
  1: 'Muharram',
  2: 'Safar',
  3: "Rabi' al-Awwal",
  4: "Rabi' al-Thani",
  5: 'Jumada al-Ula',
  6: 'Jumada al-Thania',
  7: 'Rajab',
  8: "Sha'ban",
  9: 'Ramadan',
  10: 'Shawwal',
  11: "Dhu al-Qi'dah",
  12: "Dhu al-Hijjah",
};

const WEEK_DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const WEEK_DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ISLAMIC_EVENTS: Record<string, { name: string; color: string; nameEn: string }> = {
  '1-1': { name: 'رأس السنة الهجرية', color: 'zad-gold', nameEn: 'Islamic New Year' },
  '1-10': { name: 'يوم عاشوراء', color: 'zad-green', nameEn: 'Day of Ashura' },
  '3-12': { name: 'المولد النبوي', color: 'zad-gold', nameEn: 'Mawlid al-Nabi' },
  '7-27': { name: 'ليلة الإسراء والمعراج', color: 'zad-gold', nameEn: "Isra and Mi'raj Night" },
  '8-15': { name: 'ليلة النصف من شعبان', color: 'zad-green', nameEn: 'Mid-Sha\'ban Night' },
  '9-1': { name: 'بداية رمضان', color: 'zad-gold', nameEn: 'Start of Ramadan' },
  '9-27': { name: 'ليلة القدر (المحتملة)', color: 'zad-gold', nameEn: 'Night of Decree (Estimated)' },
  '10-1': { name: 'عيد الفطر', color: 'zad-gold', nameEn: 'Eid al-Fitr' },
  '10-2': { name: 'عيد الفطر - اليوم الثاني', color: 'zad-gold', nameEn: 'Eid al-Fitr - Day 2' },
  '10-3': { name: 'عيد الفطر - اليوم الثالث', color: 'zad-gold', nameEn: 'Eid al-Fitr - Day 3' },
  '12-8': { name: 'يوم عرفة', color: 'zad-green', nameEn: 'Day of Arafah' },
  '12-10': { name: 'عيد الأضحى', color: 'zad-gold', nameEn: 'Eid al-Adha' },
  '12-11': { name: 'عيد الأضحى - اليوم الثاني', color: 'zad-gold', nameEn: 'Eid al-Adha - Day 2' },
  '12-12': { name: 'عيد الأضحى - اليوم الثالث', color: 'zad-gold', nameEn: 'Eid al-Adha - Day 3' },
  '12-13': { name: 'أيام التشريق', color: 'zad-gold', nameEn: 'Days of Tashriq' },
};

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

/** Get Hijri date parts from a Gregorian Date using Intl API */
function getHijriParts(date: Date): HijriParts {
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(date);

  let day = 0;
  let month = 0;
  let year = 0;
  for (const part of parts) {
    if (part.type === 'day') day = parseInt(part.value, 10);
    if (part.type === 'month') month = parseInt(part.value, 10);
    if (part.type === 'year') year = parseInt(part.value, 10);
  }
  return { day, month, year };
}

/** Convert number to Arabic-Indic numerals */
function toArabicNumerals(n: number): string {
  return String(n).replace(/\d/g, (d) =>
    String.fromCharCode(0x0660 + parseInt(d, 10))
  );
}

/** Check if two dates are the same calendar day */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Get event for a given Hijri month-day key */
function getEvent(hijriMonth: number, hijriDay: number): { name: string; color: string; nameEn: string } | undefined {
  return ISLAMIC_EVENTS[`${hijriMonth}-${hijriDay}`];
}

// ═══════════════════════════════════════════════════════════════
//  SVG ICONS
// ═══════════════════════════════════════════════════════════════

function ChevronRightIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ChevronLeftIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function CalendarIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function TodayIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function EventDotIcon({ className = 'h-2.5 w-2.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={className}>
      <circle cx="5" cy="5" r="4" fill="currentColor" />
    </svg>
  );
}

function MoonIcon({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <path
        d="M24 4C13 4 4 13 4 24s9 20 20 20c2.5 0 4.8-.4 7-1.2C25.5 39 20.5 32 20.5 24S25.5 9 31 5.2C28.8 4.4 26.5 4 24 4z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M38 16l1.5 4.5H44l-3.8 2.8 1.5 4.5-3.7-2.8-3.7 2.8 1.5-4.5L32 20.5h4.5z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function HijriCalendar() {
  const language = useSettingsStore((s) => s.language);
  const isArabic = language === 'ar';

  // View date tracks which Hijri month to display (stored as Gregorian reference)
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1); // 1=forward, -1=backward for animation

  // ── Build calendar grid ──
  const { calendarDays, hijriMonthInfo, monthEvents } = useMemo(() => {
    const hijri = getHijriParts(viewDate);
    const monthName = isArabic ? HIJRI_MONTHS_AR[hijri.month] : HIJRI_MONTHS_EN[hijri.month];
    const yearDisplay = isArabic ? toArabicNumerals(hijri.year) : String(hijri.year);

    // Find first day of this Hijri month (scan backward)
    const startDate = new Date(viewDate);
    for (let i = 0; i < 35; i++) {
      const prev = new Date(startDate);
      prev.setDate(prev.getDate() - 1);
      const prevH = getHijriParts(prev);
      if (prevH.month !== hijri.month || prevH.year !== hijri.year) break;
      startDate.setDate(startDate.getDate() - 1);
    }

    // Find last day of this Hijri month (scan forward)
    const endDate = new Date(viewDate);
    for (let i = 0; i < 35; i++) {
      const next = new Date(endDate);
      next.setDate(next.getDate() + 1);
      const nextH = getHijriParts(next);
      if (nextH.month !== hijri.month || nextH.year !== hijri.year) break;
      endDate.setDate(endDate.getDate() + 1);
    }

    // Extend grid to full weeks (Sun-Sat)
    const gridStart = new Date(startDate);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay()); // Go to Sunday

    const gridEnd = new Date(endDate);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay())); // Go to Saturday

    // Build days array
    const days: CalendarDay[] = [];
    const today = new Date();
    const current = new Date(gridStart);

    while (current <= gridEnd) {
      const h = getHijriParts(current);
      const isCurrentMonth = h.month === hijri.month && h.year === hijri.year;
      const ev = getEvent(h.month, h.day);
      days.push({
        gregorian: new Date(current),
        gregorianDay: current.getDate(),
        gregorianMonth: current.getMonth(),
        hijriDay: h.day,
        hijriMonth: h.month,
        hijriYear: h.year,
        dayOfWeek: current.getDay(),
        isCurrentMonth,
        isToday: isSameDay(current, today),
        isFriday: current.getDay() === 5,
        event: ev ? { name: ev.name, color: ev.color } : undefined,
      });
      current.setDate(current.getDate() + 1);
    }

    // Collect events for this month
    const events: { name: string; color: string; nameEn: string; day: number }[] = [];
    for (let d = 1; d <= 30; d++) {
      const ev = getEvent(hijri.month, d);
      if (ev) {
        events.push({ ...ev, day: d });
      }
    }

    return {
      calendarDays: days,
      hijriMonthInfo: {
        month: hijri.month,
        year: hijri.year,
        monthName,
        yearDisplay,
      },
      monthEvents: events,
    };
  }, [viewDate, isArabic]);

  // ── Navigation handlers ──
  const goToPrevMonth = useCallback(() => {
    setDirection(-1);
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 30);
      return next;
    });
    setSelectedDay(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setDirection(1);
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 30);
      return next;
    });
    setSelectedDay(null);
  }, []);

  const goToToday = useCallback(() => {
    setDirection(0 as 1);
    setViewDate(new Date());
    setSelectedDay(null);
  }, []);

  const handleDayPress = useCallback((day: CalendarDay) => {
    setSelectedDay(day);
  }, []);

  // Week day names
  const weekDays = isArabic ? WEEK_DAYS_AR : WEEK_DAYS_EN;

  // Check if we're viewing today's month
  const todayHijri = getHijriParts(new Date());
  const viewHijri = getHijriParts(viewDate);
  const isViewingCurrentMonth = todayHijri.month === viewHijri.month && todayHijri.year === viewHijri.year;

  return (
    <div className="custom-scrollbar flex flex-col gap-4 overflow-y-auto pb-6">
      {/* ── Header with Moon Icon ── */}
      <div className="flex flex-col items-center gap-3 px-4 pt-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zad-gold/10">
          <MoonIcon className="h-10 w-10 text-zad-gold" />
        </div>
        <h2 className="gold-text arabic-display text-xl font-bold">
          {isArabic ? 'التقويم الهجري' : 'Hijri Calendar'}
        </h2>
      </div>

      {/* ── Month Navigation ── */}
      <div className="mx-4 flex items-center justify-between rounded-xl border border-zad-border bg-zad-surface/60 px-3 py-2.5">
        {/* Prev button */}
        <button
          onClick={goToPrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-zad-gold/10 hover:text-zad-gold active:scale-95"
          aria-label={isArabic ? 'الشهر السابق' : 'Previous month'}
        >
          {isArabic ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>

        {/* Month/Year display */}
        <button
          onClick={goToToday}
          className="flex flex-col items-center gap-0.5 transition-colors hover:text-zad-gold"
        >
          <span className="arabic-display text-base font-bold text-text-primary">
            {hijriMonthInfo.monthName}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            {hijriMonthInfo.yearDisplay} {isArabic ? 'هـ' : 'AH'}
            {!isViewingCurrentMonth && (
              <TodayIcon className="h-3 w-3 text-zad-gold/70" />
            )}
          </span>
        </button>

        {/* Next button */}
        <button
          onClick={goToNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-zad-gold/10 hover:text-zad-gold active:scale-95"
          aria-label={isArabic ? 'الشهر التالي' : 'Next month'}
        >
          {isArabic ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </div>

      {/* ── Calendar Grid ── */}
      <div className="mx-4 overflow-hidden rounded-xl border border-zad-border bg-zad-surface/40">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-zad-border bg-zad-surface/80">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`flex items-center justify-center py-2 text-[11px] font-medium ${
                i === 5 ? 'text-zad-green' : 'text-text-muted'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div
          className="grid grid-cols-7"
          style={{
            animation: `fadeSlide${direction === 1 ? 'Left' : 'Right'} 0.2s ease-out`,
          }}
        >
          {calendarDays.map((day, i) => (
            <DayCell
              key={`${day.gregorian.getTime()}`}
              day={day}
              isArabic={isArabic}
              isSelected={selectedDay ? isSameDay(selectedDay.gregorian, day.gregorian) : false}
              onPress={() => handleDayPress(day)}
            />
          ))}
        </div>
      </div>

      {/* ── Selected Day Event Detail ── */}
      {selectedDay && selectedDay.event && (
        <div className="mx-4 overflow-hidden rounded-xl border border-zad-border bg-zad-surface/60">
          <div className="flex items-start gap-3 p-4">
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                selectedDay.event.color === 'zad-gold' ? 'bg-zad-gold/10' : 'bg-zad-green/10'
              }`}
            >
              <CalendarIcon
                className={`h-5 w-5 ${
                  selectedDay.event.color === 'zad-gold' ? 'text-zad-gold' : 'text-zad-green'
                }`}
              />
            </div>
            <div className="flex-1">
              <p
                className={`arabic-display text-sm font-bold ${
                  selectedDay.event.color === 'zad-gold' ? 'text-zad-gold' : 'text-zad-green'
                }`}
              >
                {isArabic ? selectedDay.event.name : (getEvent(selectedDay.hijriMonth, selectedDay.hijriDay)?.nameEn ?? selectedDay.event.name)}
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {isArabic ? toArabicNumerals(selectedDay.hijriDay) : selectedDay.hijriDay}{' '}
                {isArabic ? HIJRI_MONTHS_AR[selectedDay.hijriMonth] : HIJRI_MONTHS_EN[selectedDay.hijriMonth]}{' '}
                {isArabic ? toArabicNumerals(selectedDay.hijriYear) : selectedDay.hijriYear} {isArabic ? 'هـ' : 'AH'}
                {' • '}
                {selectedDay.gregorianDay}/{selectedDay.gregorianMonth + 1}/{selectedDay.gregorian.getFullYear()}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="mt-0.5 text-text-muted transition-colors hover:text-text-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Events for this month ── */}
      {monthEvents.length > 0 && (
        <div className="mx-4">
          <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-text-secondary">
            <CalendarIcon className="h-4 w-4 text-zad-gold" />
            {isArabic ? 'مناسبات الشهر' : 'Events this month'}
          </h3>
          <div className="flex flex-col gap-2">
            {monthEvents.map((ev) => (
              <div
                key={ev.day}
                className="flex items-center gap-3 rounded-lg border border-zad-border/50 bg-zad-surface/30 px-3 py-2.5"
              >
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    ev.color === 'zad-gold' ? 'bg-zad-gold' : 'bg-zad-green'
                  }`}
                />
                <div className="flex-1">
                  <p className={`text-xs font-medium ${ev.color === 'zad-gold' ? 'text-zad-gold' : 'text-zad-green'}`}>
                    {isArabic ? ev.name : ev.nameEn}
                  </p>
                </div>
                <span className="text-[11px] text-text-muted">
                  {isArabic ? toArabicNumerals(ev.day) : ev.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CSS animations ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideCenter {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DAY CELL
// ═══════════════════════════════════════════════════════════════

function DayCell({
  day,
  isArabic,
  isSelected,
  onPress,
}: {
  day: CalendarDay;
  isArabic: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  const hasEvent = !!day.event;

  // Base cell styles
  let cellClasses = 'relative flex flex-col items-center justify-center py-2 px-1 min-h-[3.5rem] transition-all cursor-pointer border-b border-r border-zad-border/20';

  // Dim days outside current month
  if (!day.isCurrentMonth) {
    cellClasses += ' opacity-25';
  }

  // Today highlight
  if (day.isToday && !isSelected) {
    cellClasses += ' bg-zad-gold/[0.08] border-amber-500/30';
  }

  // Friday highlight
  if (day.isFriday && day.isCurrentMonth && !day.isToday && !isSelected) {
    cellClasses += ' bg-zad-green/[0.05]';
  }

  // Selected state
  if (isSelected) {
    cellClasses += ' bg-zad-gold/15 ring-1 ring-zad-gold/50';
  }

  // Hover for current month days
  if (day.isCurrentMonth) {
    cellClasses += ' hover:bg-zad-gold/[0.06]';
  }

  return (
    <button
      className={cellClasses}
      onClick={onPress}
      disabled={!day.isCurrentMonth}
      type="button"
    >
      {/* Gregorian date (small, top) */}
      <span className={`text-[9px] leading-none tabular-nums ${
        day.isToday ? 'text-zad-gold font-semibold' : 'text-text-muted'
      }`}>
        {day.gregorianDay}
      </span>

      {/* Hijri date (centered, larger) */}
      <span className={`arabic-display mt-1 text-sm leading-none ${
        day.isToday
          ? 'text-zad-gold font-bold'
          : day.isFriday && day.isCurrentMonth
            ? 'text-zad-green'
            : day.isCurrentMonth
              ? 'text-text-primary font-bold'
              : 'text-text-muted'
      }`}>
        {isArabic ? toArabicNumerals(day.hijriDay) : day.hijriDay}
      </span>

      {/* Event indicator dot */}
      {hasEvent && day.isCurrentMonth && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <EventDotIcon className={`h-1.5 w-1.5 ${
            day.event?.color === 'zad-gold' ? 'text-zad-gold' : 'text-zad-green'
          }`} />
        </span>
      )}

      {/* Today indicator ring */}
      {day.isToday && (
        <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zad-gold" />
      )}
    </button>
  );
}
