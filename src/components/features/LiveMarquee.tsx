interface LiveMarqueeProps {
  items?: string[];
}

export default function LiveMarquee({ items }: LiveMarqueeProps) {
  const defaultItems = [
    "🛡️ AES-256-GCM ACTIVE",
    "⚡ LATENCY: 12ms",
    "🔐 E2EE ENABLED",
    "✅ ZERO THREATS DETECTED",
    "🌐 DMARC p=reject",
    "🔒 TLS 1.3 ENFORCED",
    "📡 REAL-TIME SYNC: ONLINE",
    "🏰 FORTRESS: SECURE",
    "💚 UPTIME: 99.99%",
    "🔑 PASSKEYS: ACTIVE",
    "📊 10,000+ SESSIONS",
    "🌍 HSTS PRELOADED",
  ];

  const display = items || defaultItems;
  const doubled = [...display, ...display];

  return (
    <div className="relative overflow-hidden h-10 flex items-center glass-emerald border-y border-emerald-300/40">
      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
          style={{ animation: "scan-line 3s linear infinite" }}
        />
      </div>

      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-6 text-xs font-bold tracking-wider"
          >
            <span
              className="font-mono"
              style={{
                color: "#047857",
                textShadow: "0 0 8px rgba(16,185,129,0.6), 0 0 16px rgba(16,185,129,0.3)",
              }}
            >
              {item}
            </span>
            <span className="text-emerald-300/60">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
