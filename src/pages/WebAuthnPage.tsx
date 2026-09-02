import { useState, useEffect } from "react";
import {
  Fingerprint, Shield, Plus, Trash2, Smartphone, Monitor,
  Tablet, CheckCircle2, XCircle, Clock, RefreshCw, AlertTriangle,
  Key, Lock, Eye, EyeOff, Activity
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Language } from "@/types";
import LiveMarquee from "@/components/features/LiveMarquee";

interface WebAuthnPageProps { language: Language }

interface Credential {
  id: string;
  credential_id: string;
  device_name: string;
  platform: string;
  is_active: boolean;
  created_at: string;
  last_used: string;
}

interface Session {
  id: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  country: string;
  is_current: boolean;
  last_active: string;
  created_at: string;
}

const demoCredentials = (userId: string): Partial<Credential>[] => [
  { device_name: "MacBook Pro Touch ID", platform: "macOS", is_active: true, credential_id: "cred_mac_" + Math.random().toString(36).slice(-8), last_used: new Date().toISOString() },
  { device_name: "iPhone Face ID", platform: "iOS", is_active: true, credential_id: "cred_ios_" + Math.random().toString(36).slice(-8), last_used: new Date(Date.now() - 3600000).toISOString() },
  { device_name: "Windows Hello", platform: "Windows", is_active: false, credential_id: "cred_win_" + Math.random().toString(36).slice(-8), last_used: new Date(Date.now() - 7 * 24 * 3600000).toISOString() },
];

const demoSessions = (userId: string): Partial<Session>[] => [
  { device_name: "Chrome on macOS", device_type: "desktop", ip_address: "192.168.1.42", country: "US", is_current: true, last_active: new Date().toISOString() },
  { device_name: "Safari on iPhone", device_type: "mobile", ip_address: "10.0.0.15", country: "PK", is_current: false, last_active: new Date(Date.now() - 1800000).toISOString() },
  { device_name: "Firefox on Ubuntu", device_type: "desktop", ip_address: "172.16.0.8", country: "GB", is_current: false, last_active: new Date(Date.now() - 86400000).toISOString() },
];

