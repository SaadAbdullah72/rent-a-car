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
        brand: {
          50: '#eef8ff',
          100: '#d8eeff',
          200: '#b9e2ff',
          300: '#89d1ff',
          400: '#52b7ff',
          500: '#2b97fe',
          600: '#1476f4',
          700: '#0d5fe0',
          800: '#114cb6',
          900: '#14428f',
          950: '#102957',
        },
        slateDark: {
          850: '#151d2c',
          900: '#0f172a',
          950: '#090d16',
        }
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(43, 151, 254, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
      }
    },
  },
  plugins: [],
}
