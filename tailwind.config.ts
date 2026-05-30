import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#FF6B00",
          600: "#E85E00",
          700: "#C64F00",
        },
        surface: {
          900: "#0B1220",
          950: "#050A12",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ['"Manrope"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,107,0,0.2), 0 20px 60px rgba(255,107,0,0.18)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.75" },
          "50%": { transform: "scale(1.35)", opacity: "1" },
        },
        floatUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.5s ease-in-out infinite",
        floatUp: "floatUp 260ms ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
