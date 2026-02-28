/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lid: {
          50: '#f3fadd',
          100: '#e4f4b6',
          200: '#cceb80',
          300: '#b0de45',
          400: '#96cd18',
          500: '#7ab300', // Primary brand color
          600: '#5e8c00',
          700: '#476a00',
          800: '#354f06',
          900: '#2d430a',
        },
        surface: '#F5F5F5',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Lexend"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 8px 30px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
