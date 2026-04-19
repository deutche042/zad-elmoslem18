'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Copy,
  Check,
  Share2,
  Star,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';

// ── Types ──────────────────────────────────────────────────────────
interface DailyHadith {
  textAr: string;
  textEn: string;
  narrator: string;
  source: string;
  grade: string;
}

interface HadithCollection {
  id: number;
  nameAr: string;
  nameEn: string;
  hadithsCount: number;
  description: string;
}

interface HadithData {
  daily: DailyHadith;
  collections: HadithCollection[];
  totalHadiths: number;
}

// ── Animation variants ─────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: 'easeOut' as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

// ── Decorative Islamic border SVG ──────────────────────────────────
function IslamicBorderTop() {
  return (
    <div className="relative flex items-center justify-center py-1">
      <svg
        viewBox="0 0 400 24"
        className="h-6 w-full max-w-md text-zad-gold"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left connector */}
        <line
          x1="40"
          y1="12"
          x2="120"
          y2="12"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.5"
        />
        {/* Right connector */}
        <line
          x1="280"
          y1="12"
          x2="360"
          y2="12"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.5"
        />
        {/* Center 8-point star */}
        <path
          d="M200 2 L204 8 L210 8 L206 13 L208 20 L200 16 L192 20 L194 13 L190 8 L196 8 Z"
          fill="currentColor"
          opacity="0.8"
        />
        {/* Left diamond chain */}
        <path
          d="M130 12 L135 7 L140 12 L135 17 Z"
          fill="currentColor"
          opacity="0.4"
        />
        <path
          d="M110 12 L115 7 L120 12 L115 17 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M90 12 L95 7 L100 12 L95 17 Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M70 12 L75 7 L80 12 L75 17 Z"
          fill="currentColor"
          opacity="0.15"
        />
        {/* Right diamond chain */}
        <path
          d="M260 12 L265 7 L270 12 L265 17 Z"
          fill="currentColor"
          opacity="0.4"
        />
        <path
          d="M280 12 L285 7 L290 12 L285 17 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M300 12 L305 7 L310 12 L305 17 Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M320 12 L325 7 L330 12 L325 17 Z"
          fill="currentColor"
          opacity="0.15"
        />
        {/* Small dots at ends */}
        <circle cx="55" cy="12" r="1.5" fill="currentColor" opacity="0.2" />
        <circle cx="345" cy="12" r="1.5" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  );
}

