import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuranStore } from '@/store/quran-store';

interface PageNavigationProps {
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PageNavigation({ currentPage, onPrev, onNext }: PageNavigationProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-3 pb-4 sm:p-4 sm:pb-5">
      {/* Previous Page - RIGHT side (RTL) */}
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-900/30 bg-black/60 shadow-lg backdrop-blur-xl transition-all hover:bg-black/80 disabled:opacity-20 sm:h-12 sm:w-12"
        aria-label="Previous Page"
      >
        <ChevronRight size={20} className="text-amber-200" />
      </button>

      {/* Center: Progress */}
      <div className="flex items-center gap-1 rounded-full border border-amber-900/30 bg-black/60 px-3 py-2 shadow-lg backdrop-blur-xl">
        {Array.from({ length: 7 }).map((_, i) => {
          const pageMark = Math.round((currentPage / 604) * 7);
          return (
            <div
              key={i}
              className={`h-1 w-4 rounded-full transition-colors sm:w-5 ${
                i < pageMark ? 'bg-amber-400' : 'bg-amber-900/30'
              }`}
            />
          );
        })}
        <span className="mr-1 text-[10px] text-amber-200/50 sm:text-xs">
          {Math.round((currentPage / 604) * 100)}%
        </span>
      </div>

      {/* Next Page - LEFT side (RTL) */}
      <button
        onClick={onNext}
        disabled={currentPage >= 604}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-900/30 bg-black/60 shadow-lg backdrop-blur-xl transition-all hover:bg-black/80 disabled:opacity-20 sm:h-12 sm:w-12"
        aria-label="Next Page"
      >
        <ChevronLeft size={20} className="text-amber-200" />
      </button>
    </div>
  );
}
