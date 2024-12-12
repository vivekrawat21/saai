import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        lightning: {
          "0%, 100%": { transform: "translate(0, 0)", opacity: "1" },
          "50%": { transform: "translate(10px, 10px)", opacity: "0.7" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px #3b82f6, 0 0 20px #3b82f6" },
          "50%": { boxShadow: "0 0 20px #2563eb, 0 0 40px #2563eb" },
        },
      },
      animation: {
        lightning: "lightning 1s infinite",
        glow: "glow 1.5s infinite",
      },
      colors: {
        "dark-bg": "#1a1a2e",
        "dark-text": "#e0e0e0",
        "light-text": "#f5f5f5",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        dark: {
          primary: "#2563eb",
          secondary: "#1d4ed8",
          accent: "#1e40af",
          neutral: "#1a1a2e",
          "base-100": "#1a1a2e",
          "base-200": "#111827",
          "base-300": "#1f2937",
          "primary-content": "#f3f4f6",
          "secondary-content": "#e0e0e0",
        },
      },
    ],
  },
} satisfies Config;
