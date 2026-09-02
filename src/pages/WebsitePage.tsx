import { useState, useEffect } from "react";
import {
  Globe, Plus, RefreshCw, ExternalLink, GitBranch, CloudUpload,
  CheckCircle2, AlertTriangle, Zap, Database, Shield, Settings,
  Activity, Server, Code2, Trash2, Eye, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Language } from "@/types";
import LiveMarquee from "@/components/features/LiveMarquee";

interface WebsitePageProps { language: Language }

interface Website {
  id: string;
  name: string;
  custom_domain: string;
  host_provider: string;
  repo_url: string;
  framework: string;
  deploy_status: string;
  last_deployed: string;
  ssl_enabled: boolean;
  analytics_enabled: boolean;
  monthly_visits: number;
  storage_used_mb: number;
  created_at: string;
}

const hostProviders = [
  { id: "netlify", label: "Netlify", icon: "🔷", color: "#00c7b7" },
  { id: "vercel", label: "Vercel", icon: "▲", color: "#000000" },
  { id: "onspace", label: "OnSpace Cloud", icon: "🚀", color: "#10b981" },
  { id: "github-pages", label: "GitHub Pages", icon: "🐙", color: "#24292f" },
  { id: "firebase", label: "Firebase Hosting", icon: "🔥", color: "#ff6d00" },
  { id: "wordpress", label: "WordPress", icon: "📝", color: "#21759b" },
  { id: "supabase", label: "Supabase Edge", icon: "⚡", color: "#3ecf8e" },
];

const frameworks = [
  { id: "react", label: "React / Vite" },
  { id: "nextjs", label: "Next.js" },
  { id: "wordpress", label: "WordPress" },
  { id: "static", label: "Static HTML" },
  { id: "gatsby", label: "Gatsby" },
  { id: "remix", label: "Remix" },
];

const demoWebsites = (userId: string): Partial<Website>[] => [
  {
    name: "@uniorbi.com",
    custom_domain: "uniorbi.com",
    host_provider: "onspace",
    repo_url: "https://github.com/uniorbi/main-site",
    framework: "react",
    deploy_status: "deployed",
    last_deployed: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    ssl_enabled: true,
    analytics_enabled: true,
    monthly_visits: 12847,
    storage_used_mb: 48.2,
  },
  {
    name: "ESWorld Portal",
    custom_domain: "esworld.com",
    host_provider: "netlify",
    repo_url: "https://github.com/esworld/portal",
    framework: "nextjs",
    deploy_status: "deployed",
    last_deployed: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    ssl_enabled: true,
    analytics_enabled: false,
    monthly_visits: 5320,
    storage_used_mb: 124.7,
  },
  {
    name: "API Documentation",
    custom_domain: "docs.uniorbi.com",
    host_provider: "github-pages",
    repo_url: "https://github.com/uniorbi/docs",
    framework: "static",
    deploy_status: "building",
    last_deployed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    ssl_enabled: true,
    analytics_enabled: false,
    monthly_visits: 2140,
    storage_used_mb: 12.4,
  },
];

function DeployBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    deployed: { color: "#10b981", label: "● Deployed" },
    building: { color: "#f59e0b", label: "⟳ Building" },
    failed: { color: "#f43f5e", label: "✕ Failed" },
    offline: { color: "#94a3b8", label: "○ Offline" },
  };
  const s = map[status] || map.offline;
  return (
    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
      style={{ background: `${s.color}15`, color: s.color }}>{s.label}</span>
  );
}

