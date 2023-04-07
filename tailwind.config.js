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
          50: '#edfcf5',
          100: '#d4f7e6',
          200: '#adedd2',
          300: '#78ddb8',
          400: '#41c69a',
          500: '#22c493',
          600: '#118a68',
          700: '#0d6f56',
          800: '#0d5845',
          900: '#0c483a',
          950: '#052921',
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
