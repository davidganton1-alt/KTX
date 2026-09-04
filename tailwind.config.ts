import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A0E27",
          900: "#0A0E27",
          800: "#10153a",
          700: "#161b45",
        },
        royal: {
          purple: "#6D28D9",
          violet: "#A855F7",
        },
        gold: {
          light: "#F5C97B",
          DEFAULT: "#E6B450",
        },
        cyan: {
          light: "#22D3EE",
          DEFAULT: "#06B6D4",
        },
        pearl: "#EEF2FF",
        profit: "#34D399",
        loss: "#F87171",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(168,85,247,0.35)",
        gold: "0 0 30px rgba(245,201,123,0.35)",
      },
      backgroundImage: {
        "kingdom-radial":
          "radial-gradient(900px 700px at 50% 30%, #161b45 0%, #0A0E27 60%)",
      },
      keyframes: {
        spinRing: {
          from: { transform: "translate(-50%,-50%) rotate(0deg)" },
          to: { transform: "translate(-50%,-50%) rotate(360deg)" },
        },
        haloPulse: {
          "0%,100%": { opacity: "0.5", transform: "scale(0.95)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        flipY: {
          from: { transform: "rotateY(0deg)" },
          to: { transform: "rotateY(360deg)" },
        },
      },
      animation: {
        spinRing: "spinRing 12s linear infinite",
        "spinRing-rev": "spinRing 8s linear infinite reverse",
        haloPulse: "haloPulse 4.5s ease-in-out infinite",
        flipY: "flipY 7s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
