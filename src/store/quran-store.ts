import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuranStore {
  currentSurah: number | null;
  currentAyah: number | null;
  isPlaying: boolean;
  fontSize: number;
  showTranslation: boolean;
  currentPage: number;
  lastReadSurah: number | null;
  lastReadAyah: number | null;
  lastReadPage: number | null;
  bookmarks: { surah: number; ayah: number; page?: number; timestamp: number }[];

  setSurah: (num: number) => void;
  setAyah: (num: number | null) => void;
  setPlaying: (playing: boolean) => void;
  setFontSize: (size: number) => void;
  toggleTranslation: () => void;
  setPage: (page: number) => void;
  setLastRead: (surah: number, ayah: number, page?: number) => void;
  toggleBookmark: (surah: number, ayah: number, page?: number) => void;
  isBookmarked: (surah: number, ayah: number) => boolean;
}

export const useQuranStore = create<QuranStore>()(
  persist(
    (set, get) => ({
      currentSurah: null,
      currentAyah: null,
      isPlaying: false,
      fontSize: 28,
      showTranslation: true,
      currentPage: 1,
      lastReadSurah: null,
      lastReadAyah: null,
      lastReadPage: null,
      bookmarks: [],

      setSurah: (num) => set({ currentSurah: num }),
      setAyah: (num) => set({ currentAyah: num }),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setFontSize: (size) => set({ fontSize: size }),
      toggleTranslation: () =>
        set((s) => ({ showTranslation: !s.showTranslation })),
      setPage: (page) => set({ currentPage: page }),
      setLastRead: (surah, ayah, page) =>
        set({ lastReadSurah: surah, lastReadAyah: ayah, lastReadPage: page ?? null }),
      toggleBookmark: (surah, ayah, page) =>
        set((state) => {
          const exists = state.bookmarks.find((b) => b.surah === surah && b.ayah === ayah);
          if (exists) {
            return { bookmarks: state.bookmarks.filter((b) => !(b.surah === surah && b.ayah === ayah)) };
          }
          const newBookmarks = [...state.bookmarks, { surah, ayah, page, timestamp: Date.now() }];
          if (newBookmarks.length > 100) {
            newBookmarks.shift();
          }
          return { bookmarks: newBookmarks };
        }),
      isBookmarked: (surah, ayah) => {
        return get().bookmarks.some((b) => b.surah === surah && b.ayah === ayah);
      },
    }),
    {
      name: "zad-muslim-quran",
    }
  )
);
