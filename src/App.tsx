import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { AppSettings, AuthUser } from "@/types";
import { loadSettings, saveSettings, applyTheme, applyLanguage } from "@/lib/appStore";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import HomePage from "@/pages/HomePage";
import LaunchersPage from "@/pages/LaunchersPage";
import SecurityPage from "@/pages/SecurityPage";
import AdminPage from "@/pages/AdminPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import CrimsonVaultPage from "@/pages/CrimsonVaultPage";
import EmailPage from "@/pages/EmailPage";
import DomainsPage from "@/pages/DomainsPage";
import WebsitePage from "@/pages/WebsitePage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import WebAuthnPage from "@/pages/WebAuthnPage";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="text-center glass-card rounded-3xl p-12">
        <div className="text-7xl font-black shimmer-text mb-4">404</div>
        <p className="text-slate-500 font-semibold">Page not found</p>
      </div>
    </div>
  );
}

function AppInner() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const { user, loading, login, logout } = useAuthProvider();

  useEffect(() => {
    applyTheme(settings.theme);
    applyLanguage(settings.language);
    if (settings.autoSave) saveSettings(settings);
  }, [settings]);

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    applyTheme(newSettings.theme);
    applyLanguage(newSettings.language);
  };

  const handleThemeToggle = () => handleSettingsChange({ ...settings, theme: settings.theme === "light" ? "dark" : "light" });
  const handleLanguageChange = (lang: typeof settings.language) => handleSettingsChange({ ...settings, language: lang });
  const handleLauncherSelect = (id: string) => handleSettingsChange({ ...settings, activeLauncher: id });

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      <div className="min-h-screen">
        <Navbar
          language={settings.language}
          theme={settings.theme}
          onThemeToggle={handleThemeToggle}
          onLanguageChange={handleLanguageChange}
          user={user}
          onLogout={logout}
        />
        <Routes>
          <Route path="/" element={<HomePage language={settings.language} />} />
          <Route path="/auth" element={<AuthPage language={settings.language} />} />
          <Route path="/dashboard" element={<DashboardPage language={settings.language} />} />
          <Route path="/vault" element={<CrimsonVaultPage language={settings.language} />} />
          <Route path="/email" element={<EmailPage language={settings.language} />} />
          <Route path="/domains" element={<DomainsPage language={settings.language} />} />
          <Route path="/websites" element={<WebsitePage language={settings.language} />} />
          <Route path="/integrations" element={<IntegrationsPage language={settings.language} />} />
          <Route path="/webauthn" element={<WebAuthnPage language={settings.language} />} />
          <Route path="/launchers" element={
            <LaunchersPage language={settings.language} activeLauncher={settings.activeLauncher} onLauncherSelect={handleLauncherSelect} />
          } />
          <Route path="/security" element={<SecurityPage language={settings.language} />} />
          <Route path="/admin" element={
            <AdminPage settings={settings} onSettingsChange={handleSettingsChange} />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(16,185,129,0.3)",
              boxShadow: "0 0 20px rgba(16,185,129,0.15)",
              color: "#1e293b",
            },
          }}
        />
      </div>
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
