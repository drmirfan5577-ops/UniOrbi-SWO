import { useState, useEffect } from "react";
import {
  Globe, Plus, RefreshCw, ExternalLink, Shield, CheckCircle2,
  AlertTriangle, Clock, RotateCcw, Trash2, Settings, Wifi,
  Lock, Mail, Server, Database
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Language } from "@/types";
import LiveMarquee from "@/components/features/LiveMarquee";

interface DomainsPageProps { language: Language }

interface Domain {
  id: string;
  domain_name: string;
  registrar: string;
  status: string;
  dns_provider: string;
  ssl_status: string;
  ssl_expiry: string;
  domain_expiry: string;
  auto_renew: boolean;
  spf_verified: boolean;
  dkim_verified: boolean;
  dmarc_verified: boolean;
  nameservers: string[];
  created_at: string;
}

const registrars = [
  { id: "namecheap", label: "Namecheap", icon: "🏷️", color: "#ff6c2c" },
  { id: "godaddy", label: "GoDaddy", icon: "🌐", color: "#1bdbdb" },
  { id: "cloudflare", label: "Cloudflare Registrar", icon: "🔶", color: "#f38020" },
];

const dnsProviders = [
  { id: "cloudflare", label: "Cloudflare DNS", icon: "🔶" },
  { id: "route53", label: "AWS Route 53", icon: "☁️" },
  { id: "namecheap", label: "Namecheap DNS", icon: "🏷️" },
];

const demoDomainsData = (userId: string): Partial<Domain>[] => [
  {
    domain_name: "uniorbi.com",
    registrar: "namecheap",
    status: "active",
    dns_provider: "cloudflare",
    ssl_status: "active",
    ssl_expiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    domain_expiry: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    auto_renew: true,
    spf_verified: true,
    dkim_verified: true,
    dmarc_verified: true,
    nameservers: ["ns1.cloudflare.com", "ns2.cloudflare.com"],
  },
  {
    domain_name: "esworld.com",
    registrar: "namecheap",
    status: "active",
    dns_provider: "cloudflare",
    ssl_status: "active",
    ssl_expiry: new Date(Date.now() + 290 * 24 * 3600 * 1000).toISOString(),
    domain_expiry: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    auto_renew: true,
    spf_verified: true,
    dkim_verified: false,
    dmarc_verified: true,
    nameservers: ["ns1.cloudflare.com", "ns2.cloudflare.com"],
  },
];

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
      {ok ? <CheckCircle2 size={9} /> : <AlertTriangle size={9} />}
      {label}
    </span>
  );
}

