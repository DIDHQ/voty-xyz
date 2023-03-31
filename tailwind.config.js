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
          50: '#E9F9F4',
          100: '#CFF0E5',
          200: '#A5E2CC',
          300: '#7BD3B3',
          400: '#52C49A',
          500: '#22C493',
          600: '#1BA57F',
          700: '#15876A',
          800: '#106A56',
          900: '#0B4D41',
        },
        secondary: colors.sky,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-safe-area'),
  ],
}
