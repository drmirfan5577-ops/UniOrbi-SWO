import { useState, useEffect } from "react";
import {
  Link2, Plus, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  Clock, Key, Trash2, ExternalLink, Settings, Zap, Shield,
  Globe, Database, Mail, GitBranch, Cloud, Wifi
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Language } from "@/types";
import LiveMarquee from "@/components/features/LiveMarquee";

interface IntegrationsPageProps { language: Language }

interface Integration {
  id: string;
  provider: string;
  display_name: string;
  status: string;
  api_key_hint: string;
  scopes: string[];
  metadata: any;
  last_synced: string;
  created_at: string;
}

const PROVIDERS = [
  { id: "namecheap", label: "Namecheap", icon: "🏷️", color: "#ff6c2c", category: "domain", desc: "Domain registrar & DNS management" },
  { id: "zoho", label: "Zoho Mail", icon: "📧", color: "#f04d21", category: "email", desc: "Business email hosting & calendar" },
  { id: "netlify", label: "Netlify", icon: "🔷", color: "#00c7b7", category: "hosting", desc: "Web hosting, CI/CD & edge functions" },
  { id: "cloudflare", label: "Cloudflare", icon: "🔶", color: "#f38020", category: "security", desc: "CDN, WAF, DNS & DDoS protection" },
  { id: "onspace", label: "OnSpace Cloud", icon: "🚀", color: "#10b981", category: "backend", desc: "PostgreSQL, Auth & Edge Functions" },
  { id: "github", label: "GitHub", icon: "🐙", color: "#24292f", category: "devops", desc: "Version control & CI/CD pipelines" },
  { id: "resend", label: "Resend", icon: "✉️", color: "#000000", category: "email", desc: "Transactional email API" },
  { id: "vercel", label: "Vercel", icon: "▲", color: "#000000", category: "hosting", desc: "Next.js deployment & serverless" },
  { id: "supabase", label: "Supabase", icon: "⚡", color: "#3ecf8e", category: "backend", desc: "Open-source Firebase alternative" },
  { id: "firebase", label: "Firebase", icon: "🔥", color: "#ff6d00", category: "backend", desc: "Google's app development platform" },
  { id: "wordpress", label: "WordPress", icon: "📝", color: "#21759b", category: "cms", desc: "Content management system" },
  { id: "godaddy", label: "GoDaddy", icon: "🌐", color: "#1bdbdb", category: "domain", desc: "Domain registration & hosting" },
];

const categories = [
  { id: "all", label: "All Integrations" },
  { id: "domain", label: "🌐 Domains" },
  { id: "email", label: "📧 Email" },
  { id: "hosting", label: "🔷 Hosting" },
  { id: "backend", label: "⚡ Backend" },
  { id: "security", label: "🔶 Security" },
  { id: "devops", label: "🐙 DevOps" },
  { id: "cms", label: "📝 CMS" },
];

const demoIntegrations = (userId: string): Partial<Integration>[] =>
  PROVIDERS.slice(0, 7).map((p, i) => ({
    provider: p.id,
    display_name: p.label,
    status: i < 5 ? "connected" : i === 5 ? "pending" : "error",
    api_key_hint: `****${Math.random().toString(36).slice(-4).toUpperCase()}`,
    scopes: ["read", "write"],
    metadata: { plan: "Pro", region: "US-East" },
    last_synced: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  }));

function StatusIcon({ status }: { status: string }) {
  if (status === "connected") return <CheckCircle2 size={12} className="text-emerald-500" />;
  if (status === "pending") return <Clock size={12} className="text-amber-500" />;
  if (status === "error") return <XCircle size={12} className="text-rose-500" />;
  return <AlertTriangle size={12} className="text-slate-400" />;
}