export default function WebsitePage({ language }: WebsitePageProps) {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Website | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);

  // Form
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newProvider, setNewProvider] = useState("netlify");
  const [newFramework, setNewFramework] = useState("react");
  const [newRepo, setNewRepo] = useState("");
  const [saving, setSaving] = useState(false);

  const isRtl = language === "ur" || language === "ar";

  useEffect(() => {
    if (!user) return;
    loadWebsites();
  }, [user]);

  async function loadWebsites() {
    setLoading(true);
    const { data } = await supabase.from("websites").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      setWebsites(data); setSelected(data[0]);
    } else {
      const seeds = demoWebsites(user!.id).map((d) => ({ ...d, user_id: user!.id }));
      const { data: ins } = await supabase.from("websites").insert(seeds).select();
      if (ins) { setWebsites(ins); setSelected(ins[0]); }
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newName || !user) return;
    setSaving(true);
    const { data, error } = await supabase.from("websites").insert({
      user_id: user.id,
      name: newName,
      custom_domain: newDomain,
      host_provider: newProvider,
      framework: newFramework,
      repo_url: newRepo,
      deploy_status: "deployed",
      last_deployed: new Date().toISOString(),
      ssl_enabled: true,
      analytics_enabled: false,
      monthly_visits: 0,
      storage_used_mb: 0,
    }).select().single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setWebsites((prev) => [data, ...prev]);
    setSelected(data);
    setNewName(""); setNewDomain(""); setNewRepo(""); setShowAdd(false);
    toast.success("Website added ✅");
  }

  async function handleDeploy(site: Website) {
    setDeploying(site.id);
    await supabase.from("websites").update({ deploy_status: "building" }).eq("id", site.id);
    setWebsites((prev) => prev.map((w) => w.id === site.id ? { ...w, deploy_status: "building" } : w));
    if (selected?.id === site.id) setSelected({ ...site, deploy_status: "building" });
    setTimeout(async () => {
      await supabase.from("websites").update({ deploy_status: "deployed", last_deployed: new Date().toISOString() }).eq("id", site.id);
      setWebsites((prev) => prev.map((w) => w.id === site.id ? { ...w, deploy_status: "deployed", last_deployed: new Date().toISOString() } : w));
      if (selected?.id === site.id) setSelected({ ...site, deploy_status: "deployed", last_deployed: new Date().toISOString() });
      setDeploying(null);
      toast.success(`${site.name} deployed successfully! 🚀`);
    }, 3500);
  }

  async function handleDelete(id: string) {
    await supabase.from("websites").delete().eq("id", id);
    setWebsites((prev) => prev.filter((w) => w.id !== id));
    if (selected?.id === id) setSelected(websites.find((w) => w.id !== id) || null);
    toast.success("Website removed");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-16 flex items-center justify-center">
        <div className="glass-card rounded-3xl p-10 text-center max-w-sm mx-4">
          <Globe size={40} className="text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Authentication Required</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 ${language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}>
      <LiveMarquee />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Globe size={22} className="text-teal-500" />
              Website <span className="shimmer-text">Hub</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Netlify • Vercel • GitHub Pages • Firebase • WordPress • Supabase • OnSpace</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #00c7b7, #0694a2)", boxShadow: "0 0 15px rgba(0,199,183,0.3)" }}>
            <Plus size={14} /> New Website
          </button>
        </div>

        {showAdd && (
          <div className="glass-card rounded-2xl p-5 mb-5 border border-teal-200/40"
            style={{ boxShadow: "0 0 20px rgba(0,199,183,0.1)" }}>
            <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CloudUpload size={14} className="text-teal-500" /> Deploy New Website
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Website name"
                className="px-3 py-2.5 rounded-xl glass-card border border-teal-200/40 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-400" />
              <input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="custom-domain.com"
                className="px-3 py-2.5 rounded-xl glass-card border border-teal-200/40 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-400" />
              <input value={newRepo} onChange={(e) => setNewRepo(e.target.value)} placeholder="https://github.com/username/repo"
                className="px-3 py-2.5 rounded-xl glass-card border border-teal-200/40 text-slate-900 dark:text-white text-sm outline-none focus:border-teal-400" />
              <div className="flex gap-2">
                <select value={newProvider} onChange={(e) => setNewProvider(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl glass-card border border-teal-200/40 text-slate-700 dark:text-white text-sm outline-none bg-white/80">
                  {hostProviders.map((h) => <option key={h.id} value={h.id}>{h.icon} {h.label}</option>)}
                </select>
                <select value={newFramework} onChange={(e) => setNewFramework(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl glass-card border border-teal-200/40 text-slate-700 dark:text-white text-sm outline-none bg-white/80">
                  {frameworks.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleAdd} disabled={!newName || saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #00c7b7, #0694a2)" }}>
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <CloudUpload size={13} />}
              Add & Deploy
            </button>
          </div>
        )}

        {/* Provider Quick Links */}
        <div className="flex gap-2 flex-wrap mb-5">
          {hostProviders.map(({ id, label, icon, color }) => (
            <div key={id} className="flex items-center gap-1.5 glass-card rounded-xl px-3 py-1.5 border border-slate-200/60">
              <span className="text-sm">{icon}</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</span>
              <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full"
                style={{ background: color }}>
                {websites.filter((w) => w.host_provider === id).length}
              </span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Website List */}
          <div className="space-y-3">
            {loading ? (
              <div className="glass-card rounded-2xl p-8 flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin text-teal-500" />
              </div>
            ) : websites.map((site) => {
              const provider = hostProviders.find((h) => h.id === site.host_provider);
              return (
                <div key={site.id}
                  onClick={() => setSelected(site)}
                  className={`glass-card rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${
                    selected?.id === site.id ? "ring-2 ring-teal-400" : ""
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{provider?.icon || "🌐"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-slate-900 dark:text-white truncate">{site.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{site.custom_domain}</div>
                    </div>
                    <DeployBadge status={deploying === site.id ? "building" : site.deploy_status} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <BarChart3 size={8} /> {site.monthly_visits?.toLocaleString() || 0}/mo
                    </span>
                    <span className="flex items-center gap-1">
                      <Database size={8} /> {site.storage_used_mb?.toFixed(1)}MB
                    </span>
                    <span className="flex items-center gap-1">
                      <Code2 size={8} /> {site.framework}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Website Detail */}
          {selected ? (
            <div className="lg:col-span-2 space-y-4">
              {/* Overview */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{selected.name}</h2>
                    <a href={`https://${selected.custom_domain}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-0.5">
                      {selected.custom_domain} <ExternalLink size={9} />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDeploy(selected)} disabled={deploying === selected.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #00c7b7, #0694a2)" }}>
                      {deploying === selected.id
                        ? <><RefreshCw size={11} className="animate-spin" /> Building...</>
                        : <><Zap size={11} /> Deploy</>}
                    </button>
                    <button onClick={() => handleDelete(selected.id)}
                      className="p-1.5 rounded-xl glass-crimson text-rose-500 hover:scale-105 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Monthly Visits", value: selected.monthly_visits?.toLocaleString() || "0", color: "#10b981", icon: Activity },
                    { label: "Storage Used", value: `${selected.storage_used_mb?.toFixed(1)}MB`, color: "#3b82f6", icon: Database },
                    { label: "Deploy Status", value: selected.deploy_status, color: "#8b5cf6", icon: CloudUpload },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="rounded-xl p-3 text-center"
                      style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                      <Icon size={14} style={{ color }} className="mx-auto mb-1" />
                      <div className="text-sm font-black capitalize" style={{ color }}>{value}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <GitBranch size={14} className="text-slate-500" /> Connected Services
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { icon: "🐙", label: "GitHub", status: "connected", color: "#24292f" },
                    { icon: "🔶", label: "Cloudflare", status: "connected", color: "#f38020" },
                    { icon: "📊", label: "Analytics", status: selected.analytics_enabled ? "connected" : "inactive", color: "#8b5cf6" },
                    { icon: "📧", label: "Resend Mail", status: "connected", color: "#000000" },
                    { icon: "⚡", label: "Supabase", status: "connected", color: "#3ecf8e" },
                    { icon: "🔥", label: "Firebase", status: "inactive", color: "#ff6d00" },
                    { icon: "🏷️", label: "Namecheap", status: "connected", color: "#ff6c2c" },
                    { icon: "☁️", label: "AWS S3", status: "inactive", color: "#ff9900" },
                  ].map(({ icon, label, status, color }) => (
                    <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl glass-card border border-slate-100 dark:border-slate-800">
                      <span className="text-sm">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{label}</div>
                        <div className={`text-[9px] font-black uppercase ${status === "connected" ? "text-emerald-500" : "text-slate-400"}`}>
                          {status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repo + Deployment */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Code2 size={14} className="text-slate-500" /> Deployment Config
                </h3>
                <div className="space-y-2 font-mono text-xs">
                  {[
                    ["Repository", selected.repo_url || "Not configured"],
                    ["Framework", selected.framework],
                    ["Host Provider", hostProviders.find((h) => h.id === selected.host_provider)?.label || selected.host_provider],
                    ["SSL/TLS", selected.ssl_enabled ? "Enabled (Auto-renew)" : "Disabled"],
                    ["Last Deploy", selected.last_deployed ? new Date(selected.last_deployed).toLocaleString() : "Never"],
                    ["Branch", "main"],
                    ["Build Command", selected.framework === "react" ? "npm run build" : selected.framework === "nextjs" ? "next build" : "build"],
                    ["Publish Dir", selected.framework === "react" ? "dist" : selected.framework === "nextjs" ? ".next" : "public"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-slate-400 w-28 flex-shrink-0">{k}</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate">{v as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 glass-card rounded-2xl flex items-center justify-center h-48 text-slate-300">
              <p className="text-sm font-semibold">Select a website to manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
