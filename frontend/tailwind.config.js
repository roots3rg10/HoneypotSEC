/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#060b14',
          900: '#0a0f1e',
          850: '#0d1424',
          800: '#111827',
          750: '#151f30',
          700: '#1a2540',
          600: '#243050',
          500: '#374763',
          400: '#64748b',
          300: '#94a3b8',
          200: '#cbd5e1',
          100: '#e2e8f0',
          50:  '#f1f5f9',
        },
        cyan: {
          500: '#06b6d4',
          400: '#22d3ee',
          300: '#67e8f9',
        },
        blue: {
          500: '#3b82f6',
          400: '#60a5fa',
        },
        violet: {
          500: '#8b5cf6',
          400: '#a78bfa',
        },
        emerald: {
          500: '#10b981',
          400: '#34d399',
        },
        rose: {
          500: '#f43f5e',
          400: '#fb7185',
        },
        amber: {
          500: '#f59e0b',
          400: '#fbbf24',
        },
        pink: {
          500: '#ec4899',
          400: '#f472b6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow:    '0 0 20px rgba(6,182,212,0.15)',
        'glow-sm': '0 0 10px rgba(6,182,212,0.1)',
        card:    '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
