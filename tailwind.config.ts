import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14213D",
          light: "#24406B",
        },
        moss: {
          DEFAULT: "#2F6F4E",
          light: "#3F9067",
        },
        stamp: {
          DEFAULT: "#B5482F",
          light: "#C96448",
        },
        brass: "#A9762F",
        paper: {
          DEFAULT: "#F3F4EF",
          dark: "#12181A",
        },
        // Back-compat aliases used throughout the app
        primary: {
          DEFAULT: "#14213D",
          light: "#24406B",
        },
        accent: {
          DEFAULT: "#2F6F4E",
          light: "#3F9067",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "0.9rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,33,61,0.04), 0 8px 24px -8px rgba(20,33,61,0.10)",
        "card-hover": "0 4px 8px rgba(20,33,61,0.06), 0 16px 32px -12px rgba(20,33,61,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
