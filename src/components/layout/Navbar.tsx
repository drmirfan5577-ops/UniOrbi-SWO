import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield, Rocket, Lock, Settings, Menu, X, Sun, Moon,
  LayoutDashboard, Mail, Globe, Link2, Monitor, Fingerprint,
  LogIn, LogOut, User, ChevronDown
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Language, Theme, AuthUser } from "@/types";
import { t } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

interface NavbarProps {
  language: Language;
  theme: Theme;
  onThemeToggle: () => void;
  onLanguageChange: (lang: Language) => void;
  user: AuthUser | null;
  onLogout: () => void;
}

const navGroups = [
  {
    label: "Core",
    items: [
      { to: "/", label: "Home", icon: Shield },
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/launchers", label: "Launchers", icon: Rocket },
    ],
  },
  {
    label: "Security",
    items: [
      { to: "/vault", label: "Crimson Vault", icon: Lock },
      { to: "/webauthn", label: "Phantom Auth", icon: Fingerprint },
      { to: "/security", label: "Security Center", icon: Shield },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/email", label: "Email Hub", icon: Mail },
      { to: "/domains", label: "Domains", icon: Globe },
      { to: "/websites", label: "Websites", icon: Monitor },
      { to: "/integrations", label: "Integrations", icon: Link2 },
    ],
  },
];

export default function Navbar({ language, theme, onThemeToggle, onLanguageChange, user, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const megaRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const isRtl = language === "ur" || language === "ar";

  const langs: Language[] = ["en", "ur", "ar"];
  const langLabels = { en: "EN", ur: "اردو", ar: "عربي" };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
    toast.success("Signed out");
    navigate("/");
  }

  const quickLinks = [
    { to: "/", icon: Shield, label: "Home" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/security", icon: Shield, label: "Security" },
    { to: "/admin", icon: Settings, label: "Admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/60 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-emerald-500/30 group-hover:ring-emerald-500/60 transition-all">
            <img src={logoImg} alt="uniorbi logo" className="w-full h-full object-cover" />
          </div>
          <div className={isRtl ? "text-right" : ""}>
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight hidden sm:block">
              @uniorbi<span className="glow-text-emerald">.com</span>
            </span>
            <div className="flex items-center gap-1 hidden sm:flex">
              <span className="live-dot" />
              <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">Live</span>
            </div>
          </div>
        </Link>

        {/* Desktop Quick Links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {quickLinks.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active ? "glass-emerald glow-text-emerald" : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
                }`}>
                <Icon size={13} />
                {label}
              </Link>
            );
          })}

          {/* Mega Menu */}
          <div ref={megaRef} className="relative">
            <button onClick={() => setMegaOpen(!megaOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-all">
              More <ChevronDown size={11} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            {megaOpen && (
              <div className="absolute top-full left-0 mt-2 w-[520px] glass-card rounded-3xl p-5 shadow-2xl border border-white/60 dark:border-white/10"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 40px rgba(16,185,129,0.1)" }}>
                <div className="grid grid-cols-3 gap-4">
                  {navGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{group.label}</p>
                      <div className="space-y-0.5">
                        {group.items.map(({ to, label, icon: Icon }) => (
                          <Link key={to} to={to} onClick={() => setMegaOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              location.pathname === to
                                ? "glass-emerald text-emerald-700 dark:text-emerald-400"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                            }`}>
                            <Icon size={12} />
                            {label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Language */}
          <div className="hidden sm:flex items-center bg-white/60 dark:bg-white/10 rounded-xl p-0.5 gap-0.5">
            {langs.map((lang) => (
              <button key={lang} onClick={() => onLanguageChange(lang)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  language === lang ? "bg-emerald-500 text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}>
                {langLabels[lang]}
              </button>
            ))}
          </div>

          {/* Theme */}
          <button onClick={onThemeToggle}
            className="w-8 h-8 rounded-xl glass-card flex items-center justify-center transition-all hover:scale-105 text-slate-600 dark:text-slate-300 hover:text-emerald-600">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* User menu / Auth */}
          {user ? (
            <div ref={userRef} className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-emerald transition-all hover:scale-105">
                <div className="w-5 h-5 rounded-lg bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hidden sm:block max-w-[80px] truncate">
                  {user.username}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 glass-card rounded-2xl p-2 shadow-xl border border-white/60">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.username}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <Settings size={12} /> Admin Panel
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 12px rgba(16,185,129,0.3)" }}>
              <LogIn size={13} /> Sign In
            </Link>
          )}

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-8 h-8 rounded-xl glass-card flex items-center justify-center text-slate-600 dark:text-slate-300">
            {mobileOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-card border-t border-white/40 dark:border-white/10 px-4 py-3 max-h-[80vh] overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-1">{group.label}</p>
              {group.items.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === to ? "glass-emerald glow-text-emerald" : "text-slate-600 hover:bg-white/60 dark:text-slate-300"
                  }`}>
                  <Icon size={14} />
                  {label}
                </Link>
              ))}
            </div>
          ))}
          {/* Mobile Language */}
          <div className="flex items-center gap-1.5 px-3 py-2">
            {langs.map((lang) => (
              <button key={lang} onClick={() => onLanguageChange(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${language === lang ? "bg-emerald-500 text-white" : "bg-white/60 dark:bg-white/10 text-slate-500"}`}>
                {langLabels[lang]}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
