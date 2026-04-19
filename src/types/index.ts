// ===== Prayer Types =====
export interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  timestamp: number;
  icon: string;
}

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Midnight?: string;
  [key: string]: string | undefined;
}

export interface NextPrayer {
  name: string;
  nameAr: string;
  time: string;
  remaining: number; // ms until prayer
}

export interface HijriDate {
  day: string;
  month: string;
  monthAr: string;
  monthEn: string;
  year: string;
  designation: { abbreviated: string; expanded: string };
  weekday: { en: string; ar: string };
}

// ===== Quran Types =====
export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
}

export interface Ayah {
  number: number; // global ayah number
  numberInSurah: number;
  text: string;
  translation?: string;
  audioUrl?: string;
}

export interface SurahFull {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  name: string;
  nameAr: string;
  folder?: string;
  style?: string;
}

// ===== Azkar Types =====
export interface Dhikr {
  id: number;
  category: string;
  count: number;
  description: string;
  reference: string;
  content: string;
}

// ===== Hadith Types =====
export interface Hadith {
  id: number;
  collection: string;
  collectionAr: string;
  bookNumber: string;
  hadithNumber: string;
  textAr: string;
  textEn?: string;
  grade?: string;
  narrator?: string;
}

// ===== Names of Allah =====
export interface NameOfAllah {
  name: string;
  transliteration: string;
  meaning: string;
  meaningAr?: string;
  number: number;
}

// ===== Radio Types =====
export interface RadioStation {
  id: number;
  name: string;
  nameAr?: string;
  url: string;
  country?: string;
}

// ===== Goals Types =====
export interface DailyGoal {
  id: string;
  date: string;
  quranPages: number;
  adhkarMorning: boolean;
  adhkarEvening: boolean;
  adhkarSleep: boolean;
  salawatCount: number;
  qiyamAlLayl: boolean;
  duhaPrayer: boolean;
  fasting: boolean;
  charity: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Settings Types =====
export interface UserSettings {
  language: "ar" | "en";
  theme: "dark" | "light";
  prayerMethod: number;
  madhab: 0 | 1;
  reciterId: string;
  quranFontSize: number;
  translationLang: string;
  locationLat: number;
  locationLng: number;
  locationName: string;
  notificationsEnabled: boolean;
  eyeComfort: boolean;
  salawatEnabled: boolean;
  salawatInterval: number; // minutes: 1, 5, 10, 15, 30
  prayerReminderEnabled: boolean;
  prayerReminderMinutes: number; // 5, 10, 15, 20, 30
  adhanEnabled: boolean; // play adhan at prayer time
  adhanSound: string; // default, algeria, makka, rashed
  pushEnabled: boolean; // push notifications when app is closed
}

// ===== Mushaf Page Types =====
export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
}

export interface PageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  hizbQuarter: number;
  sajda: boolean;
  surah?: SurahMeta;
}

export interface MushafPageData {
  number: number;
  ayahs: PageAyah[];
  surahStarts: SurahMeta[];
}

export type QuranMode = "mushaf" | "surah";

// ===== Salawat Types =====
export interface SalawatState {
  count: number;
  target: number;
  history: { date: string; count: number }[];
}

// ===== Navigation =====
export type AppTab = "home" | "quran" | "prayer" | "azkar" | "more";
export type MoreView = "menu" | "hadith" | "salawat" | "settings" | "names" | "qibla" | "radio" | "goals" | "calendar";

export interface QuranView {
  type: "list" | "reader" | "bookmarks" | "search";
  surahNumber?: number;
}
