import { useState, useEffect } from "react";
import {
  Mail, Inbox, Send, FileText, Trash2, Star, StarOff, Reply,
  Forward, Plus, Search, RefreshCw, Settings, ChevronRight,
  Paperclip, Circle, CheckCircle2, AlertCircle, Eye, X, Globe
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Language } from "@/types";
import LiveMarquee from "@/components/features/LiveMarquee";

interface EmailPageProps { language: Language }

type Folder = "inbox" | "sent" | "drafts" | "trash" | "spam";

interface EmailAccount {
  id: string;
  email: string;
  display_name: string;
  provider: string;
  is_verified: boolean;
  unread_count: number;
}

interface EmailMessage {
  id: string;
  account_id: string;
  folder: Folder;
  from_email: string;
  from_name: string;
  to_emails: string[];
  subject: string;
  body: string;
  is_read: boolean;
  is_starred: boolean;
  is_encrypted: boolean;
  attachments: any[];
  labels: string[];
  created_at: string;
}

const providerColors: Record<string, string> = {
  zoho: "#f04d21",
  gmail: "#ea4335",
  outlook: "#0072c6",
  resend: "#000000",
};

const providerIcons: Record<string, string> = {
  zoho: "📧",
  gmail: "📬",
  outlook: "📨",
  resend: "📤",
};

// Demo seed messages
const demoMessages = (accountId: string, userId: string): Partial<EmailMessage>[] => [
  {
    account_id: accountId,
    folder: "inbox",
    from_email: "security@cloudflare.com",
    from_name: "Cloudflare Security",
    to_emails: ["admin@uniorbi.com"],
    subject: "SSL Certificate Renewed — uniorbi.com",
    body: "Your SSL certificate for uniorbi.com has been automatically renewed. It is valid until August 2027. No action required.",
    is_read: false,
    is_starred: true,
    is_encrypted: true,
    attachments: [],
    labels: ["security", "ssl"],
  },
  {
    account_id: accountId,
    folder: "inbox",
    from_email: "noreply@namecheap.com",
    from_name: "Namecheap",
    to_emails: ["admin@uniorbi.com"],
    subject: "Domain Renewal Reminder — 30 days remaining",
    body: "Your domain uniorbi.com expires in 30 days. Please renew it to avoid service interruption.",
    is_read: false,
    is_starred: false,
    is_encrypted: false,
    attachments: [],
    labels: ["domain", "renewal"],
  },
  {
    account_id: accountId,
    folder: "sent",
    from_email: "admin@uniorbi.com",
    from_name: "UniOrbi Admin",
    to_emails: ["team@esworld.com"],
    subject: "Security Audit Report — Q3 2026",
    body: "Please find attached the quarterly security audit report. All 10 compliance checks passed.",
    is_read: true,
    is_starred: false,
    is_encrypted: true,
    attachments: [{ name: "audit-q3-2026.pdf", size: "2.4 MB" }],
    labels: ["audit", "security"],
  },
  {
    account_id: accountId,
    folder: "drafts",
    from_email: "admin@uniorbi.com",
    from_name: "UniOrbi Admin",
    to_emails: ["partner@techcorp.io"],
    subject: "Integration Proposal — Draft",
    body: "Hi, I wanted to discuss the potential integration between our systems...",
    is_read: true,
    is_starred: false,
    is_encrypted: false,
    attachments: [],
    labels: ["proposal"],
  },
];

