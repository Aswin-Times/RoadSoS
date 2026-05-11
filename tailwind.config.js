/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emergency: { DEFAULT: '#E8361A', hover: '#C42D15', muted: '#3D1510' },
        warning: { DEFAULT: '#F59E0B', muted: '#2D1F05' },
        safe: { DEFAULT: '#22C55E', muted: '#0A2415' },
        asphalt: {
          900: '#070708',
          800: '#0A0A0B',
          700: '#111113',
          600: '#141416',
          500: '#1C1C20',
          400: '#242428',
          300: '#2E2E34',
        },
        smoke: {
          100: '#F0EDE8',
          200: '#C4BFB9',
          300: '#8A8480',
          400: '#5A5652',
          500: '#3A3733',
        },
      },
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        touch: '48px',
        gutter: '20px',
        'card-pad': '16px',
      },
      borderRadius: {
        sharp: '4px',
        card: '12px',
        pill: '9999px',
      },
      boxShadow: {
        'glow-red': '0 0 0 1px rgba(232,54,26,0.3), 0 0 16px rgba(232,54,26,0.15)',
        'glow-red-strong': '0 0 0 2px rgba(232,54,26,0.6), 0 0 32px rgba(232,54,26,0.25)',
        'glow-green': '0 0 0 1px rgba(34,197,94,0.3), 0 0 12px rgba(34,197,94,0.12)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.06)',
      },
      animation: {
        'sos-pulse': 'sos-pulse-anim 1.8s ease-in-out infinite',
        'sos-pulse-fast': 'sos-pulse-anim 1.2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s linear infinite',
        'slow-spin': 'spin 4s linear infinite',
        breathe: 'breathe 3s ease-in-out infinite',
      },
      keyframes: {
        'sos-pulse-anim': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.12)', opacity: '0.78' },
        },
        shimmer: {
          to: { backgroundPosition: '-200% 0' },
        },
        breathe: {
          '0%, 100%': { opacity: '.72', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
      },
    },
  },
}
