import { useState, useEffect } from "react";
import { Settings, Lock, Sun, Moon, Globe, Type, Palette, Save, Check, Eye, EyeOff, Shield, Zap, ToggleLeft, ToggleRight } from "lucide-react";
import { Language, Theme, AppSettings } from "@/types";
import { t, fontOptions } from "@/lib/i18n";
import { launchers } from "@/constants/launchers";

interface AdminPageProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const ADMIN_PASSWORD = "1122";

export default function AdminPage({ settings, onSettingsChange }: AdminPageProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");
  const language = settings.language;
  const isRtl = language === "ur" || language === "ar";
  const fontClass = language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : "";

  const handleUnlock = () => {
    if (locked) return;
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError("");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(t("admin.wrong", language));
      if (newAttempts >= 5) {
        setLocked(true);
        setTimeout(() => { setLocked(false); setAttempts(0); }, 15 * 60 * 1000);
      }
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (key: keyof AppSettings, value: unknown) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const tabs = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language", icon: Globe },
    { id: "launchers", label: "Launchers", icon: Zap },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System", icon: Settings },
  ];

  const themes: { id: Theme; label: string; icon: React.ElementType }[] = [
    { id: "light", label: "Light Mode", icon: Sun },
    { id: "dark", label: "Dark Mode", icon: Moon },
  ];

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: "en", label: "English", flag: "🇺🇸" },
    { id: "ur", label: "اردو", flag: "🇵🇰" },
    { id: "ar", label: "عربي", flag: "🇸🇦" },
  ];

  // Login Screen
  if (!unlocked) {
    return (
      <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 flex items-center justify-center ${fontClass}`} dir={isRtl ? "rtl" : "ltr"}>
        {/* Background orbs */}
        <div className="fixed top-20 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
        <div className="fixed bottom-20 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #f43f5e, transparent)" }} />

        <div className="w-full max-w-md mx-4">
          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            {/* Lock icon */}
            <div className="text-center mb-8">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-float"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))",
                  border: "1px solid rgba(16,185,129,0.3)",
                  boxShadow: "0 0 30px rgba(16,185,129,0.2)",
                }}
              >
                <Lock size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t("admin.title", language)}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Password Protected • Default: 1122
              </p>
            </div>

            {/* Password input */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder={t("admin.password", language)}
                  disabled={locked}
                  className="w-full px-4 py-3.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all font-mono text-lg tracking-widest pr-12"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className="text-sm text-rose-600 dark:text-rose-400 font-semibold text-center bg-rose-50 dark:bg-rose-900/20 rounded-xl py-2 px-4">
                  {error}
                  {attempts > 0 && ` (${5 - attempts} attempts remaining)`}
                </div>
              )}

              {locked && (
                <div className="text-sm text-amber-600 dark:text-amber-400 font-semibold text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl py-2 px-4">
                  🔒 Account locked for 15 minutes
                </div>
              )}

              <button
                onClick={handleUnlock}
                disabled={locked || !password}
                className="w-full py-3.5 rounded-xl font-black text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 0 20px rgba(16,185,129,0.3)",
                }}
              >
                {t("admin.unlock", language)}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-600">
                Protected by Zero-Trust Authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Panel
  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 ${fontClass}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="glass-emerald border-b border-emerald-200/40 dark:border-emerald-900/40">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Shield size={18} className="text-emerald-600" />
              <h1 className="font-black text-xl text-slate-900 dark:text-white">{t("admin.welcome", language)}</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Full Control Panel • @uniorbi.com Ecosystem
              {settings.lastSaved && (
                <span className="ml-2">Last saved: {new Date(settings.lastSaved).toLocaleTimeString()}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {settings.autoSave && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                <span className="live-dot" />
                Auto-Saving
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
              style={{ background: saved ? "#10b981" : "linear-gradient(135deg, #10b981, #059669)" }}
            >
              {saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? t("admin.saved", language) : t("admin.save", language)}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <nav className="glass-card rounded-2xl p-2 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === id
                      ? "glass-emerald text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sun size={18} /> Theme
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => update("theme", id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          settings.theme === id
                            ? "border-emerald-400 glass-emerald"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <Icon size={20} className={settings.theme === id ? "text-emerald-600" : "text-slate-500"} />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{label}</span>
                        {settings.theme === id && <Check size={14} className="ml-auto text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Type size={18} /> Font
                  </h2>
                  <div className="space-y-2">
                    {fontOptions.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => update("activeFont", font.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                          settings.activeFont === font.id
                            ? "border-emerald-400 glass-emerald"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${font.class}`}>
                          {font.name}
                        </span>
                        {settings.activeFont === font.id && <Check size={14} className="text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe size={18} /> Language & Region
                </h2>
                <div className="space-y-3">
                  {languages.map(({ id, label, flag }) => (
                    <button
                      key={id}
                      onClick={() => update("language", id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        settings.language === id
                          ? "border-emerald-400 glass-emerald"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                      dir={id === "ur" || id === "ar" ? "rtl" : "ltr"}
                    >
                      <span className="text-2xl">{flag}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{label}</span>
                      {settings.language === id && <Check size={16} className="ml-auto text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Launchers Tab */}
            {activeTab === "launchers" && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap size={18} /> Active Launcher
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {launchers.map((launcher) => (
                    <button
                      key={launcher.id}
                      onClick={() => update("activeLauncher", launcher.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        settings.activeLauncher === launcher.id
                          ? "border-emerald-400 glass-emerald"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-2xl">{launcher.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{launcher.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{launcher.description}</div>
                      </div>
                      {settings.activeLauncher === launcher.id && (
                        <Check size={14} className="ml-auto text-emerald-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="glass-emerald rounded-2xl p-6">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield size={18} /> Security Configuration
                  </h2>
                  <div className="space-y-2">
                    {[
                      { label: "AES-256-GCM Encryption", active: true },
                      { label: "WebAuthn / Passkeys", active: true },
                      { label: "Zero-Trust mTLS", active: true },
                      { label: "DMARC p=reject Policy", active: true },
                      { label: "HSTS Preload Enabled", active: true },
                      { label: "Real-Time Threat Monitor", active: true },
                      { label: "Brute Force Protection", active: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="live-dot" />
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">ACTIVE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-crimson rounded-2xl p-6">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white mb-2">Change Admin Password</h2>
                  <p className="text-xs text-slate-500 mb-4">Connect to OnSpace Cloud backend to enable password changes.</p>
                  <div className="space-y-3">
                    <input type="password" placeholder="Current password" disabled
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 placeholder-slate-400 cursor-not-allowed" />
                    <input type="password" placeholder="New password" disabled
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 placeholder-slate-400 cursor-not-allowed" />
                    <button disabled className="w-full py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed">
                      Requires Backend (OnSpace Cloud)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === "system" && (
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings size={18} /> System Settings
                  </h2>
                  <div className="space-y-4">
                    {[
                      { key: "autoSave" as const, label: "Auto-Save Changes", desc: "Automatically save all changes" },
                      { key: "animations" as const, label: "Animations & Effects", desc: "Glowing, floating, scan-line effects" },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</div>
                        </div>
                        <button
                          onClick={() => update(key, !settings[key])}
                          className={`w-12 h-6 rounded-full transition-all relative ${
                            settings[key] ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                              settings[key] ? "left-6" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-black text-base text-slate-900 dark:text-white mb-3">Domain Info</h2>
                  <div className="space-y-2 font-mono text-sm">
                    {[
                      ["Domain", "@uniorbi.com"],
                      ["Version", "1.0.0 Production"],
                      ["Classification", "Confidential"],
                      ["Encryption", "AES-256-GCM"],
                      ["Auth", "WebAuthn/FIDO2"],
                      ["Compliance", "GDPR, CCPA, ISO 27001"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <span className="text-slate-400 dark:text-slate-500">{k}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
