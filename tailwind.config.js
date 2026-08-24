/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1F1D1E",
          soft: "#2B2929",
          faint: "#3A3838",
        },
        paper: {
          DEFAULT: "#F7F4EF",
          dim: "#EDE8DF",
        },
        magenta: {
          DEFAULT: "#E5136F",
          deep: "#A80D53",
          soft: "#F6C9DD",
        },
        ash: {
          DEFAULT: "#726D68",
          light: "#A39D96",
        },
        folio: {
          green: "#2F7A54",
          amber: "#C8821A",
          red: "#B8402F",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        ledger:
          "repeating-linear-gradient(180deg, transparent, transparent 39px, rgba(31,29,30,0.06) 40px)",
      },
    },
  },
  plugins: [],
};