export default function IntegrationsPage({ language }: IntegrationsPageProps) {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].id);
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  const isRtl = language === "ur" || language === "ar";

  useEffect(() => {
    if (!user) return;
    loadIntegrations();
  }, [user]);

  async function loadIntegrations() {
    setLoading(true);
    const { data } = await supabase.from("integrations").select("*").order("created_at");
    if (data && data.length > 0) {
      setIntegrations(data);
    } else {
      const seeds = demoIntegrations(user!.id).map((d) => ({ ...d, user_id: user!.id }));
      const { data: ins } = await supabase.from("integrations").insert(seeds).select();
      if (ins) setIntegrations(ins);
    }
    setLoading(false);
  }

  async function handleConnect() {
    if (!apiKey || !user) return;
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const provider = PROVIDERS.find((p) => p.id === selectedProvider)!;
    const { data, error } = await supabase.from("integrations").insert({
      user_id: user.id,
      provider: provider.id,
      display_name: provider.label,
      status: "connected",
      api_key_hint: `****${apiKey.slice(-4).toUpperCase()}`,
      scopes: ["read", "write"],
      metadata: { connected_at: new Date().toISOString() },
      last_synced: new Date().toISOString(),
    }).select().single();
    setConnecting(false);
    if (error) { toast.error(error.message); return; }
    setIntegrations((prev) => {
      const exists = prev.find((i) => i.provider === provider.id);
      if (exists) return prev.map((i) => i.provider === provider.id ? data : i);
      return [...prev, data];
    });
    setApiKey(""); setShowAdd(false);
    toast.success(`${provider.label} connected successfully! 🔗`);
  }

  async function handleSync(integration: Integration) {
    setSyncing(integration.id);
    await new Promise((r) => setTimeout(r, 1500));
    await supabase.from("integrations").update({ last_synced: new Date().toISOString() }).eq("id", integration.id);
    setIntegrations((prev) => prev.map((i) => i.id === integration.id ? { ...i, last_synced: new Date().toISOString() } : i));
    setSyncing(null);
    toast.success(`${integration.display_name} synced`);
  }

  async function handleDisconnect(id: string) {
    await supabase.from("integrations").delete().eq("id", id);
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
    toast.success("Integration disconnected");
  }

  const connected = integrations.filter((i) => i.status === "connected");
  const filtered = activeCategory === "all"
    ? PROVIDERS
    : PROVIDERS.filter((p) => p.category === activeCategory);

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-16 flex items-center justify-center">
        <div className="glass-card rounded-3xl p-10 text-center max-w-sm mx-4">
          <Link2 size={40} className="text-violet-500 mx-auto mb-4" />
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
              <Link2 size={22} className="text-violet-500" />
              Integration <span className="shimmer-text">Hub</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {connected.length}/{PROVIDERS.length} connected • Namecheap + Zoho + Netlify + Cloudflare + OnSpace + GitHub + Resend + more
            </p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", boxShadow: "0 0 15px rgba(139,92,246,0.3)" }}>
            <Plus size={14} /> Connect
          </button>
        </div>

        {/* Connect Form */}
        {showAdd && (
          <div className="glass-purple rounded-2xl p-5 mb-5 border border-violet-200/40">
            <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Key size={14} className="text-violet-500" /> Connect Integration
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-3 py-2.5 rounded-xl glass-card border border-violet-200/40 text-slate-700 dark:text-white text-sm outline-none bg-white/80">
                {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
              </select>
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                type="password" placeholder="API Key / OAuth Token"
                className="px-3 py-2.5 rounded-xl glass-card border border-violet-200/40 text-slate-900 dark:text-white text-sm outline-none focus:border-violet-400" />
              <button onClick={handleConnect} disabled={!apiKey || connecting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-50 transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                {connecting ? <RefreshCw size={13} className="animate-spin" /> : <Link2 size={13} />}
                {connecting ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        )}

        {/* Status Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Connected", value: connected.length, color: "#10b981", icon: CheckCircle2 },
            { label: "Pending", value: integrations.filter((i) => i.status === "pending").length, color: "#f59e0b", icon: Clock },
            { label: "Errors", value: integrations.filter((i) => i.status === "error").length, color: "#f43f5e", icon: XCircle },
            { label: "Available", value: PROVIDERS.length - connected.length, color: "#8b5cf6", icon: Plus },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-4"
              style={{ borderTop: `3px solid ${color}` }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} style={{ color }} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 flex-wrap mb-5">
          {categories.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveCategory(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === id ? "bg-violet-500 text-white" : "glass-card border border-slate-200 text-slate-600 hover:border-violet-400"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Integration Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((provider) => {
            const integration = integrations.find((i) => i.provider === provider.id);
            const isConnected = integration?.status === "connected";
            const isSyncing = syncing === integration?.id;

            return (
              <div key={provider.id}
                className="glass-card rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                style={{ borderTop: `3px solid ${isConnected ? provider.color : "#e2e8f0"}` }}>
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${provider.color}12`, border: `1px solid ${provider.color}25` }}>
                    {provider.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-slate-900 dark:text-white">{provider.label}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{provider.category}</div>
                  </div>
                  {integration && <StatusIcon status={integration.status} />}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{provider.desc}</p>

                {integration ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Key size={9} />
                      <span className="font-mono">{integration.api_key_hint}</span>
                      {integration.last_synced && (
                        <span className="ml-auto flex items-center gap-0.5">
                          <Clock size={8} /> {new Date(integration.last_synced).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleSync(integration)} disabled={!!syncing}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black transition-all hover:scale-105"
                        style={{ background: `${provider.color}15`, color: provider.color }}>
                        <RefreshCw size={9} className={isSyncing ? "animate-spin" : ""} />
                        {isSyncing ? "Syncing" : "Sync"}
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black glass-card border border-slate-200 text-slate-600 transition-all hover:scale-105">
                        <Settings size={9} /> Config
                      </button>
                      <button onClick={() => handleDisconnect(integration.id)}
                        className="py-1.5 px-2 rounded-lg text-[10px] font-black text-rose-500 glass-crimson transition-all hover:scale-105">
                        <Trash2 size={9} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setSelectedProvider(provider.id); setShowAdd(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="w-full py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${provider.color}, ${provider.color}cc)` }}>
                    Connect {provider.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
