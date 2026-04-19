import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CachedPageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface CachedSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface CachedPage {
  number: number;
  ayahs: CachedPageAyah[];
  surahStarts: CachedSurah[];
  timestamp: number;
}

const MAX_PAGES = 50;

interface QuranCacheStore {
  pages: Record<number, CachedPage>;
  surahs: CachedSurah[] | null;
  surahsTimestamp: number | null;

  setPages: (pages: CachedPage[]) => void;
  setPage: (page: CachedPage) => void;
  setSurahs: (surahs: CachedSurah[]) => void;
  getPage: (pageNumber: number) => CachedPage | null;
  hasPage: (pageNumber: number) => boolean;
  getCachedCount: () => number;
}

export const useQuranCache = create<QuranCacheStore>()(
  persist(
    (set, get) => ({
      pages: {},
      surahs: null,
      surahsTimestamp: null,

      setPages: (newPages) => {
        const pagesMap = { ...get().pages };
        for (const page of newPages) {
          pagesMap[page.number] = page;
        }
        const keys = Object.keys(pagesMap).map(Number).sort((a, b) => a - b);
        if (keys.length > MAX_PAGES) {
          const keysToRemove = keys.slice(0, keys.length - MAX_PAGES);
          for (const k of keysToRemove) {
            delete pagesMap[k];
          }
        }
        set({ pages: pagesMap });
      },

      setPage: (page) => {
        set((s) => {
          const newPages = { ...s.pages, [page.number]: page };
          const keys = Object.keys(newPages).map(Number).sort((a, b) => a - b);
          if (keys.length > MAX_PAGES) {
            const keysToRemove = keys.slice(0, keys.length - MAX_PAGES);
            for (const k of keysToRemove) {
              delete newPages[k];
            }
          }
          return { pages: newPages };
        });
      },

      setSurahs: (surahs) => {
        set({ surahs, surahsTimestamp: Date.now() });
      },

      getPage: (pageNumber) => {
        return get().pages[pageNumber] || null;
      },

      hasPage: (pageNumber) => {
        return pageNumber in get().pages;
      },

      getCachedCount: () => {
        return Object.keys(get().pages).length;
      },
    }),
    {
      name: "zad-muslim-quran-cache",
      partialize: (state) => ({
        pages: state.pages,
        surahs: state.surahs,
        surahsTimestamp: state.surahsTimestamp,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
