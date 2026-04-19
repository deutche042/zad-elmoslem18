import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SalawatStore {
  count: number;
  target: number;
  todayCount: number;
  todayDate: string;
  totalSessions: number;
  streak: number;

  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setTarget: (target: number) => void;
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

export const useSalawatStore = create<SalawatStore>()(
  persist(
    (set, get) => ({
      count: 0,
      target: 100,
      todayCount: 0,
      todayDate: getTodayString(),
      totalSessions: 0,
      streak: 0,

      increment: () =>
        set((state) => {
          const today = getTodayString();
          const yesterdayStr = getYesterdayString();

          if (state.todayDate !== today) {
            const newStreak = state.todayDate === yesterdayStr ? state.streak + 1 : 1;

            return {
              count: 1,
              todayCount: 1,
              todayDate: today,
              totalSessions: state.totalSessions + 1,
              streak: newStreak,
            };
          } else {
            return {
              count: state.count + 1,
              todayCount: state.todayCount + 1,
              todayDate: today,
            };
          }
        }),

      decrement: () => {
        const { count, todayCount } = get();
        if (count > 0) {
          set({ count: count - 1, todayCount: Math.max(0, todayCount - 1) });
        }
      },

      reset: () => {
        set({ count: 0, todayCount: 0, todayDate: getTodayString() });
      },

      setTarget: (target: number) => {
        set({ target: Math.max(1, Math.min(10000, target)) });
      },
    }),
    {
      name: "zad-muslim-salawat",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const today = getTodayString();
          const yesterdayStr = getYesterdayString();

          if (state.todayDate !== today) {
            if (state.todayDate !== yesterdayStr && state.streak > 0) {
              state.streak = 0;
            }
            state.count = 0;
            state.todayCount = 0;
            state.todayDate = today;
          }
        }
        return state;
      },
    }
  )
);
