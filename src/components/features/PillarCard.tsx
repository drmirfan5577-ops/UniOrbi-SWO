interface PillarCardProps {
  number: string;
  icon: string;
  title: string;
  description: string;
  glassType: "emerald" | "crimson" | "blue" | "purple";
  specs: string[];
}

const glassMap = {
  emerald: "glass-emerald",
  crimson: "glass-crimson",
  blue: "glass-blue",
  purple: "glass-purple",
};

const textMap = {
  emerald: { label: "text-emerald-700 dark:text-emerald-400", color: "#10b981" },
  crimson: { label: "text-rose-700 dark:text-rose-400", color: "#f43f5e" },
  blue: { label: "text-blue-700 dark:text-blue-400", color: "#3b82f6" },
  purple: { label: "text-violet-700 dark:text-violet-400", color: "#8b5cf6" },
};

export default function PillarCard({ number, icon, title, description, glassType, specs }: PillarCardProps) {
  const glass = glassMap[glassType];
  const tc = textMap[glassType];

  return (
    <div className={`${glass} rounded-3xl p-6 lg:p-8 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1`}>
      {/* Background number watermark */}
      <div
        className="absolute -top-4 -right-2 text-9xl font-black opacity-[0.04] select-none pointer-events-none"
        style={{ color: tc.color }}
      >
        {number}
      </div>

      {/* Icon + Number */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: `${tc.color}15`, border: `1px solid ${tc.color}30` }}
        >
          {icon}
        </div>
        <span
          className="text-xs font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
          style={{ background: `${tc.color}15`, color: tc.color }}
        >
          Pillar {number}
        </span>
      </div>

      <h3
        className={`text-xl font-black mb-2 ${tc.label}`}
        style={{ textShadow: `0 0 20px ${tc.color}40` }}
      >
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{description}</p>

      {/* Spec list */}
      <div className="space-y-1.5">
        {specs.map((spec, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: tc.color, boxShadow: `0 0 6px ${tc.color}` }}
            />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">{spec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
