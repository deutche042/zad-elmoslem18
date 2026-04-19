import { create } from "zustand";
import type { AppTab, QuranView, QuranMode, MoreView } from "@/types";

interface AppStore {
  activeTab: AppTab;
  activeView: string;
  viewHistory: string[];
  quranView: QuranView;
  quranMode: QuranMode;
  moreView: MoreView;
  isAppReady: boolean;
  isSplashComplete: boolean;

  setActiveTab: (tab: AppTab) => void;
  navigate: (view: string) => void;
  goBack: () => void;
  setQuranView: (view: QuranView) => void;
  setQuranMode: (mode: QuranMode) => void;
  setMoreView: (view: MoreView) => void;
  setAppReady: (ready: boolean) => void;
  setSplashComplete: (complete: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeTab: "home",
  activeView: "home",
  viewHistory: [],
  quranView: { type: "list" },
  quranMode: "mushaf",
  moreView: "menu",
  isAppReady: false,
  isSplashComplete: false,

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      activeView: tab,
      viewHistory: [],
      quranView: tab === "quran" ? { type: "list" } : { type: "list" },
      moreView: tab === "more" ? "menu" : "menu",
    }),

  navigate: (view) =>
    set((state) => ({
      activeView: view,
      viewHistory: [...state.viewHistory.slice(-19), state.activeView],
    })),

  goBack: () =>
    set((state) => {
      const newHistory = [...state.viewHistory];
      const prevView = newHistory.pop() || state.activeTab;
      return { activeView: prevView, viewHistory: newHistory };
    }),

  setQuranView: (view) =>
    set({ quranView: view, activeView: "quran-" + view.type }),

  setQuranMode: (mode) => set({ quranMode: mode }),

  setMoreView: (view) => set({ moreView: view }),

  setAppReady: (ready) => set({ isAppReady: ready }),

  setSplashComplete: (complete) => set({ isSplashComplete: complete }),
}));
