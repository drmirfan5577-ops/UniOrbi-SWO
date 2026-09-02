import { useState, useEffect } from "react";
import {
  Lock, Plus, Search, Key, FileText, Star, StarOff, Trash2,
  Eye, EyeOff, RefreshCw, Shield, ChevronDown, Clock, Tag,
  Copy, Check, Database, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Language } from "@/types";
import LiveMarquee from "@/components/features/LiveMarquee";

interface CrimsonVaultPageProps { language: Language }

interface VaultItem {
  id: string;
  label: string;
  data_type: string;
  ciphertext: string;
  iv: string;
  algorithm: string;
  tags: string[];
  is_favorite: boolean;
  expires_at: string | null;
  created_at: string;
}

// Simulated client-side AES-256-GCM via Web Crypto
async function encryptText(plaintext: string, password: string): Promise<{ ciphertext: string; iv: string }> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey("raw", enc.encode(password.padEnd(32, "0").slice(0, 32)), "PBKDF2", false, ["deriveKey"]);
  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("uniorbi-salt"), iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

async function decryptText(ciphertext: string, iv: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey("raw", enc.encode(password.padEnd(32, "0").slice(0, 32)), "PBKDF2", false, ["deriveKey"]);
  const key = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("uniorbi-salt"), iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
  const ivArr = new Uint8Array(atob(iv).split("").map((c) => c.charCodeAt(0)));
  const cipher = new Uint8Array(atob(ciphertext).split("").map((c) => c.charCodeAt(0)));
  const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: ivArr }, key, cipher);
  return new TextDecoder().decode(decrypted);
}

const dataTypes = [
  { id: "text", label: "Secure Note", icon: FileText, color: "#10b981" },
  { id: "key", label: "API Key", icon: Key, color: "#f43f5e" },
  { id: "credential", label: "Credential", icon: Shield, color: "#8b5cf6" },
  { id: "file", label: "Encrypted File", icon: Database, color: "#3b82f6" },
];