function IslamicBorderBottom() {
  return (
    <div className="relative flex items-center justify-center py-1">
      <svg
        viewBox="0 0 400 20"
        className="h-5 w-full max-w-md text-zad-gold"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Continuous wave / geometric line */}
        <path
          d="M20 10 Q60 2, 100 10 Q140 18, 180 10 Q200 6, 200 10 Q200 6, 220 10 Q260 18, 300 10 Q340 2, 380 10"
          stroke="currentColor"
          strokeWidth="0.75"
          fill="none"
          opacity="0.4"
        />
        {/* Center ornament */}
        <circle cx="200" cy="10" r="3" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.6" />
        <circle cx="200" cy="10" r="1" fill="currentColor" opacity="0.8" />
      </svg>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────
function HadithLoadingSkeleton() {
  return (
    <div className="custom-scrollbar space-y-6 overflow-y-auto p-4">
      {/* Daily hadith skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-zad-border bg-zad-surface/50 p-6">
        {/* Pattern overlay skeleton */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="relative space-y-4">
          <Skeleton className="mx-auto h-4 w-32 rounded" />
          <div className="space-y-2 py-4">
            <Skeleton className="mx-auto h-6 w-full rounded" />
            <Skeleton className="mx-auto h-6 w-[90%] rounded" />
            <Skeleton className="mx-auto h-6 w-[75%] rounded" />
          </div>
          <div className="flex justify-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Collections grid skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export function HadithView() {
  const [copied, setCopied] = useState(false);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const { data, isLoading, isError, refetch } = useQuery<HadithData>({
    queryKey: ['hadith-data'],
    queryFn: () => fetch('/api/hadith').then((r) => r.json()),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours — matches API cache
  });

  const daily = data?.daily;
  const collections = data?.collections || [];

  // ── Share & Copy handlers ──────────────────────────────────────
  const buildShareText = () => {
    if (!daily) return '';
    const lines = [daily.textAr];
    if (daily.textEn) lines.push(daily.textEn);
    lines.push(`— ${daily.narrator}`);
    lines.push(`${t.source}: ${daily.source}`);
    lines.push(`${t.grade}: ${daily.grade}`);
    lines.push('\n📱 ' + (language === 'ar' ? 'تطبيق زاد مسلم' : 'Zad Muslim App'));
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopied(true);
      toast.success(language === 'ar' ? 'تم نسخ الحديث' : 'Hadith copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(language === 'ar' ? 'فشل النسخ' : 'Failed to copy');
    }
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.hadithToday,
          text,
        });
      } catch (err) {
        // User cancelled or error — fall through to clipboard
        if ((err as DOMException).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  // ── Error state ────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
        <BookOpen className="h-12 w-12 text-text-muted" />
        <p className="text-sm text-text-muted">{t.error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-zad-border text-text-secondary hover:bg-zad-surface"
        >
          {t.retry}
        </Button>
      </div>
    );
  }

  if (isLoading) return <HadithLoadingSkeleton />;
  if (!data) return null;

  return (
    <div className="custom-scrollbar space-y-6 overflow-y-auto px-4 pb-8 pt-2">
      {/* ────────────────────────────────────────────────────────────
          SECTION 1 — Daily Hadith Card
          ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={scaleIn}
      >
        <Card className="relative overflow-hidden rounded-2xl border border-zad-gold/25 bg-zad-surface/60 shadow-lg shadow-zad-gold/[0.03]">
          {/* Subtle Islamic pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ opacity: 0.03 }}
            aria-hidden="true"
          >
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="hadith-card-pattern"
                  x="0"
                  y="0"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M30 0 L34 12 L46 12 L36 20 L40 32 L30 24 L20 32 L24 20 L14 12 L26 12 Z"
                    fill="#D4A017"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hadith-card-pattern)" />
            </svg>
          </div>

          {/* Top decorative border */}
          <div className="relative">
            <IslamicBorderTop />
          </div>

          <CardContent className="relative px-5 pb-5 pt-2 sm:px-8">
            {/* Section title */}
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-zad-gold/70" />
              <h2 className="gold-text text-sm font-semibold tracking-wide">
                {t.hadithToday}
              </h2>
              <Sparkles size={14} className="text-zad-gold/70" />
            </div>

            {/* Arabic hadith text */}
            <div dir="rtl" className="mb-4 text-center">
              <p
                className="text-arabic arabic-display text-2xl leading-[2.2] font-medium sm:text-[1.75rem] lg:text-3xl"
                style={{ lineHeight: '2.4' }}
              >
                {daily?.textAr}
              </p>
            </div>

            {/* Decorative divider */}
            <div className="mx-auto my-3 flex items-center justify-center gap-3">
              <Separator className="w-12 bg-zad-gold/20" />
              <Star
                size={10}
                className="text-zad-gold/50 rotate-12"
                fill="currentColor"
              />
              <Separator className="w-12 bg-zad-gold/20" />
            </div>

            {/* English translation */}
            {language !== 'ar' && daily?.textEn && (
              <p className="mb-4 text-center text-sm leading-relaxed text-text-secondary italic sm:text-base">
                &ldquo;{daily.textEn}&rdquo;
              </p>
            )}

            {/* Metadata badges */}
            {daily && (
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                {/* Narrator */}
                <Badge
                  variant="outline"
                  className="border-zad-gold/20 bg-zad-gold/5 px-2.5 py-1 text-xs text-zad-gold"
                >
                  <span className="ml-1 text-[10px] text-text-muted">
                    {t.narrator}
                  </span>
                  <span dir="rtl" className="arabic-display text-xs">
                    {daily.narrator}
                  </span>
                </Badge>

                {/* Source */}
                <Badge
                  variant="outline"
                  className="border-zad-teal/20 bg-zad-teal/5 px-2.5 py-1 text-xs text-zad-teal"
                >
                  <span className="ml-1 text-[10px] text-text-muted">
                    {t.source}
                  </span>
                  <span dir="rtl" className="arabic-display text-xs">
                    {daily.source}
                  </span>
                </Badge>

                {/* Grade */}
                <Badge
                  variant="outline"
                  className="border-zad-green/20 bg-zad-green/5 px-2.5 py-1 text-xs text-zad-green"
                >
                  <span className="ml-1 text-[10px] text-text-muted">
                    {t.grade}
                  </span>
                  <span dir="rtl" className="arabic-display text-xs">
                    {daily.grade}
                  </span>
                </Badge>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-9 w-9 rounded-lg text-text-muted transition-all hover:border-zad-gold/30 hover:bg-zad-gold/10 hover:text-zad-gold"
                aria-label={language === 'ar' ? 'نسخ الحديث' : 'Copy hadith'}
              >
                {copied ? (
                  <Check size={16} className="text-zad-green" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="h-9 w-9 rounded-lg text-text-muted transition-all hover:border-zad-gold/30 hover:bg-zad-gold/10 hover:text-zad-gold"
                aria-label={language === 'ar' ? 'مشاركة الحديث' : 'Share hadith'}
              >
                <Share2 size={16} />
              </Button>
            </div>
          </CardContent>

          {/* Bottom decorative border */}
          <div className="relative">
            <IslamicBorderBottom />
          </div>
        </Card>
      </motion.div>

      {/* ────────────────────────────────────────────────────────────
          SECTION 2 — Hadith Collections Grid
          ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
      >
        {/* Section header */}
        <div className="mb-4 flex items-center gap-2 px-1">
          <BookOpen size={16} className="text-zad-gold" />
          <h3 className="text-sm font-semibold text-text-primary">
            {language === 'ar' ? 'كتب الحديث' : 'Hadith Collections'}
          </h3>
          <span className="ml-auto rounded-full bg-zad-gold/10 px-2 py-0.5 text-[10px] font-medium text-zad-gold">
            {collections.length} {language === 'ar' ? 'كتب' : 'books'}
          </span>
        </div>

        {/* Collections grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              custom={index}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <Card className="group cursor-pointer overflow-hidden rounded-xl border border-zad-border bg-zad-surface/40 transition-all duration-300 hover:border-zad-gold/30 hover:bg-zad-gold/[0.03] hover:shadow-md hover:shadow-zad-gold/[0.04]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Collection number icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zad-gold/10 transition-colors group-hover:bg-zad-gold/15">
                      <BookOpen
                        size={18}
                        className="text-zad-gold/70 transition-colors group-hover:text-zad-gold"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Collection names */}
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          dir="rtl"
                          className="arabic-display text-sm font-bold text-text-primary"
                        >
                          {collection.nameAr}
                        </h4>
                        <ChevronDown
                          size={14}
                          className="shrink-0 rotate-[-90deg] text-text-muted transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-text-secondary">
                        {collection.nameEn}
                      </p>

                      {/* Description */}
                      <p
                        dir="rtl"
                        className="mt-2 text-xs leading-relaxed text-text-muted"
                      >
                        {collection.description}
                      </p>

                      {/* Hadith count */}
                      <div className="mt-3 flex items-center gap-1.5">
                        <div className="h-px flex-1 bg-zad-border/50" />
                        <span className="text-[11px] tabular-nums font-medium text-zad-gold/70">
                          {collection.hadithsCount.toLocaleString()}{' '}
                          {language === 'ar' ? 'حديث' : 'hadiths'}
                        </span>
                        <div className="h-px flex-1 bg-zad-border/50" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