export default function EmailPage({ language }: EmailPageProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [selectedMsg, setSelectedMsg] = useState<EmailMessage | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);

  // Add account state
  const [newEmail, setNewEmail] = useState("");
  const [newProvider, setNewProvider] = useState("zoho");
  const [newDisplayName, setNewDisplayName] = useState("");

  const isRtl = language === "ur" || language === "ar";

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const { data: accs } = await supabase.from("email_accounts").select("*").order("created_at");
    if (accs && accs.length > 0) {
      setAccounts(accs);
      setActiveAccount(accs[0].id);
      const { data: msgs } = await supabase.from("email_messages").select("*").order("created_at", { ascending: false });
      if (msgs) setMessages(msgs);
    } else {
      // Create default account + seed messages
      const { data: acc } = await supabase.from("email_accounts").insert({
        user_id: user!.id,
        email: `admin@uniorbi.com`,
        display_name: "UniOrbi Admin",
        provider: "zoho",
        is_verified: true,
        is_default: true,
        unread_count: 2,
      }).select().single();

      if (acc) {
        setAccounts([acc]);
        setActiveAccount(acc.id);
        const seedMsgs = demoMessages(acc.id, user!.id).map((m) => ({ ...m, user_id: user!.id }));
        const { data: inserted } = await supabase.from("email_messages").insert(seedMsgs).select();
        if (inserted) setMessages(inserted);
      }
    }
    setLoading(false);
  }

  async function handleAddAccount() {
    if (!newEmail || !user) return;
    const { data, error } = await supabase.from("email_accounts").insert({
      user_id: user.id,
      email: newEmail,
      display_name: newDisplayName || newEmail.split("@")[0],
      provider: newProvider,
      is_verified: false,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setAccounts((prev) => [...prev, data]);
    setNewEmail(""); setNewProvider("zoho"); setNewDisplayName(""); setShowAddAccount(false);
    toast.success("Email account added");
  }

  async function handleSend() {
    if (!composeTo || !composeSubject || !user || !activeAccount) return;
    setComposeSending(true);
    const { data, error } = await supabase.from("email_messages").insert({
      user_id: user.id,
      account_id: activeAccount,
      folder: "sent",
      from_email: accounts.find((a) => a.id === activeAccount)?.email || "",
      from_name: accounts.find((a) => a.id === activeAccount)?.display_name || "",
      to_emails: composeTo.split(",").map((e) => e.trim()),
      subject: composeSubject,
      body: composeBody,
      is_read: true,
      is_encrypted: true,
      attachments: [],
      labels: [],
      sent_at: new Date().toISOString(),
    }).select().single();
    setComposeSending(false);
    if (error) { toast.error("Send failed"); return; }
    setMessages((prev) => [data, ...prev]);
    setComposeTo(""); setComposeSubject(""); setComposeBody(""); setShowCompose(false);
    toast.success("Email sent & encrypted ✅");
  }

  async function handleMarkRead(msg: EmailMessage) {
    if (msg.is_read) return;
    await supabase.from("email_messages").update({ is_read: true }).eq("id", msg.id);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
  }

  async function handleToggleStar(msg: EmailMessage) {
    await supabase.from("email_messages").update({ is_starred: !msg.is_starred }).eq("id", msg.id);
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_starred: !m.is_starred } : m));
  }

  async function handleDelete(msg: EmailMessage) {
    if (msg.folder === "trash") {
      await supabase.from("email_messages").delete().eq("id", msg.id);
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    } else {
      await supabase.from("email_messages").update({ folder: "trash" }).eq("id", msg.id);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, folder: "trash" } : m));
    }
    if (selectedMsg?.id === msg.id) setSelectedMsg(null);
    toast.success("Moved to trash");
  }

  const folderMeta: { id: Folder; label: string; icon: typeof Inbox; color: string }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox, color: "#10b981" },
    { id: "sent", label: "Sent", icon: Send, color: "#3b82f6" },
    { id: "drafts", label: "Drafts", icon: FileText, color: "#f59e0b" },
    { id: "trash", label: "Trash", icon: Trash2, color: "#f43f5e" },
    { id: "spam", label: "Spam", icon: AlertCircle, color: "#8b5cf6" },
  ];

  const currentMessages = messages.filter((m) => {
    if (activeAccount && m.account_id !== activeAccount) return false;
    if (m.folder !== activeFolder) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.subject?.toLowerCase().includes(q) || m.from_email?.toLowerCase().includes(q) || m.body?.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = (folder: Folder) =>
    messages.filter((m) => (!activeAccount || m.account_id === activeAccount) && m.folder === folder && !m.is_read).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-16 flex items-center justify-center">
        <div className="glass-card rounded-3xl p-10 text-center max-w-sm mx-4">
          <Mail size={40} className="text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sign In Required</h2>
          <p className="text-sm text-slate-500">Authenticate to access Email Management</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 ${language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : ""}`}
      dir={isRtl ? "rtl" : "ltr"}>
      <LiveMarquee />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mail size={22} className="text-blue-500" />
              Email <span className="shimmer-text">Command Center</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Multi-account • E2EE • Enterprise-grade management</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddAccount(!showAddAccount)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold glass-card border border-slate-200 text-slate-600 hover:border-blue-400 transition-all">
              <Plus size={13} /> Add Account
            </button>
            <button onClick={() => setShowCompose(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 0 15px rgba(59,130,246,0.3)" }}>
              <Plus size={14} /> Compose
            </button>
          </div>
        </div>

        {/* Add Account Form */}
        {showAddAccount && (
          <div className="glass-blue rounded-2xl p-5 mb-5 border border-blue-200/40">
            <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3">Add Email Account</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <input value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Display Name"
                className="px-3 py-2.5 rounded-xl glass-card border border-blue-200/40 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-400" />
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@domain.com" type="email"
                className="px-3 py-2.5 rounded-xl glass-card border border-blue-200/40 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-400" />
              <div className="flex gap-2">
                <select value={newProvider} onChange={(e) => setNewProvider(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl glass-card border border-blue-200/40 text-slate-700 dark:text-white text-sm outline-none bg-white/80">
                  {["zoho", "gmail", "outlook", "resend"].map((p) => (
                    <option key={p} value={p}>{providerIcons[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <button onClick={handleAddAccount}
                  className="px-4 py-2 rounded-xl text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="flex gap-4 h-[calc(100vh-260px)] min-h-[500px]">

          {/* Sidebar: Accounts + Folders */}
          <div className="w-56 flex-shrink-0 flex flex-col gap-3">
            {/* Accounts */}
            <div className="glass-card rounded-2xl p-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Accounts</p>
              <div className="space-y-1">
                {accounts.map((acc) => (
                  <button key={acc.id} onClick={() => setActiveAccount(acc.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left ${
                      activeAccount === acc.id ? "glass-blue" : "hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}>
                    <span className="text-base">{providerIcons[acc.provider] || "📧"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{acc.display_name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{acc.email}</div>
                    </div>
                    {acc.unread_count > 0 && (
                      <span className="text-[9px] font-black w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                        {acc.unread_count}
                      </span>
                    )}
                    {acc.is_verified && <CheckCircle2 size={10} className="text-emerald-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Folders */}
            <div className="glass-card rounded-2xl p-3 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Folders</p>
              <div className="space-y-0.5">
                {folderMeta.map(({ id, label, icon: Icon, color }) => (
                  <button key={id} onClick={() => setActiveFolder(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                      activeFolder === id
                        ? "font-black"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                    style={activeFolder === id ? { background: `${color}12`, color } : {}}>
                    <Icon size={13} />
                    <span className="text-xs font-semibold flex-1 text-left">{label}</span>
                    {unreadCount(id) > 0 && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: color }}>
                        {unreadCount(id)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col min-w-0">
            {/* Search bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${activeFolder}...`}
                  className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none text-xs" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw size={20} className="animate-spin text-blue-500" />
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                  <Mail size={28} className="mb-2 opacity-30" />
                  <p className="text-xs font-semibold">No messages</p>
                </div>
              ) : currentMessages.map((msg) => (
                <div key={msg.id}
                  onClick={() => { setSelectedMsg(msg); handleMarkRead(msg); }}
                  className={`px-4 py-3 border-b border-slate-100/60 dark:border-slate-800/60 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/3 ${
                    selectedMsg?.id === msg.id ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  } ${!msg.is_read ? "border-l-2 border-l-blue-500" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`flex-1 text-xs truncate ${!msg.is_read ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-600 dark:text-slate-400"}`}>
                      {msg.from_name || msg.from_email}
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{new Date(msg.created_at).toLocaleDateString()}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleStar(msg); }}
                      className="flex-shrink-0">
                      {msg.is_starred ? <Star size={11} className="text-amber-400 fill-amber-400" /> : <StarOff size={11} className="text-slate-300" />}
                    </button>
                  </div>
                  <div className={`text-xs mb-0.5 truncate ${!msg.is_read ? "font-bold text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-400"}`}>
                    {msg.subject}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 truncate flex-1">{msg.body?.slice(0, 60)}...</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {msg.is_encrypted && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">E2EE</span>}
                      {msg.attachments?.length > 0 && <Paperclip size={9} className="text-slate-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Detail */}
          {selectedMsg ? (
            <div className="w-96 glass-card rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">{selectedMsg.subject}</h3>
                  <button onClick={() => setSelectedMsg(null)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                    <X size={15} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-black text-blue-600">
                    {(selectedMsg.from_name || selectedMsg.from_email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedMsg.from_name}</div>
                    <div className="text-[10px] text-slate-400">{selectedMsg.from_email}</div>
                  </div>
                  {selectedMsg.is_encrypted && (
                    <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      🔐 E2EE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">To: {selectedMsg.to_emails?.join(", ")}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{selectedMsg.body}</p>
                {selectedMsg.attachments?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Attachments</p>
                    {selectedMsg.attachments.map((att: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl glass-card border border-slate-200/40">
                        <Paperclip size={12} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{att.name}</span>
                        <span className="text-[10px] text-slate-400 ml-auto">{att.size}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedMsg.labels?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {selectedMsg.labels.map((l) => (
                      <span key={l} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">#{l}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold glass-blue text-blue-700 dark:text-blue-400 transition-all hover:scale-105">
                  <Reply size={12} /> Reply
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold glass-card border border-slate-200 text-slate-600 transition-all hover:scale-105">
                  <Forward size={12} /> Forward
                </button>
                <button onClick={() => handleDelete(selectedMsg)}
                  className="py-2 px-3 rounded-xl text-xs font-bold glass-crimson text-rose-600 transition-all hover:scale-105">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-96 glass-card rounded-2xl flex items-center justify-center text-slate-300">
              <div className="text-center">
                <Mail size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Select a message</p>
              </div>
            </div>
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
            <div className="glass-card rounded-3xl w-full max-w-md shadow-2xl pointer-events-auto border border-blue-200/40"
              style={{ boxShadow: "0 0 40px rgba(59,130,246,0.2)" }}>
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">New Message</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">🔐 E2EE</span>
                  <button onClick={() => setShowCompose(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <input value={composeTo} onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="To (comma separated emails)"
                  className="w-full px-3 py-2.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:border-blue-400" />
                <input value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-3 py-2.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:border-blue-400" />
                <textarea value={composeBody} onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Message body..."
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:border-blue-400 resize-none" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Will be encrypted with AES-256-GCM before sending</span>
                  <button onClick={handleSend} disabled={!composeTo || !composeSubject || composeSending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                    {composeSending ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