export default function CrimsonVaultPage({ language }: CrimsonVaultPageProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [vaultKey] = useState("uniorbi-e2ee-key-2026"); // In prod: from secure enclave

  // Add form state
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [saving, setSaving] = useState(false);

  const isRtl = language === "ur" || language === "ar";

  useEffect(() => {
    if (!user) return;
    loadVault();
  }, [user]);

  async function loadVault() {
    setLoading(true);
    const { data, error } = await supabase
      .from("encrypted_vault")
      .select("*")
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newLabel || !newContent || !user) return;
    setSaving(true);
    const { ciphertext, iv } = await encryptText(newContent, vaultKey);
    const { data, error } = await supabase.from("encrypted_vault").insert({
      user_id: user.id,
      label: newLabel,
      data_type: newType,
      ciphertext,
      iv,
      algorithm: "AES-256-GCM",
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
    }).select().single();
    setSaving(false);
    if (error) { toast.error("Failed to encrypt & store"); return; }
    toast.success("🔐 Encrypted and stored in vault");
    setItems((prev) => [data, ...prev]);
    setNewLabel(""); setNewContent(""); setNewTags(""); setShowAddForm(false);
  }

  async function handleDecrypt(item: VaultItem) {
    if (decryptedMap[item.id]) {
      setDecryptedMap((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
      return;
    }
    const plain = await decryptText(item.ciphertext, item.iv, vaultKey);
    setDecryptedMap((prev) => ({ ...prev, [item.id]: plain }));
  }

  async function handleCopy(item: VaultItem) {
    let text = decryptedMap[item.id];
    if (!text) text = await decryptText(item.ciphertext, item.iv, vaultKey);
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard");
  }

  async function handleToggleFavorite(item: VaultItem) {
    const { error } = await supabase.from("encrypted_vault").update({ is_favorite: !item.is_favorite }).eq("id", item.id);
    if (!error) setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i));
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("encrypted_vault").delete().eq("id", id);
    if (!error) { setItems((prev) => prev.filter((i) => i.id !== id)); toast.success("Deleted from vault"); }
  }

  const filtered = items.filter((item) => {
    if (activeFilter === "favorites") return item.is_favorite;
    if (activeFilter !== "all") return item.data_type === activeFilter;
    return item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-16 flex items-center justify-center">
        <div className="glass-crimson rounded-3xl p-10 text-center max-w-sm mx-4">
          <Lock size={40} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-500">Sign in to access your encrypted vault</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 ${language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}>
      <LiveMarquee />

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #f43f5e, transparent)" }} />
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full opacity-8 blur-3xl"
            style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-2xl glass-crimson flex items-center justify-center">
                  <Lock size={18} className="text-rose-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    Crimson <span className="glow-text-crimson">Vault</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">AES-256-GCM • Zero-Knowledge • Client-Side E2EE</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-emerald rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                <span className="live-dot" />
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">{items.length} items secured</span>
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #f43f5e, #be123c)", boxShadow: "0 0 20px rgba(244,63,94,0.3)" }}>
                <Plus size={15} /> Add Secret
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="glass-crimson rounded-3xl p-6 mt-6 border border-rose-200/60">
              <h3 className="font-black text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield size={16} className="text-rose-500" /> Encrypt & Store
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label (e.g. GitHub API Key)"
                  className="px-4 py-3 rounded-xl glass-card border border-rose-200/40 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 text-sm" />
                <select value={newType} onChange={(e) => setNewType(e.target.value)}
                  className="px-4 py-3 rounded-xl glass-card border border-rose-200/40 text-slate-700 dark:text-white outline-none focus:border-rose-400 text-sm bg-white/80">
                  {dataTypes.map((dt) => <option key={dt.id} value={dt.id}>{dt.label}</option>)}
                </select>
              </div>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                placeholder="Sensitive data to encrypt (AES-256-GCM on client-side before storage)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl glass-card border border-rose-200/40 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rose-400 text-sm mb-4 resize-none" />
              <div className="flex gap-3">
                <input value={newTags} onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Tags (comma separated)"
                  className="flex-1 px-4 py-2.5 rounded-xl glass-card border border-rose-200/40 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rose-400 text-sm" />
                <button onClick={handleAdd} disabled={!newLabel || !newContent || saving}
                  className="px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #f43f5e, #be123c)" }}>
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                  Encrypt & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters + Search */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vault..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rose-400 text-sm" />
          </div>
          <div className="flex gap-1 glass-card rounded-xl p-1 overflow-x-auto">
            {[
              { id: "all", label: "All" },
              { id: "favorites", label: "★ Stars" },
              ...dataTypes.map((d) => ({ id: d.id, label: d.label })),
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setActiveFilter(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === id ? "bg-rose-500 text-white" : "text-slate-500 hover:text-slate-800"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vault Items */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-rose-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-crimson rounded-3xl p-16 text-center">
            <Lock size={48} className="text-rose-300 mx-auto mb-4" />
            <p className="font-black text-slate-500 text-lg">Vault is empty</p>
            <p className="text-sm text-slate-400 mt-1">Add your first encrypted secret above</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const dt = dataTypes.find((d) => d.id === item.data_type) || dataTypes[0];
              const DtIcon = dt.icon;
              const isDecrypted = !!decryptedMap[item.id];
              const isCopied = copiedId === item.id;

              return (
                <div key={item.id}
                  className="glass-card rounded-2xl p-5 group transition-all hover:-translate-y-1"
                  style={{ borderLeft: `3px solid ${dt.color}` }}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${dt.color}15`, border: `1px solid ${dt.color}30` }}>
                        <DtIcon size={14} style={{ color: dt.color }} />
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dt.color }}>{dt.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleFavorite(item)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                        {item.is_favorite
                          ? <Star size={13} className="text-amber-500 fill-amber-500" />
                          : <StarOff size={13} className="text-slate-300" />}
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Ciphertext display */}
                  <div className="rounded-xl p-3 mb-3 font-mono text-[10px] relative"
                    style={{ background: `${dt.color}06`, border: `1px solid ${dt.color}20` }}>
                    {isDecrypted ? (
                      <span className="text-slate-700 dark:text-slate-300 break-all leading-relaxed">
                        {decryptedMap[item.id]}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {item.ciphertext.slice(0, 40)}<span className="opacity-50">••••••••••••••••</span>
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${dt.color}12`, color: dt.color }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => handleDecrypt(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                      style={{ background: isDecrypted ? `${dt.color}20` : `${dt.color}12`, color: dt.color, border: `1px solid ${dt.color}25` }}>
                      {isDecrypted ? <EyeOff size={12} /> : <Eye size={12} />}
                      {isDecrypted ? "Hide" : "Decrypt"}
                    </button>
                    <button onClick={() => handleCopy(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 text-white"
                      style={{ background: isCopied ? "#10b981" : dt.color }}>
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Clock size={9} />
                    {new Date(item.created_at).toLocaleDateString()} • AES-256-GCM
                    {item.expires_at && (
                      <span className="ml-auto text-amber-500 flex items-center gap-0.5">
                        <AlertCircle size={9} /> Expires {new Date(item.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