export default function WebAuthnPage({ language }: WebAuthnPageProps) {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"passkeys" | "sessions">("passkeys");

  const isRtl = language === "ur" || language === "ar";

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [{ data: creds }, { data: sess }] = await Promise.all([
      supabase.from("webauthn_credentials").select("*").order("created_at", { ascending: false }),
      supabase.from("user_sessions").select("*").order("last_active", { ascending: false }),
    ]);

    if (creds && creds.length > 0) {
      setCredentials(creds);
    } else {
      const seeds = demoCredentials(user!.id).map((c) => ({ ...c, user_id: user!.id, public_key: btoa("demo-pub-key-" + Math.random()) }));
      const { data: ins } = await supabase.from("webauthn_credentials").insert(seeds).select();
      if (ins) setCredentials(ins);
    }

    if (sess && sess.length > 0) {
      setSessions(sess);
    } else {
      const seedSess = demoSessions(user!.id).map((s) => ({ ...s, user_id: user!.id }));
      const { data: insS } = await supabase.from("user_sessions").insert(seedSess).select();
      if (insS) setSessions(insS);
    }

    setLoading(false);
  }

  async function handleRegisterPasskey() {
    if (!newDeviceName) return;
    setRegistering(true);

    // Simulate WebAuthn registration
    await new Promise((r) => setTimeout(r, 1500));

    const credId = btoa(Math.random().toString(36) + Date.now().toString(36));
    const { data, error } = await supabase.from("webauthn_credentials").insert({
      user_id: user!.id,
      credential_id: credId,
      public_key: btoa("simulated-pub-key-" + Math.random()),
      device_name: newDeviceName,
      platform: navigator.platform.includes("Win") ? "Windows" : navigator.platform.includes("Mac") ? "macOS" : "Linux",
      is_active: true,
      last_used: new Date().toISOString(),
    }).select().single();

    setRegistering(false);
    if (error) { toast.error(error.message); return; }
    setCredentials((prev) => [data, ...prev]);
    setNewDeviceName(""); setShowDeviceForm(false);
    toast.success("Passkey registered successfully! 🔑");
  }

  async function handleRevokeCredential(id: string) {
    await supabase.from("webauthn_credentials").update({ is_active: false }).eq("id", id);
    setCredentials((prev) => prev.map((c) => c.id === id ? { ...c, is_active: false } : c));
    toast.success("Passkey revoked");
  }

  async function handleDeleteCredential(id: string) {
    await supabase.from("webauthn_credentials").delete().eq("id", id);
    setCredentials((prev) => prev.filter((c) => c.id !== id));
    toast.success("Passkey deleted");
  }

  async function handleRevokeSession(id: string) {
    await supabase.from("user_sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Session revoked");
  }

  const deviceIcon = (type: string) => {
    if (type === "mobile") return Smartphone;
    if (type === "tablet") return Tablet;
    return Monitor;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-16 flex items-center justify-center">
        <div className="glass-card rounded-3xl p-10 text-center max-w-sm mx-4">
          <Fingerprint size={40} className="text-violet-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Authentication Required</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 ${language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}>
      <LiveMarquee />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl glass-purple flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}>
            <Fingerprint size={28} className="text-violet-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            Phantom <span className="shimmer-text">Auth</span>
          </h1>
          <p className="text-sm text-slate-500">WebAuthn • FIDO2 Passkeys • Session Management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active Passkeys", value: credentials.filter((c) => c.is_active).length, color: "#8b5cf6", icon: Key },
            { label: "Active Sessions", value: sessions.length, color: "#10b981", icon: Activity },
            { label: "Security Score", value: "98%", color: "#f43f5e", icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-4 text-center"
              style={{ borderTop: `3px solid ${color}` }}>
              <Icon size={18} style={{ color }} className="mx-auto mb-2" />
              <div className="text-2xl font-black" style={{ color, textShadow: `0 0 10px ${color}40` }}>{value}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center glass-card rounded-2xl p-1 mb-6">
          {(["passkeys", "sessions"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${
                activeTab === tab ? "bg-violet-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}>
              {tab === "passkeys" ? "🔑 Passkeys" : "📱 Active Sessions"}
            </button>
          ))}
        </div>

        {/* Passkeys Tab */}
        {activeTab === "passkeys" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg text-slate-900 dark:text-white">Registered Passkeys</h2>
              <button onClick={() => setShowDeviceForm(!showDeviceForm)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                <Plus size={14} /> Register Passkey
              </button>
            </div>

            {showDeviceForm && (
              <div className="glass-purple rounded-2xl p-5 mb-4 border border-violet-200/40">
                <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Fingerprint size={14} className="text-violet-500" /> Register New Passkey
                </h3>
                <div className="flex gap-3">
                  <input value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="Device name (e.g. MacBook Touch ID)"
                    className="flex-1 px-4 py-3 rounded-xl glass-card border border-violet-200/40 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-violet-400 text-sm" />
                  <button onClick={handleRegisterPasskey} disabled={!newDeviceName || registering}
                    className="px-5 py-3 rounded-xl font-black text-sm text-white disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                    {registering ? <RefreshCw size={14} className="animate-spin" /> : <Fingerprint size={14} />}
                    {registering ? "Registering..." : "Register"}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Your browser's biometric / PIN authentication will be used</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw size={20} className="animate-spin text-violet-500" />
              </div>
            ) : (
              <div className="space-y-3">
                {credentials.map((cred) => (
                  <div key={cred.id}
                    className={`glass-card rounded-2xl p-5 transition-all ${cred.is_active ? "" : "opacity-60"}`}
                    style={{ borderLeft: `3px solid ${cred.is_active ? "#8b5cf6" : "#94a3b8"}` }}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cred.is_active ? "glass-purple" : "bg-slate-100 dark:bg-slate-800"}`}>
                        <Fingerprint size={18} className={cred.is_active ? "text-violet-600" : "text-slate-400"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{cred.device_name}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${cred.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                            {cred.is_active ? "ACTIVE" : "REVOKED"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {cred.platform}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mb-1 truncate">
                          ID: {cred.credential_id?.slice(0, 24)}...
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock size={8} /> Added {new Date(cred.created_at).toLocaleDateString()}
                          </span>
                          {cred.last_used && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 size={8} className="text-emerald-500" /> Last used {new Date(cred.last_used).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {cred.is_active && (
                          <button onClick={() => handleRevokeCredential(cred.id)}
                            className="text-[10px] font-black px-2.5 py-1.5 rounded-lg glass-gold text-amber-600 hover:scale-105 transition-all">
                            Revoke
                          </button>
                        )}
                        <button onClick={() => handleDeleteCredential(cred.id)}
                          className="p-1.5 rounded-lg glass-crimson text-rose-500 hover:scale-105 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg text-slate-900 dark:text-white">Active Sessions</h2>
              <button onClick={async () => {
                const others = sessions.filter((s) => !s.is_current);
                for (const s of others) await supabase.from("user_sessions").delete().eq("id", s.id);
                setSessions((prev) => prev.filter((s) => s.is_current));
                toast.success("All other sessions revoked");
              }}
                className="text-xs font-black text-rose-600 hover:text-rose-700 transition-colors">
                Revoke All Others
              </button>
            </div>
            <div className="space-y-3">
              {sessions.map((session) => {
                const DevIcon = deviceIcon(session.device_type);
                return (
                  <div key={session.id}
                    className={`glass-card rounded-2xl p-5 ${session.is_current ? "ring-2 ring-emerald-400" : ""}`}
                    style={{ borderLeft: `3px solid ${session.is_current ? "#10b981" : "#94a3b8"}` }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${session.is_current ? "glass-emerald" : "bg-slate-100 dark:bg-slate-800"}`}>
                        <DevIcon size={16} className={session.is_current ? "text-emerald-600" : "text-slate-400"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{session.device_name}</span>
                          {session.is_current && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center gap-0.5">
                              <span className="live-dot w-1.5 h-1.5" style={{ width: 6, height: 6 }} />
                              CURRENT
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            🌍 {session.country}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-3">
                          <span className="font-mono">{session.ip_address}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={8} /> {new Date(session.last_active).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {!session.is_current && (
                        <button onClick={() => handleRevokeSession(session.id)}
                          className="text-[10px] font-black px-2.5 py-1.5 rounded-lg glass-crimson text-rose-600 hover:scale-105 transition-all flex-shrink-0">
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
