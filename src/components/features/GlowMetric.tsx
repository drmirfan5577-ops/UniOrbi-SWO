import { useEffect, useState } from "react";

interface GlowMetricProps {
  label: string;
  value: string;
  unit?: string;
  color: "emerald" | "crimson" | "blue" | "purple" | "gold";
  icon?: string;
  animated?: boolean;
}

const colorMap = {
  emerald: {
    text: "text-emerald-700 dark:text-emerald-400",
    glow: "rgba(16,185,129,0.5)",
    bg: "glass-emerald",
    bar: "bg-emerald-500",
  },
  crimson: {
    text: "text-rose-700 dark:text-rose-400",
    glow: "rgba(244,63,94,0.5)",
    bg: "glass-crimson",
    bar: "bg-rose-500",
  },
  blue: {
    text: "text-blue-700 dark:text-blue-400",
    glow: "rgba(59,130,246,0.5)",
    bg: "glass-blue",
    bar: "bg-blue-500",
  },
  purple: {
    text: "text-violet-700 dark:text-violet-400",
    glow: "rgba(139,92,246,0.5)",
    bg: "glass-purple",
    bar: "bg-violet-500",
  },
  gold: {
    text: "text-amber-700 dark:text-amber-400",
    glow: "rgba(245,158,11,0.5)",
    bg: "glass-gold",
    bar: "bg-amber-500",
  },
};

export default function GlowMetric({ label, value, unit, color, icon, animated = true }: GlowMetricProps) {
  const [displayed, setDisplayed] = useState("0");
  const c = colorMap[color];

  useEffect(() => {
    if (!animated) { setDisplayed(value); return; }
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) { setDisplayed(value); return; }
    let current = 0;
    const step = num / 30;
    const interval = setInterval(() => {
      current += step;
      if (current >= num) {
        setDisplayed(value);
        clearInterval(interval);
      } else {
        setDisplayed(Math.floor(current).toLocaleString());
      }
    }, 40);
    return () => clearInterval(interval);
  }, [value, animated]);

  return (
    <div className={`${c.bg} rounded-2xl p-5 flex flex-col gap-1.5`}>
      <div className="flex items-center justify-between">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex items-center gap-1.5">
          <span className="live-dot" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">Live</span>
        </div>
      </div>
      <div
        className={`text-3xl font-black ${c.text} font-mono`}
        style={{ textShadow: `0 0 15px ${c.glow}` }}
      >
        {displayed}
        {unit && <span className="text-sm ml-1 font-semibold">{unit}</span>}
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}
