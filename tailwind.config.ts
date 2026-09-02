import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "serif"],
        arabic: ["Amiri", "serif"],
        mono: ["Space Grotesk", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        crimson: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px 4px rgba(16,185,129,0.4), 0 0 40px 8px rgba(16,185,129,0.2)" },
          "50%": { boxShadow: "0 0 40px 8px rgba(16,185,129,0.6), 0 0 80px 16px rgba(16,185,129,0.3)" },
        },
        "glow-pulse-crimson": {
          "0%, 100%": { boxShadow: "0 0 20px 4px rgba(244,63,94,0.4), 0 0 40px 8px rgba(244,63,94,0.2)" },
          "50%": { boxShadow: "0 0 40px 8px rgba(244,63,94,0.6), 0 0 80px 16px rgba(244,63,94,0.3)" },
        },
        "glow-pulse-blue": {
          "0%, 100%": { boxShadow: "0 0 20px 4px rgba(59,130,246,0.4), 0 0 40px 8px rgba(59,130,246,0.2)" },
          "50%": { boxShadow: "0 0 40px 8px rgba(59,130,246,0.6), 0 0 80px 16px rgba(59,130,246,0.3)" },
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "orb-drift": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "digit-roll": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(16,185,129,0.5)" },
          "50%": { borderColor: "rgba(16,185,129,1)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "glow-pulse-crimson": "glow-pulse-crimson 3s ease-in-out infinite",
        "glow-pulse-blue": "glow-pulse-blue 3s ease-in-out infinite",
        "text-shimmer": "text-shimmer 3s linear infinite",
        "marquee": "marquee 20s linear infinite",
        "float": "float 4s ease-in-out infinite",
        "orb-drift": "orb-drift 8s ease-in-out infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
        "scan-line": "scan-line 4s linear infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
