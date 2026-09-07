/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          base: '#080d16',
          surface: '#0f172a',
          card: '#131e33',
          cardHover: '#182744',
          border: '#1e2e4a',
          accent: '#0284c7',
          emerald: '#10b981',
          amber: '#f59e0b',
          danger: '#ef4444',
          neon: '#00f0ff'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      keyframes: {
        radarPulse: {
          '0%': { transform: 'scale(0.95)', opacity: '0.9' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        flowDash: {
          to: { strokeDashoffset: '-28' },
        },
      },
      animation: {
        radarPulse: 'radarPulse 2.5s infinite ease-out',
        flowDash: 'flowDash 1.2s linear infinite',
      },
    },
  },
}