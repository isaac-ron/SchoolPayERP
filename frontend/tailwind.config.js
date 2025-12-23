/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#1e3a8a",
        "primary-light": "#3b82f6",
        "primary-hover": "#1e40af",
        "success": "#10b981",
        "background-light": "#ffffff",
        "background-dark": "#0f172a",
        "surface-light": "#f8fafc",
        "surface-dark": "#1e293b",
        "surface-lighter": "#334155",
        "surface-border": "#e2e8f0",
        "text-main": "#1e293b",
        "text-muted": "#64748b",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "header": ["Manrope", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "3rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
