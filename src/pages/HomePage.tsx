import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Shield, Rocket, LayoutDashboard, Mail, Globe, Lock, Link2, Monitor, Fingerprint } from "lucide-react";
import { Language } from "@/types";
import { t } from "@/lib/i18n";
import PillarCard from "@/components/features/PillarCard";
import GlowMetric from "@/components/features/GlowMetric";
import LiveMarquee from "@/components/features/LiveMarquee";
import heroImg from "@/assets/hero-bg.jpg";

interface HomePageProps { language: Language; }

export default function HomePage({ language }: HomePageProps) {
  const navigate = useNavigate();
  const ecosystemLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "#10b981" },
    { to: "/vault", icon: Lock, label: "Crimson Vault", color: "#f43f5e" },
    { to: "/email", icon: Mail, label: "Email Hub", color: "#3b82f6" },
    { to: "/domains", icon: Globe, label: "Domains", color: "#f38020" },
    { to: "/websites", icon: Monitor, label: "Websites", color: "#00c7b7" },
    { to: "/integrations", icon: Link2, label: "Integrations", color: "#8b5cf6" },
    { to: "/webauthn", icon: Fingerprint, label: "Phantom Auth", color: "#7c3aed" },
    { to: "/security", icon: Shield, label: "Security", color: "#059669" },
  ];
  const isRtl = language === "ur" || language === "ar";
  const fontClass = language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : "";

  const pillars = [
    {
      number: "1",
      icon: "🛡️",
      title: t("pillar1.title", language),
      description: t("pillar1.desc", language),
      glassType: "emerald" as const,
      specs: ["AES-256-GCM", "X25519 Key Exchange", "FIPS 140-2 Level 3", "Auto Key Rotation 30d"],
    },
    {
      number: "2",
      icon: "🧙‍♂️",
      title: t("pillar2.title", language),
      description: t("pillar2.desc", language),
      glassType: "crimson" as const,
      specs: ["WebAuthn / FIDO2", "TOTP + Email OTP", "JWT 15-min + Refresh", "5 attempts → lockout"],
    },
    {
      number: "3",
      icon: "⚡",
      title: t("pillar3.title", language),
      description: t("pillar3.desc", language),
      glassType: "blue" as const,
      specs: ["WebSocket / gRPC", "<50ms Latency", "Blind Push Payload", "IndexedDB E2EE Cache"],
    },
    {
      number: "4",
      icon: "🏰",
      title: t("pillar4.title", language),
      description: t("pillar4.desc", language),
      glassType: "purple" as const,
      specs: ["SPF + DKIM + DMARC", "CAA: Let's Encrypt only", "HSTS 2yr preload", "Zero-Trust mTLS API"],
    },
  ];

  const metrics = [
    { label: t("metrics.threats", language), value: "247,893", icon: "🛡️", color: "emerald" as const },
    { label: t("metrics.encrypted", language), value: "99.98", unit: "%", icon: "🔐", color: "crimson" as const },
    { label: t("metrics.uptime", language), value: "99.99", unit: "%", icon: "📡", color: "blue" as const },
    { label: t("metrics.users", language), value: "8,412", icon: "👥", color: "purple" as const },
  ];

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 ${fontClass}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Marquee */}
      <div className="mt-16">
        <LiveMarquee />
      </div>

      {/* ====== HERO ====== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Ecosystem background"
            className="w-full h-full object-cover opacity-20 dark:opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80 dark:from-slate-950/80 dark:via-slate-950/60 dark:to-slate-950/90" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full opacity-20 blur-3xl animate-orb-drift"
          style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full opacity-15 blur-3xl animate-orb-drift"
          style={{ background: "radial-gradient(circle, #f43f5e, transparent)", animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl animate-orb-drift"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)", animationDelay: "-5s" }} />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-emerald rounded-full px-5 py-2 mb-8">
            <span className="live-dot" />
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tracking-widest uppercase">
              {t("common.secure", language)} • ZERO-KNOWLEDGE • {t("common.live", language)}
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            @uniorbi
            <span className="shimmer-text">.com</span>
          </h1>

          <div
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              color: "#047857",
              textShadow: "0 0 20px rgba(16,185,129,0.4), 0 0 40px rgba(16,185,129,0.2)",
            }}
          >
            {t("hero.tagline", language)}
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero.subtitle", language)}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/launchers")}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-black text-base transition-all hover:scale-105 animate-glow-pulse"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 0 20px rgba(16,185,129,0.4), 0 4px 24px rgba(16,185,129,0.3)",
              }}
            >
              <Rocket size={18} />
              {t("hero.cta", language)}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/security")}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base glass-card border border-slate-200/60 hover:border-emerald-300 transition-all hover:scale-105 text-slate-700 dark:text-white"
            >
              <Shield size={18} />
              {t("nav.security", language)}
            </button>
          </div>

          {/* Inline Metrics strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14">
            {[
              { icon: "🛡️", label: "Military-Grade E2EE" },
              { icon: "⚡", label: "<50ms Real-Time" },
              { icon: "🔐", label: "Zero-Knowledge" },
              { icon: "🌐", label: "Domain Fortress" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 glass-card rounded-xl px-4 py-2">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== LIVE METRICS ====== */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <GlowMetric key={m.label} label={m.label} value={m.value} unit={m.unit} icon={m.icon} color={m.color} />
          ))}
        </div>
      </section>

      {/* ====== 4 PILLARS ====== */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-emerald rounded-full px-4 py-1.5 mb-4">
            <Shield size={12} className="text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 tracking-wider uppercase">Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
            {t("pillars.title", language)}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">{t("pillars.subtitle", language)}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.number} {...pillar} />
          ))}
        </div>
      </section>

      {/* ====== TECH STACK ====== */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 text-center">Technology Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: "⚛️", name: "React 18", color: "#61dafb" },
              { icon: "🐹", name: "Go 1.21", color: "#00acd7" },
              { icon: "🐘", name: "PostgreSQL", color: "#336791" },
              { icon: "⚡", name: "Redis 7", color: "#ff4438" },
              { icon: "☸️", name: "Kubernetes", color: "#326ce5" },
              { icon: "🔐", name: "WebAuthn", color: "#10b981" },
              { icon: "🌐", name: "Cloudflare", color: "#f38020" },
              { icon: "🔑", name: "Vault", color: "#1563ff" },
              { icon: "📊", name: "Grafana", color: "#f46800" },
              { icon: "🔒", name: "AES-256", color: "#be123c" },
              { icon: "🐳", name: "Docker", color: "#2496ed" },
              { icon: "🚀", name: "Terraform", color: "#7b42bc" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="rounded-xl p-3 text-center transition-all hover:scale-105 cursor-default"
                style={{ background: `${tech.color}10`, border: `1px solid ${tech.color}30` }}
              >
                <div className="text-2xl mb-1">{tech.icon}</div>
                <div
                  className="text-xs font-bold"
                  style={{ color: tech.color, textShadow: `0 0 8px ${tech.color}60` }}
                >
                  {tech.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ECOSYSTEM QUICK ACCESS ====== */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-5 text-center">Quick Access — Ecosystem Sections</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ecosystemLinks.map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg text-center"
                style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8 text-center">
        <p className="text-sm font-bold text-slate-400 dark:text-slate-600">
          © 2026{" "}
          <span className="glow-text-emerald">@uniorbi.com</span>
          {" "}— All Rights Reserved. Confidential.
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-700 mt-1">
          <span className="shimmer-text font-bold">Smart World Order • ESOneWorld</span>
        </p>
      </footer>
    </div>
  );
}