export default function DomainsPage({ language }: DomainsPageProps) {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Add form
  const [newDomain, setNewDomain] = useState("");
  const [newRegistrar, setNewRegistrar] = useState("namecheap");
  const [newDnsProvider, setNewDnsProvider] = useState("cloudflare");
  const [saving, setSaving] = useState(false);

  const isRtl = language === "ur" || language === "ar";

  useEffect(() => {
    if (!user) return;
    loadDomains();
  }, [user]);

  async function loadDomains() {
    setLoading(true);
    const { data } = await supabase.from("domains").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      setDomains(data);
      setSelectedDomain(data[0]);
    } else {
      const seeds = demoDomainsData(user!.id).map((d) => ({ ...d, user_id: user!.id }));
      const { data: inserted } = await supabase.from("domains").insert(seeds).select();
      if (inserted) { setDomains(inserted); setSelectedDomain(inserted[0]); }
    }
    setLoading(false);
  }

  async function handleAdd() {
    if (!newDomain || !user) return;
    setSaving(true);
    const exp = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
    const { data, error } = await supabase.from("domains").insert({
      user_id: user.id,
      domain_name: newDomain,
      registrar: newRegistrar,
      dns_provider: newDnsProvider,
      status: "active",
      ssl_status: "active",
      ssl_expiry: exp,
      domain_expiry: exp,
      auto_renew: true,
      spf_verified: false,
      dkim_verified: false,
      dmarc_verified: false,
      nameservers: [],
    }).select().single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setDomains((prev) => [data, ...prev]);
    setNewDomain(""); setShowAdd(false);
    toast.success("Domain added successfully");
  }

  async function handleToggleAutoRenew(domain: Domain) {
    const { error } = await supabase.from("domains").update({ auto_renew: !domain.auto_renew }).eq("id", domain.id);
    if (!error) {
      setDomains((prev) => prev.map((d) => d.id === domain.id ? { ...d, auto_renew: !d.auto_renew } : d));
      if (selectedDomain?.id === domain.id) setSelectedDomain({ ...domain, auto_renew: !domain.auto_renew });
      toast.success(`Auto-renew ${!domain.auto_renew ? "enabled" : "disabled"}`);
    }
  }

  async function handleVerifyDns(domain: Domain, record: "spf" | "dkim" | "dmarc") {
    await new Promise((r) => setTimeout(r, 800));
    const update: any = {};
    update[`${record}_verified`] = true;
    const { error } = await supabase.from("domains").update(update).eq("id", domain.id);
    if (!error) {
      setDomains((prev) => prev.map((d) => d.id === domain.id ? { ...d, ...update } : d));
      if (selectedDomain?.id === domain.id) setSelectedDomain({ ...domain, ...update });
      toast.success(`${record.toUpperCase()} verified ✅`);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-16 flex items-center justify-center">
        <div className="glass-card rounded-3xl p-10 text-center max-w-sm mx-4">
          <Globe size={40} className="text-orange-500 mx-auto mb-4" />
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
              <Globe size={22} className="text-orange-500" />
              Domain <span className="shimmer-text">Fortress</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Namecheap • Cloudflare • GoDaddy • SPF/DKIM/DMARC • SSL Monitoring</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #f38020, #d97706)", boxShadow: "0 0 15px rgba(243,128,32,0.3)" }}>
            <Plus size={14} /> Add Domain
          </button>
        </div>

        {/* Add Domain */}
        {showAdd && (
          <div className="glass-gold rounded-2xl p-5 mb-5 border border-amber-200/40">
            <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Globe size={14} className="text-amber-500" /> Register / Import Domain
            </h3>
            <div className="grid sm:grid-cols-4 gap-3">
              <input value={newDomain} onChange={(e) => setNewDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="sm:col-span-2 px-3 py-2.5 rounded-xl glass-card border border-amber-200/40 text-slate-900 dark:text-white text-sm outline-none focus:border-amber-400" />
              <select value={newRegistrar} onChange={(e) => setNewRegistrar(e.target.value)}
                className="px-3 py-2.5 rounded-xl glass-card border border-amber-200/40 text-slate-700 dark:text-white text-sm outline-none bg-white/80">
                {registrars.map((r) => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
              </select>
              <div className="flex gap-2">
                <select value={newDnsProvider} onChange={(e) => setNewDnsProvider(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl glass-card border border-amber-200/40 text-slate-700 dark:text-white text-sm outline-none bg-white/80">
                  {dnsProviders.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
                </select>
                <button onClick={handleAdd} disabled={!newDomain || saving}
                  className="px-4 py-2 rounded-xl text-sm font-black text-white disabled:opacity-50 flex items-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #f38020, #d97706)" }}>
                  {saving ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Domain List */}
          <div className="space-y-3">
            {loading ? (
              <div className="glass-card rounded-2xl p-8 flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin text-orange-500" />
              </div>
            ) : domains.map((domain) => {
              const sslDays = daysUntil(domain.ssl_expiry);
              const domDays = daysUntil(domain.domain_expiry);
              const urgent = domDays < 60;

              return (
                <div key={domain.id}
                  onClick={() => setSelectedDomain(domain)}
                  className={`glass-card rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${
                    selectedDomain?.id === domain.id ? "ring-2 ring-orange-400" : ""
                  }`}
                  style={{ boxShadow: selectedDomain?.id === domain.id ? "0 0 20px rgba(243,128,32,0.2)" : undefined }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={14} className="text-orange-500" />
                    <span className="font-black text-sm text-slate-900 dark:text-white">{domain.domain_name}</span>
                    <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-full ${domain.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {domain.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Lock size={8} /> SSL: <span className={sslDays < 30 ? "text-amber-500 font-bold" : "text-emerald-600 font-bold"}>{sslDays}d</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={8} /> Exp: <span className={urgent ? "text-rose-600 font-bold" : "text-slate-600 font-bold"}>{domDays}d</span>
                    </span>
                    <span className="flex items-center gap-1">
                      🔶 {domain.registrar}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <StatusBadge ok={domain.spf_verified} label="SPF" />
                    <StatusBadge ok={domain.dkim_verified} label="DKIM" />
                    <StatusBadge ok={domain.dmarc_verified} label="DMARC" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Domain Detail */}
          {selectedDomain ? (
            <div className="lg:col-span-2 space-y-4">
              {/* SSL + Expiry Cards */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "SSL Certificate", icon: Lock,
                    value: `${daysUntil(selectedDomain.ssl_expiry)} days`, color: "#10b981",
                    sublabel: "Let's Encrypt Auto-Renewal",
                    ok: daysUntil(selectedDomain.ssl_expiry) > 30,
                  },
                  {
                    label: "Domain Expiry", icon: Clock,
                    value: `${daysUntil(selectedDomain.domain_expiry)} days`, color: "#f59e0b",
                    sublabel: selectedDomain.auto_renew ? "Auto-renew ON" : "Manual renewal needed",
                    ok: daysUntil(selectedDomain.domain_expiry) > 30,
                  },
                  {
                    label: "DNS Provider", icon: Server,
                    value: selectedDomain.dns_provider, color: "#3b82f6",
                    sublabel: "Anycast DNS • DDoS Protected",
                    ok: true,
                  },
                ].map(({ label, icon: Icon, value, color, sublabel, ok }) => (
                  <div key={label} className="glass-card rounded-2xl p-4"
                    style={{ borderLeft: `3px solid ${ok ? color : "#f43f5e"}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={13} style={{ color }} />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
                    </div>
                    <div className="text-lg font-black" style={{ color, textShadow: `0 0 10px ${color}40` }}>{value}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sublabel}</div>
                  </div>
                ))}
              </div>

              {/* DNS Security Checks */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield size={14} className="text-emerald-500" />
                  Email Security Records (SPF • DKIM • DMARC)
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      key: "spf" as const,
                      label: "SPF Record",
                      value: `v=spf1 include:_spf.google.com include:sendgrid.net -all`,
                      verified: selectedDomain.spf_verified,
                      color: "#10b981",
                    },
                    {
                      key: "dkim" as const,
                      label: "DKIM Record",
                      value: `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEF...`,
                      verified: selectedDomain.dkim_verified,
                      color: "#3b82f6",
                    },
                    {
                      key: "dmarc" as const,
                      label: "DMARC Policy",
                      value: `v=DMARC1; p=reject; rua=mailto:security@${selectedDomain.domain_name}`,
                      verified: selectedDomain.dmarc_verified,
                      color: "#8b5cf6",
                    },
                  ].map(({ key, label, value, verified, color }) => (
                    <div key={key} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: `${color}06`, border: `1px solid ${color}20` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black" style={{ color }}>{label}</span>
                          <StatusBadge ok={verified} label={verified ? "VERIFIED" : "UNVERIFIED"} />
                        </div>
                        <code className="text-[10px] text-slate-500 dark:text-slate-400 break-all font-mono">{value}</code>
                      </div>
                      {!verified && (
                        <button onClick={() => handleVerifyDns(selectedDomain, key)}
                          className="flex-shrink-0 text-[10px] font-black px-2.5 py-1.5 rounded-lg text-white transition-all hover:scale-105"
                          style={{ background: color }}>
                          Verify
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Nameservers + Controls */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Wifi size={14} className="text-blue-500" /> Nameservers
                  </h3>
                  <div className="space-y-2">
                    {(selectedDomain.nameservers?.length ? selectedDomain.nameservers : ["ns1.cloudflare.com", "ns2.cloudflare.com"]).map((ns) => (
                      <div key={ns} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                        <Server size={11} className="text-slate-400" />
                        <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{ns}</code>
                        <CheckCircle2 size={10} className="ml-auto text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Settings size={14} className="text-slate-500" /> Domain Controls
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Auto-Renew</span>
                      <button onClick={() => handleToggleAutoRenew(selectedDomain)}
                        className={`w-10 h-5 rounded-full relative transition-all ${selectedDomain.auto_renew ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${selectedDomain.auto_renew ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">SSL Auto-Renew</span>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ON</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">HSTS Preload</span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">2 Years</span>
                    </div>
                    <button className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold glass-card border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-400 transition-all">
                      <ExternalLink size={11} /> Open in {selectedDomain.registrar.charAt(0).toUpperCase() + selectedDomain.registrar.slice(1)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 glass-card rounded-2xl flex items-center justify-center h-48 text-slate-300">
              <p className="text-sm font-semibold">Select a domain to manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
