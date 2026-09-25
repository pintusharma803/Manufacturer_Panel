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
        tb: {
          dark: '#0f172a',      // Slate 900
          darker: '#090d16',    // Deep Void
          sidebar: '#111827',   // ThingsBoard Gray-900
          card: '#1e293b',      // Slate 800
          cardBorder: '#334155',// Slate 700
          primary: '#2563eb',   // ThingsBoard Blue
          accent: '#0284c7',    // Cyan/Sky
          success: '#10b981',   // Emerald
          warning: '#f59e0b',   // Amber
          danger: '#ef4444',    // Rose/Red
          text: '#f8fafc',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(37, 99, 235, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
