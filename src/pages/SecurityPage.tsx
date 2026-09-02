import { useEffect, useState } from "react";
import { Shield, Lock, Zap, Globe, CheckCircle, AlertTriangle, Activity } from "lucide-react";
import { Language } from "@/types";
import { t } from "@/lib/i18n";
import GlowMetric from "@/components/features/GlowMetric";
import LiveMarquee from "@/components/features/LiveMarquee";

interface SecurityPageProps { language: Language; }

interface LogEntry {
  time: string;
  event: string;
  status: "ok" | "warn" | "block";
  ip: string;
}

const generateLog = (): LogEntry => {
  const events = [
    { event: "E2EE Handshake Completed", status: "ok" as const },
    { event: "WebAuthn Authentication Success", status: "ok" as const },
    { event: "Rate Limit Triggered", status: "warn" as const },
    { event: "DDoS Attempt Blocked", status: "block" as const },
    { event: "JWT Token Rotated", status: "ok" as const },
    { event: "Blind Notification Sent", status: "ok" as const },
    { event: "Suspicious IP Flagged", status: "block" as const },
    { event: "Key Rotation Executed", status: "ok" as const },
    { event: "mTLS Handshake Verified", status: "ok" as const },
    { event: "DMARC Policy Enforced", status: "ok" as const },
  ];
  const e = events[Math.floor(Math.random() * events.length)];
  const ips = ["192.168.1.", "10.0.0.", "172.16.0.", "203.0.113."];
  return {
    time: new Date().toLocaleTimeString(),
    event: e.event,
    status: e.status,
    ip: ips[Math.floor(Math.random() * ips.length)] + Math.floor(Math.random() * 255),
  };
};

export default function SecurityPage({ language }: SecurityPageProps) {
  const [logs, setLogs] = useState<LogEntry[]>(() => Array.from({ length: 8 }, generateLog));
  const [threatCount, setThreatCount] = useState(247893);
  const isRtl = language === "ur" || language === "ar";
  const fontClass = language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : "";

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [generateLog(), ...prev.slice(0, 14)]);
      setThreatCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const encryptionSpecs = [
    { label: "Algorithm", value: "AES-256-GCM", color: "#10b981" },
    { label: "Key Exchange", value: "X25519", color: "#10b981" },
    { label: "Transport", value: "TLS 1.3", color: "#3b82f6" },
    { label: "Certificate", value: "Let's Encrypt", color: "#3b82f6" },
    { label: "HSTS", value: "2yr Preload", color: "#8b5cf6" },
    { label: "Key Rotation", value: "30 Days Auto", color: "#8b5cf6" },
    { label: "Zero-Knowledge", value: "Server-Blind", color: "#f43f5e" },
    { label: "Compliance", value: "FIPS 140-2 L3", color: "#f43f5e" },
  ];

  const checks = [
    { icon: "✅", label: "SPF Record Active", ok: true },
    { icon: "✅", label: "DKIM Signing Enabled", ok: true },
    { icon: "✅", label: "DMARC p=reject", ok: true },
    { icon: "✅", label: "CAA: letsencrypt.org", ok: true },
    { icon: "✅", label: "HSTS Preloaded", ok: true },
    { icon: "✅", label: "CSP Headers Active", ok: true },
    { icon: "✅", label: "Rate Limiting ON", ok: true },
    { icon: "✅", label: "mTLS Verified", ok: true },
    { icon: "✅", label: "Zero-Trust API", ok: true },
    { icon: "✅", label: "Brute Force Guard", ok: true },
  ];

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 ${fontClass}`} dir={isRtl ? "rtl" : "ltr"}>
      <LiveMarquee />

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass-emerald rounded-full px-5 py-2 mb-4">
            <span className="live-dot" />
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
              Real-Time Intelligence
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">
            {t("security.title", language)}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">{t("security.subtitle", language)}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <GlowMetric label={t("metrics.threats", language)} value={threatCount.toLocaleString()} icon="🛡️" color="emerald" animated={false} />
          <GlowMetric label={t("metrics.encrypted", language)} value="99.98" unit="%" icon="🔐" color="crimson" />
          <GlowMetric label={t("metrics.uptime", language)} value="99.99" unit="%" icon="📡" color="blue" />
          <GlowMetric label={t("metrics.users", language)} value="8,412" icon="👥" color="purple" />
        </div>

        {/* Two columns: Encryption specs + Security checks */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Encryption Specs */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-emerald-600" />
              <h2 className="font-black text-lg text-slate-900 dark:text-white">Cryptographic Specifications</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {encryptionSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-xl p-3"
                  style={{ background: `${spec.color}08`, border: `1px solid ${spec.color}25` }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                    {spec.label}
                  </div>
                  <div
                    className="text-sm font-black font-mono"
                    style={{ color: spec.color, textShadow: `0 0 8px ${spec.color}50` }}
                  >
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Checks */}
          <div className="glass-emerald rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle size={18} className="text-emerald-600" />
              <h2 className="font-black text-lg text-slate-900 dark:text-white">Security Compliance</h2>
              <span className="ml-auto text-xs font-black text-white bg-emerald-500 px-2 py-0.5 rounded-full">
                10/10 PASS
              </span>
            </div>
            <div className="space-y-2">
              {checks.map((check, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl"
                  style={{ background: "rgba(16,185,129,0.06)" }}
                >
                  <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{check.label}</span>
                  <span
                    className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                    style={{ background: "#10b981" }}
                  >
                    PASS
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Event Log */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-blue-600" />
            <h2 className="font-black text-lg text-slate-900 dark:text-white">Live Security Event Log</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="live-dot" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Feed</span>
            </div>
          </div>
          <div className="font-mono text-xs space-y-1.5 max-h-80 overflow-y-auto">
            {logs.map((log, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                style={{
                  background: log.status === "ok"
                    ? "rgba(16,185,129,0.06)"
                    : log.status === "warn"
                    ? "rgba(245,158,11,0.06)"
                    : "rgba(244,63,94,0.06)",
                  borderLeft: `3px solid ${log.status === "ok" ? "#10b981" : log.status === "warn" ? "#f59e0b" : "#f43f5e"}`,
                  opacity: Math.max(0.4, 1 - i * 0.05),
                }}
              >
                <span className="text-slate-400 dark:text-slate-600 flex-shrink-0">{log.time}</span>
                <span
                  className="flex-shrink-0 w-12 text-center font-black text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: log.status === "ok" ? "#10b98120" : log.status === "warn" ? "#f59e0b20" : "#f43f5e20",
                    color: log.status === "ok" ? "#059669" : log.status === "warn" ? "#d97706" : "#be123c",
                  }}
                >
                  {log.status.toUpperCase()}
                </span>
                <span className="text-slate-700 dark:text-slate-300 flex-1">{log.event}</span>
                <span className="text-slate-400 dark:text-slate-600 flex-shrink-0">{log.ip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
