/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sphere: {
          base: "var(--bg-base)",
          card: "var(--surface-card)",
          cardSubtle: "var(--surface-card-subtle)",
          border: "var(--border-card)",
          muted: "var(--text-muted)",
          main: "var(--text-main)",
          accent: "var(--accent-primary)",
          accentBtn: "var(--accent-btn)",
          accentBtnText: "var(--accent-btn-text)",
          accentGlow: "var(--accent-glow)",
          composer: "var(--composer-bg)",
          online: "var(--online-dot)",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3F72AF",
          600: "#2d5d9b",
          700: "#112D4E",
          800: "#0d223c",
          900: "#09172a",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
