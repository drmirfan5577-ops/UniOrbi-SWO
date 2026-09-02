import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Fingerprint, Shield, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Language } from "@/types";
import logoImg from "@/assets/logo.png";

interface AuthPageProps { language: Language }

type Step = "email" | "otp" | "password" | "login";

export default function AuthPage({ language }: AuthPageProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCells, setOtpCells] = useState(["", "", "", ""]);

  const isRtl = language === "ur" || language === "ar";

  // ── Sign-in with password ──────────────────────────────────
  async function handleSignIn() {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); setLoading(false); return; }
      login({
        id: data.user.id,
        email: data.user.email!,
        username: data.user.user_metadata?.username || data.user.email!.split("@")[0],
      });
      toast.success("Welcome back! 🛡️");
      navigate("/");
    } catch { setLoading(false); }
  }

  // ── Send OTP for sign-up ───────────────────────────────────
  async function handleSendOtp() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("OTP sent to " + email);
    setStep("otp");
  }

  // ── Verify OTP ────────────────────────────────────────────
  async function handleVerifyOtp() {
    const code = otpCells.join("");
    if (code.length !== 4) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    setLoading(false);
    if (error) { toast.error("Invalid OTP — " + error.message); return; }
    toast.success("Email verified ✅");
    setStep("password");
  }

  // ── Set password and finish sign-up ───────────────────────
  async function handleSetPassword() {
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
        data: { username: email.split("@")[0] },
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
      login({
        id: data.user.id,
        email: data.user.email!,
        username: data.user.user_metadata?.username || data.user.email!.split("@")[0],
      });
      toast.success("Account secured. Welcome to @uniorbi! 🔐");
      navigate("/");
    } catch { setLoading(false); }
  }

  // OTP cell helpers
  function handleOtpCell(idx: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpCells];
    next[idx] = val.slice(-1);
    setOtpCells(next);
    if (val && idx < 3) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpCells[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 pt-16"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Background orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #f43f5e, transparent)" }} />

      <div className="w-full max-w-md mx-4">
        <div className="glass-card rounded-3xl p-8 shadow-2xl">

          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-emerald-400/40 mx-auto mb-4 animate-float"
              style={{ boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
              <img src={logoImg} alt="logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              @uniorbi<span className="shimmer-text">.com</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
              Zero-Knowledge • E2EE • FIDO2 Secured
            </p>
          </div>

          {/* Mode Toggle */}
          {step === "email" && (
            <div className="flex items-center glass-card rounded-2xl p-1 mb-6">
              {(["signin", "signup"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${
                    mode === m
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          )}

          {/* ── Step: Email ── */}
          {step === "email" && (
            <div className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (mode === "signin" ? setStep("login") : handleSendOtp())}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                />
              </div>

              {mode === "signin" ? (
                <button
                  onClick={() => { setStep("login"); }}
                  disabled={!email}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSendOtp}
                  disabled={!email || loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />}
                  Send Verification Code
                </button>
              )}
            </div>
          )}

          {/* ── Step: Sign-in Password ── */}
          {step === "login" && (
            <div className="space-y-4">
              <div className="glass-emerald rounded-xl px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {email}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handleSignIn}
                disabled={!password || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Fingerprint size={16} />}
                Secure Sign In
              </button>
              <button onClick={() => setStep("email")}
                className="w-full text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                ← Back
              </button>
            </div>
          )}

          {/* ── Step: OTP Verification ── */}
          {step === "otp" && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  4-digit code sent to
                </p>
                <p className="font-bold text-slate-800 dark:text-white">{email}</p>
              </div>
              <div className="flex gap-3 justify-center">
                {otpCells.map((cell, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={cell}
                    onChange={(e) => handleOtpCell(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-14 text-center text-2xl font-black rounded-xl glass-card border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                    style={{ boxShadow: cell ? "0 0 12px rgba(16,185,129,0.3)" : undefined }}
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={otpCells.join("").length !== 4 || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
                Verify Code
              </button>
              <button onClick={() => { setStep("email"); setOtpCells(["", "", "", ""]); }}
                className="w-full text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                ← Back / Resend
              </button>
            </div>
          )}

          {/* ── Step: Set Password ── */}
          {step === "password" && (
            <div className="space-y-4">
              <div className="glass-emerald rounded-xl px-4 py-3 text-sm">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">Email Verified ✅</p>
                <p className="text-emerald-600/70 dark:text-emerald-400/70 text-xs mt-0.5">Set your secure password</p>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
                  placeholder="Create password (min. 6 chars)"
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl glass-card border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      i < Math.min(4, Math.floor(password.length / 2))
                        ? i < 2 ? "bg-rose-400" : i < 3 ? "bg-amber-400" : "bg-emerald-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`} />
                  ))}
                </div>
              )}
              <button
                onClick={handleSetPassword}
                disabled={password.length < 6 || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
                Secure My Account
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold">
              Protected by Zero-Knowledge E2EE • WebAuthn/FIDO2 Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
