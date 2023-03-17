const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        18: '4.5rem',
      },
      colors: {
        primary: {
          50: '#E7FAF3',
          100: '#CFF5E6',
          200: '#9EEAC7',
          300: '#6DDFA8',
          400: '#3CD48A',
          500: '#22C493',
          600: '#1AA77F',
          700: '#128A6B',
          800: '#0A6D57',
          900: '#055144',
        },
        secondary: colors.sky,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
    require('tailwindcss-safe-area'),
  ],
}
