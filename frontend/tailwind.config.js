/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#1a2340',
          600: '#1e2d4e',
        },
        accent: {
          500: '#00d4ff',
          400: '#33dcff',
        },
        danger:  '#ff4444',
        warning: '#ffaa00',
        success: '#00cc66',
      },
    },
  },
  plugins: [],
}
