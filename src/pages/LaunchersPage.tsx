import { useState } from "react";
import { Rocket, Grid3X3, List } from "lucide-react";
import { Language } from "@/types";
import { t } from "@/lib/i18n";
import { launchers } from "@/constants/launchers";
import LauncherCard from "@/components/features/LauncherCard";
import LiveMarquee from "@/components/features/LiveMarquee";

interface LaunchersPageProps {
  language: Language;
  activeLauncher: string;
  onLauncherSelect: (id: string) => void;
}

export default function LaunchersPage({ language, activeLauncher, onLauncherSelect }: LaunchersPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const isRtl = language === "ur" || language === "ar";
  const fontClass = language === "ur" ? "font-urdu" : language === "ar" ? "font-arabic" : "";

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 pt-16 ${fontClass}`} dir={isRtl ? "rtl" : "ltr"}>
      <LiveMarquee />

      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
        <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #f43f5e, transparent)" }} />

        <div className="max-w-6xl mx-auto px-6 py-14 text-center relative z-10">
          <div className="inline-flex items-center gap-2 glass-emerald rounded-full px-5 py-2 mb-6">
            <Rocket size={12} className="text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 tracking-wider uppercase">
              8 Ecosystem Launchers
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">
            {t("launchers.title", language)}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t("launchers.subtitle", language)}
          </p>
        </div>
      </div>

      {/* View Controls */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="live-dot" />
            <span className="font-semibold">
              Active: <span className="text-emerald-600 dark:text-emerald-400 font-black">
                {launchers.find(l => l.id === activeLauncher)?.name || "None"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1 glass-card rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-emerald-500 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-emerald-500 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Launcher Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className={
          viewMode === "grid"
            ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            : "flex flex-col gap-4"
        }>
          {launchers.map((launcher) => (
            <div key={launcher.id} className={viewMode === "list" ? "max-w-2xl" : ""}>
              <LauncherCard
                launcher={launcher}
                language={language}
                isActive={activeLauncher === launcher.id}
                onSelect={onLauncherSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
