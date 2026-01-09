/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#f5fce8',
          100: '#e9f8cf',
          200: '#d3f0a3',
          300: '#b4e56c',
          400: '#95d639',
          500: '#76b912',
          600: '#6aa200',
          700: '#558200',
          800: '#446608',
          900: '#39540d',
          950: '#1e2f02',
        },
      },
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      animation: {
        shine: 'shine 6s linear infinite',
        gradient: 'gradient 8s ease infinite',
      },
      backgroundSize: {
        '300%': '300%',
      }
    },
  },
  plugins: [],
}
