import { Language } from "@/types";

type TranslationKey =
  | "nav.home"
  | "nav.launchers"
  | "nav.security"
  | "nav.admin"
  | "hero.tagline"
  | "hero.subtitle"
  | "hero.cta"
  | "hero.live"
  | "pillars.title"
  | "pillars.subtitle"
  | "pillar1.title"
  | "pillar1.desc"
  | "pillar2.title"
  | "pillar2.desc"
  | "pillar3.title"
  | "pillar3.desc"
  | "pillar4.title"
  | "pillar4.desc"
  | "launchers.title"
  | "launchers.subtitle"
  | "launchers.launch"
  | "security.title"
  | "security.subtitle"
  | "admin.title"
  | "admin.password"
  | "admin.unlock"
  | "admin.wrong"
  | "admin.welcome"
  | "admin.save"
  | "admin.saved"
  | "common.on"
  | "common.off"
  | "common.active"
  | "common.secure"
  | "common.live"
  | "metrics.threats"
  | "metrics.encrypted"
  | "metrics.uptime"
  | "metrics.users";

type Translations = Record<TranslationKey, string>;

const translations: Record<Language, Translations> = {
  en: {
    "nav.home": "Home",
    "nav.launchers": "Launchers",
    "nav.security": "Security",
    "nav.admin": "Admin",
    "hero.tagline": "Zero-Knowledge Personal Ecosystem",
    "hero.subtitle": "Military-grade encrypted, real-time, and fortified personal domain infrastructure powered by E2EE, WebAuthn, and Zero-Trust Architecture.",
    "hero.cta": "Explore Ecosystem",
    "hero.live": "LIVE",
    "pillars.title": "4 Core Pillars",
    "pillars.subtitle": "The foundation of an unbreakable digital fortress",
    "pillar1.title": "E2EE Zero-Knowledge Core",
    "pillar1.desc": "AES-256-GCM encryption. Server stores only ciphertext. Decryption keys live exclusively on your device.",
    "pillar2.title": "Frictionless Auth Wizard",
    "pillar2.desc": "WebAuthn/FIDO2 passkeys. No passwords. Biometric-first authentication with step-up MFA.",
    "pillar3.title": "Real-Time Encrypted Sync",
    "pillar3.desc": "WebSocket gRPC under 50ms latency. Blind push notifications with encrypted payload references only.",
    "pillar4.title": "Domain-Level Fortress",
    "pillar4.desc": "SPF, DKIM, DMARC rejection policy. HSTS 2-year preload. Zero-Trust mTLS API gateway.",
    "launchers.title": "Ecosystem Launchers",
    "launchers.subtitle": "Choose your portal into the @uniorbi.com ecosystem",
    "launchers.launch": "Launch",
    "security.title": "Security Command Center",
    "security.subtitle": "Real-time threat intelligence & cryptographic status",
    "admin.title": "Admin Control Panel",
    "admin.password": "Enter Admin Password",
    "admin.unlock": "Unlock Panel",
    "admin.wrong": "Incorrect password. Try again.",
    "admin.welcome": "Welcome, Administrator",
    "admin.save": "Save Changes",
    "admin.saved": "Changes Saved!",
    "common.on": "ON",
    "common.off": "OFF",
    "common.active": "ACTIVE",
    "common.secure": "SECURE",
    "common.live": "LIVE",
    "metrics.threats": "Threats Blocked",
    "metrics.encrypted": "Data Encrypted",
    "metrics.uptime": "Uptime",
    "metrics.users": "Active Sessions",
  },
  ur: {
    "nav.home": "ہوم",
    "nav.launchers": "لانچرز",
    "nav.security": "سیکیورٹی",
    "nav.admin": "ایڈمن",
    "hero.tagline": "زیرو-نالج ذاتی ایکو سسٹم",
    "hero.subtitle": "ملٹری گریڈ انکرپٹڈ، ریئل ٹائم، اور مضبوط ڈومین انفراسٹرکچر E2EE اور WebAuthn کے ساتھ۔",
    "hero.cta": "ایکو سسٹم دریافت کریں",
    "hero.live": "لائیو",
    "pillars.title": "چار بنیادی ستون",
    "pillars.subtitle": "ناقابل توڑ ڈیجیٹل قلعے کی بنیاد",
    "pillar1.title": "E2EE زیرو-نالج کور",
    "pillar1.desc": "AES-256-GCM انکرپشن۔ سرور صرف سائفر ٹیکسٹ محفوظ کرتا ہے۔",
    "pillar2.title": "بے رکاوٹ توثیق وزرڈ",
    "pillar2.desc": "WebAuthn/FIDO2 پاس کیز۔ کوئی پاس ورڈ نہیں۔ بائیو میٹرک تصدیق۔",
    "pillar3.title": "ریئل ٹائم انکرپٹڈ سنک",
    "pillar3.desc": "50 ملی سیکنڈ سے کم لیٹینسی۔ بلائنڈ پش نوٹیفیکیشنز۔",
    "pillar4.title": "ڈومین سطح کا قلعہ",
    "pillar4.desc": "SPF, DKIM, DMARC ریجیکشن پالیسی۔ HSTS 2 سال۔ Zero-Trust mTLS۔",
    "launchers.title": "ایکو سسٹم لانچرز",
    "launchers.subtitle": "@uniorbi.com ایکو سسٹم میں اپنا پورٹل منتخب کریں",
    "launchers.launch": "لانچ کریں",
    "security.title": "سیکیورٹی کمانڈ سنٹر",
    "security.subtitle": "ریئل ٹائم خطرے کی انٹیلیجنس اور کریپٹو اسٹیٹس",
    "admin.title": "ایڈمن کنٹرول پینل",
    "admin.password": "ایڈمن پاس ورڈ درج کریں",
    "admin.unlock": "پینل کھولیں",
    "admin.wrong": "غلط پاس ورڈ۔ دوبارہ کوشش کریں۔",
    "admin.welcome": "خوش آمدید، ایڈمنسٹریٹر",
    "admin.save": "تبدیلیاں محفوظ کریں",
    "admin.saved": "تبدیلیاں محفوظ ہو گئیں!",
    "common.on": "آن",
    "common.off": "آف",
    "common.active": "فعال",
    "common.secure": "محفوظ",
    "common.live": "لائیو",
    "metrics.threats": "روکے گئے خطرات",
    "metrics.encrypted": "انکرپٹڈ ڈیٹا",
    "metrics.uptime": "اپ ٹائم",
    "metrics.users": "فعال سیشنز",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.launchers": "القواذف",
    "nav.security": "الأمان",
    "nav.admin": "المشرف",
    "hero.tagline": "نظام بيئي شخصي بدون معرفة",
    "hero.subtitle": "بنية تحتية مشفرة بدرجة عسكرية في الوقت الفعلي مع E2EE وWebAuthn.",
    "hero.cta": "استكشف النظام البيئي",
    "hero.live": "مباشر",
    "pillars.title": "الأعمدة الأربعة الأساسية",
    "pillars.subtitle": "أساس الحصن الرقمي الذي لا يمكن اختراقه",
    "pillar1.title": "نواة التشفير الشامل",
    "pillar1.desc": "تشفير AES-256-GCM. يخزن الخادم النص المشفر فقط.",
    "pillar2.title": "معالج مصادقة سلسة",
    "pillar2.desc": "مفاتيح المرور WebAuthn/FIDO2. لا كلمات مرور. المصادقة البيومترية.",
    "pillar3.title": "مزامنة مشفرة في الوقت الفعلي",
    "pillar3.desc": "زمن استجابة أقل من 50 مللي ثانية. إشعارات دفع عمياء.",
    "pillar4.title": "حصن على مستوى النطاق",
    "pillar4.desc": "سياسة رفض SPF وDKIM وDMARC. HSTS لعامين. بوابة Zero-Trust.",
    "launchers.title": "قاذفات النظام البيئي",
    "launchers.subtitle": "اختر بوابتك في النظام البيئي @uniorbi.com",
    "launchers.launch": "إطلاق",
    "security.title": "مركز قيادة الأمان",
    "security.subtitle": "استخبارات التهديدات في الوقت الفعلي وحالة التشفير",
    "admin.title": "لوحة التحكم الإدارية",
    "admin.password": "أدخل كلمة مرور المشرف",
    "admin.unlock": "فتح اللوحة",
    "admin.wrong": "كلمة مرور خاطئة. حاول مرة أخرى.",
    "admin.welcome": "مرحباً، المسؤول",
    "admin.save": "حفظ التغييرات",
    "admin.saved": "تم حفظ التغييرات!",
    "common.on": "تشغيل",
    "common.off": "إيقاف",
    "common.active": "نشط",
    "common.secure": "آمن",
    "common.live": "مباشر",
    "metrics.threats": "التهديدات المحجوبة",
    "metrics.encrypted": "البيانات المشفرة",
    "metrics.uptime": "وقت التشغيل",
    "metrics.users": "الجلسات النشطة",
  },
};

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations["en"][key] || key;
}

export const fontOptions = [
  { id: "space-grotesk", name: "Space Grotesk", class: "font-sans" },
  { id: "inter", name: "Inter", class: "font-sans" },
  { id: "noto-urdu", name: "Noto Nastaliq (Urdu)", class: "font-urdu" },
  { id: "amiri", name: "Amiri (Arabic)", class: "font-arabic" },
];
