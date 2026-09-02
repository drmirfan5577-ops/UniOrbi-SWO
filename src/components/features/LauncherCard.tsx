import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { LauncherConfig } from "@/types";
import { Language } from "@/types";
import { t } from "@/lib/i18n";

interface LauncherCardProps {
  launcher: LauncherConfig;
  language: Language;
  isActive?: boolean;
  onSelect: (id: string) => void;
}

const glassMap = {
  emerald: "glass-emerald",
  crimson: "glass-crimson",
  blue: "glass-blue",
  purple: "glass-purple",
  gold: "glass-gold",
};

export default function LauncherCard({ launcher, language, isActive, onSelect }: LauncherCardProps) {
  const navigate = useNavigate();
  const glassClass = glassMap[launcher.glassType];
  const isRtl = language === "ur" || language === "ar";

  const name = language === "ur" ? launcher.nameUr : language === "ar" ? launcher.nameAr : launcher.name;
  const desc = language === "ur" ? launcher.descUr : language === "ar" ? launcher.descAr : launcher.description;

  return (
    <div
      className={`launcher-card rounded-3xl p-6 ${glassClass} ${
        isActive ? "ring-2" : "ring-1 ring-transparent hover:ring-2"
      }`}
      style={{
        ringColor: launcher.accentColor,
        boxShadow: isActive
          ? `0 0 30px ${launcher.accentColor}40, 0 8px 32px rgba(0,0,0,0.08)`
          : undefined,
      }}
      onClick={() => onSelect(launcher.id)}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${launcher.accentColor}20, ${launcher.accentColor}10)`, border: `1px solid ${launcher.accentColor}40` }}
        >
          {launcher.icon}
        </div>
        {isActive && (
          <span
            className="text-[10px] font-black px-2.5 py-1 rounded-full text-white uppercase tracking-widest"
            style={{ background: launcher.accentColor }}
          >
            Active
          </span>
        )}
      </div>

      {/* Content */}
      <h3
        className="font-black text-lg text-slate-900 dark:text-white mb-1"
        style={{ textShadow: isActive ? `0 0 12px ${launcher.accentColor}60` : undefined }}
      >
        {name}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{desc}</p>

      {/* Feature Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {launcher.features.map((f) => (
          <span
            key={f}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${launcher.accentColor}15`,
              color: launcher.accentColor,
              border: `1px solid ${launcher.accentColor}30`,
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Launch Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(launcher.route);
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
        style={{ background: `linear-gradient(135deg, ${launcher.accentColor}, ${launcher.accentColor}cc)` }}
      >
        {t("launchers.launch", language)}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
