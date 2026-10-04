/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kiyomi brand palette — centralized so it can be re-themed without
        // touching component code. Placeholder editorial boutique palette
        // (warm sand / ink / terracotta) until real @kyomi___store brand
        // assets are supplied — see src/lib/brand.js.
        kiyomi: {
          ink: "#1b1815",
          sand: "#f4efe9",
          sandDark: "#e7ded2",
          terracotta: "#b5613f",
          gold: "#a8813f",
          cream: "#faf7f2",
          muted: "#8a8178",
          babyPink: "#f7d6e0",
          babyPinkDark: "#eab8c9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        lg: "8px",
      },
      maxWidth: {
        content: "1400px",
      },
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.12) translate(-1.5%, -1.5%)" },
        },
      },
      animation: {
        kenburns: "kenburns 8000ms ease-out forwards",
      },
    },
  },
  plugins: [],
};