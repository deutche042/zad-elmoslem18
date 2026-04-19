import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

interface SettingsStore extends UserSettings {
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
  setLocation: (lat: number, lng: number, name: string) => void;
  isLoaded: boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      locationLat: 30.0444,
      locationLng: 31.2357,
      locationName: "القاهرة",
      isLoaded: false,

      updateSettings: (partial) => set((s) => ({ ...s, ...partial })),
      resetSettings: () =>
        set({
          ...DEFAULT_SETTINGS,
          locationLat: 30.0444,
          locationLng: 31.2357,
          locationName: "القاهرة",
          isLoaded: false,
        }),
      setLocation: (lat, lng, name) =>
        set({ locationLat: lat, locationLng: lng, locationName: name }),
    }),
    {
      name: "zad-muslim-settings",
      partialize: (state) => ({
        fontSize: state.fontSize,
        theme: state.theme,
        language: state.language,
        prayerMethod: state.prayerMethod,
        madhab: state.madhab,
        locationLat: state.locationLat,
        locationLng: state.locationLng,
        locationName: state.locationName,
        eyeComfort: state.eyeComfort,
        adhanSound: state.adhanSound,
        adhanType: state.adhanType,
        salawatTarget: state.salawatTarget,
        salawatReminder: state.salawatReminder,
        salawatInterval: state.salawatInterval,
        notificationPermission: state.notificationPermission,
        pushEnabled: state.pushEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.locationLat = state.locationLat ?? 30.0444;
          state.locationLng = state.locationLng ?? 31.2357;
          state.locationName = state.locationName ?? "القاهرة";
          state.isLoaded = true;
        }
        return state;
      },
    }
  )
);
