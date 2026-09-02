import { AppSettings, Language, Theme } from "@/types";

const STORAGE_KEY = "uniorbi_settings";

const defaultSettings: AppSettings = {
  theme: "light",
  language: "en",
  activeFont: "space-grotesk",
  adminUnlocked: false,
  activeLauncher: "fortress",
  autoSave: true,
  animations: true,
  lastSaved: new Date().toISOString(),
};

export function loadSettings(): AppSettings {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return { ...defaultSettings, ...JSON.parse(stored), adminUnlocked: false };
  }
  return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  const toSave = { ...settings, adminUnlocked: false, lastSaved: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export function applyTheme(theme: Theme): void {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function applyLanguage(lang: Language): void {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" || lang === "ur" ? "rtl" : "ltr";
}
