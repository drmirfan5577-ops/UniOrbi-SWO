import { useEffect, useState, useRef } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Activity, Shield, Zap, Lock, TrendingUp, TrendingDown, Globe,
  AlertTriangle, CheckCircle, Server, Cpu, Wifi
} from "lucide-react";
import { Language } from "@/types";
import { t } from "@/lib/i18n";
import GlowMetric from "@/components/features/GlowMetric";
import LiveMarquee from "@/components/features/LiveMarquee";

interface DashboardPageProps { language: Language }

interface DataPoint {
  time: string;
  threats: number;
  encrypted: number;
  latency: number;
  sessions: number;
  bandwidth: number;
}

interface LogEntry {
  id: number;
  time: string;
  event: string;
  status: "ok" | "warn" | "block";
  ip: string;
}

let logId = 0;
const logEvents = [
  { event: "E2EE Handshake Completed", status: "ok" as const },
  { event: "WebAuthn Authentication", status: "ok" as const },
  { event: "JWT Token Rotated", status: "ok" as const },
  { event: "Rate Limit Triggered", status: "warn" as const },
  { event: "DDoS Attempt Blocked", status: "block" as const },
  { event: "Blind Notification Sent", status: "ok" as const },
  { event: "Suspicious IP Flagged", status: "block" as const },
  { event: "Key Rotation Executed", status: "ok" as const },
  { event: "mTLS Handshake Verified", status: "ok" as const },
  { event: "DMARC Policy Enforced", status: "ok" as const },
  { event: "CSP Header Violation", status: "warn" as const },
  { event: "Vault Access Granted", status: "ok" as const },
];

function makePoint(prev?: DataPoint): DataPoint {
  const now = new Date();
  return {
    time: now.toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    threats: Math.max(0, (prev?.threats || 0) + Math.floor(Math.random() * 3)),
    encrypted: 99.9 + Math.random() * 0.09,
    latency: 8 + Math.random() * 18,
    sessions: 8400 + Math.floor(Math.random() * 200),
    bandwidth: 120 + Math.random() * 80,
  };
}

