import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b",
        surface: "#111113",
        card: "#18181b",
        border: "#27272a",
        "text-primary": "#fafafa",
        "text-secondary": "#a1a1aa",
        tomato: {
          DEFAULT: "#ef4444",
          dark: "#b91c1c",
          light: "#fca5a5",
        },
        dota: {
          DEFAULT: "#8b5cf6",
          dark: "#6d28d9",
          light: "#c4b5fd",
        },
        gold: {
          DEFAULT: "#f59e0b",
          dark: "#b45309",
          light: "#fcd34d",
        },
        xp: {
          DEFAULT: "#22c55e",
          dark: "#15803d",
          light: "#86efac",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "slide-up": "slideUp 0.3s ease-out",
        "glow-tomato": "glowTomato 2s ease-in-out infinite alternate",
        "spin-slow": "spin 8s linear infinite",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glowTomato: {
          "0%": { boxShadow: "0 0 5px #ef444480, 0 0 10px #ef444440" },
          "100%": { boxShadow: "0 0 20px #ef444480, 0 0 40px #ef444440" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        shimmer:
          "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)",
      },
    },
  },
  plugins: [],
};

export default config;
