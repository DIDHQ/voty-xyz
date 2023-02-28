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
          200: '#E9F9F4',
          300: '#D3F3E9',
          400: '#BDEDDF',
          500: '#A7E7D4',
          600: '#22C493',
          700: '#1EAE82',
        },
        secondary: colors.sky,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/typography'),
  ],
}
