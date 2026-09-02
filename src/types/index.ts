export type Language = "en" | "ur" | "ar";
export type Theme = "light" | "dark";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface LauncherConfig {
  id: string;
  name: string;
  nameUr: string;
  nameAr: string;
  icon: string;
  description: string;
  descUr: string;
  descAr: string;
  glassType: "emerald" | "crimson" | "blue" | "purple" | "gold";
  accentColor: string;
  bgGradient: string;
  features: string[];
  route: string;
}

export interface SecurityMetric {
  label: string;
  value: string;
  status: "active" | "warning" | "secure";
  percentage: number;
}

export interface AdminSection {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  activeFont: string;
  adminUnlocked: boolean;
  activeLauncher: string;
  autoSave: boolean;
  animations: boolean;
  lastSaved: string;
}