function makeLog(): LogEntry {
  const e = logEvents[Math.floor(Math.random() * logEvents.length)];
  const ips = ["192.168.1.", "10.0.0.", "203.0.113."];
  return {
    id: ++logId,
    time: new Date().toLocaleTimeString(),
    event: e.event,
    status: e.status,
    ip: ips[Math.floor(Math.random() * ips.length)] + Math.floor(Math.random() * 255),
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="font-black text-slate-500 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="font-semibold text-slate-600">{p.name}:</span>
          <span className="font-black" style={{ color: p.color }}>
            {typeof p.value === "number" ? p.value.toFixed(p.name === "encrypted" ? 3 : p.name === "latency" ? 1 : 0) : p.value}
            {p.name === "encrypted" ? "%" : p.name === "latency" ? "ms" : p.name === "bandwidth" ? " MB/s" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage({ language }: DashboardPageProps) {
  const [data, setData] = useState<DataPoint[]>(() => {
    const pts: DataPoint[] = [];
    for (let i = 0; i < 20; i++) pts.push(makePoint(pts[pts.length - 1]));
    return pts;
  });
  const [logs, setLogs] = useState<LogEntry[]>(() => Array.from({ length: 12 }, makeLog));
  const [totalThreats, setTotalThreats] = useState(247893);
  const [uptime, setUptime] = useState(99.991);
  const isRtl = language === "ur" || language === "ar";
  const fontClass = language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : "";

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(-29), makePoint(prev[prev.length - 1])];
        return next;
      });
      setLogs((prev) => [makeLog(), ...prev.slice(0, 18)]);
      setTotalThreats((prev) => prev + Math.floor(Math.random() * 4));
      setUptime((prev) => Math.min(99.999, prev + (Math.random() > 0.5 ? 0.001 : -0.0005)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const latest = data[data.length - 1];

  const statusCards = [
    { icon: Shield, label: "E2EE Encryption", value: "AES-256-GCM", status: "ACTIVE", color: "#10b981" },
    { icon: Lock, label: "TLS Version", value: "TLS 1.3", status: "ENFORCED", color: "#3b82f6" },
    { icon: Zap, label: "WebSocket", value: `${latest?.latency.toFixed(0)}ms`, status: "OPTIMAL", color: "#8b5cf6" },
    { icon: Globe, label: "CDN Status", value: "Cloudflare", status: "ACTIVE", color: "#f59e0b" },
    { icon: Server, label: "Database", value: "PostgreSQL 15", status: "HEALTHY", color: "#06b6d4" },
    { icon: Wifi, label: "Zero-Trust API", value: "mTLS Active", status: "SECURED", color: "#f43f5e" },
  ];

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 ${fontClass}`} dir={isRtl ? "rtl" : "ltr"}>
      <LiveMarquee />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-dot" />
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Live Dashboard
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Security <span className="shimmer-text">Command Center</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="glass-emerald rounded-xl px-4 py-2 text-center">
              <div className="text-xs font-bold text-slate-500 mb-0.5">Uptime</div>
              <div className="text-lg font-black text-emerald-600">{uptime.toFixed(3)}%</div>
            </div>
            <div className="glass-crimson rounded-xl px-4 py-2 text-center">
              <div className="text-xs font-bold text-slate-500 mb-0.5">Threats</div>
              <div className="text-lg font-black text-rose-600">{totalThreats.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlowMetric label="Threats Blocked" value={totalThreats.toLocaleString()} icon="🛡️" color="emerald" animated={false} />
          <GlowMetric label="Encryption Rate" value={latest?.encrypted.toFixed(2) || "99.98"} unit="%" icon="🔐" color="crimson" animated={false} />
          <GlowMetric label="API Latency" value={latest?.latency.toFixed(0) || "12"} unit="ms" icon="⚡" color="blue" animated={false} />
          <GlowMetric label="Active Sessions" value={latest?.sessions.toLocaleString() || "8,412"} icon="👥" color="purple" animated={false} />
        </div>

        {/* Main Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Threat Timeline */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-rose-500" />
                <h2 className="font-black text-slate-900 dark:text-white text-sm">Threat Detection Stream</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="live-dot" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="threats" name="threats" stroke="#f43f5e" strokeWidth={2}
                  fill="url(#threatGrad)" dot={false}
                  style={{ filter: "drop-shadow(0 0 4px rgba(244,63,94,0.5))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Latency Stream */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-blue-500" />
                <h2 className="font-black text-slate-900 dark:text-white text-sm">API Latency Monitor</h2>
              </div>
              <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                &lt;50ms SLA
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[0, 50]} />
                <Tooltip content={<CustomTooltip />} />
                {/* SLA line at 50ms */}
                <Line type="monotone" dataKey="latency" name="latency" stroke="#3b82f6" strokeWidth={2.5}
                  dot={false} strokeShadowColor="rgba(59,130,246,0.5)"
                  style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.5))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sessions + Bandwidth */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">

          {/* Sessions */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-violet-500" />
              <h2 className="font-black text-slate-900 dark:text-white text-sm">Sessions & Bandwidth</h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.slice(-15)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={2}>
                <defs>
                  <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={2} />
                <YAxis yAxisId="left" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar yAxisId="left" dataKey="sessions" name="sessions" fill="url(#sessGrad)" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="right" dataKey="bandwidth" name="bandwidth" fill="url(#bwGrad)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Panel */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-black text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" />
              System Status
            </h2>
            <div className="space-y-2.5">
              {statusCards.map(({ icon: Icon, label, value, status, color }) => (
                <div key={label} className="flex items-center gap-2.5 p-2 rounded-xl"
                  style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}>
                    <Icon size={12} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</div>
                    <div className="text-xs font-black text-slate-700 dark:text-slate-300 truncate">{value}</div>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                    style={{ background: color }}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Event Log */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-blue-500" />
            <h2 className="font-black text-slate-900 dark:text-white text-sm">Live Security Event Feed</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="live-dot" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">WebSocket Stream</span>
            </div>
          </div>
          <div className="font-mono text-xs space-y-1 max-h-64 overflow-y-auto pr-1">
            {logs.map((log, i) => (
              <div key={log.id} className="flex items-center gap-3 p-2 rounded-xl transition-all"
                style={{
                  background: log.status === "ok" ? "rgba(16,185,129,0.05)" : log.status === "warn" ? "rgba(245,158,11,0.05)" : "rgba(244,63,94,0.05)",
                  borderLeft: `2px solid ${log.status === "ok" ? "#10b981" : log.status === "warn" ? "#f59e0b" : "#f43f5e"}`,
                  opacity: Math.max(0.35, 1 - i * 0.04),
                }}>
                <span className="text-slate-400 flex-shrink-0 text-[10px]">{log.time}</span>
                <span className="flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{
                    background: log.status === "ok" ? "#10b98118" : log.status === "warn" ? "#f59e0b18" : "#f43f5e18",
                    color: log.status === "ok" ? "#059669" : log.status === "warn" ? "#d97706" : "#be123c",
                  }}>
                  {log.status.toUpperCase()}
                </span>
                <span className="text-slate-700 dark:text-slate-300 flex-1 truncate">{log.event}</span>
                <span className="text-slate-400 flex-shrink-0 text-[10px]">{log.ip}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
